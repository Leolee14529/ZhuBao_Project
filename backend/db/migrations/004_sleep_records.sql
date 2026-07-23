CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  sleep_duration_minutes SMALLINT NOT NULL CHECK (sleep_duration_minutes BETWEEN 1 AND 1440),
  sleep_hours SMALLINT NOT NULL CHECK (sleep_hours BETWEEN 0 AND 24),
  sleep_minutes SMALLINT NOT NULL CHECK (sleep_minutes BETWEEN 0 AND 59),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sleep_records_user_date_unique UNIQUE (user_id, record_date)
);

CREATE INDEX IF NOT EXISTS sleep_records_user_date_idx
  ON sleep_records(user_id, record_date DESC);
