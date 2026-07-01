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

-- Migration: real service catalog (categories, task matrices, scale-up pricing, add-on bundling).
-- Idempotent — safe to re-run against an already-provisioned database.

ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'standard'
  CHECK (category IN ('sectional', 'standard', 'deep_addon', 'turnover'));
ALTER TABLE services ADD COLUMN IF NOT EXISTS tasks TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_bedrooms INTEGER NOT NULL DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_bathrooms INTEGER NOT NULL DEFAULT 1;
ALTER TABLE services ADD COLUMN IF NOT EXISTS bedroom_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS bathroom_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_addon BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS bedrooms INTEGER NOT NULL DEFAULT 1;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS bathrooms INTEGER NOT NULL DEFAULT 1;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS addon_service_id UUID REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2);

UPDATE appointments SET total_price = COALESCE(
  (SELECT price FROM services WHERE services.id = appointments.service_id), 0
) WHERE total_price IS NULL;
ALTER TABLE appointments ALTER COLUMN total_price SET NOT NULL;

-- Real Primax service catalog. Duration estimates are reasonable defaults
-- (none were provided in the pricing brief) — worth confirming with the client.
INSERT INTO services (slug, name, description, duration_minutes, price, is_active, category, tasks, base_bedrooms, base_bathrooms, bedroom_modifier, bathroom_modifier, is_addon)
VALUES
  (
    'sectional-kitchen',
    'Sectional Clean — Gourmet Kitchen Focus',
    'A focused, single-section clean for just the kitchen. Book on its own or alongside other sections.',
    45, 49.00, true, 'sectional',
    ARRAY[
      'Surface Sanitation — countertops, backsplashes, breakfast bars',
      'Appliance Facades — fridge, oven, dishwasher exterior',
      'Stovetop Restore — burners, grates, knobs',
      'Cavity Clean — microwave inside/out',
      'Fixtures & Basin — sink/faucet polish',
      'Floor Care — vacuum and damp-mop'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'sectional-bathroom',
    'Sectional Clean — Spa Bathroom Focus',
    'A focused, single-section clean for just one bathroom. Book on its own or alongside other sections.',
    30, 49.00, true, 'sectional',
    ARRAY[
      'Sanitary Porcelain — toilet bowl, base, tank, flusher',
      'Shower & Tub — soap scum removal from tile, glass doors, basins',
      'Vanity & Mirror — sink basin, faucet polish, mirrors',
      'Floor Care — bath mats shake, vacuum, hand-mop tiles'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'sectional-bedroom',
    'Sectional Clean — Sleep & Lounge Focus (Per Room)',
    'A focused, single-section clean for one bedroom or lounge room. Book once per room you''d like covered.',
    30, 49.00, true, 'sectional',
    ARRAY[
      'Dusting Mastery — nightstands, dressers, TV stands, screens',
      'Linen Service — straighten/replace bedsheets',
      'High-Touch Wipe — door handles, switches, remotes',
      'Floor Care — edge vacuuming/mopping'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'standard-1b1b',
    'Standard Maintenance Cleaning (1 Bed / 1 Bath)',
    'A full-home maintenance clean covering kitchen, bathrooms, bedrooms, and living areas. Price scales with home size — add bedrooms/bathrooms when booking.',
    120, 129.00, true, 'standard',
    ARRAY[
      'Kitchen — countertop perimeters/backsplashes',
      'Kitchen — stovetop exterior',
      'Kitchen — major appliance exteriors',
      'Kitchen — microwave interior/turntable',
      'Kitchen — spot-wipe cabinet doors',
      'Kitchen — sanitize sink/polish chrome',
      'Kitchen — sweep and damp-mop',
      'Bathrooms — disinfect/scrub toilet',
      'Bathrooms — clean tub/shower walls/fixtures',
      'Bathrooms — wipe vanity top/sink/faucet',
      'Bathrooms — streak-free mirror cleaning',
      'Bathrooms — empty trash liner/wipe canister',
      'Bathrooms — mop tiles with disinfectant',
      'Bedrooms & Living — dust accessible surfaces/shelves/decor',
      'Bedrooms & Living — straighten bed linens/fluff pillows',
      'Bedrooms & Living — vacuum rugs/carpets/under low furniture',
      'Bedrooms & Living — dust reachable sills/baseboards',
      'Bedrooms & Living — empty all trash bins'
    ]::text[],
    1, 1, 30.00, 40.00, false
  ),
  (
    'deep-premium-addon',
    'Deep Premium Upgrade (Add-On to Standard)',
    'An add-on upgrade bundled onto Standard Maintenance Cleaning for a full top-to-bottom deep clean. Not bookable on its own.',
    90, 99.00, true, 'deep_addon',
    ARRAY[
      'Kitchen — Oven Interior carbon removal',
      'Kitchen — Fridge/Freezer Interior sanitize shelves/drawers',
      'Kitchen — Range Hood Exhaust degrease',
      'Kitchen — Cabinet Detailing hand-wipe exterior faces',
      'Bathroom — Grout Remediation line scrub',
      'Bathroom — Exhaust Ventilation fan vacuum/wipe',
      'Bathroom — Scale Removal on showerheads/taps',
      'Living Space — Baseboard Scrubbing hand-wipe',
      'Living Space — Window Interiors glass/sills/tracks',
      'Living Space — Blind Detailing dust individual slats',
      'Living Space — Under-Furniture vacuuming',
      'Living Space — Ventilation register/vent dusting'
    ]::text[],
    1, 1, 0, 0, true
  ),
  (
    'turnover-empty-unit',
    'Move-In / Move-Out Turnover (Empty Unit)',
    'A full turnover clean for a completely empty unit — required for accurate pricing and scope. Price scales with bedrooms/bathrooms — add them when booking.',
    240, 249.00, true, 'turnover',
    ARRAY[
      'Vacuum/wipe inside all empty cabinets/drawers',
      'Closet Restoration — shelves/rods',
      'Appliance Overhaul — inside/out oven, fridge, freezer, dishwasher',
      'Fixtures & Trim cleaning',
      'Entryway & Doors wipe-down',
      'Restorative Floor Prep — edge vacuum/double mop',
      'Small trash bagging',
      'Complete switch/outlet cover sanitization'
    ]::text[],
    1, 1, 45.00, 45.00, false
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  tasks = EXCLUDED.tasks,
  base_bedrooms = EXCLUDED.base_bedrooms,
  base_bathrooms = EXCLUDED.base_bathrooms,
  bedroom_modifier = EXCLUDED.bedroom_modifier,
  bathroom_modifier = EXCLUDED.bathroom_modifier,
  is_addon = EXCLUDED.is_addon;
