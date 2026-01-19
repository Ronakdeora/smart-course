-- Add Google OAuth support columns
ALTER TABLE accounts
  ADD COLUMN google_id VARCHAR(255) UNIQUE,
  ADD COLUMN profile_picture_url TEXT;

-- Make password_hash nullable to support OAuth-only users
ALTER TABLE accounts
  ALTER COLUMN password_hash DROP NOT NULL;

-- Add index on google_id for faster lookups
CREATE INDEX idx_accounts_google_id ON accounts(google_id) WHERE google_id IS NOT NULL;

-- Add check constraint to ensure either password_hash or google_id is present
ALTER TABLE accounts
  ADD CONSTRAINT check_auth_method
  CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL);

