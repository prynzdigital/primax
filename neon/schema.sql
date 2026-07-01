-- Primax Group LLC — Neon Postgres schema
-- Run once against your Neon database, e.g.:
--   psql "$DATABASE_URL" -f neon/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);

CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday INTEGER NOT NULL UNIQUE CHECK (weekday BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT false,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '17:00:00'
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT '',
  business_email TEXT NOT NULL DEFAULT '',
  business_phone TEXT NOT NULL DEFAULT '',
  business_address TEXT NOT NULL DEFAULT '',
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
  booking_notice_hours INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Replaces Supabase Auth's user store. Passwords are bcrypt hashes, created
-- via `npm run create-admin` (scripts/create-admin.mjs) — never insert plaintext here.
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data matching Primax Group's real services (from primaxgroupllc.com).
-- Safe to re-run: only inserts when the table is empty.
INSERT INTO business_hours (weekday, is_open, start_time, end_time)
SELECT weekday, is_open, start_time, end_time FROM (
  VALUES
    (0, false, '09:00:00'::time, '17:00:00'::time),
    (1, true,  '09:00:00'::time, '17:00:00'::time),
    (2, true,  '09:00:00'::time, '17:00:00'::time),
    (3, true,  '09:00:00'::time, '17:00:00'::time),
    (4, true,  '09:00:00'::time, '17:00:00'::time),
    (5, true,  '09:00:00'::time, '17:00:00'::time),
    (6, true,  '08:00:00'::time, '14:00:00'::time)
) AS seed(weekday, is_open, start_time, end_time)
WHERE NOT EXISTS (SELECT 1 FROM business_hours);

INSERT INTO business_settings (business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours)
SELECT 'Primax Group LLC', 'info@primaxgroupllc.com', '(312) 296-5589', '332 S Michigan Ave, 9th Floor, Chicago, IL 60604', 30, 2
WHERE NOT EXISTS (SELECT 1 FROM business_settings);
