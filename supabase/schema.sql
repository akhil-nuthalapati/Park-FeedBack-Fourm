DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OFFICER', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE park_status AS ENUM ('active', 'inactive', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'resolved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_type AS ENUM ('equipment', 'lighting', 'hygiene', 'safety', 'greenery', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS parks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  ward        TEXT NOT NULL,
  latitude    NUMERIC(9, 6),
  longitude   NUMERIC(9, 6),
  status      park_status NOT NULL DEFAULT 'active',
  qr_code     TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  phone        TEXT,
  designation  TEXT,
  department   TEXT,
  role         user_role NOT NULL DEFAULT 'VIEWER',
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id     UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  visit_time  TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_id   TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id         UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  overall_rating  SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness     SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
  safety          SMALLINT CHECK (safety BETWEEN 1 AND 5),
  facilities      SMALLINT CHECK (facilities BETWEEN 1 AND 5),
  greenery        SMALLINT CHECK (greenery BETWEEN 1 AND 5),
  lighting        SMALLINT CHECK (lighting BETWEEN 1 AND 5),
  playground      SMALLINT CHECK (playground BETWEEN 1 AND 5),
  washroom        SMALLINT CHECK (washroom BETWEEN 1 AND 5),
  suggestion      TEXT,
  anonymous       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id      UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  issue_type   TEXT NOT NULL,
  priority     request_priority NOT NULL DEFAULT 'medium',
  description  TEXT NOT NULL,
  photo_url    TEXT,
  status       request_status NOT NULL DEFAULT 'open',
  assigned_to  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_visits_park_id ON visits(park_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_time ON visits(visit_time);
CREATE INDEX IF NOT EXISTS idx_feedback_park_id ON feedback(park_id);
CREATE INDEX IF NOT EXISTS idx_feedback_overall_rating ON feedback(overall_rating);
CREATE INDEX IF NOT EXISTS idx_maintenance_park_id ON maintenance_requests(park_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned_to ON maintenance_requests(assigned_to);
