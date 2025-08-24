ALTER TABLE user_language_proficiencies
  ALTER COLUMN last_assessed_at TYPE DATE USING last_assessed_at::date;