import { supabase } from './supabase';
import { createNotificationsForAllProfiles } from './notificationService';

// Helper to generate readable short ticket lookup code (e.g., MR-83920)
export function generateTicketCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MR-${code}`;
}

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
  const ticketCode = generateTicketCode();
  let priority = payload.priority || 'medium';
  let isRecurring = false;
  let recentCount = 1;

  // 1. RECURRING ISSUE DETECTION (Check 3+ complaints for same park + issue_type within 48h)
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: recentReports } = await supabase
      .from('maintenance_requests')
      .select('id')
      .eq('park_id', payload.park_id)
      .eq('issue_type', enumType)
      .gte('created_at', fortyEightHoursAgo);

    if (recentReports && recentReports.length >= 2) {
      // 3+ reports total (including current one)
      isRecurring = true;
      recentCount = recentReports.length + 1;
      priority = 'high'; // Auto-escalate priority to high
    }
  } catch (e) {
    console.warn('Error checking recurring complaints:', e);
  }

  const titlePrefix = payload.issue_type && payload.issue_type !== enumType ? `[Issue Category: ${payload.issue_type}]\n` : '';
  const recurringPrefix = isRecurring ? `[⚡ RECURRING ISSUE AUTO-ESCALATED — ${recentCount} Reports in 48h]\n` : '';
  const fullDescription = `${recurringPrefix}${titlePrefix}${payload.description || ''}`;

  const finalPayload = {
    park_id: payload.park_id,
    issue_type: enumType,
    description: fullDescription,
    priority,
    status: 'open',
    photo_url: payload.photo_url || null,
    visitor_phone: payload.visitor_phone || null,
    ticket_code: ticketCode,
  };

  let parkName = 'Park';
  if (payload.park_name) {
    parkName = payload.park_name;
  }

  // 2. Insert into maintenance_requests (no .select() to comply with anon RLS)
  let { data, error } = await supabase
    .from('maintenance_requests')
    .insert([finalPayload]);

  // Fallback if ticket_code column isn't in DB yet
  if (error && (error.message?.includes('ticket_code') || error.code === '42703')) {
    delete finalPayload.ticket_code;
    delete finalPayload.visitor_phone;
    const retryRes = await supabase.from('maintenance_requests').insert([finalPayload]);
    error = retryRes.error;
  }

  // Fallback retry with issue_type 'other' if schema constraint 22P02
  if (error && (error.code === '22P02' || error.status === 400)) {
    console.warn('Enum mismatch detected, retrying with fallback issue_type "other":', error);
    finalPayload.issue_type = 'other';
    const retryRes = await supabase.from('maintenance_requests').insert([finalPayload]);
    error = retryRes.error;
  }

  // 3. TRIGGER NOTIFICATIONS TO ALL PROFILES
  if (!error) {
    const notifTitle = isRecurring 
      ? `⚡ RECURRING ALERT: ${enumType.toUpperCase()} at ${parkName}`
      : `🚨 New Maintenance Issue: ${enumType.toUpperCase()} at ${parkName}`;
    
    const notifMsg = isRecurring
      ? `⚠️ 3+ reports detected within 48h! Priority auto-escalated to HIGH. Ticket Code: ${ticketCode}`
      : `New report submitted (${priority} priority). Ticket Code: ${ticketCode}. Description: ${payload.description?.substring(0, 80) || ''}`;

    createNotificationsForAllProfiles({
      title: notifTitle,
      message: notifMsg,
      type: isRecurring ? 'escalation' : 'maintenance',
      referenceId: ticketCode,
    });
  }

  return { data, error, ticketCode, isRecurring, recentCount };
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

  if (!error && data) {
    createNotificationsForAllProfiles({
      title: `👤 Staff Assigned to Request`,
      message: `Maintenance Ticket ${data.ticket_code || id} assigned to officer.`,
      type: 'info',
      referenceId: id,
    });
  }

  return { data, error };
}

export async function updateStatus(id, status, resolutionNote = null, resolvedBy = null) {
  const updateFields = { status };
  if (resolutionNote !== null) {
    updateFields.resolution_note = resolutionNote;
  }
  if (resolvedBy) {
    updateFields.resolved_by = resolvedBy;
  }
  if (status === 'resolved') {
    updateFields.resolved_at = new Date().toISOString();
  }

  let { data, error } = await supabase
    .from('maintenance_requests')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  // Fallback if resolution_note column not present in DB
  if (error && (error.message?.includes('resolution_note') || error.code === '42703')) {
    delete updateFields.resolution_note;
    delete updateFields.resolved_by;
    const retryRes = await supabase
      .from('maintenance_requests')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    data = retryRes.data;
    error = retryRes.error;
  }

  if (!error) {
    const isResolved = status === 'resolved';
    createNotificationsForAllProfiles({
      title: isResolved ? `✅ Maintenance Request Resolved` : `🔄 Request Status Updated: ${status.toUpperCase()}`,
      message: isResolved 
        ? `Ticket ${data?.ticket_code || id} has been marked RESOLVED. Note: ${resolutionNote || 'Issue fixed.'}`
        : `Ticket ${data?.ticket_code || id} status changed to ${status}.`,
      type: isResolved ? 'resolution' : 'info',
      referenceId: id,
    });
  }

  return { data, error };
}

export async function getComplaintByTicketOrPhone(lookupTerm) {
  if (!lookupTerm) return { data: [], error: null };
  const cleanTerm = String(lookupTerm).trim();

  try {
    // 1. Search by exact ticket_code or phone or id
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, parks(name), profiles(full_name)')
      .or(`ticket_code.eq.${cleanTerm.toUpperCase()},visitor_phone.eq.${cleanTerm},id.eq.${cleanTerm}`)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return { data, error: null };
    }
  } catch (e) {
    console.warn('DB lookup failed, trying fallback search:', e);
  }

  // Fallback search with ilike
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, parks(name), profiles(full_name)')
      .ilike('ticket_code', `%${cleanTerm}%`)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (e) {
    return { data: [], error: e };
  }
}

export async function deleteComplaint(id) {
  const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
  return { error };
}
