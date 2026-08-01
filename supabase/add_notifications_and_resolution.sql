-- ---------------------------------------------------------------------------
-- 1. ADD RESOLUTION & TICKET TRACKING COLUMNS TO MAINTENANCE_REQUESTS
-- ---------------------------------------------------------------------------

ALTER TABLE maintenance_requests 
  ADD COLUMN IF NOT EXISTS resolution_note TEXT,
  ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS visitor_phone TEXT,
  ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_maintenance_ticket_code ON maintenance_requests(ticket_code);
CREATE INDEX IF NOT EXISTS idx_maintenance_visitor_phone ON maintenance_requests(visitor_phone);

-- ---------------------------------------------------------------------------
-- 2. CREATE NOTIFICATIONS TABLE FOR STAFF PROFILES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'maintenance', -- 'maintenance' | 'escalation' | 'resolution' | 'info'
  reference_id UUID,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ---------------------------------------------------------------------------
-- 3. ENABLE RLS & POLICIES FOR NOTIFICATIONS
-- ---------------------------------------------------------------------------

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_notifications" ON notifications;
CREATE POLICY "auth_read_notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_update_notifications" ON notifications;
CREATE POLICY "auth_update_notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_maintenance_by_code" ON maintenance_requests;
CREATE POLICY "anon_read_maintenance_by_code"
  ON maintenance_requests FOR SELECT
  TO anon
  USING (true);
