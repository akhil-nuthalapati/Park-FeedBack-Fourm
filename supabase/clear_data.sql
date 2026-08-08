-- =============================================================================
-- Park Maintenance System — Full Reset & Re-Seed Script
-- Team Zenith
-- =============================================================================
-- Run this to wipe all activity data and re-populate with fresh seed data.
-- Parks are UPSERTED (not deleted) so QR codes stay consistent.
-- Visits, Feedback, Maintenance are TRUNCATED then re-seeded.
-- IDEMPOTENT: Safe to run multiple times — same result every time.
-- =============================================================================

-- Step 1: Clear all activity data (cascade removes child records automatically)
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE maintenance_requests CASCADE;
TRUNCATE TABLE feedback CASCADE;
TRUNCATE TABLE visits CASCADE;

-- Step 2: Upsert all 13 GVMC parks (preserves IDs & QR codes)
INSERT INTO parks (id, name, location, ward, latitude, longitude, status, qr_code)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Indira Gandhi Park',        'Sector 12, MVP Colony, Vizag',   'Ward 10', 17.7231, 83.3013, 'active',      'PARK-IGP-001'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'VUDA Park',                 'Beach Road, Vizag',              'Ward 5',  17.7140, 83.3183, 'active',      'PARK-VUDA-002'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Kailasagiri Park',          'Kailasagiri Hill, Vizag',        'Ward 15', 17.7520, 83.3750, 'active',      'PARK-KGP-003'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Ross Hill Park',            'Ross Hill, Vizag',               'Ward 8',  17.7180, 83.2980, 'maintenance', 'PARK-RHP-004'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Tenneti Park',              'Rushikonda Beach, Vizag',        'Ward 20', 17.7610, 83.3840, 'active',      'PARK-TNP-005'),
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'MVP Colony Central Park',   'MVP Colony Sector 11, Vizag',    'Ward 17', 17.7372, 83.3210, 'active',      'PARK-MVP-006'),
  ('07a8b9c0-d1e2-4a3b-4c5d-6e7f8a9b0c1d', 'Seethammadhara Park',       'Seethammadhara, Vizag',          'Ward 22', 17.7458, 83.3119, 'active',      'PARK-SMP-007'),
  ('18b9c0d1-e2f3-4b4c-5d6e-7f8a9b0c1d2e', 'Bheemili Beach Park',       'Bheemili Beach, Vizag',          'Ward 34', 17.8893, 83.4561, 'active',      'PARK-BBP-008'),
  ('29c0d1e2-f3a4-4c5d-6e7f-8a9b0c1d2e3f', 'YSR Jagananna Park',        'Steel Plant Road, Gajuwaka',     'Ward 40', 17.6882, 83.2198, 'active',      'PARK-YJP-009'),
  ('3ad1e2f3-a4b5-4d6e-7f8a-9b0c1d2e3f4a', 'Kommadi Eco Park',          'Kommadi Junction, Vizag',        'Ward 38', 17.7789, 83.4012, 'active',      'PARK-KEP-010'),
  ('4be2f3a4-b5c6-4e7f-8a9b-0c1d2e3f4a5b', 'Maddilapalem Park',         'Maddilapalem, Vizag',            'Ward 19', 17.7521, 83.3288, 'active',      'PARK-MLP-011'),
  ('5cf3a4b5-c6d7-4f8a-9b0c-1d2e3f4a5b6c', 'Bheemunipatnam Civic Park', 'Bheemunipatnam, Vizag',          'Ward 36', 17.8967, 83.4423, 'maintenance', 'PARK-BCP-012'),
  ('6da4b5c6-d7e8-4a9b-0c1d-2e3f4a5b6c7d', 'Pendurthi Central Park',    'Pendurthi Municipality, Vizag',  'Ward 1',  17.8104, 83.2487, 'active',      'PARK-PCP-013')
ON CONFLICT (id) DO UPDATE SET
  name      = EXCLUDED.name,
  location  = EXCLUDED.location,
  ward      = EXCLUDED.ward,
  latitude  = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  status    = EXCLUDED.status;

-- Step 3: Re-seed visits with fixed UUIDs
INSERT INTO visits (id, park_id, visit_time, device_id)
VALUES
  ('aa000001-0000-4000-8000-000000000001', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '1 hour',          'device-001'),
  ('aa000002-0000-4000-8000-000000000002', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '3 hours',         'device-002'),
  ('aa000003-0000-4000-8000-000000000003', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '2 hours',         'device-003'),
  ('aa000004-0000-4000-8000-000000000004', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '4 hours',         'device-004'),
  ('aa000005-0000-4000-8000-000000000005', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '5 hours',         'device-005'),
  ('aa000006-0000-4000-8000-000000000006', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', now() - interval '1 day',           'device-006'),
  ('aa000007-0000-4000-8000-000000000007', '07a8b9c0-d1e2-4a3b-4c5d-6e7f8a9b0c1d', now() - interval '1 day 2 hours',   'device-007'),
  ('aa000008-0000-4000-8000-000000000008', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '1 day 4 hours',   'device-008'),
  ('aa000009-0000-4000-8000-000000000009', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '2 days',          'device-009'),
  ('aa000010-0000-4000-8000-000000000010', '29c0d1e2-f3a4-4c5d-6e7f-8a9b0c1d2e3f', now() - interval '2 days 3 hours',  'device-010'),
  ('aa000011-0000-4000-8000-000000000011', '3ad1e2f3-a4b5-4d6e-7f8a-9b0c1d2e3f4a', now() - interval '3 days',          'device-011'),
  ('aa000012-0000-4000-8000-000000000012', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '3 days 2 hours',  'device-012'),
  ('aa000013-0000-4000-8000-000000000013', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '4 days',          'device-013'),
  ('aa000014-0000-4000-8000-000000000014', '4be2f3a4-b5c6-4e7f-8a9b-0c1d2e3f4a5b', now() - interval '4 days 1 hour',   'device-014'),
  ('aa000015-0000-4000-8000-000000000015', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '5 days',          'device-015'),
  ('aa000016-0000-4000-8000-000000000016', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', now() - interval '5 days 2 hours',  'device-016'),
  ('aa000017-0000-4000-8000-000000000017', '6da4b5c6-d7e8-4a9b-0c1d-2e3f4a5b6c7d', now() - interval '6 days',          'device-017'),
  ('aa000018-0000-4000-8000-000000000018', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '6 days 4 hours',  'device-018'),
  ('aa000019-0000-4000-8000-000000000019', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '7 days',          'device-019'),
  ('aa000020-0000-4000-8000-000000000020', '07a8b9c0-d1e2-4a3b-4c5d-6e7f8a9b0c1d', now() - interval '8 days',          'device-020'),
  ('aa000021-0000-4000-8000-000000000021', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', now() - interval '9 days',          'device-021'),
  ('aa000022-0000-4000-8000-000000000022', '3ad1e2f3-a4b5-4d6e-7f8a-9b0c1d2e3f4a', now() - interval '10 days',         'device-022'),
  ('aa000023-0000-4000-8000-000000000023', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', now() - interval '10 days 3 hours', 'device-023'),
  ('aa000024-0000-4000-8000-000000000024', '29c0d1e2-f3a4-4c5d-6e7f-8a9b0c1d2e3f', now() - interval '11 days',         'device-024'),
  ('aa000025-0000-4000-8000-000000000025', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '12 days',         'device-025'),
  ('aa000026-0000-4000-8000-000000000026', '4be2f3a4-b5c6-4e7f-8a9b-0c1d2e3f4a5b', now() - interval '12 days 2 hours', 'device-026'),
  ('aa000027-0000-4000-8000-000000000027', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', now() - interval '13 days',         'device-027'),
  ('aa000028-0000-4000-8000-000000000028', '6da4b5c6-d7e8-4a9b-0c1d-2e3f4a5b6c7d', now() - interval '13 days 5 hours', 'device-028'),
  ('aa000029-0000-4000-8000-000000000029', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', now() - interval '14 days',         'device-029'),
  ('aa000030-0000-4000-8000-000000000030', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', now() - interval '14 days 6 hours', 'device-030')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Re-seed feedback
INSERT INTO feedback (id, park_id, overall_rating, cleanliness, safety, facilities, greenery, lighting, playground, washroom, suggestion)
VALUES
  ('bb000001-0000-4000-8000-000000000001', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 5, 4, 5, 4, 5, 4, 3, 3, 'Excellent park! Could use more drinking water stations.'),
  ('bb000002-0000-4000-8000-000000000002', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 4, 3, 4, 3, 5, 3, 4, 2, 'Washrooms need improvement. Otherwise a great park.'),
  ('bb000003-0000-4000-8000-000000000003', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 5, 5, 5, 4, 5, 5, 4, 4, 'Beautiful beach road park, extremely well maintained!'),
  ('bb000004-0000-4000-8000-000000000004', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 3, 2, 3, 3, 4, 2, 3, 2, 'Lighting is poor in the evening. Safety concern near east gate.'),
  ('bb000005-0000-4000-8000-000000000005', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 5, 5, 5, 5, 5, 5, 5, 4, 'Best park in the city! The ropeway and hilltop view are amazing.'),
  ('bb000006-0000-4000-8000-000000000006', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 4, 4, 4, 3, 5, 4, 4, 3, 'Playground equipment needs regular maintenance. Greenery is superb.'),
  ('bb000007-0000-4000-8000-000000000007', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 2, 2, 2, 1, 3, 1, 1, 1, 'Park is under maintenance. Not accessible currently. Hope repairs finish soon.'),
  ('bb000008-0000-4000-8000-000000000008', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 4, 4, 4, 3, 5, 4, 3, 3, 'Good park near Rushikonda. More seating benches would help.'),
  ('bb000009-0000-4000-8000-000000000009', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 5, 5, 5, 4, 5, 5, 4, 4, 'Perfectly maintained. Love the ocean view and morning walks!'),
  ('bb000010-0000-4000-8000-000000000010', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 3, 3, 3, 2, 4, 3, 3, 2, 'Average experience this visit. Dustbins were overflowing.'),
  ('bb000011-0000-4000-8000-000000000011', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 4, 4, 4, 3, 5, 3, 4, 3, 'MVP Colony Park is a gem! Well maintained walking track.'),
  ('bb000012-0000-4000-8000-000000000012', '07a8b9c0-d1e2-4a3b-4c5d-6e7f8a9b0c1d', 5, 5, 5, 4, 5, 4, 4, 4, 'Seethammadhara Park is lovely. Very peaceful morning environment.'),
  ('bb000013-0000-4000-8000-000000000013', '18b9c0d1-e2f3-4b4c-5d6e-7f8a9b0c1d2e', 4, 4, 3, 3, 5, 3, 3, 2, 'Bheemili Beach Park is scenic but needs better washroom facilities.'),
  ('bb000014-0000-4000-8000-000000000014', '29c0d1e2-f3a4-4c5d-6e7f-8a9b0c1d2e3f', 4, 3, 4, 3, 4, 4, 4, 3, 'YSR Jagananna Park is great for families. Kids love the play area.'),
  ('bb000015-0000-4000-8000-000000000015', '3ad1e2f3-a4b5-4d6e-7f8a-9b0c1d2e3f4a', 5, 5, 5, 4, 5, 5, 4, 4, 'Kommadi Eco Park is stunning. Excellent biodiversity and clean.'),
  ('bb000016-0000-4000-8000-000000000016', '4be2f3a4-b5c6-4e7f-8a9b-0c1d2e3f4a5b', 3, 3, 3, 3, 4, 3, 3, 2, 'Maddilapalem Park needs more lighting in the evening for safety.')
ON CONFLICT (id) DO NOTHING;

-- Step 5: Re-seed maintenance requests
INSERT INTO maintenance_requests (id, park_id, issue_type, priority, description, status, created_at)
VALUES
  ('cc000001-0000-4000-8000-000000000001', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'equipment', 'high',     'Broken bench near the main entrance. Sharp edges exposed, safety hazard for children.',            'open',        now() - interval '1 day'),
  ('cc000002-0000-4000-8000-000000000002', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'hygiene',   'critical', 'Overflowing dustbins near the food court area. Attracting stray animals.',                         'in_progress', now() - interval '2 days'),
  ('cc000003-0000-4000-8000-000000000003', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'lighting',  'high',     'Three street lights not working on the walking trail. Dark and unsafe after 6 PM.',               'open',        now() - interval '3 days'),
  ('cc000004-0000-4000-8000-000000000004', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'safety',    'medium',   'Railing on the bridge is loose. Needs tightening before it becomes dangerous.',                   'resolved',    now() - interval '5 days'),
  ('cc000005-0000-4000-8000-000000000005', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'greenery',  'low',      'Some flower beds need replanting. The roses have dried up in the east garden.',                   'open',        now() - interval '4 days'),
  ('cc000006-0000-4000-8000-000000000006', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'equipment', 'medium',   'Swing set chain is rusty and creaking. Needs replacement for child safety.',                       'in_progress', now() - interval '6 days'),
  ('cc000007-0000-4000-8000-000000000007', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'other',     'critical', 'Major water leakage from the irrigation system. Flooding the walking path.',                      'rejected',    now() - interval '7 days'),
  ('cc000008-0000-4000-8000-000000000008', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'hygiene',   'medium',   'Public washroom door lock is broken. No privacy for users.',                                      'resolved',    now() - interval '10 days'),
  ('cc000009-0000-4000-8000-000000000009', 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'lighting',  'high',     'MVP Colony Park east section lights not functioning. Evening walkers affected.',                   'open',        now() - interval '2 days'),
  ('cc000010-0000-4000-8000-000000000010', '07a8b9c0-d1e2-4a3b-4c5d-6e7f8a9b0c1d', 'equipment', 'medium',   'Seethammadhara Park — exercise machine handle broken. Risk of injury.',                           'in_progress', now() - interval '3 days'),
  ('cc000011-0000-4000-8000-000000000011', '29c0d1e2-f3a4-4c5d-6e7f-8a9b0c1d2e3f', 'hygiene',   'high',     'YSR Jagananna Park — garbage bins overflowing near main gate. Requires immediate attention.',   'open',        now() - interval '1 day'),
  ('cc000012-0000-4000-8000-000000000012', '3ad1e2f3-a4b5-4d6e-7f8a-9b0c1d2e3f4a', 'greenery',  'low',      'Kommadi Eco Park — some saplings need watering. Dry spell has affected the new plantation.',    'open',        now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;
