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
  CHECK (category IN ('sectional', 'standard', 'deep', 'turnover'));
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

-- Migration: expanded task matrices, Deep Cleaning becomes a standalone tier
-- (no longer addon-only), and a proper many-to-many add-ons system replaces
-- the old single-addon columns. Idempotent — safe to re-run.

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;

CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointment_addons (
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE RESTRICT,
  PRIMARY KEY (appointment_id, addon_id)
);

-- Fully replaced by appointment_addons — a customer can now select several
-- add-ons at once, which a single nullable FK can't represent.
ALTER TABLE appointments DROP COLUMN IF EXISTS addon_service_id;

-- One-time repurpose of the old addon-only row into the new standalone Deep
-- Cleaning tier (idempotent: no-ops once the rename has already happened).
UPDATE services
SET slug = 'deep-cleaning', name = 'Deep Cleaning', category = 'deep', is_addon = false, price = 0
WHERE slug = 'deep-premium-addon'
  AND NOT EXISTS (SELECT 1 FROM services WHERE slug = 'deep-cleaning');

-- Re-add the constraint now that no row still has the retired 'deep_addon' value.
ALTER TABLE services ADD CONSTRAINT services_category_check
  CHECK (category IN ('sectional', 'standard', 'deep', 'turnover'));

-- Refreshed task matrices from the expanded service brief. Deep Cleaning's
-- duration is a placeholder estimate (none was specified) alongside its $0
-- price — both need client confirmation before this tier is truly bookable.
INSERT INTO services (slug, name, description, duration_minutes, price, is_active, category, tasks, base_bedrooms, base_bathrooms, bedroom_modifier, bathroom_modifier, is_addon)
VALUES
  (
    'sectional-kitchen',
    'Sectional Clean — Gourmet Kitchen Focus',
    'A focused, single-section clean for just the kitchen. Book on its own or alongside other sections.',
    45, 49.00, true, 'sectional',
    ARRAY[
      'Countertops — sanitize all accessible countertops',
      'Countertops — wipe backsplash',
      'Countertops — clean breakfast bar',
      'Countertops — remove light grease',
      'Sink — scrub basin',
      'Sink — polish faucet',
      'Sink — remove food residue',
      'Appliances — refrigerator exterior',
      'Appliances — dishwasher exterior',
      'Appliances — oven exterior',
      'Appliances — microwave exterior and interior',
      'Stovetop — remove grease',
      'Stovetop — clean burner area',
      'Stovetop — polish controls',
      'Floors — sweep',
      'Floors — vacuum edges',
      'Floors — damp mop',
      'Trash — empty bin',
      'Trash — replace liner if provided'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'sectional-bathroom',
    'Sectional Clean — Spa Bathroom Focus',
    'A focused, single-section clean for just one bathroom. Book on its own or alongside other sections.',
    30, 49.00, true, 'sectional',
    ARRAY[
      'Toilet — bowl, seat, lid, tank exterior, base',
      'Sink — basin, faucet, counter',
      'Mirror — streak-free clean',
      'Shower — remove soap residue',
      'Shower — glass door wipe',
      'Tub — rinse and clean',
      'Floor — vacuum',
      'Floor — mop',
      'Trash — empty'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'sectional-bedroom',
    'Sectional Clean — Sleep & Lounge Focus (Per Room)',
    'A focused, single-section clean for one bedroom or lounge room. Book once per room you''d like covered.',
    30, 49.00, true, 'sectional',
    ARRAY[
      'Dust — nightstand',
      'Dust — dresser',
      'Dust — headboard',
      'Dust — TV stand',
      'Dust — windowsill',
      'Make bed',
      'Vacuum',
      'Mop if applicable',
      'Empty trash',
      'Sanitize — door handles',
      'Sanitize — switches',
      'Sanitize — remote controls'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'standard-1b1b',
    'Standard Maintenance Cleaning (1 Bed / 1 Bath)',
    'Everything in the Express sections, plus kitchen, bathroom, bedroom, living room, and hallway detailing. Price scales with home size — add bedrooms/bathrooms when booking.',
    120, 129.00, true, 'standard',
    ARRAY[
      'Kitchen — sanitize all accessible countertops',
      'Kitchen — wipe backsplash',
      'Kitchen — clean breakfast bar',
      'Kitchen — remove light grease',
      'Kitchen — scrub sink basin',
      'Kitchen — polish faucet',
      'Kitchen — remove food residue from sink',
      'Kitchen — refrigerator, dishwasher, oven exteriors',
      'Kitchen — microwave exterior and interior',
      'Kitchen — stovetop degrease, burner area, controls',
      'Kitchen — sweep, vacuum edges, damp mop',
      'Kitchen — empty trash, replace liner if provided',
      'Kitchen — cabinet fronts',
      'Kitchen — spot clean walls',
      'Kitchen — dining table',
      'Kitchen — chairs',
      'Kitchen — baseboards (visible dust)',
      'Bathrooms — toilet bowl, seat, lid, tank exterior, base',
      'Bathrooms — sink basin, faucet, counter',
      'Bathrooms — streak-free mirror',
      'Bathrooms — shower soap residue and glass door',
      'Bathrooms — tub rinse and clean',
      'Bathrooms — floor vacuum and mop',
      'Bathrooms — empty trash',
      'Bathrooms — vanity storage exterior',
      'Bathrooms — tub ledges',
      'Bathrooms — soap dishes',
      'Bathrooms — tissue holder',
      'Bedrooms — dust nightstand, dresser, headboard, TV stand, windowsill',
      'Bedrooms — make bed',
      'Bedrooms — vacuum and mop if applicable',
      'Bedrooms — empty trash',
      'Bedrooms — sanitize door handles, switches, remote controls',
      'Bedrooms — furniture dusting',
      'Bedrooms — lamps',
      'Bedrooms — picture frames',
      'Living Room — coffee table',
      'Living Room — side tables',
      'Living Room — electronics dust',
      'Living Room — couch vacuum (surface only)',
      'Hallway — baseboards',
      'Hallway — light switches',
      'Hallway — entry mat vacuum'
    ]::text[],
    1, 1, 30.00, 40.00, false
  ),
  (
    'deep-cleaning',
    'Deep Cleaning',
    'A dramatically more thorough clean — interiors, tracks, grout, and every surface a standard visit doesn''t reach. Price and duration are placeholders pending confirmation.',
    210, 0.00, true, 'deep',
    ARRAY[
      'Kitchen — oven interior',
      'Kitchen — refrigerator interior',
      'Kitchen — freezer',
      'Kitchen — cabinet fronts (entire kitchen)',
      'Kitchen — hood filters',
      'Kitchen — window tracks',
      'Kitchen — light fixtures',
      'Bathrooms — tile grout',
      'Bathrooms — hard water removal',
      'Bathrooms — exhaust fan',
      'Bathrooms — under sink exterior',
      'Bathrooms — detailed fixtures',
      'Bedrooms — under bed vacuum',
      'Bedrooms — closet floor',
      'Bedrooms — baseboards scrubbed',
      'Bedrooms — window tracks',
      'Bedrooms — doors',
      'Living Room — furniture moved where safe',
      'Living Room — behind couch',
      'Living Room — window interiors',
      'Living Room — blinds',
      'Living Room — ceiling fan',
      'Entire Home — air vents',
      'Entire Home — baseboards',
      'Entire Home — interior doors',
      'Entire Home — frames',
      'Entire Home — trim',
      'Entire Home — window sills'
    ]::text[],
    1, 1, 0, 0, false
  ),
  (
    'turnover-empty-unit',
    'Move-In / Move-Out Turnover (Empty Unit)',
    'Everything in Deep Cleaning, plus every interior surface for a completely empty unit. Price scales with bedrooms/bathrooms — add them when booking.',
    300, 249.00, true, 'turnover',
    ARRAY[
      'Kitchen — oven interior',
      'Kitchen — refrigerator interior',
      'Kitchen — freezer',
      'Kitchen — cabinet fronts (entire kitchen)',
      'Kitchen — hood filters',
      'Kitchen — window tracks',
      'Kitchen — light fixtures',
      'Kitchen — every cabinet interior',
      'Kitchen — every drawer interior',
      'Kitchen — appliance interiors',
      'Kitchen — pantry shelving',
      'Kitchen — refrigerator drip tray',
      'Bathrooms — tile grout',
      'Bathrooms — hard water removal',
      'Bathrooms — exhaust fan',
      'Bathrooms — under sink exterior',
      'Bathrooms — detailed fixtures',
      'Bathrooms — medicine cabinet interior',
      'Bathrooms — vanity interior',
      'Bathrooms — exhaust vent',
      'Bathrooms — toilet behind base',
      'Bedrooms — under bed vacuum',
      'Bedrooms — closet floor',
      'Bedrooms — baseboards scrubbed',
      'Bedrooms — window tracks',
      'Bedrooms — doors',
      'Bedrooms — closet shelving',
      'Bedrooms — closet rods',
      'Bedrooms — closet walls',
      'Living — furniture moved where safe',
      'Living — behind couch',
      'Living — window interiors',
      'Living — blinds',
      'Living — ceiling fan',
      'Living — light fixtures',
      'Living — switch plates',
      'Living — door frames',
      'Living — interior doors',
      'Living — windows interior',
      'Entire Home — all reachable baseboards',
      'Entire Home — all trim',
      'Entire Home — all vents',
      'Entire Home — entry doors',
      'Entire Home — interior doors',
      'Entire Home — garage sweep (if selected)',
      'Entire Home — balcony sweep (if selected)'
    ]::text[],
    1, 1, 45.00, 45.00, false
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  category = EXCLUDED.category,
  tasks = EXCLUDED.tasks,
  base_bedrooms = EXCLUDED.base_bedrooms,
  base_bathrooms = EXCLUDED.base_bathrooms,
  bedroom_modifier = EXCLUDED.bedroom_modifier,
  bathroom_modifier = EXCLUDED.bathroom_modifier,
  is_addon = EXCLUDED.is_addon;

-- Standalone add-ons — never bundled automatically, selected individually on
-- any booking. Prices/durations are $0/0 placeholders (none were specified)
-- and need real values entered via the admin Add-ons page before launch.
INSERT INTO addons (slug, name, description, price, duration_minutes, is_active)
VALUES
  ('laundry-service', 'Laundry Service', 'Wash, dry, and fold a load of laundry during the visit — iron available on request.', 0, 0, true),
  ('inside-refrigerator', 'Inside Refrigerator', 'Full interior clean of the refrigerator — shelves, drawers, and door bins.', 0, 0, true),
  ('inside-oven', 'Inside Oven', 'Full interior clean of the oven cavity, racks, and door glass.', 0, 0, true),
  ('pet-hair-removal', 'Pet Hair Removal', 'Extra pass to remove pet hair from furniture, floors, and upholstery.', 0, 0, true),
  ('balcony-cleaning', 'Balcony Cleaning', 'Sweep and wipe-down of balcony surfaces and railings.', 0, 0, true),
  ('interior-windows', 'Interior Windows', 'Interior glass cleaning for accessible windows.', 0, 0, true),
  ('blind-cleaning', 'Blind Cleaning', 'Dust and wipe-down of blinds, slat by slat.', 0, 0, true),
  ('wall-spot-cleaning', 'Wall Spot Cleaning', 'Spot cleaning of marks and scuffs on walls.', 0, 0, true),
  ('garage-sweep', 'Garage Sweep', 'Sweep and general tidy of garage floor space.', 0, 0, true),
  ('patio-cleaning', 'Patio Cleaning', 'Sweep and wipe-down of patio surfaces and furniture.', 0, 0, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Migration: service address for the booking form (needed so cleaners know
-- where to go). Idempotent — safe to re-run.
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS zip_code TEXT NOT NULL DEFAULT '';

-- Migration: Instacart-style room/tier/zip/subscription pricing cart.
-- Prices/rates below are as specified by the client request, not yet
-- confirmed as final real business figures — flagged for sign-off.
-- Idempotent — safe to re-run.

ALTER TABLE services ADD COLUMN IF NOT EXISTS living_room_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS kitchen_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS balcony_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_living_rooms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_kitchens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_balconies INTEGER NOT NULL DEFAULT 0;

-- base_* room counts set to 0: in this à-la-carte model every room adds its
-- per-unit price on top of the base tier fee (nothing "included").
UPDATE services SET
  name = 'Standard Maintenance',
  description = 'Consistent upkeep for busy professionals',
  price = 95, base_bedrooms = 0, base_bathrooms = 0,
  bedroom_modifier = 30, bathroom_modifier = 45,
  living_room_modifier = 35, kitchen_modifier = 50, balcony_modifier = 25
WHERE slug = 'standard-1b1b';

UPDATE services SET
  name = 'Deep Restorative',
  description = 'Intensive hand-wiping, grout scrubbing, & scale removal',
  price = 175, base_bedrooms = 0, base_bathrooms = 0,
  bedroom_modifier = 55, bathroom_modifier = 85,
  living_room_modifier = 60, kitchen_modifier = 95, balcony_modifier = 45
WHERE slug = 'deep-cleaning';

UPDATE services SET
  name = 'Move-In / Move-Out',
  description = 'Turnkey empty-home sanitization including interior cabinets',
  price = 250, base_bedrooms = 0, base_bathrooms = 0,
  bedroom_modifier = 70, bathroom_modifier = 110,
  living_room_modifier = 75, kitchen_modifier = 130, balcony_modifier = 60
WHERE slug = 'turnover-empty-unit';

ALTER TABLE addons ADD COLUMN IF NOT EXISTS is_counter BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE addons ADD COLUMN IF NOT EXISTS max_quantity INTEGER;
ALTER TABLE addons ADD COLUMN IF NOT EXISTS disabled_for_category TEXT;

-- Retire the old $0-placeholder add-on set — replaced by the 5 premium
-- add-ons specified in the new cart model.
UPDATE addons SET is_active = false
WHERE slug IN (
  'laundry-service', 'inside-refrigerator', 'inside-oven', 'pet-hair-removal',
  'balcony-cleaning', 'interior-windows', 'blind-cleaning', 'wall-spot-cleaning',
  'garage-sweep', 'patio-cleaning'
);

INSERT INTO addons (slug, name, description, price, is_counter, max_quantity, disabled_for_category, is_active)
VALUES
  ('premium-concierge-shopping', 'Premium Concierge Shopping', 'We pick up groceries or essentials for you during the visit.', 45, false, 1, NULL, true),
  ('inside-large-appliance-detail', 'Inside Large Appliance Detail', 'Deep interior clean of a large appliance (oven, fridge, etc.) — priced per appliance.', 40, true, 6, NULL, true),
  ('inside-kitchen-cabinets-drawers', 'Inside Kitchen Cabinets & Drawers', 'Interior wipe-down of all kitchen cabinets and drawers.', 65, false, 1, 'turnover', true),
  ('eco-pet-hair-extraction', 'Eco-Pet Hair Extraction & Sanitization', 'Specialized extraction and sanitizing pass for homes with pets.', 35, false, 1, NULL, true),
  ('load-of-laundry', 'Load of Laundry (Wash, Dry, Fold)', 'A load of laundry washed, dried, and folded — priced per load.', 30, true, 4, NULL, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_counter = EXCLUDED.is_counter,
  max_quantity = EXCLUDED.max_quantity,
  disabled_for_category = EXCLUDED.disabled_for_category,
  is_active = EXCLUDED.is_active;

ALTER TABLE appointment_addons ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS living_rooms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS kitchens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS balconies INTEGER NOT NULL DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS square_footage INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'one_time'
  CHECK (frequency IN ('one_time', 'monthly', 'biweekly', 'weekly'));

-- Deactivate any legacy slug-less service (e.g. the original "Standard Home
-- Cleaning" test row) so it doesn't appear as a bogus tier in the cart.
UPDATE services SET is_active = false WHERE slug IS NULL;

-- Bespoke-quote leads (enterprise-scale jobs) — not scheduled appointments,
-- just a lead to follow up on manually.
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
