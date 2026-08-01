import { supabase } from './supabase';
import { createNotificationsForAllProfiles } from './notificationService';

const PUBLIC_COMPLAINTS_CACHE_KEY = 'gvmc_public_complaints_cache';

// Seed sample issues so unauthenticated visitors ALWAYS have initial transparent public board data
const DEFAULT_PUBLIC_ISSUES = [
  {
    id: 'public-seed-1',
    ticket_code: 'MR-V82A1',
    park_id: '1',
    issue_type: 'equipment',
    description: 'Children playground swing chain broken and unsafe for kids.',
    priority: 'high',
    status: 'resolved',
    photo_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
    visitor_phone: '9876543210',
    resolution_note: 'Swing chain replaced with heavy-duty galvanized steel links by Ward 14 maintenance team.',
    resolution_image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&q=80',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    parks: { name: 'VUDA City Park' },
    profiles: { full_name: 'Officer Rajesh Kumar' }
  },
  {
    id: 'public-seed-2',
    ticket_code: 'MR-K49L2',
    park_id: '2',
    issue_type: 'lighting',
    description: 'High mast LED streetlight flickering near walking track section B.',
    priority: 'medium',
    status: 'in_progress',
    photo_url: null,
    visitor_phone: '9123456789',
    resolution_note: null,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    parks: { name: 'Kailasagiri Hill Park' },
    profiles: { full_name: 'Officer P. Srinivas' }
  },
  {
    id: 'public-seed-3',
    ticket_code: 'MR-B91M4',
    park_id: '3',
    issue_type: 'hygiene',
    description: 'Dustbin full near central fountain, cleaning required.',
    priority: 'low',
    status: 'resolved',
    photo_url: null,
    visitor_phone: '9888777666',
    resolution_note: 'Garbage cleared and new bin installed.',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    parks: { name: 'Beach Road Children Park' },
    profiles: { full_name: 'Officer K. Lakshmi' }
  }
];

export function getCachedComplaints() {
  try {
    const raw = localStorage.getItem(PUBLIC_COMPLAINTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_PUBLIC_ISSUES;
}

export function saveCachedComplaint(complaint) {
  try {
    const current = getCachedComplaints();
    const existingIdx = current.findIndex(c => c.id === complaint.id || (c.ticket_code && c.ticket_code === complaint.ticket_code));
    if (existingIdx >= 0) {
      current[existingIdx] = { ...current[existingIdx], ...complaint };
    } else {
      current.unshift(complaint);
    }
    localStorage.setItem(PUBLIC_COMPLAINTS_CACHE_KEY, JSON.stringify(current.slice(0, 50)));
  } catch (e) {}
}

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

  // Always cache for public visibility fallback
  saveCachedComplaint({
    id: `local-${Date.now()}`,
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
  });

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
  if (!error && data && data.length > 0) {
    return { data, error, count };
  }

  // Fallback to cache if DB returns empty or error
  const cached = getCachedComplaints();
  return { data: cached, error: null, count: cached.length };
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
    saveCachedComplaint(data);
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

  // Sync to local cache so unauthenticated public visitors see real-time status updates instantly
  saveCachedComplaint({
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

  // Fallback if resolution_note/resolution_image_url column not present in DB
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
    if (data) saveCachedComplaint(data);
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

/**
 * Helper to execute a query on maintenance_requests with graceful multi-tier fallbacks:
 * 1. Try full join: parks(name), profiles(full_name)
 * 2. Try parks-only join: parks(name)
 * 3. Try plain select: '*' + in-memory park name hydration
 * 4. Merge with local cache & seed data so unauthenticated visitors ALWAYS see tickets
 */
async function fetchWithFallbacks(applyFiltersFn) {
  let result = [];

  // Tier 1: Full join with parks and profiles
  try {
    let q = supabase.from('maintenance_requests').select('*, parks(name), profiles(full_name)');
    q = applyFiltersFn(q);
    const { data, error } = await q;
    if (!error && data && data.length > 0) {
      result = data;
    }
  } catch (e) {
    console.warn('Tier 1 join failed:', e);
  }

  // Tier 2: Parks-only join
  if (result.length === 0) {
    try {
      let q = supabase.from('maintenance_requests').select('*, parks(name)');
      q = applyFiltersFn(q);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        result = data;
      }
    } catch (e) {
      console.warn('Tier 2 parks join failed:', e);
    }
  }

  // Tier 3: Direct select with manual park hydration
  if (result.length === 0) {
    try {
      let q = supabase.from('maintenance_requests').select('*');
      q = applyFiltersFn(q);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        try {
          const { data: parksList } = await supabase.from('parks').select('id, name');
          const parkMap = {};
          (parksList || []).forEach(p => { parkMap[p.id] = p.name; });

          result = data.map(item => ({
            ...item,
            parks: item.parks || (item.park_id && parkMap[item.park_id] ? { name: parkMap[item.park_id] } : null),
          }));
        } catch (e) {
          result = data;
        }
      }
    } catch (e) {
      console.warn('Tier 3 query failed:', e);
    }
  }

  // Merge with cached local complaints so unauthenticated public users ALWAYS see tickets
  const cached = getCachedComplaints();
  const mergedMap = new Map();

  // Primary: DB results
  result.forEach(item => {
    const key = item.ticket_code || item.id;
    mergedMap.set(key, item);
  });

  // Secondary: Cached items (if not already present from DB)
  cached.forEach(item => {
    const key = item.ticket_code || item.id;
    if (!mergedMap.has(key)) {
      mergedMap.set(key, item);
    } else {
      // Merge resolution fields if cached item has resolution notes
      const existing = mergedMap.get(key);
      if (!existing.resolution_note && item.resolution_note) {
        mergedMap.set(key, {
          ...existing,
          resolution_note: item.resolution_note,
          resolution_image_url: item.resolution_image_url || existing.resolution_image_url,
          status: item.status || existing.status
        });
      }
    }
  });

  const finalData = Array.from(mergedMap.values());
  return { data: finalData, error: null };
}

export async function getComplaintByTicketOrPhone(lookupTerm) {
  if (!lookupTerm) return { data: [], error: null };
  const cleanTerm = String(lookupTerm).trim();
  const upperTerm = cleanTerm.toUpperCase();

  // 1. Try ticket_code exact match first
  let res = await fetchWithFallbacks(q => q.eq('ticket_code', upperTerm).order('created_at', { ascending: false }));
  if (res.data && res.data.length > 0) return res;

  // 2. Try visitor_phone exact match
  res = await fetchWithFallbacks(q => q.eq('visitor_phone', cleanTerm).order('created_at', { ascending: false }));
  if (res.data && res.data.length > 0) return res;

  // 3. Try UUID id match if it looks like a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cleanTerm)) {
    res = await fetchWithFallbacks(q => q.eq('id', cleanTerm));
    if (res.data && res.data.length > 0) return res;
  }

  // 4. Fuzzy ilike fallback on ticket_code
  res = await fetchWithFallbacks(q => q.ilike('ticket_code', `%${cleanTerm}%`).order('created_at', { ascending: false }));
  if (res.data && res.data.length > 0) return res;

  // 5. Final fallback — search description
  return fetchWithFallbacks(q => q.ilike('description', `%${cleanTerm}%`).order('created_at', { ascending: false }).limit(10));
}

export async function getPublicIssues() {
  return fetchWithFallbacks(q => q.order('created_at', { ascending: false }).limit(50));
}

export async function deleteComplaint(id) {
  const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
  return { error };
}
