export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type ServiceCategory = 'sectional' | 'standard' | 'deep' | 'turnover';

export interface AdminUser {
  id: string;
  email: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  category: ServiceCategory;
  tasks: string[];
  base_bedrooms: number;
  base_bathrooms: number;
  bedroom_modifier: number;
  bathroom_modifier: number;
}

export interface Addon {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  service?: Service;
  bedrooms: number;
  bathrooms: number;
  addons?: Addon[];
  total_price: number;
}

export interface BusinessHours {
  id: string;
  weekday: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
