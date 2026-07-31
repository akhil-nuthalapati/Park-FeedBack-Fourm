import { supabase } from './supabase';

export async function submitComplaint(payload) {
  const { data, error } = await supabase.from('maintenance_requests').insert([payload]).select().single();
  return { data, error };
}

export async function uploadComplaintPhoto(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `complaints/${fileName}`;

  const { data, error } = await supabase.storage
    .from('maintenance-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) return { data: null, error };

  const { data: urlData } = supabase.storage.from('maintenance-images').getPublicUrl(filePath);
  return { data: urlData.publicUrl, error: null };
}

export async function getComplaints(filters = {}) {
  const { page = 1, limit = 20, status, priority, issueType, parkId, sortBy = 'created_at', ascending = false } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('maintenance_requests')
    .select('*, parks(name), profiles(full_name)', { count: 'exact' })
    .order(sortBy, { ascending });

  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (issueType) query = query.eq('issue_type', issueType);
  if (parkId) query = query.eq('park_id', parkId);
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data, error, count };
}

export async function assignComplaint(id, employeeId) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({ assigned_to: employeeId, status: 'in_progress' })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function updateStatus(id, status) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteComplaint(id) {
  const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
  return { error };
}
