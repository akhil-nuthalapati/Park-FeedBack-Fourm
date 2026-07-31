-- =============================================================================
-- Park Maintenance System — Helper Functions & Triggers
-- Team Zenith
-- =============================================================================
-- This file creates security-definer helper functions and triggers.
-- Must be run BEFORE policies.sql (which references current_user_role()).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SECURITY DEFINER: current_user_role()
-- ---------------------------------------------------------------------------
-- Returns the caller's user_role from the profiles table.
-- Used inside RLS policies to avoid repeating subqueries.
-- Returns NULL for anonymous/unauthenticated users.

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 2. TRIGGER: auto-set resolved_at on status change to 'resolved'
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- When status changes to 'resolved', stamp resolved_at
  IF NEW.status = 'resolved' AND (OLD.status IS DISTINCT FROM 'resolved') THEN
    NEW.resolved_at = now();
  END IF;
  -- When status changes away from 'resolved', clear resolved_at
  IF NEW.status != 'resolved' AND OLD.status = 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trg_set_resolved_at ON maintenance_requests;
CREATE TRIGGER trg_set_resolved_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_resolved_at();

-- ---------------------------------------------------------------------------
-- 3. TRIGGER: auto-create profile on auth.users insert (optional helper)
-- ---------------------------------------------------------------------------
-- This is useful if admin creates users via Supabase Auth admin API.
-- The employeeService.js will handle profile creation explicitly,
-- so this is a safety net only.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (auth_user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'VIEWER')
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. DASHBOARD AGGREGATION HELPERS
-- ---------------------------------------------------------------------------

-- Get visit count for a park within a date range
CREATE OR REPLACE FUNCTION get_visit_count(
  p_park_id uuid DEFAULT NULL,
  p_start_date timestamptz DEFAULT (now() - interval '1 day'),
  p_end_date timestamptz DEFAULT now()
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)
  FROM visits
  WHERE (p_park_id IS NULL OR park_id = p_park_id)
    AND visit_time BETWEEN p_start_date AND p_end_date;
$$;

-- Get average ratings for a park
CREATE OR REPLACE FUNCTION get_average_ratings(
  p_park_id uuid DEFAULT NULL
)
RETURNS TABLE (
  avg_overall    numeric,
  avg_cleanliness numeric,
  avg_safety     numeric,
  avg_facilities numeric,
  avg_greenery   numeric,
  avg_lighting   numeric,
  avg_playground numeric,
  avg_washroom   numeric,
  total_feedback bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROUND(AVG(overall_rating)::numeric, 2),
    ROUND(AVG(cleanliness)::numeric, 2),
    ROUND(AVG(safety)::numeric, 2),
    ROUND(AVG(facilities)::numeric, 2),
    ROUND(AVG(greenery)::numeric, 2),
    ROUND(AVG(lighting)::numeric, 2),
    ROUND(AVG(playground)::numeric, 2),
    ROUND(AVG(washroom)::numeric, 2),
    COUNT(*)
  FROM feedback
  WHERE (p_park_id IS NULL OR park_id = p_park_id);
$$;

-- Get daily visitor counts (last 30 days)
CREATE OR REPLACE FUNCTION get_daily_visitors(
  p_park_id uuid DEFAULT NULL,
  p_days int DEFAULT 30
)
RETURNS TABLE (
  visit_date date,
  visitor_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    DATE(visit_time) AS visit_date,
    COUNT(*) AS visitor_count
  FROM visits
  WHERE (p_park_id IS NULL OR park_id = p_park_id)
    AND visit_time >= (now() - (p_days || ' days')::interval)
  GROUP BY DATE(visit_time)
  ORDER BY visit_date;
$$;
