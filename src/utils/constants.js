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

export const FEATURED_ISSUES = [
  'Broken Bench',
  'Street Light Not Working',
  'Garbage Overflow',
  'Broken Swing',
  'Grass Overgrown',
  'Toilet Not Functional',
  'Water Leakage',
  'Fallen Tree',
  'Stray Dogs',
  'Damaged Walking Track',
  'Drinking Water Not Available',
  'Broken CCTV Camera',
  'Damaged Exercise Machine',
  'Waterlogging',
  'Vandalism',
  'Broken Fence',
  'Dustbin Full',
  'Toilet Cleaning Required',
  'Potholes Inside Park',
  'Other',
];

export const MAINTENANCE_CATEGORIES = [
  {
    domain: '🪑 Park Infrastructure',
    items: [
      'Broken Bench',
      'Damaged Gazebo / Shelter',
      'Broken Fence',
      'Damaged Boundary Wall',
      'Damaged Entrance Gate',
      'Damaged Exit Gate',
      'Broken Railing',
      'Broken Steps',
      'Broken Ramp',
      'Damaged Pavement',
      'Damaged Footpath',
      'Uneven Surface',
      'Potholes Inside Park',
      'Damaged Sign Board',
      'Missing Sign Board',
      'Broken Information Board',
      'Broken Notice Board',
      'Damaged Name Board',
    ],
  },
  {
    domain: "🎠 Children's Play Area",
    items: [
      'Broken Swing',
      'Broken Slide',
      'Broken Seesaw',
      'Broken Merry-Go-Round',
      'Broken Climbing Frame',
      'Broken Monkey Bars',
      'Broken Play Equipment',
      'Unsafe Play Equipment',
      'Missing Play Equipment',
      'Rusted Play Equipment',
      'Loose Bolts / Fasteners',
    ],
  },
  {
    domain: '🏋️ Outdoor Gym Equipment',
    items: [
      'Broken Gym Equipment',
      'Rusted Gym Equipment',
      'Damaged Exercise Machine',
      'Missing Equipment Parts',
      'Unsafe Equipment',
      'Equipment Needs Lubrication',
    ],
  },
  {
    domain: '🚶 Walking & Jogging Track',
    items: [
      'Damaged Walking Track',
      'Cracked Track',
      'Uneven Walking Surface',
      'Waterlogging on Track',
      'Obstruction on Track',
      'Slippery Surface',
    ],
  },
  {
    domain: '💡 Electrical & Lighting',
    items: [
      'Street Light Not Working',
      'Garden Light Not Working',
      'Decorative Lights Not Working',
      'Electrical Hazard',
      'Exposed Electrical Wiring',
      'Flickering Lights',
      'Lighting Pole Damaged',
      'Power Failure',
    ],
  },
  {
    domain: '🚰 Water Facilities',
    items: [
      'Drinking Water Not Available',
      'Drinking Water Tap Broken',
      'Water Leakage',
      'Pipe Leakage',
      'Broken Water Fountain',
      'Water Fountain Not Working',
      'Low Water Pressure',
      'Water Tank Damage',
    ],
  },
  {
    domain: '🚻 Washrooms & Sanitation',
    items: [
      'Toilet Cleaning Required',
      'Toilet Not Functional',
      'Toilet Door Broken',
      'Water Not Available in Toilet',
      'Wash Basin Damaged',
      'Bad Odor',
      'Blocked Toilet',
      'Toilet Lights Not Working',
    ],
  },
  {
    domain: '🗑️ Cleanliness',
    items: [
      'Garbage Overflow',
      'Garbage Not Collected',
      'Dustbin Full',
      'Dustbin Missing',
      'Dustbin Damaged',
      'Plastic Waste',
      'Glass Waste',
      'Food Waste',
      'General Littering',
      'Animal Waste',
      'Leaf Accumulation',
    ],
  },
  {
    domain: '🌳 Greenery & Landscaping',
    items: [
      'Grass Overgrown',
      'Lawn Dry',
      'Lawn Damaged',
      'Plants Need Watering',
      'Dead Plants',
      'Fallen Tree',
      'Fallen Branch',
      'Tree Pruning Required',
      'Shrubs Overgrown',
      'Flower Bed Damaged',
      'Weed Growth',
    ],
  },
  {
    domain: '🐕 Animal Issues',
    items: [
      'Stray Dogs',
      'Stray Cattle',
      'Monkey Nuisance',
      'Snake Sighting',
      'Bird Nest Hazard',
      'Bee Hive',
      'Animal Carcass',
    ],
  },
  {
    domain: '🌧️ Drainage & Waterlogging',
    items: [
      'Blocked Drain',
      'Drain Overflow',
      'Waterlogging',
      'Flooded Area',
      'Mosquito Breeding',
      'Sewage Overflow',
    ],
  },
  {
    domain: '🛡️ Safety & Security',
    items: [
      'Broken CCTV Camera',
      'CCTV Not Working',
      'Security Guard Absent',
      'Suspicious Activity',
      'Vandalism',
      'Theft',
      'Broken Lock',
      'Broken Gate',
      'Unsafe Area',
      'Fire Hazard',
      'Emergency Exit Blocked',
    ],
  },
  {
    domain: '🚗 Parking',
    items: [
      'Parking Area Damaged',
      'Illegal Parking',
      'Parking Markings Faded',
      'Parking Overflow',
      'Vehicle Obstruction',
    ],
  },
  {
    domain: '🚲 Accessibility',
    items: [
      'Wheelchair Ramp Damaged',
      'Ramp Blocked',
      'Handrail Damaged',
      'Accessibility Issue',
      'Tactile Path Damaged',
    ],
  },
  {
    domain: '🌦️ Weather-Related Damage',
    items: [
      'Storm Damage',
      'Flood Damage',
      'Wind Damage',
      'Fallen Tree Due to Storm',
      'Lightning Damage',
    ],
  },
  {
    domain: '🏛️ Park Amenities',
    items: [
      'Seating Area Damaged',
      'Pergola Damaged',
      'Fountain Not Working',
      'Fountain Cleaning Required',
      'Clock Not Working',
      'Public Address System Not Working',
      'Wi-Fi Not Working (if available)',
      'Charging Point Not Working',
    ],
  },
  {
    domain: '🚨 Public Nuisance',
    items: [
      'Smoking in Park',
      'Alcohol Consumption',
      'Illegal Vendors',
      'Noise Disturbance',
      'Public Misconduct',
      'Encroachment',
      'Graffiti',
      'Wall Defacement',
    ],
  },
  {
    domain: '♻️ Environmental Issues',
    items: [
      'Air Pollution',
      'Water Pollution',
      'Bad Smell',
      'Chemical Spill',
      'Oil Spill',
      'Construction Debris',
    ],
  },
  {
    domain: '🔍 Inspection & Miscellaneous',
    items: [
      'Routine Inspection Requested',
      'Maintenance Follow-up',
      'Repeated Issue',
      'Other',
    ],
  },
];

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
