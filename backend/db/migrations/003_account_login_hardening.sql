CREATE UNIQUE INDEX IF NOT EXISTS users_account_name_lower_unique_idx
  ON users(LOWER(account_name))
  WHERE account_name IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_account_name_lowercase'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_account_name_lowercase
      CHECK (account_name IS NULL OR account_name = LOWER(account_name));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_account_password_pair'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_account_password_pair
      CHECK (
        (account_name IS NULL AND password_hash IS NULL) OR
        (account_name IS NOT NULL AND password_hash IS NOT NULL)
      );
  END IF;
END
$$;
