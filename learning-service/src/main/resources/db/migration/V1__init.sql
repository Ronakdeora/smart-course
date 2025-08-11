CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  level       TEXT NOT NULL, -- e.g., "8th-standard", "UG"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INT  NOT NULL
);

CREATE TABLE enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,              -- comes from user-service (logical link)
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  status       TEXT NOT NULL, -- e.g., NOT_STARTED|IN_PROGRESS|DONE
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, module_id)
);
