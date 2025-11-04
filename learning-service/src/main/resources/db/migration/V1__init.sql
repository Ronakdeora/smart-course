-- =====================================================================
-- Learning Platform: Initial schema (v1)
-- Purpose: Course + Lesson metadata, split lesson bodies, FE views, indexes
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 0) Namespace
-- ---------------------------------------------------------------------
-- CREATE SCHEMA IF NOT EXISTS learning;

-- ---------------------------------------------------------------------
-- 1) Status Enum
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE course_status AS ENUM ('QUEUED','GENERATING','READY','FAILED');
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 2) Timestamp touch helper (auto-update updated_at)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------------
-- 3) Courses (header + outline only)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id               UUID PRIMARY KEY,
  user_id          UUID NOT NULL,
  slug             TEXT GENERATED ALWAYS AS
                    (regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) STORED,
  title            TEXT NOT NULL,
  topic            TEXT NOT NULL,
  grade_level      TEXT NOT NULL,
  source_filter    TEXT,
  total_lessons    INT  NOT NULL DEFAULT 0,
  outline_json     JSONB,
  status           course_status NOT NULL DEFAULT 'QUEUED',
  error_message    TEXT,
  generated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_courses_touch ON courses;
CREATE TRIGGER trg_courses_touch
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------------------------------------------------------------------
-- 4) Lessons (metadata only; bodies live in lesson_bodies)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id                  UUID PRIMARY KEY,
  course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_number       INT  NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  key_concepts        TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  sources             TEXT[] DEFAULT '{}',
  generated_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, lesson_number)
);

DROP TRIGGER IF EXISTS trg_lessons_touch ON lessons;
CREATE TRIGGER trg_lessons_touch
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------------------------------------------------------------------
-- 5) Lesson Bodies (big fields split out)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_bodies (
  lesson_id     UUID PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
  content_md    TEXT,
  content_json  JSONB,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: attempt LZ4 compression on PG 14+; ignore if not supported
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE lesson_bodies
               ALTER COLUMN content_md   SET COMPRESSION lz4,
               ALTER COLUMN content_json SET COMPRESSION lz4';
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if Postgres < 14 or LZ4 not available
    NULL;
  END;
END $$;

DROP TRIGGER IF EXISTS trg_lesson_bodies_touch ON lesson_bodies;
CREATE TRIGGER trg_lesson_bodies_touch
BEFORE UPDATE ON lesson_bodies
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ---------------------------------------------------------------------
-- 6) Optional formative checks per lesson
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_checks (
  id         UUID PRIMARY KEY,
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  q_order    INT  NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, q_order)
);

-- ---------------------------------------------------------------------
-- 7) Indexes that match access patterns
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_courses_slug
  ON courses(slug);

CREATE INDEX IF NOT EXISTS idx_courses_status
  ON courses(status);

CREATE INDEX IF NOT EXISTS idx_lessons_course
  ON lessons(course_id, lesson_number);

-- ---------------------------------------------------------------------
-- 8) Views for FE convenience
-- ---------------------------------------------------------------------
-- Course summary (list/card views)
CREATE OR REPLACE VIEW v_course_summary AS
SELECT
  c.id, c.slug, c.title, c.topic, c.grade_level,
  c.total_lessons, c.status, c.generated_at, c.created_at, c.updated_at
FROM courses c;

-- Lesson list (titles only, ordered)
CREATE OR REPLACE VIEW v_course_lessons AS
SELECT
  l.course_id, l.lesson_number, l.title
FROM lessons l
ORDER BY l.course_id, l.lesson_number;

-- Full lesson (metadata + body joined) for read endpoints
CREATE OR REPLACE VIEW v_lessons_full AS
SELECT
  l.id, l.course_id, l.lesson_number, l.title, l.description,
  l.key_concepts, l.learning_objectives, l.sources,
  b.content_md, b.content_json,
  l.generated_at, l.created_at, l.updated_at
FROM lessons l
LEFT JOIN lesson_bodies b
  ON b.lesson_id = l.id;

COMMIT;

-- =====================================================================
-- End of initial schema (v1)
-- =====================================================================
