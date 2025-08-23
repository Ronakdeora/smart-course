CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE user_profile (
  user_id       UUID PRIMARY KEY,            -- comes from accounts.id
  full_name      TEXT,
  email            CITEXT NOT NULL UNIQUE,
  standard_level TEXT,
  bio            TEXT,
  timezone       TEXT,
  locale         TEXT,
  weekly_time_budget_min INT,
  preferred_session_min  INT,
  learning_style TEXT,
  accessibility_notes TEXT,
  goals          TEXT,
  prior_knowledge_tags TEXT[],
  ai_profile     JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper 2a) Language proficiency
-- Use CEFR-like levels or your own scale.
CREATE TYPE proficiency_level AS ENUM ('A1','A2','B1','B2','C1','C2','Native');
CREATE TABLE user_language_proficiencies (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  language_code   TEXT NOT NULL,               -- ISO 639-1 like 'en','hi'
  level           proficiency_level NOT NULL,
  last_assessed_at TIMESTAMPTZ
);

-- Helper 2b) Guardrail if you still want “IQ/EQ”-like numbers
-- Store *assessed skills* with provenance; keep it optional and separate.
--CREATE TABLE user_assessed_traits (
--  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
--  trait_key     TEXT NOT NULL,      -- e.g., 'verbal_reasoning','working_memory'
--  score_numeric NUMERIC,            -- scaled 0–100 or z-score
--  source        TEXT,               -- who/what assessed this
--  observed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--  PRIMARY KEY (user_id, trait_key)
--);
