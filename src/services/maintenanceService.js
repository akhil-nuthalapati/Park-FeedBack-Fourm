import { supabase } from './supabase';

// Map detailed issue titles to valid Postgres issue_type ENUM values ('equipment'|'lighting'|'hygiene'|'safety'|'greenery'|'other')
export function mapToValidIssueTypeEnum(selectedIssue) {
  if (!selectedIssue) return 'other';
  const str = String(selectedIssue).toLowerCase();

  const validEnums = ['equipment', 'lighting', 'hygiene', 'safety', 'greenery', 'other'];
  if (validEnums.includes(str)) {
    return str;
  }

  if (str.includes('light') || str.includes('lamp') || str.includes('electric') || str.includes('pole') || str.includes('dark')) {
    return 'lighting';
  }
  if (str.includes('bench') || str.includes('swing') || str.includes('slide') || str.includes('equipment') || str.includes('gate') || str.includes('fence') || str.includes('play') || str.includes('fountain') || str.includes('pipe')) {
    return 'equipment';
  }
  if (str.includes('clean') || str.includes('garbage') || str.includes('trash') || str.includes('washroom') || str.includes('toilet') || str.includes('leak') || str.includes('smell') || str.includes('hygiene') || str.includes('waste') || str.includes('dustbin')) {
    return 'hygiene';
  }
  if (str.includes('tree') || str.includes('grass') || str.includes('plant') || str.includes('green') || str.includes('branch') || str.includes('lawn') || str.includes('flower')) {
    return 'greenery';
  }
  if (str.includes('safe') || str.includes('security') || str.includes('guard') || str.includes('cctv') || str.includes('hazard') || str.includes('snake') || str.includes('broken glass')) {
    return 'safety';
  }

  return 'other';
}

export async function submitComplaint(payload) {
  const enumType = mapToValidIssueTypeEnum(payload.issue_type);
  const titlePrefix = payload.issue_type && payload.issue_type !== enumType ? `[Issue Category: ${payload.issue_type}]\n` : '';
  const fullDescription = `${titlePrefix}${payload.description || ''}`;

  const finalPayload = {
    park_id: payload.park_id,
    issue_type: enumType, // Guaranteed valid Postgres ENUM value
    description: fullDescription,
    priority: payload.priority || 'medium',
    status: 'open',
    photo_url: payload.photo_url || null,
  };

  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert([finalPayload]);

  // Retry fallback with 'other' if any legacy schema constraint triggers 22P02
  if (error && (error.code === '22P02' || error.status === 400)) {
    console.warn('Enum mismatch detected, retrying with fallback issue_type "other":', error);
    finalPayload.issue_type = 'other';
    const retryRes = await supabase.from('maintenance_requests').insert([finalPayload]);
    return { data: retryRes.data, error: retryRes.error };
  }

  return { data, error };
}

export async function uploadComplaintPhoto(file) {
  if (!file) return { data: null, error: null };

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `complaints/${fileName}`;

    const { data, error } = await supabase.storage
      .from('maintenance-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('maintenance-images').getPublicUrl(filePath);
      return { data: urlData.publicUrl, error: null };
    }
  } catch (e) {
    console.warn('Supabase storage bucket upload error, converting to base64 fallback:', e);
  }

  // Fail-Safe Fallback: Convert image file to base64 Data URL so submission NEVER fails
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ data: reader.result, error: null });
    };
    reader.onerror = () => {
      resolve({ data: null, error: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  });
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
  const targetId = employeeId && String(employeeId).trim() !== '' ? employeeId : null;
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({
      assigned_to: targetId,
      status: targetId ? 'in_progress' : 'open',
    })
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
