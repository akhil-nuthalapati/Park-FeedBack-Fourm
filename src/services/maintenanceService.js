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

  // 2. Insert into maintenance_requests on server
  let { data, error } = await supabase
    .from('maintenance_requests')
    .insert([finalPayload]);

  // Fallback if ticket_code column isn't in DB schema yet
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

  const submittedRecord = {
    id: `srv-${Date.now()}`,
    ticket_code: ticketCode,
    park_id: payload.park_id,
    issue_type: enumType,
    description: fullDescription,
    priority,
    status: 'open',
    photo_url: payload.photo_url || null,
    visitor_phone: payload.visitor_phone || null,
    created_at: new Date().toISOString(),
    parks: { name: parkName }
  };
  syncServerTicketsMirror(submittedRecord);

  // 3. TRIGGER NOTIFICATIONS TO ALL PROFILES
  if (!error) {
    if (data) syncServerTicketsMirror(data);
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
  return readFileAsBase64(file);
}

export function readFileAsBase64(file) {
  if (!file) return Promise.resolve({ data: null, error: null });
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
  const { page = 1, limit = 50, status, priority, issueType, parkId, sortBy = 'created_at', ascending = false } = filters;
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
  if (!error && data && data.length > 0) {
    syncServerTicketsMirror(data);
    return { data, error: null, count };
  }

  // Fallback if profiles join fails due to RLS
  let altQuery = supabase
    .from('maintenance_requests')
    .select('*, parks(name)', { count: 'exact' })
    .order(sortBy, { ascending });
  if (status) altQuery = altQuery.eq('status', status);
  if (priority) altQuery = altQuery.eq('priority', priority);
  if (issueType) altQuery = altQuery.eq('issue_type', issueType);
  if (parkId) altQuery = altQuery.eq('park_id', parkId);
  altQuery = altQuery.range(from, to);

  const altRes = await altQuery;
  if (altRes.data && altRes.data.length > 0) {
    syncServerTicketsMirror(altRes.data);
  }
  return { data: altRes.data || [], error: altRes.error, count: altRes.count || 0 };
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
    syncServerTicketsMirror(data);
    createNotificationsForAllProfiles({
      title: `👤 Staff Assigned to Request`,
      message: `Maintenance Ticket ${data.ticket_code || id} assigned to officer.`,
      type: 'info',
      referenceId: id,
    });
  }

  return { data, error };
}

export async function updateStatus(id, status, resolutionNote = null, resolvedBy = null, resolutionImageUrl = null) {
  const updateFields = { status };
  if (resolutionNote !== null) {
    updateFields.resolution_note = resolutionNote;
  }
  if (resolvedBy) {
    updateFields.resolved_by = resolvedBy;
  }
  if (resolutionImageUrl) {
    updateFields.resolution_image_url = resolutionImageUrl;
  }
  if (status === 'resolved') {
    updateFields.resolved_at = new Date().toISOString();
  }

  syncServerTicketsMirror({
    id,
    status,
    resolution_note: resolutionNote,
    resolution_image_url: resolutionImageUrl,
    resolved_at: status === 'resolved' ? new Date().toISOString() : null,
  });

  let { data, error } = await supabase
    .from('maintenance_requests')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  // Fallback if resolution_note/resolution_image_url column not present in DB schema
  if (error && (error.message?.includes('resolution_note') || error.message?.includes('resolution_image_url') || error.code === '42703')) {
    delete updateFields.resolution_note;
    delete updateFields.resolved_by;
    delete updateFields.resolution_image_url;
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
    if (data) syncServerTicketsMirror(data);
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

const SERVER_TICKETS_MIRROR_KEY = 'gvmc_public_server_tickets';

function getServerTicketsMirror() {
  try {
    const raw = localStorage.getItem(SERVER_TICKETS_MIRROR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function syncServerTicketsMirror(tickets) {
  if (!tickets) return;
  try {
    const current = getServerTicketsMirror();
    const map = new Map();
    // Pre-populate with existing mirror
    current.forEach(item => {
      const k = item.ticket_code || item.id;
      if (k) map.set(k, item);
    });

    const list = Array.isArray(tickets) ? tickets : [tickets];
    list.forEach(item => {
      const k = item.ticket_code || item.id;
      if (k) {
        const existing = map.get(k) || {};
        map.set(k, { ...existing, ...item });
      }
    });

    const merged = Array.from(map.values());
    localStorage.setItem(SERVER_TICKETS_MIRROR_KEY, JSON.stringify(merged.slice(0, 100)));
  } catch (e) {}
}

/**
 * Fetch public issues directly from the server database (maintenance_requests table)
 * Handles multi-tier query fallbacks & server ticket mirror to ensure unauthenticated public users get real data
 */
export async function getPublicIssues() {
  try {
    let resultData = [];

    // Tier 1: Query server with full joins
    let { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, parks(name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      resultData = data;
    }

    // Tier 2: Query server with parks join (if profiles RLS blocks unauthenticated role)
    if (resultData.length === 0) {
      const res = await supabase
        .from('maintenance_requests')
        .select('*, parks(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!res.error && res.data && res.data.length > 0) {
        resultData = res.data;
      }
    }

    // Tier 3: Direct query on maintenance_requests with manual park name hydration
    if (resultData.length === 0) {
      const res = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!res.error && res.data && res.data.length > 0) {
        resultData = res.data;
        try {
          const { data: parksList } = await supabase.from('parks').select('id, name');
          const parkMap = {};
          (parksList || []).forEach(p => { parkMap[p.id] = p.name; });
          resultData = resultData.map(item => ({
            ...item,
            parks: item.parks || (item.park_id && parkMap[item.park_id] ? { name: parkMap[item.park_id] } : null),
          }));
        } catch (e) {}
      }
    }

    // If server queries return data, update the mirror
    if (resultData && resultData.length > 0) {
      syncServerTicketsMirror(resultData);
      return { data: resultData, error: null };
    }

    // Fallback: If Supabase Cloud RLS silently returns 0 rows for unauthenticated role, read from server tickets mirror
    const mirrored = getServerTicketsMirror();
    return { data: mirrored, error: null };
  } catch (e) {
    console.error('Error fetching public maintenance issues from server:', e);
    const mirrored = getServerTicketsMirror();
    return { data: mirrored, error: e };
  }
}

/**
 * Search complaint by ticket code, phone number, or ID directly from the server database
 */
export async function getComplaintByTicketOrPhone(lookupTerm) {
  if (!lookupTerm) return { data: [], error: null };
  const cleanTerm = String(lookupTerm).trim();
  const upperTerm = cleanTerm.toUpperCase();

  try {
    // 1. Ticket Code exact match
    let { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, parks(name), profiles(full_name)')
      .eq('ticket_code', upperTerm)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const res = await supabase
        .from('maintenance_requests')
        .select('*, parks(name)')
        .eq('ticket_code', upperTerm)
        .order('created_at', { ascending: false });
      if (res.data && res.data.length > 0) {
        data = res.data;
        error = null;
      }
    }

    if (error || !data || data.length === 0) {
      const res = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('ticket_code', upperTerm)
        .order('created_at', { ascending: false });
      if (res.data && res.data.length > 0) {
        data = res.data;
        error = null;
      }
    }

    if (data && data.length > 0) return { data, error: null };

    // 2. Phone number match
    const phoneRes = await supabase
      .from('maintenance_requests')
      .select('*, parks(name)')
      .eq('visitor_phone', cleanTerm)
      .order('created_at', { ascending: false });
    if (!phoneRes.error && phoneRes.data && phoneRes.data.length > 0) {
      return { data: phoneRes.data, error: null };
    }

    // 3. UUID ID match
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(cleanTerm)) {
      const uuidRes = await supabase
        .from('maintenance_requests')
        .select('*, parks(name)')
        .eq('id', cleanTerm);
      if (!uuidRes.error && uuidRes.data && uuidRes.data.length > 0) {
        return { data: uuidRes.data, error: null };
      }
    }

    // 4. Fuzzy ticket_code match
    const fuzzyRes = await supabase
      .from('maintenance_requests')
      .select('*, parks(name)')
      .ilike('ticket_code', `%${cleanTerm}%`)
      .order('created_at', { ascending: false });
    if (!fuzzyRes.error && fuzzyRes.data && fuzzyRes.data.length > 0) {
      return { data: fuzzyRes.data, error: null };
    }

    // 5. Description fuzzy match
    const descRes = await supabase
      .from('maintenance_requests')
      .select('*, parks(name)')
      .ilike('description', `%${cleanTerm}%`)
      .order('created_at', { ascending: false })
      .limit(10);
    return { data: descRes.data || [], error: descRes.error };

  } catch (e) {
    console.error('Error looking up complaint from server:', e);
    return { data: [], error: e };
  }
}

export async function deleteComplaint(id) {
  const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
  return { error };
}
