-- =============================================================================
-- Park Maintenance System — Seed Data
-- Team Zenith
-- =============================================================================
-- Run AFTER schema.sql, functions.sql, and policies.sql.
-- Idempotent: uses ON CONFLICT DO NOTHING where possible.
-- =============================================================================
-- NOTE: Employee auth users must be created via Supabase Auth (dashboard or API).
-- The profiles below reference auth_user_id placeholders. Replace them with
-- actual auth.users IDs after creating users in Supabase Auth dashboard.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PARKS (5 parks)
-- ---------------------------------------------------------------------------

INSERT INTO parks (id, name, location, ward, latitude, longitude, status, qr_code)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Indira Gandhi Park', 'Sector 12, Vizag', 'Ward 10', 17.7231, 83.3013, 'active', 'PARK-IGP-001'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'VUDA Park', 'Beach Road, Vizag', 'Ward 5', 17.7140, 83.3183, 'active', 'PARK-VUDA-002'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Kailasagiri Park', 'Kailasagiri Hill', 'Ward 15', 17.7520, 83.3750, 'active', 'PARK-KGP-003'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Ross Hill Park', 'Ross Hill', 'Ward 8', 17.7180, 83.2980, 'maintenance', 'PARK-RHP-004'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Tenneti Park', 'Rushikonda', 'Ward 20', 17.7610, 83.3840, 'active', 'PARK-TNP-005')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. VISITS (20 visits across parks, spread over last 14 days)
-- ---------------------------------------------------------------------------

INSERT INTO visits (id, park_id, visit_time, device_id)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '1 day', 'device-001'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '1 day 2 hours', 'device-002'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '1 day 3 hours', 'device-003'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '2 days', 'device-004'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '2 days 1 hour', 'device-005'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '3 days', 'device-006'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '3 days 4 hours', 'device-007'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '4 days', 'device-008'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '4 days 2 hours', 'device-009'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '5 days', 'device-010'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '5 days 3 hours', 'device-011'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '6 days', 'device-012'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '7 days', 'device-013'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '8 days', 'device-014'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '9 days', 'device-015'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '10 days', 'device-016'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '11 days', 'device-017'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '12 days', 'device-018'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '13 days', 'device-019'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '14 days', 'device-020')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. FEEDBACK (10 entries)
-- ---------------------------------------------------------------------------

INSERT INTO feedback (id, park_id, overall_rating, cleanliness, safety, facilities, greenery, lighting, playground, washroom, suggestion)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 5, 4, 5, 4, 5, 4, 3, 3, 'Excellent park! Could use more drinking water stations.'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 4, 3, 4, 3, 5, 3, 4, 2, 'Washrooms need improvement.'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 5, 5, 5, 4, 5, 5, 4, 4, 'Beautiful beach road park, well maintained!'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 3, 2, 3, 3, 4, 2, 3, 2, 'Lighting is poor in the evening. Safety concern.'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 5, 5, 5, 5, 5, 5, 5, 4, 'Best park in the city! The ropeway view is amazing.'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 4, 4, 4, 3, 5, 4, 4, 3, 'Playground equipment needs regular maintenance.'),
  (gen_random_uuid(), 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 2, 2, 2, 1, 3, 1, 1, 1, 'Park is under maintenance. Not usable currently.'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 4, 4, 4, 3, 5, 4, 3, 3, 'Good park near Rushikonda. More seating would help.'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 5, 5, 5, 4, 5, 5, 4, 4, 'Perfectly maintained. Love the ocean view!'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 3, 3, 3, 2, 4, 3, 3, 2, 'Average experience. Dustbins were overflowing.')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. MAINTENANCE REQUESTS (8 across different statuses/priorities)
-- ---------------------------------------------------------------------------

INSERT INTO maintenance_requests (id, park_id, issue_type, priority, description, status, created_at)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'equipment', 'high', 'Broken bench near the main entrance. Sharp edges exposed, safety hazard for children.', 'open', now() - interval '1 day'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'hygiene', 'critical', 'Overflowing dustbins near the food court area. Attracting stray animals.', 'in_progress', now() - interval '2 days'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'lighting', 'high', 'Three street lights not working on the walking trail. Dark and unsafe after 6 PM.', 'open', now() - interval '3 days'),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'safety', 'medium', 'Railing on the bridge is loose. Needs tightening before it becomes dangerous.', 'resolved', now() - interval '5 days'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'greenery', 'low', 'Some flower beds need replanting. The roses have dried up in the east garden.', 'open', now() - interval '4 days'),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'equipment', 'medium', 'Swing set chain is rusty and creaking. Needs replacement for children safety.', 'in_progress', now() - interval '6 days'),
  (gen_random_uuid(), 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'other', 'critical', 'Major water leakage from the irrigation system. Flooding the walking path.', 'rejected', now() - interval '7 days'),
  (gen_random_uuid(), 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'hygiene', 'medium', 'Public washroom door lock is broken. No privacy for users.', 'resolved', now() - interval '10 days')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. PROFILES (4 employees — one per role)
-- ---------------------------------------------------------------------------
-- IMPORTANT: Replace the auth_user_id values below with actual Supabase Auth
-- user IDs. You need to create these users in Supabase Auth first:
--   1. super_admin@parkms.gov.in  (password: Admin@2026)
--   2. admin@parkms.gov.in        (password: Admin@2026)
--   3. officer@parkms.gov.in      (password: Officer@2026)
--   4. viewer@parkms.gov.in       (password: Viewer@2026)
-- After creating them in Supabase Auth, copy their auth.users.id and replace below.
-- ---------------------------------------------------------------------------
-- NOTE: If you use the handle_new_user trigger (functions.sql), profiles will
-- be auto-created when you create auth users with proper metadata. Otherwise,
-- uncomment and run the inserts below with correct auth_user_ids.
-- ---------------------------------------------------------------------------

-- INSERT INTO profiles (id, auth_user_id, full_name, email, phone, designation, department, role, active)
-- VALUES
--   (gen_random_uuid(), '<REPLACE_WITH_AUTH_USER_ID_1>', 'Rajesh Kumar', 'super_admin@parkms.gov.in', '+91-9876543210', 'Commissioner', 'Parks & Recreation', 'SUPER_ADMIN', true),
--   (gen_random_uuid(), '<REPLACE_WITH_AUTH_USER_ID_2>', 'Priya Sharma', 'admin@parkms.gov.in', '+91-9876543211', 'Deputy Commissioner', 'Parks & Recreation', 'ADMIN', true),
--   (gen_random_uuid(), '<REPLACE_WITH_AUTH_USER_ID_3>', 'Vikram Singh', 'officer@parkms.gov.in', '+91-9876543212', 'Field Officer', 'Maintenance Division', 'OFFICER', true),
--   (gen_random_uuid(), '<REPLACE_WITH_AUTH_USER_ID_4>', 'Anita Patel', 'viewer@parkms.gov.in', '+91-9876543213', 'Data Analyst', 'Analytics & Reporting', 'VIEWER', true)
-- ON CONFLICT (email) DO NOTHING;
