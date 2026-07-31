-- =============================================================================
-- Park Maintenance System — Schema Definition
-- Team Zenith
-- =============================================================================
-- This file creates all enum types, tables, foreign keys, indexes, and 
-- constraints for the Park Maintenance System database.
-- Idempotent: safe to re-run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE park_status AS ENUM ('active', 'inactive', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OFFICER', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_type AS ENUM ('equipment', 'lighting', 'hygiene', 'safety', 'greenery', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'resolved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------------

-- Parks table
CREATE TABLE IF NOT EXISTS parks (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text          NOT NULL,
  location    text,
  ward        text,
  latitude    numeric(9,6),
  longitude   numeric(9,6),
  status      park_status   NOT NULL DEFAULT 'active',
  qr_code     text          UNIQUE NOT NULL,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- Profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  uuid          UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text          NOT NULL,
  email         text          UNIQUE NOT NULL,
  phone         text,
  designation   text,
  department    text,
  role          user_role     NOT NULL DEFAULT 'VIEWER',
  active        boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id     uuid          NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  visit_time  timestamptz   NOT NULL DEFAULT now(),
  device_id   text,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id         uuid        NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  overall_rating  smallint    NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness     smallint    CHECK (cleanliness BETWEEN 1 AND 5),
  safety          smallint    CHECK (safety BETWEEN 1 AND 5),
  facilities      smallint    CHECK (facilities BETWEEN 1 AND 5),
  greenery        smallint    CHECK (greenery BETWEEN 1 AND 5),
  lighting        smallint    CHECK (lighting BETWEEN 1 AND 5),
  playground      smallint    CHECK (playground BETWEEN 1 AND 5),
  washroom        smallint    CHECK (washroom BETWEEN 1 AND 5),
  suggestion      text,
  anonymous       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Maintenance Requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id            uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id       uuid            NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  issue_type    issue_type      NOT NULL,
  priority      priority_level  NOT NULL DEFAULT 'medium',
  description   text            NOT NULL,
  photo_url     text,
  status        request_status  NOT NULL DEFAULT 'open',
  assigned_to   uuid            REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at   timestamptz,
  created_at    timestamptz     NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. INDEXES
-- ---------------------------------------------------------------------------

-- Parks indexes
CREATE INDEX IF NOT EXISTS idx_parks_ward       ON parks(ward);
CREATE INDEX IF NOT EXISTS idx_parks_status      ON parks(status);

-- Visits indexes
CREATE INDEX IF NOT EXISTS idx_visits_park_id    ON visits(park_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_time ON visits(visit_time);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_park_id    ON feedback(park_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_overall    ON feedback(overall_rating);

-- Maintenance Requests indexes
CREATE INDEX IF NOT EXISTS idx_maint_park_id     ON maintenance_requests(park_id);
CREATE INDEX IF NOT EXISTS idx_maint_status      ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maint_priority    ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maint_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maint_created_at  ON maintenance_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_maint_issue_type  ON maintenance_requests(issue_type);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role      ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active    ON profiles(active);
