CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  energy SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  sleep_minutes SMALLINT NOT NULL CHECK (sleep_minutes BETWEEN 0 AND 1440),
  is_wearing_jewelry BOOLEAN NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  note VARCHAR(200) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_checkins_user_date_unique UNIQUE (user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS daily_checkins_user_date_idx
  ON daily_checkins(user_id, checkin_date DESC);
