// Broadcast Announcement Service for Municipal Emergency/Closure Banners

const ANNOUNCEMENT_KEY = 'gvmc_broadcast_announcement';

export function getBroadcastAnnouncement() {
  try {
    const data = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setBroadcastAnnouncement(payload) {
  try {
    if (!payload || !payload.message?.trim()) {
      localStorage.removeItem(ANNOUNCEMENT_KEY);
    } else {
      const announcementData = {
        message: payload.message.trim(),
        type: payload.type || 'info', // 'info' | 'warning' | 'emergency'
        active: payload.active !== false,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(announcementData));
    }
  } catch (e) {
    console.error(e);
  }
}

export function clearBroadcastAnnouncement() {
  try {
    localStorage.removeItem(ANNOUNCEMENT_KEY);
  } catch (e) {
    console.error(e);
  }
}
