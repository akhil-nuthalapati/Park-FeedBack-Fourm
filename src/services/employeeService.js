import { supabase, supabaseAdmin } from './supabase';

const publicClient = () => supabaseAdmin || supabase;

// employeeService always uses the authenticated supabase client for writes
// (creating users requires the signed-in super-admin session)
// Reads use publicClient so profile lists load reliably.

export async function getEmployees() {
  const db = publicClient();
  const { data, error } = await db.from('profiles').select('*').order('full_name');
  return { data: data || [], error };
}

export async function createEmployee(payload) {
  const { email, password, full_name, phone, designation, department, role } = payload;

  // Auth signUp always uses the authenticated supabase client
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
    },
  });

  if (authError) return { data: null, error: authError };

  if (authData?.user) {
    const db = publicClient();
    const { data, error } = await db
      .from('profiles')
      .update({ phone, designation, department, role })
      .eq('auth_user_id', authData.user.id)
      .select()
      .maybeSingle();
    return { data: data || authData.user, error };
  }

  return { data: authData, error: null };
}

export async function updateEmployee(id, payload) {
  const db = publicClient();
  const { data, error } = await db.from('profiles').update(payload).eq('id', id).select().single();
  return { data, error };
}

export async function deactivateEmployee(id) {
  const db = publicClient();
  const { data, error } = await db.from('profiles').update({ active: false }).eq('id', id).select().single();
  return { data, error };
}

export async function deleteEmployee(id) {
  const db = publicClient();
  const { data: profile, error: fetchError } = await db
    .from('profiles')
    .select('auth_user_id')
    .eq('id', id)
    .single();
  if (fetchError) return { error: fetchError };
  const { error } = await db.from('profiles').delete().eq('id', id);
  return { error };
}

export async function resetEmployeePassword(id) {
  const db = publicClient();
  const { data: profile, error: fetchError } = await db
    .from('profiles')
    .select('email')
    .eq('id', id)
    .single();
  if (fetchError) return { error: fetchError };
  // Password reset uses the anon supabase client (doesn't need service role)
  const { data, error } = await supabase.auth.resetPasswordForEmail(profile.email);
  return { data, error };
}

export async function getActiveOfficers() {
  const db = publicClient();
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, designation')
    .eq('active', true)
    .in('role', ['OFFICER', 'ADMIN', 'SUPER_ADMIN'])
    .order('full_name');
  return { data: data || [], error };
}
