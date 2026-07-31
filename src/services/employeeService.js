import { supabase } from './supabase';

export async function getEmployees() {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name');
  return { data, error };
}

export async function createEmployee(payload) {
  const { email, password, full_name, phone, designation, department, role } = payload;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (authError) return { data: null, error: authError };

  if (authData?.user) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ phone, designation, department, role })
      .eq('auth_user_id', authData.user.id)
      .select()
      .single();
    return { data, error };
  }

  return { data: authData, error: null };
}

export async function updateEmployee(id, payload) {
  const { data, error } = await supabase.from('profiles').update(payload).eq('id', id).select().single();
  return { data, error };
}

export async function deactivateEmployee(id) {
  const { data, error } = await supabase.from('profiles').update({ active: false }).eq('id', id).select().single();
  return { data, error };
}

export async function deleteEmployee(id) {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('auth_user_id')
    .eq('id', id)
    .single();
  if (fetchError) return { error: fetchError };
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  return { error };
}

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

export async function getActiveOfficers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, designation')
    .eq('active', true)
    .in('role', ['OFFICER', 'ADMIN', 'SUPER_ADMIN'])
    .order('full_name');
  return { data, error };
}
