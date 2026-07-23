ALTER TABLE users
  ALTER COLUMN openid DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_name TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_account_name_unique_idx
  ON users(account_name)
  WHERE account_name IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_identity_required'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_identity_required
      CHECK (openid IS NOT NULL OR account_name IS NOT NULL);
  END IF;
END
$$;
