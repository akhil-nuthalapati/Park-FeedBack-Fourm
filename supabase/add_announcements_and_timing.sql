-- 1. Create Announcements table for cross-device live broadcast alert banners
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

-- Enable RLS & Policies for Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all insert/update announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Convert issue_type column in maintenance_requests to TEXT so Postgres accepts all custom category strings
DO $$ BEGIN
  ALTER TABLE maintenance_requests ALTER COLUMN issue_type TYPE TEXT USING issue_type::TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
