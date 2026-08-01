import { supabase } from './supabase';

const LOCAL_NOTIF_KEY = 'gvmc_local_notifications';

// Fetch notifications for active profile / system
export async function getNotifications(profileId) {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (profileId) {
      query = query.or(`profile_id.eq.${profileId},profile_id.is.null`);
    }

    const { data, error } = await query;
    if (!error && data) {
      return { data, error: null };
    }
  } catch (e) {
    console.warn('Notifications DB query failed, using localStorage fallback:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return { data: list, error: null };
  } catch (e) {
    return { data: [], error: null };
  }
}

// Create notifications for all registered profiles
export async function createNotificationsForAllProfiles({ title, message, type = 'maintenance', referenceId = null }) {
  const notifObj = {
    title,
    message,
    type,
    reference_id: referenceId,
    created_at: new Date().toISOString(),
    is_read: false,
  };

  // 1. Always append to localStorage for instant local reactivity
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ ...notifObj, id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  } catch (e) {
    console.warn('Failed to update local notifications:', e);
  }

  // 2. Insert into DB for all profiles
  try {
    const { data: profiles } = await supabase.from('profiles').select('id');
    
    if (profiles && profiles.length > 0) {
      const records = profiles.map(p => ({
        profile_id: p.id,
        title,
        message,
        type,
        reference_id: referenceId,
        is_read: false,
      }));

      await supabase.from('notifications').insert(records);
    } else {
      // If profiles table has no rows or anon cannot select profiles, insert with null profile_id
      await supabase.from('notifications').insert([{
        profile_id: null,
        title,
        message,
        type,
        reference_id: referenceId,
        is_read: false,
      }]);
    }
  } catch (e) {
    console.warn('Could not insert notifications to database:', e);
  }
}

// Mark single notification as read
export async function markNotificationAsRead(id) {
  if (id && String(id).startsWith('loc-')) {
    try {
      const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
      let list = raw ? JSON.parse(raw) : [];
      list = list.map(n => n.id === id ? { ...n, is_read: true } : n);
      localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    } catch (e) {}
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    return { error };
  } catch (e) {
    return { error: e };
  }
}

// Mark all as read
export async function markAllNotificationsAsRead(profileId) {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.map(n => ({ ...n, is_read: true }));
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  } catch (e) {}

  try {
    let query = supabase.from('notifications').update({ is_read: true });
    if (profileId) {
      query = query.or(`profile_id.eq.${profileId},profile_id.is.null`);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const { error } = await query;
    return { error };
  } catch (e) {
    return { error: e };
  }
}
