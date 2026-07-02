import type { Addon, Service } from './types';

// Chicago zip-code guardrails and cart pricing rules for the Instacart-style
// booking cart. Figures below are as specified by the client request, not
// yet confirmed as final real business numbers — flag for sign-off.

// Unified location multiplier — a single "Urban Logistics & Parking Fee" that
// merges the former luxury multiplier and flat logistics fee into one factor
// applied to the whole subtotal, keyed off the Chicago zip code.
export const ULTRA_LUXURY_ZIPS = [
  '60601', '60602', '60603', '60604', '60605', '60606', '60611', '60614', '60654', '60661',
];
export const AFFLUENT_ZIPS = ['60613', '60647', '60657', '60201'];

/** Returns the location multiplier (1.30 / 1.15 / 1.00) for a Chicago zip. */
export function locationMultiplier(zip: string): number {
  const z = zip.trim();
  if (ULTRA_LUXURY_ZIPS.includes(z)) return 1.3;
  if (AFFLUENT_ZIPS.includes(z)) return 1.15;
  return 1.0;
}

export const MIN_BOOKING_PRICE = 95;
export const ENTERPRISE_BED_MAX = 6;
export const ENTERPRISE_BATH_MAX = 6;
export const ENTERPRISE_SQFT_MAX = 5000;

export type Frequency = 'one_time' | 'monthly' | 'biweekly' | 'weekly';

export const FREQUENCY_OPTIONS: { value: Frequency; label: string; discountPct: number; badge?: string }[] = [
  { value: 'one_time', label: 'One-Time Clean', discountPct: 0 },
  { value: 'monthly', label: 'Monthly', discountPct: 5 },
  { value: 'biweekly', label: 'Bi-Weekly', discountPct: 10, badge: 'Most Popular' },
  { value: 'weekly', label: 'Weekly', discountPct: 15 },
];

export function isEnterpriseJob(params: {
  bedrooms: number;
  bathrooms: number;
  squareFootage: number | null;
}): boolean {
  const { bedrooms, bathrooms, squareFootage } = params;
  return (
    bedrooms > ENTERPRISE_BED_MAX ||
    bathrooms > ENTERPRISE_BATH_MAX ||
    (squareFootage !== null && squareFootage > ENTERPRISE_SQFT_MAX)
  );
}

export interface RoomCounts {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
  balconies: number;
}

export interface CartAddonSelection {
  addon: Addon;
  quantity: number;
}

export interface CartTotal {
  baseFee: number;
  roomAdditions: number;
  addonsTotal: number;
  preSurchargeSubtotal: number;
  locationMultiplier: number;
  locationFee: number;
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
}

export function computeCartTotal(params: {
  service: Service;
  rooms: RoomCounts;
  addons: CartAddonSelection[];
  zipCode: string;
  frequency: Frequency;
}): CartTotal {
  const { service, rooms, addons, zipCode, frequency } = params;

  const roomAdditions =
    Math.max(0, rooms.bedrooms - service.base_bedrooms) * service.bedroom_modifier +
    Math.max(0, rooms.bathrooms - service.base_bathrooms) * service.bathroom_modifier +
    Math.max(0, rooms.livingRooms - service.base_living_rooms) * service.living_room_modifier +
    Math.max(0, rooms.kitchens - service.base_kitchens) * service.kitchen_modifier +
    Math.max(0, rooms.balconies - service.base_balconies) * service.balcony_modifier;

  const addonsTotal = addons.reduce((sum, { addon, quantity }) => sum + addon.price * quantity, 0);

  const baseFee = service.price;
  const preSurchargeSubtotal = baseFee + roomAdditions + addonsTotal;

  // Single consolidated location factor replaces the old luxury multiplier +
  // flat logistics fee. The "Urban Logistics & Parking Fee" line is the delta
  // it adds to the subtotal.
  const multiplier = locationMultiplier(zipCode);
  const locationFee = preSurchargeSubtotal * (multiplier - 1);

  const subtotal = preSurchargeSubtotal + locationFee;

  const discountPct = FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.discountPct ?? 0;
  const discountAmount = subtotal * (discountPct / 100);

  const total = subtotal - discountAmount;

  return {
    baseFee,
    roomAdditions,
    addonsTotal,
    preSurchargeSubtotal,
    locationMultiplier: multiplier,
    locationFee,
    subtotal,
    discountPct,
    discountAmount,
    total,
  };
}
