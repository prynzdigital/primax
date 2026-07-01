import type {
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

export const demoServices: Service[] = [
  {
    id: 'demo-svc-1',
    name: 'Residential Cleaning',
    description:
      'A thorough recurring clean for homes and condos across Chicago. Kitchens, bathrooms, living areas, bedrooms, and floors — handled by a vetted two-person Primax crew.',
    duration_minutes: 120,
    price: 129,
    is_active: true,
    created_at: NOW_ISO,
  },
  {
    id: 'demo-svc-2',
    name: 'Deep Cleaning — Signature Reset',
    description:
      'A top-to-bottom reset. Baseboards, inside cabinets, behind appliances, light fixtures — every surface addressed with our 38-point service standard.',
    duration_minutes: 240,
    price: 249,
    is_active: true,
    created_at: NOW_ISO,
  },
  {
    id: 'demo-svc-3',
    name: 'Move-In / Move-Out — Fresh Start',
    description:
      'A spotless, ready-to-live-in clean for empty homes. Perfect for new tenants, property handbacks, or sellers staging for market.',
    duration_minutes: 300,
    price: 299,
    is_active: true,
    created_at: NOW_ISO,
  },
  {
    id: 'demo-svc-4',
    name: 'Airbnb & Short-Term Rental Cleaning',
    description:
      'Fast turnovers built around your guest schedule. Linen-ready, guest-ready, 5-star-ready — every time.',
    duration_minutes: 90,
    price: 179,
    is_active: true,
    created_at: NOW_ISO,
  },
  {
    id: 'demo-svc-5',
    name: 'Office & Commercial Cleaning',
    description:
      'A polished workspace for your team — desks, kitchens, conference rooms, and shared areas. After-hours available for zero disruption.',
    duration_minutes: 180,
    price: 229,
    is_active: true,
    created_at: NOW_ISO,
  },
  {
    id: 'demo-svc-6',
    name: 'Post-Construction Cleaning',
    description:
      'Dust-free, finished, and photo-ready after renovation or construction. We handle the fine debris, surfaces, and final shine.',
    duration_minutes: 360,
    price: 449,
    is_active: true,
    created_at: NOW_ISO,
  },
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
