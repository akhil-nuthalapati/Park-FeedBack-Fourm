CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER parks_updated_at
  BEFORE UPDATE ON parks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER maintenance_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'resolved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'resolved') THEN
    NEW.resolved_at = COALESCE(NEW.resolved_at, now());
  ELSIF NEW.status IS DISTINCT FROM 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS maintenance_resolved_at ON maintenance_requests;
CREATE TRIGGER maintenance_resolved_at
  BEFORE INSERT OR UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION set_resolved_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  extracted_role user_role := 'VIEWER';
  meta_role text;
BEGIN
  meta_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'VIEWER'));
  IF meta_role IN ('SUPER_ADMIN', 'ADMIN', 'OFFICER', 'VIEWER') THEN
    extracted_role := meta_role::user_role;
  END IF;

  INSERT INTO profiles (auth_user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    extracted_role
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

