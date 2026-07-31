export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '—';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-IN', { ...defaults, ...options });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function getCurrentDate() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatTime_(dateStr) {
  return new Date(dateStr || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function getCurrentTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatStatus(status) {
  if (!status) return '—';
  return status.split('_').map(capitalize).join(' ');
}

export function getDeviceId() {
  let deviceId = localStorage.getItem('park_ms_device_id');
  if (!deviceId) {
    deviceId = 'dev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('park_ms_device_id', deviceId);
  }
  return deviceId;
}

export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
}

export function getPriorityColor(priority) {
  const map = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return map[priority] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status) {
  const map = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export function getParkOperationalStatus(parkStatus, customDate = new Date()) {
  if (parkStatus === 'maintenance') {
    return {
      status: 'maintenance',
      label: 'Under Maintenance',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      timingText: 'Closed for maintenance',
      isOpen: false,
    };
  }
  if (parkStatus === 'inactive') {
    return {
      status: 'inactive',
      label: 'Inactive (Closed)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      timingText: 'Closed to public',
      isOpen: false,
    };
  }

  // Active park: check municipal operating hours (5:00 AM - 9:00 PM)
  const currentHour = customDate.getHours();
  const currentMinute = customDate.getMinutes();
  const timeInMinutes = currentHour * 60 + currentMinute;
  const openMinutes = 5 * 60; // 5:00 AM
  const closeMinutes = 21 * 60; // 9:00 PM (21:00)

  if (timeInMinutes >= openMinutes && timeInMinutes < closeMinutes) {
    return {
      status: 'open',
      label: '🟢 Open Now (5:00 AM - 9:00 PM)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      timingText: 'Operating Hours: 5:00 AM – 9:00 PM',
      isOpen: true,
    };
  } else {
    return {
      status: 'closed_night',
      label: '🌙 Closed for Night (Opens 5:00 AM)',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      timingText: 'Closed for Night (Reopens 5:00 AM)',
      isOpen: false,
    };
  }
}
