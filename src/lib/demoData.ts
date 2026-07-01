import type {
  Addon,
  BlockedDate,
  BusinessHours,
  BusinessSettings,
  Service,
} from './types';

/**
 * Safe demo data used only when the Neon-backed API is unreachable.
 * The real backend data takes over automatically once DATABASE_URL/JWT_SECRET are configured.
 */

const NOW_ISO = new Date('2026-01-01T12:00:00Z').toISOString();

// Shared defaults for the room/modifier fields so each entry stays readable.
const ROOM_DEFAULTS = {
  base_bedrooms: 0,
  base_bathrooms: 0,
  base_living_rooms: 0,
  base_kitchens: 0,
  base_balconies: 0,
};

export const demoServices: Service[] = [
  {
    id: 'demo-svc-standard',
    name: 'Standard Maintenance',
    description: 'Consistent upkeep for busy professionals',
    duration_minutes: 120,
    price: 95,
    is_active: true,
    created_at: NOW_ISO,
    category: 'standard',
    tasks: [],
    ...ROOM_DEFAULTS,
    bedroom_modifier: 30,
    bathroom_modifier: 45,
    living_room_modifier: 35,
    kitchen_modifier: 50,
    balcony_modifier: 25,
  },
  {
    id: 'demo-svc-deep',
    name: 'Deep Restorative',
    description: 'Intensive hand-wiping, grout scrubbing, & scale removal',
    duration_minutes: 210,
    price: 175,
    is_active: true,
    created_at: NOW_ISO,
    category: 'deep',
    tasks: [],
    ...ROOM_DEFAULTS,
    bedroom_modifier: 55,
    bathroom_modifier: 85,
    living_room_modifier: 60,
    kitchen_modifier: 95,
    balcony_modifier: 45,
  },
  {
    id: 'demo-svc-turnover',
    name: 'Move-In / Move-Out',
    description: 'Turnkey empty-home sanitization including interior cabinets',
    duration_minutes: 300,
    price: 250,
    is_active: true,
    created_at: NOW_ISO,
    category: 'turnover',
    tasks: [],
    ...ROOM_DEFAULTS,
    bedroom_modifier: 70,
    bathroom_modifier: 110,
    living_room_modifier: 75,
    kitchen_modifier: 130,
    balcony_modifier: 60,
  },
];

export const demoAddons: Addon[] = [
  { id: 'demo-addon-concierge', slug: 'premium-concierge-shopping', name: 'Premium Concierge Shopping', description: 'We pick up groceries or essentials for you during the visit.', price: 45, duration_minutes: 0, is_active: true, created_at: NOW_ISO, is_counter: false, max_quantity: 1, disabled_for_category: null },
  { id: 'demo-addon-appliance', slug: 'inside-large-appliance-detail', name: 'Inside Large Appliance Detail', description: 'Deep interior clean of a large appliance — priced per appliance.', price: 40, duration_minutes: 0, is_active: true, created_at: NOW_ISO, is_counter: true, max_quantity: 6, disabled_for_category: null },
  { id: 'demo-addon-cabinets', slug: 'inside-kitchen-cabinets-drawers', name: 'Inside Kitchen Cabinets & Drawers', description: 'Interior wipe-down of all kitchen cabinets and drawers.', price: 65, duration_minutes: 0, is_active: true, created_at: NOW_ISO, is_counter: false, max_quantity: 1, disabled_for_category: 'turnover' },
  { id: 'demo-addon-pet', slug: 'eco-pet-hair-extraction', name: 'Eco-Pet Hair Extraction & Sanitization', description: 'Specialized extraction and sanitizing pass for homes with pets.', price: 35, duration_minutes: 0, is_active: true, created_at: NOW_ISO, is_counter: false, max_quantity: 1, disabled_for_category: null },
  { id: 'demo-addon-laundry', slug: 'load-of-laundry', name: 'Load of Laundry (Wash, Dry, Fold)', description: 'A load of laundry washed, dried, and folded — priced per load.', price: 30, duration_minutes: 0, is_active: true, created_at: NOW_ISO, is_counter: true, max_quantity: 4, disabled_for_category: null },
];

export const demoBusinessHours: BusinessHours[] = [
  { id: 'h-0', weekday: 0, is_open: false, start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'h-1', weekday: 1, is_open: true,  start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'h-2', weekday: 2, is_open: true,  start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'h-3', weekday: 3, is_open: true,  start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'h-4', weekday: 4, is_open: true,  start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'h-5', weekday: 5, is_open: true,  start_time: '09:00:00', end_time: '17:00:00' },
  { id: 'h-6', weekday: 6, is_open: true,  start_time: '08:00:00', end_time: '14:00:00' },
];

export const demoBlockedDates: BlockedDate[] = [];

export const demoSettings: BusinessSettings = {
  id: 'demo-settings',
  business_name: 'Primax Group LLC',
  business_email: 'info@primaxgroupllc.com',
  business_phone: '(312) 296-5589',
  business_address: '332 S Michigan Ave, 9th Floor, Chicago, IL 60604',
  slot_interval_minutes: 30,
  booking_notice_hours: 2,
  created_at: NOW_ISO,
};
