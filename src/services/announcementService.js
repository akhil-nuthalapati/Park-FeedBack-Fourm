import { supabase } from './supabase';

const ANNOUNCEMENT_KEY = 'gvmc_broadcast_announcement';

export async function getBroadcastAnnouncement() {
  try {
    // 1. Fetch live active banner from Supabase database
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const dbAnnouncement = data[0];
      localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(dbAnnouncement));
      return dbAnnouncement;
    }
  } catch (e) {
    console.error('Supabase announcement fetch error:', e);
  }

  // 2. Fallback to localStorage if offline/table not created
  try {
    const local = localStorage.getItem(ANNOUNCEMENT_KEY);
    return local ? JSON.parse(local) : null;
  } catch (e) {
    return null;
  }
}

export async function setBroadcastAnnouncement(payload) {
  const announcementData = {
    message: payload.message.trim(),
    type: payload.type || 'info', // 'info' | 'warning' | 'emergency'
    park_id: payload.park_id || '',
    park_name: payload.park_name || 'All Parks',
    active: true,
    updated_at: new Date().toISOString(),
  };

  // Always sync to localStorage and dispatch custom event
  localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(announcementData));
  window.dispatchEvent(new Event('announcementUpdated'));

  try {
    // Deactivate previous active banners in Supabase
    await supabase.from('announcements').update({ active: false }).eq('active', true);

    // Insert new live announcement in Supabase
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcementData])
      .select()
      .single();

    return { data: data || announcementData, error: null };
  } catch (e) {
    console.error('Supabase set announcement error:', e);
    return { data: announcementData, error: null };
  }
}

export async function clearBroadcastAnnouncement() {
  localStorage.removeItem(ANNOUNCEMENT_KEY);
  window.dispatchEvent(new Event('announcementUpdated'));

  try {
    await supabase.from('announcements').update({ active: false }).eq('active', true);
  } catch (e) {
    console.error('Supabase clear announcement error:', e);
  }
}
