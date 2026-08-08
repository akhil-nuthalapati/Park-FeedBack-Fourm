-- =============================================================================
-- Park Maintenance System — Complete RLS & Schema Fix Script
-- Team Zenith
-- =============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to fix:
--   1. Missing columns (ticket_code, visitor_phone, resolution_note, etc.)
--   2. RLS policy 401/403/Unauthorized errors on public submissions & reads
--   3. Missing announcements table
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTEND SCHEMA & COLUMNS ON MAINTENANCE_REQUESTS
-- ---------------------------------------------------------------------------

ALTER TABLE maintenance_requests 
  ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS visitor_phone TEXT,
  ADD COLUMN IF NOT EXISTS resolution_note TEXT,
  ADD COLUMN IF NOT EXISTS resolution_image_url TEXT,
  ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_maintenance_ticket_code ON maintenance_requests(ticket_code);
CREATE INDEX IF NOT EXISTS idx_maintenance_visitor_phone ON maintenance_requests(visitor_phone);

-- Convert issue_type column to TEXT if it was created as ENUM type so Postgres accepts custom issue category strings
DO $$ BEGIN
  ALTER TABLE maintenance_requests ALTER COLUMN issue_type TYPE TEXT USING issue_type::TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. CREATE ANNOUNCEMENTS TABLE IF NOT EXISTS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
  park_id     TEXT,
  park_name   TEXT NOT NULL DEFAULT 'All Parks',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. CREATE NOTIFICATIONS TABLE IF NOT EXISTS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'maintenance',
  reference_id UUID,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 4. ENABLE RLS AND GRANT PUBLIC ACCESS POLICIES FOR ALL TABLES
-- ---------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE parks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback             ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;

-- PARKS: Anyone (anon + authenticated) can SELECT parks
DROP POLICY IF EXISTS "anon_read_parks" ON parks;
DROP POLICY IF EXISTS "auth_read_all_parks" ON parks;
DROP POLICY IF EXISTS "public_read_parks" ON parks;
CREATE POLICY "public_read_parks" ON parks FOR SELECT TO anon, authenticated USING (true);

-- VISITS: Anyone (anon + authenticated) can INSERT and SELECT visits
DROP POLICY IF EXISTS "anon_insert_visits" ON visits;
DROP POLICY IF EXISTS "auth_insert_visits" ON visits;
DROP POLICY IF EXISTS "auth_read_visits" ON visits;
DROP POLICY IF EXISTS "public_insert_visits" ON visits;
DROP POLICY IF EXISTS "public_read_visits" ON visits;
CREATE POLICY "public_insert_visits" ON visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_read_visits"   ON visits FOR SELECT TO anon, authenticated USING (true);

-- FEEDBACK: Anyone (anon + authenticated) can INSERT and SELECT feedback
DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback;
DROP POLICY IF EXISTS "auth_insert_feedback" ON feedback;
DROP POLICY IF EXISTS "auth_read_feedback" ON feedback;
DROP POLICY IF EXISTS "public_insert_feedback" ON feedback;
DROP POLICY IF EXISTS "public_read_feedback" ON feedback;
CREATE POLICY "public_insert_feedback" ON feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_read_feedback"   ON feedback FOR SELECT TO anon, authenticated USING (true);

-- MAINTENANCE REQUESTS: Anyone (anon + authenticated) can INSERT and SELECT complaints
DROP POLICY IF EXISTS "anon_insert_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "auth_insert_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "anon_read_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "auth_read_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "public_insert_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "public_read_maintenance" ON maintenance_requests;

CREATE POLICY "public_insert_maintenance" ON maintenance_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_read_maintenance"   ON maintenance_requests FOR SELECT TO anon, authenticated USING (true);

-- ANNOUNCEMENTS: Anyone can SELECT, authenticated/anon can INSERT/UPDATE
DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
DROP POLICY IF EXISTS "public_all_announcements" ON announcements;
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_all_announcements"  ON announcements FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);

-- NOTIFICATIONS: Anyone can INSERT and SELECT notifications
DROP POLICY IF EXISTS "public_notifications_all" ON notifications;
CREATE POLICY "public_notifications_all" ON notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- PROFILES: Anyone can SELECT profile names for officer badges
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
