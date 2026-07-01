import type {
  AdminUser,
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
  return request<Service[]>('/services');
}
export async function createService(payload: Partial<Service>) {
  return request<Service>('/services', { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateService(id: string, payload: Partial<Service>) {
  return request<Service>(`/services?id=${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

// Appointments
export async function listAppointments() {
  return request<Appointment[]>('/appointments');
}
export async function listAppointmentsForDate(date: string) {
  return request<Appointment[]>(`/appointments?date=${date}`);
}
export async function createAppointment(
  payload: Omit<Appointment, 'id' | 'created_at' | 'status' | 'service'>
) {
  // Status is always set server-side; the client cannot request a status.
  return request<{ id: string }>('/appointments', { method: 'POST', body: JSON.stringify(payload) });
}
export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return request<Appointment>(`/appointments?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
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
