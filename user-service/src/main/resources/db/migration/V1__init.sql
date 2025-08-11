-- Extensions you’ll likely want
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;  -- case-insensitive email

-- 1) Core users (auth + account state)
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            CITEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,               -- store bcrypt/argon2 hash
  full_name        TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_active ON users(is_active);

-- 2) AI-facing profile (1:1 with user)
-- Keep it sparse and flexible; put evolving stuff in JSONB.
CREATE TABLE user_profile (
  user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  standard_level         TEXT,           -- e.g., "8th", "UG", "Beginner", etc.
  bio                    TEXT,           -- short description from the user
  timezone               TEXT,           -- e.g., "Asia/Kolkata"
  locale                 TEXT,           -- e.g., "en-IN"
  weekly_time_budget_min INT,            -- how many minutes/week can they study?
  preferred_session_min  INT,            -- ideal single session length
  learning_style         TEXT,           -- e.g., "video-first", "text-first", "mixed"
  accessibility_notes    TEXT,           -- e.g., dyslexia-friendly fonts, captions
  goals                  TEXT,           -- freeform goals statement
  prior_knowledge_tags   TEXT[],         -- e.g., {'algebra','basic-python'}
  ai_profile             JSONB,          -- flexible: anything new you want the AI to know
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper 2a) Language proficiency
-- Use CEFR-like levels or your own scale.
CREATE TYPE proficiency_level AS ENUM ('A1','A2','B1','B2','C1','C2','Native');
CREATE TABLE user_language_proficiencies (
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  language_code   TEXT NOT NULL,               -- ISO 639-1 like 'en','hi'
  level           proficiency_level NOT NULL,
  last_assessed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, language_code)
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
