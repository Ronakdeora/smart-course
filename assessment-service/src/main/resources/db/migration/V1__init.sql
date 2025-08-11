CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE assessments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL,  -- logical link to learning service
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  stem          TEXT NOT NULL,
  options       JSONB NOT NULL,      -- { "A": "...", "B": "...", ... }
  answer_key    TEXT NOT NULL CHECK (answer_key IN ('A','B','C','D'))
);

CREATE TABLE attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ
);

CREATE TABLE responses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  choice     TEXT NOT NULL CHECK (choice IN ('A','B','C','D')),
  UNIQUE (attempt_id, question_id)
);
