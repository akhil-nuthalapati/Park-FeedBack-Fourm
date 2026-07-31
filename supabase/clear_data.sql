TRUNCATE TABLE visits CASCADE;
TRUNCATE TABLE feedback CASCADE;
TRUNCATE TABLE maintenance_requests CASCADE;

INSERT INTO parks (id, name, location, ward, latitude, longitude, status, qr_code)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Indira Gandhi Park', 'Sector 12, Vizag', 'Ward 10', 17.7231, 83.3013, 'active', 'PARK-IGP-001'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'VUDA Park', 'Beach Road, Vizag', 'Ward 5', 17.7140, 83.3183, 'active', 'PARK-VUDA-002'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Kailasagiri Park', 'Kailasagiri Hill', 'Ward 15', 17.7520, 83.3750, 'active', 'PARK-KGP-003'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Ross Hill Park', 'Ross Hill', 'Ward 8', 17.7180, 83.2980, 'maintenance', 'PARK-RHP-004'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Tenneti Park', 'Rushikonda', 'Ward 20', 17.7610, 83.3840, 'active', 'PARK-TNP-005')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  ward = EXCLUDED.ward,
  status = EXCLUDED.status;
