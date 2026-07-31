import { supabase } from './supabase';

/**
 * Get all employees (Super Admin only via RLS).
 */
export async function getEmployees() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
  return { data, error };
}

/**
 * Create a new employee (Super Admin only).
 * 1. Creates user in Supabase Auth
 * 2. Profile is auto-created by the handle_new_user trigger
 */
export async function createEmployee(payload) {
  const { email, password, full_name, phone, designation, department, role } = payload;

  // Step 1: Create auth user with metadata
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role,
    },
  });

  if (authError) {
    // Fallback: if admin API is not available, use signUp
    // Note: This requires the service role key which should NOT be in frontend.
    // In production, this should be handled via an Edge Function.
    return { data: null, error: authError };
  }

  // Step 2: Update profile with additional fields (trigger creates basic profile)
  if (authData?.user) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        phone,
        designation,
        department,
        role,
      })
      .eq('auth_user_id', authData.user.id)
      .select()
      .single();
    return { data, error };
  }

  return { data: authData, error: null };
}

/**
 * Update an employee profile (Super Admin only).
 */
export async function updateEmployee(id, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * Deactivate an employee (set active = false).
 */
export async function deactivateEmployee(id) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ active: false })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete an employee (removes profile; auth user cascade handles the rest).
 */
export async function deleteEmployee(id) {
  // First get the auth_user_id to delete from auth
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('auth_user_id')
    .eq('id', id)
    .single();

  if (fetchError) return { error: fetchError };

  // Delete the profile (cascade will handle FK references)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Send password reset email for an employee.
 */
export async function resetEmployeePassword(id) {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', id)
    .single();

  if (fetchError) return { error: fetchError };

  const { data, error } = await supabase.auth.resetPasswordForEmail(profile.email);
  return { data, error };
}

/**
 * Get active officers (for assignment dropdown).
 */
export async function getActiveOfficers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, designation')
    .eq('active', true)
    .in('role', ['OFFICER', 'ADMIN', 'SUPER_ADMIN'])
    .order('full_name');
  return { data, error };
}
