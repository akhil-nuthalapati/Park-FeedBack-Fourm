-- =============================================================================
-- Park Maintenance System — Row Level Security Policies
-- Team Zenith
-- =============================================================================
-- Run AFTER schema.sql and functions.sql.
-- Enables RLS on all tables and creates named, single-purpose policies
-- enforcing the permission matrix from the specification.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL TABLES
-- ---------------------------------------------------------------------------

ALTER TABLE parks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback             ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. PARKS POLICIES
-- ---------------------------------------------------------------------------

-- Anonymous visitors can read active parks only
DROP POLICY IF EXISTS "anon_read_active_parks" ON parks;
CREATE POLICY "anon_read_active_parks"
  ON parks FOR SELECT
  TO anon
  USING (status = 'active');

-- Authenticated users (all roles) can read all parks
DROP POLICY IF EXISTS "auth_read_all_parks" ON parks;
CREATE POLICY "auth_read_all_parks"
  ON parks FOR SELECT
  TO authenticated
  USING (true);

-- ADMIN and SUPER_ADMIN can insert parks
DROP POLICY IF EXISTS "admin_insert_parks" ON parks;
CREATE POLICY "admin_insert_parks"
  ON parks FOR INSERT
  TO authenticated
  WITH CHECK (current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- ADMIN and SUPER_ADMIN can update parks
DROP POLICY IF EXISTS "admin_update_parks" ON parks;
CREATE POLICY "admin_update_parks"
  ON parks FOR UPDATE
  TO authenticated
  USING (current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Only SUPER_ADMIN can delete parks
DROP POLICY IF EXISTS "super_admin_delete_parks" ON parks;
CREATE POLICY "super_admin_delete_parks"
  ON parks FOR DELETE
  TO authenticated
  USING (current_user_role() = 'SUPER_ADMIN');

-- ---------------------------------------------------------------------------
-- 3. VISITS POLICIES
-- ---------------------------------------------------------------------------

-- Anonymous visitors can INSERT only (check-in)
DROP POLICY IF EXISTS "anon_insert_visits" ON visits;
CREATE POLICY "anon_insert_visits"
  ON visits FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can also insert visits
DROP POLICY IF EXISTS "auth_insert_visits" ON visits;
CREATE POLICY "auth_insert_visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users (all roles) can read visits
DROP POLICY IF EXISTS "auth_read_visits" ON visits;
CREATE POLICY "auth_read_visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

-- SUPER_ADMIN can delete visits
DROP POLICY IF EXISTS "super_admin_delete_visits" ON visits;
CREATE POLICY "super_admin_delete_visits"
  ON visits FOR DELETE
  TO authenticated
  USING (current_user_role() = 'SUPER_ADMIN');

-- NOTE: No SELECT policy for anon on visits (anonymous cannot read visits)

-- ---------------------------------------------------------------------------
-- 4. FEEDBACK POLICIES
-- ---------------------------------------------------------------------------

-- Anonymous visitors can INSERT only
DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback;
CREATE POLICY "anon_insert_feedback"
  ON feedback FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can also insert feedback
DROP POLICY IF EXISTS "auth_insert_feedback" ON feedback;
CREATE POLICY "auth_insert_feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users (all roles) can read feedback
DROP POLICY IF EXISTS "auth_read_feedback" ON feedback;
CREATE POLICY "auth_read_feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (true);

-- SUPER_ADMIN can delete feedback
DROP POLICY IF EXISTS "super_admin_delete_feedback" ON feedback;
CREATE POLICY "super_admin_delete_feedback"
  ON feedback FOR DELETE
  TO authenticated
  USING (current_user_role() = 'SUPER_ADMIN');

-- NOTE: No SELECT policy for anon on feedback

-- ---------------------------------------------------------------------------
-- 5. MAINTENANCE REQUESTS POLICIES
-- ---------------------------------------------------------------------------

-- Anonymous visitors can INSERT only
DROP POLICY IF EXISTS "anon_insert_maintenance" ON maintenance_requests;
CREATE POLICY "anon_insert_maintenance"
  ON maintenance_requests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can also insert maintenance requests
DROP POLICY IF EXISTS "auth_insert_maintenance" ON maintenance_requests;
CREATE POLICY "auth_insert_maintenance"
  ON maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users (all roles) can read maintenance requests
DROP POLICY IF EXISTS "auth_read_maintenance" ON maintenance_requests;
CREATE POLICY "auth_read_maintenance"
  ON maintenance_requests FOR SELECT
  TO authenticated
  USING (true);

-- OFFICER can update status and assigned_to only (not delete)
DROP POLICY IF EXISTS "officer_update_maintenance" ON maintenance_requests;
CREATE POLICY "officer_update_maintenance"
  ON maintenance_requests FOR UPDATE
  TO authenticated
  USING (current_user_role() IN ('OFFICER', 'ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (current_user_role() IN ('OFFICER', 'ADMIN', 'SUPER_ADMIN'));

-- Only ADMIN and SUPER_ADMIN can delete maintenance requests
DROP POLICY IF EXISTS "admin_delete_maintenance" ON maintenance_requests;
CREATE POLICY "admin_delete_maintenance"
  ON maintenance_requests FOR DELETE
  TO authenticated
  USING (current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- NOTE: No SELECT policy for anon on maintenance_requests

-- ---------------------------------------------------------------------------
-- 6. PROFILES POLICIES
-- ---------------------------------------------------------------------------

-- Authenticated users can read their own profile
DROP POLICY IF EXISTS "auth_read_own_profile" ON profiles;
CREATE POLICY "auth_read_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR current_user_role() = 'SUPER_ADMIN');

-- Only SUPER_ADMIN can insert new profiles (create employees)
DROP POLICY IF EXISTS "super_admin_insert_profiles" ON profiles;
CREATE POLICY "super_admin_insert_profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (current_user_role() = 'SUPER_ADMIN');

-- Only SUPER_ADMIN can update profiles
DROP POLICY IF EXISTS "super_admin_update_profiles" ON profiles;
CREATE POLICY "super_admin_update_profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (current_user_role() = 'SUPER_ADMIN')
  WITH CHECK (current_user_role() = 'SUPER_ADMIN');

-- Only SUPER_ADMIN can delete profiles
DROP POLICY IF EXISTS "super_admin_delete_profiles" ON profiles;
CREATE POLICY "super_admin_delete_profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (current_user_role() = 'SUPER_ADMIN');

-- NOTE: No access for anon on profiles

-- ---------------------------------------------------------------------------
-- 7. STORAGE BUCKET & POLICIES
-- ---------------------------------------------------------------------------

-- Create the maintenance-images bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-images', 'maintenance-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anonymous users can upload images
DROP POLICY IF EXISTS "anon_upload_maintenance_images" ON storage.objects;
CREATE POLICY "anon_upload_maintenance_images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'maintenance-images');

-- Authenticated users can upload images
DROP POLICY IF EXISTS "auth_upload_maintenance_images" ON storage.objects;
CREATE POLICY "auth_upload_maintenance_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'maintenance-images');

-- Anyone can read maintenance images (public bucket)
DROP POLICY IF EXISTS "public_read_maintenance_images" ON storage.objects;
CREATE POLICY "public_read_maintenance_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'maintenance-images');

-- ADMIN and SUPER_ADMIN can delete images
DROP POLICY IF EXISTS "admin_delete_maintenance_images" ON storage.objects;
CREATE POLICY "admin_delete_maintenance_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'maintenance-images'
    AND current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );
