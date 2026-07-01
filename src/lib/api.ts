import type {
  AdminUser,
  Addon,
  Appointment,
  AppointmentStatus,
  BlockedDate,
  BusinessHours,
  BusinessSettings,
  Service,
} from './types';

const BASE = '/api';

export interface ApiError {
  message: string;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

// Postgres NUMERIC columns come back from the Neon driver as strings (e.g. "129.00")
// to avoid float precision loss — coerce them to JS numbers at the API boundary.
function normalizeService(s: Service): Service {
  return {
    ...s,
    price: Number(s.price),
    bedroom_modifier: Number(s.bedroom_modifier),
    bathroom_modifier: Number(s.bathroom_modifier),
  };
}

function normalizeAddon(a: Addon): Addon {
  return { ...a, price: Number(a.price) };
}

function normalizeAppointment(a: Appointment): Appointment {
  return {
    ...a,
    total_price: a.total_price !== undefined && a.total_price !== null ? Number(a.total_price) : a.total_price,
    service: a.service ? normalizeService(a.service) : a.service,
    addons: a.addons ? a.addons.map(normalizeAddon) : a.addons,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      ...options,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { data: null, error: { message: body?.error ?? res.statusText } };
    }
    return { data: (body ?? null) as T, error: null };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : 'Network error' } };
  }
}

export async function checkHealth() {
  return request<{ ok: boolean }>('/health');
}

// Auth
export async function login(email: string, password: string) {
  return request<AdminUser>('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function logout() {
  return request<{ ok: boolean }>('/logout', { method: 'POST' });
}
export async function getSession() {
  return request<AdminUser>('/session');
}

// Services
export async function listServices() {
  const res = await request<Service[]>('/services');
  return { ...res, data: res.data ? res.data.map(normalizeService) : res.data };
}
export async function createService(payload: Partial<Service>) {
  const res = await request<Service>('/services', { method: 'POST', body: JSON.stringify(payload) });
  return { ...res, data: res.data ? normalizeService(res.data) : res.data };
}
export async function updateService(id: string, payload: Partial<Service>) {
  const res = await request<Service>(`/services?id=${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  return { ...res, data: res.data ? normalizeService(res.data) : res.data };
}

// Add-ons
export async function listAddons() {
  const res = await request<Addon[]>('/addons');
  return { ...res, data: res.data ? res.data.map(normalizeAddon) : res.data };
}
export async function createAddon(payload: Partial<Addon>) {
  const res = await request<Addon>('/addons', { method: 'POST', body: JSON.stringify(payload) });
  return { ...res, data: res.data ? normalizeAddon(res.data) : res.data };
}
export async function updateAddon(id: string, payload: Partial<Addon>) {
  const res = await request<Addon>(`/addons?id=${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  return { ...res, data: res.data ? normalizeAddon(res.data) : res.data };
}

// Appointments
export async function listAppointments() {
  const res = await request<Appointment[]>('/appointments');
  return { ...res, data: res.data ? res.data.map(normalizeAppointment) : res.data };
}
export async function listAppointmentsForDate(date: string) {
  return request<Appointment[]>(`/appointments?date=${date}`);
}
export async function createAppointment(
  payload: Omit<Appointment, 'id' | 'created_at' | 'status' | 'service' | 'addons'> & { addon_ids: string[] }
) {
  // Status is always set server-side; the client cannot request a status.
  return request<{ id: string }>('/appointments', { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const res = await request<Appointment>(`/appointments?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return { ...res, data: res.data ? normalizeAppointment(res.data) : res.data };
}

// Business hours
export async function listBusinessHours() {
  return request<BusinessHours[]>('/business-hours');
}
export async function saveBusinessHours(rows: Array<Pick<BusinessHours, 'weekday' | 'is_open' | 'start_time' | 'end_time'>>) {
  return request<BusinessHours[]>('/business-hours', { method: 'PUT', body: JSON.stringify({ rows }) });
}

// Blocked dates
export async function listBlockedDates() {
  return request<BlockedDate[]>('/blocked-dates');
}
export async function addBlockedDate(payload: { blocked_date: string; reason: string | null }) {
  return request<BlockedDate>('/blocked-dates', { method: 'POST', body: JSON.stringify(payload) });
}
export async function removeBlockedDate(id: string) {
  return request<{ ok: boolean }>(`/blocked-dates?id=${id}`, { method: 'DELETE' });
}

// Business settings
export async function getBusinessSettings() {
  return request<BusinessSettings | null>('/business-settings');
}
export async function saveBusinessSettings(payload: Omit<BusinessSettings, 'id' | 'created_at'>) {
  return request<BusinessSettings>('/business-settings', { method: 'PATCH', body: JSON.stringify(payload) });
}
