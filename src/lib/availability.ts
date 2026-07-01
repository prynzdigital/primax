import { format } from 'date-fns';
import type {
  Addon,
  Appointment,
  BlockedDate,
  BusinessHours,
  BusinessSettings,
  Service,
  TimeSlot,
} from './types';

function parseTimeOnDate(date: Date, time: string): Date {
  const [hh, mm, ss] = time.split(':');
  const d = new Date(date);
  d.setHours(parseInt(hh ?? '0', 10), parseInt(mm ?? '0', 10), parseInt(ss ?? '0', 10), 0);
  return d;
}

function isSameYMD(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDbDate(date: Date): string {
  // Local YYYY-MM-DD (avoid timezone shifts)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toDbTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}:00`;
}

export function generateTimeSlots(params: {
  date: Date;
  service: Service;
  hours: BusinessHours[];
  blocked: BlockedDate[];
  appointments: Appointment[];
  settings: BusinessSettings | null;
}): TimeSlot[] {
  const { date, service, hours, blocked, appointments, settings } = params;

  if (!date || !service) return [];

  const weekday = date.getDay();
  const dayHours = hours.find((h) => h.weekday === weekday);
  if (!dayHours || !dayHours.is_open) return [];

  const dateStr = toDbDate(date);
  const isBlocked = blocked.some((b) => b.blocked_date === dateStr);
  if (isBlocked) return [];

  const slotInterval = settings?.slot_interval_minutes ?? 30;
  const noticeHours = settings?.booking_notice_hours ?? 2;

  const dayStart = parseTimeOnDate(date, dayHours.start_time);
  const dayEnd = parseTimeOnDate(date, dayHours.end_time);

  const now = new Date();
  const earliest = new Date(now.getTime() + noticeHours * 60 * 60 * 1000);

  const slots: TimeSlot[] = [];
  let cursor = new Date(dayStart);

  while (cursor < dayEnd) {
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + service.duration_minutes * 60 * 1000);

    if (end > dayEnd) break;
    if (start < earliest) {
      cursor = new Date(cursor.getTime() + slotInterval * 60 * 1000);
      continue;
    }

    const overlaps = appointments.some((a) => {
      if (a.status === 'cancelled') return false;
      if (a.appointment_date !== dateStr) return false;
      const existingStart = parseTimeOnDate(date, a.start_time);
      const existingEnd = parseTimeOnDate(date, a.end_time);
      return start < existingEnd && end > existingStart;
    });

    if (!overlaps) {
      slots.push({
        start,
        end,
        label: format(start, 'h:mm a'),
      });
    }

    cursor = new Date(cursor.getTime() + slotInterval * 60 * 1000);
  }

  return slots;
}

export function isDateBookable(params: {
  date: Date;
  hours: BusinessHours[];
  blocked: BlockedDate[];
}): boolean {
  const { date, hours, blocked } = params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;

  const weekday = date.getDay();
  const dayHours = hours.find((h) => h.weekday === weekday);
  if (!dayHours || !dayHours.is_open) return false;

  const dateStr = toDbDate(date);
  if (blocked.some((b) => b.blocked_date === dateStr)) return false;

  return true;
}

export function buildMonthGrid(monthAnchor: Date): Date[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const days: Date[] = [];

  // Start from the Sunday on or before the 1st
  const start = new Date(year, month, 1 - startWeekday);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function computeTotalPrice(params: {
  service: Service;
  bedrooms: number;
  bathrooms: number;
  addons: Addon[];
}): number {
  const { service, bedrooms, bathrooms, addons } = params;
  const extraBedrooms = Math.max(0, bedrooms - service.base_bedrooms);
  const extraBathrooms = Math.max(0, bathrooms - service.base_bathrooms);
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  return (
    service.price +
    extraBedrooms * service.bedroom_modifier +
    extraBathrooms * service.bathroom_modifier +
    addonsTotal
  );
}

export { isSameYMD };
