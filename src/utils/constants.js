// Park Maintenance System — Constants
// Color palette, categories, status labels, and configuration values

export const COLORS = {
  primary: '#0B5ED7',
  primaryDark: '#084298',
  primaryLight: '#EAF4FF',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  success: '#198754',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#0DCAF0',
};

export const ISSUE_CATEGORIES = [
  { value: 'equipment', label: 'Broken Equipment' },
  { value: 'lighting', label: 'Street Light Issue' },
  { value: 'hygiene', label: 'Hygiene / Dustbin Overflow' },
  { value: 'safety', label: 'Safety Hazard' },
  { value: 'greenery', label: 'Greenery / Landscaping' },
  { value: 'other', label: 'Others' },
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#198754' },
  { value: 'medium', label: 'Medium', color: '#FFC107' },
  { value: 'high', label: 'High', color: '#FD7E14' },
  { value: 'critical', label: 'Critical', color: '#DC3545' },
];

export const REQUEST_STATUSES = [
  { value: 'open', label: 'Open', color: '#0DCAF0' },
  { value: 'in_progress', label: 'In Progress', color: '#FFC107' },
  { value: 'resolved', label: 'Resolved', color: '#198754' },
  { value: 'rejected', label: 'Rejected', color: '#DC3545' },
];

export const USER_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OFFICER', label: 'Officer' },
  { value: 'VIEWER', label: 'Viewer' },
];

export const RATING_LABELS = {
  overall_rating: 'Overall Rating',
  cleanliness: 'Cleanliness',
  safety: 'Safety',
  facilities: 'Facilities',
  greenery: 'Greenery',
  lighting: 'Lighting',
  playground: 'Playground',
  washroom: 'Washroom',
};

export const CHART_COLORS = ['#0B5ED7', '#198754', '#FFC107', '#DC3545', '#6F42C1', '#0DCAF0', '#FD7E14', '#20C997'];

export const PARK_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80',
  publicPark: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  walkingTrail: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
  childrensPark: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
  greenLandscape: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80',
};

export const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/checkin', label: 'Visitor Services' },
  { path: '/login', label: 'Dashboard' },
];
