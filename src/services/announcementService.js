import { supabase, supabaseAdmin } from './supabase';

const publicClient = () => supabaseAdmin || supabase;
const ANNOUNCEMENT_KEY = 'gvmc_broadcast_announcement';

export async function getBroadcastAnnouncement() {
  try {
    const db = publicClient();
    const { data, error } = await db
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
    // Silent catch — announcements table may not exist yet
  }

  // Fallback to localStorage if offline / table not created yet
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
    type: payload.type || 'info',
    park_id: payload.park_id || '',
    park_name: payload.park_name || 'All Parks',
    active: true,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(announcementData));
  window.dispatchEvent(new Event('announcementUpdated'));

  try {
    const db = publicClient();
    await db.from('announcements').update({ active: false }).eq('active', true);
    const { data, error } = await db
      .from('announcements')
      .insert([announcementData])
      .select()
      .single();
    return { data: data || announcementData, error: null };
  } catch (e) {
    return { data: announcementData, error: null };
  }
}

export async function clearBroadcastAnnouncement() {
  localStorage.removeItem(ANNOUNCEMENT_KEY);
  window.dispatchEvent(new Event('announcementUpdated'));

  try {
    const db = publicClient();
    await db.from('announcements').update({ active: false }).eq('active', true);
  } catch (e) {}
}
