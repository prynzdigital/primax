# Client Brief
**Client:** Primax Group LLC
**Stage:** Intake
**Generated:** 2026-06-30
**Inputs Used:** Client interview + primaxgroupllc.com website
**Status:** Complete

---

## 1. Business Basics
- **Legal/Trade name:** Primax Group LLC
- **Industry:** Cleaning Services *(matches PRYNZ template: `cleaning`)*
- **Location(s) / service area:** 332 S Michigan Ave, 9th Floor, Chicago, IL 60604 — serves Downtown Chicago (The Loop, West Loop, River North, South Loop), North Side (Lincoln Park, Lakeview, Wicker Park, Logan Square, Bucktown), South & West Side (Hyde Park, Bronzeville, Englewood), South Suburbs (Orland Park, Tinley Park, Joliet, Naperville, Schaumburg, Oak Brook, Evanston, Skokie, Elmhurst, Des Plaines, Park Ridge)
- **Years in business:** 10+ years in the industry; Chicago-based presence since 2022
- **Short description:** Primax Group LLC is a residential and commercial cleaning company elevating Chicago's living and working standards. They serve working professionals, busy families, college students, offices, and facility managers across Chicago and its South Suburbs with eco-friendly, background-checked, fully insured cleaning crews.
- **Contact:** Phone (312) 296-5589 · Email info@primaxgroupllc.com · Mon–Fri 9 AM–5 PM, Sat 8 AM–2 PM

## 2. Website Goal
- **Primary goal:** Online bookings — customers complete a service booking directly on the website without calling
- **Secondary goals (ranked):**
  1. Generate quote/inquiry leads for commercial and facility accounts
  2. Build trust signals (social proof, certifications, Google rating)
  3. Showcase service range to capture broader search intent

## 3. Audience
- **Who buys/uses this, in the client's own words:** Working professionals, busy families, college students, office managers, property managers, Airbnb hosts, and facility management companies in Chicago and South Suburbs
- **Known customer pain points or frequent questions:** Reliability/consistency of cleaning crew; trust/security (strangers in the home); eco-friendly/safe products for kids and pets; on-time arrival; transparent pricing
- **Any existing customer data/personas:** None supplied — Strategist Agent to formalize from brief

## 4. Competitors
- **Direct competitor URLs (if known):** [NEEDS CLIENT INPUT: client did not supply competitor URLs]
- **What the client thinks competitors do well/poorly:** [NEEDS CLIENT INPUT]
- Note: Chicago cleaning market is competitive; key differentiators are 5.0 Google rating, background-checked crews, EPA-approved eco-friendly products, 24-hour satisfaction guarantee, on-time guarantee

## 5. Brand Assets
- **Existing logo?** Yes — favicon.svg exists in `/public/`; full wordmark TBD
- **Existing brand colors/fonts?** [NEEDS CLIENT INPUT — website uses a teal/green palette; confirm hex values]
- **Existing photography/video?** [NEEDS CLIENT INPUT — stock photography used on current site]
- **Brand voice the client wants:** Professional yet approachable; trustworthy; premium but accessible; Chicago-proud

## 6. Must-Have Pages & Features
- **Pages required:** Home (Hero + Services + Booking + About + Testimonials + Contact/Footer)
- **Features required:**
  - Online booking system (service selection → date/time picker → contact form → confirmation) ✅ *already built in downloaded template*
  - Admin dashboard (appointments management, blocked dates, business hours, service management) ✅ *already built*
  - Supabase backend for real-time availability and appointment storage
- **Integrations required:** Supabase (database + auth for admin panel); [NEEDS CLIENT INPUT: email notification service for booking confirmations]

## 7. Domain & Hosting
- **Domain already owned?** Yes — primaxgroupllc.com
- **Current hosting/CMS (if migrating):** Existing website at primaxgroupllc.com (unclear platform); new site is React + Vite + TypeScript + TailwindCSS + Supabase
- **Who will manage DNS during deployment:** [NEEDS CLIENT INPUT — client or PRYNZ]

## 8. Timeline & Constraints
- **Desired launch date:** [NEEDS CLIENT INPUT]
- **Hard constraints:** [NEEDS CLIENT INPUT]

## 9. Anything Else
- Client provided a pre-downloaded GitHub booking app template at `.prynz/clients/primax/` (React + Vite + TypeScript + TailwindCSS + Supabase). The pipeline task is to **personalize this existing codebase** for Primax Group LLC rather than build from scratch.
- Template originally branded as "Lumen & Bloom Cleaning Co." — all generic references must be replaced with Primax Group LLC content.
- Tagline from live website: *"Elevating Chicago's Living & Working Standards"*
- Key trust badges: 5.0 Google rating, background-checked + bonded + insured, EPA-approved eco-friendly products, on-time guarantee, 24-hour satisfaction guarantee

---
## Open Questions
- [ ] Confirm brand hex colors and font preferences
- [ ] Confirm whether they have professional photography to replace stock images
- [ ] Supply direct competitor URLs for SEO agent
- [ ] Confirm email notification service for booking confirmations (SendGrid, Resend, etc.)
- [ ] Confirm DNS management preference for deployment
- [ ] Confirm desired launch date
- [ ] Confirm Supabase project URL + anon key (for `.env` setup)
