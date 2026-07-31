import { supabase } from './supabase';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { data: user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { data: session, error };
}

export async function sendPasswordReset(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}

export async function getUserRole() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: userError || new Error('Not authenticated') };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();
  return { data: data?.role || null, error };
}

export async function getUserProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: userError || new Error('Not authenticated') };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
  return { data, error };
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
