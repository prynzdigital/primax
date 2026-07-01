# Task List
**Client:** Primax Group LLC
**Stage:** Project Management
**Generated:** 2026-06-30
**Inputs Used:** 00-brief.md
**Status:** Active

---

## Stage 0 — Intake ✅ Complete

- [x] Conduct client interview / scrape primaxgroupllc.com
- [x] Write `00-brief.md` with all known business facts, goals, audience, and open questions
- [x] Confirm existing template codebase at `.prynz/clients/primax/` (React + Vite + TypeScript + TailwindCSS + Supabase)
- [x] Initialize pipeline folder structure (`01-strategy/` through `07-deployment/`, `deliverables/`)
- [x] Create `_status.md` with initial row for Intake

---

## Stage 1 — Strategy ⬜ Pending

- [ ] Run Strategist Agent (`/run-strategy primax`)
- [ ] Produce `01-strategy/business-analysis.md` — business model, differentiators, competitive landscape (note: no competitor URLs supplied; flag gap)
- [ ] Produce `01-strategy/customer-personas.md` — formalize at least 3 personas from brief (working professional, busy family/parent, office/facility manager minimum; Airbnb host and college student as secondary)
- [ ] Produce `01-strategy/conversion-strategy.md` — primary CTA path (online booking), secondary CTA path (commercial quote inquiry), trust-signal hierarchy
- [ ] Validate all three files against Strategist Agent success criteria before proceeding
- [ ] Append completion row to `_status.md`

---

## Stage 2 — SEO ⬜ Pending

- [ ] Run SEO Agent (`/run-seo primax`) — requires Stage 1 complete
- [ ] Produce `02-seo/seo-strategy.md` — local SEO approach for Chicago + South Suburbs, service-type targeting
- [ ] Produce `02-seo/keyword-map.md` — primary, secondary, and long-tail keywords mapped to pages/sections (residential cleaning Chicago, commercial cleaning Chicago, deep clean, move-in/move-out, Airbnb cleaning, plus suburb-level geo terms)
- [ ] Produce `02-seo/metadata.md` — title tags and meta descriptions for all pages in the app (Home, Services, About, Booking confirmation)
- [ ] Validate all three files against SEO Agent success criteria before proceeding
- [ ] Append completion row to `_status.md`

---

## Stage 3 — Content ⬜ Pending

- [ ] Run Content Agent (`/run-content primax`) — requires Stages 1 and 2 complete
- [ ] Produce `03-content/homepage.md` — Hero (tagline "Elevating Chicago's Living & Working Standards" confirmed), Services overview cards, Trust signal block (5.0 Google, background-checked, bonded + insured, EPA-approved eco-friendly, on-time guarantee, 24-hour satisfaction guarantee), Testimonials section placeholder (flag if no real testimonials supplied), primary booking CTA
- [ ] Produce `03-content/services.md` — copy for each service offered (residential, commercial, deep clean, move-in/move-out, Airbnb/short-term rental, and any others confirmed in strategy)
- [ ] Produce `03-content/about.md` — company story (10+ years industry, Chicago since 2022), mission, team/crew values, Chicago-proud tone
- [ ] Produce `03-content/faq.md` — address known pain points from brief: crew reliability, trust/security (strangers in the home), eco-friendly/safe for kids and pets, on-time arrival, transparent pricing
- [ ] Flag any pricing, testimonial quotes, or certifications not in the brief as `[NEEDS CLIENT INPUT: ...]`
- [ ] Validate all four files against Content Agent success criteria before proceeding
- [ ] Append completion row to `_status.md`

---

## Stage 4 — Design ⬜ Pending

- [ ] Run Design Agent (`/run-design primax`) — requires Stages 1 and 3 complete
- [ ] Produce `04-design/design-system.md` — color tokens (resolve teal/green palette; flag if client hex values not yet confirmed), typography scale, spacing system, component inventory keyed to existing Tailwind/React stack
- [ ] Produce `04-design/style-guide.md` — logo/wordmark guidance (note: only `favicon.svg` in `/public/`; flag if full wordmark asset is needed), photography direction (flag if professional photos not yet supplied), icon set, button and form styles
- [ ] Produce `04-design/wireframes.md` — annotated wireframes for Home, Services, About, FAQ, Booking flow, Admin dashboard; must account for existing template's component structure
- [ ] Validate all three files against Design Agent success criteria
- [ ] **APPROVAL GATE: Human operator (and/or client) must review and explicitly approve design outputs before Stage 5 is dispatched**
- [ ] Record gate decision (approved / override with quoted instruction) in `_status.md`
- [ ] Append completion row to `_status.md`

---

## Stage 5 — Development (Enhancement Pass on Existing Template) ⬜ Pending

**Note:** The codebase at `.prynz/clients/primax/` (React + Vite + TypeScript + TailwindCSS + Supabase) is the working base. This stage is a targeted enhancement and personalization pass — not a greenfield build. The Developer Agent must not scaffold a new project.

- [ ] Run Developer Agent (`/run-development primax`) — requires Design gate approval; requires Stages 2, 3, 4 complete
- [ ] Apply approved design system tokens to `tailwind.config.js` (confirmed brand colors, typography)
- [ ] Integrate final copy from Stage 3 into all relevant components in `src/`
- [ ] Audit all remaining generic/template references ("Lumen & Bloom") and replace with Primax Group LLC content
- [ ] Configure Supabase environment variables (document `.env` variable names in `build-notes.md` — no secrets committed)
- [ ] Implement or document email notification integration for booking confirmations (blocked on client supplying service choice — see Pending Client Input)
- [ ] Confirm `npm install && npm run dev` runs with zero errors and zero manual fixes
- [ ] Validate booking flow end-to-end in local dev: service selection → date/time picker → contact form → confirmation
- [ ] Validate admin dashboard: appointments list, blocked dates, business hours, service management
- [ ] Produce `05-development/build-notes.md` — stack versions, required env variable names, known limitations, manual smoke-test checklist for QA
- [ ] Validate output against Developer Agent success criteria before proceeding
- [ ] Append completion row to `_status.md`

---

## Stage 6 — QA ⬜ Pending

- [ ] Run QA Agent (`/run-qa primax`) — requires Stage 5 complete
- [ ] Produce `06-qa/qa-report.md` — full test run results: functional, visual, SEO, accessibility, performance
- [ ] Produce `06-qa/issue-log.md` — each defect logged with type, severity, and owning agent per routing table
- [ ] Produce `06-qa/release-approval.md` — PASS or FAIL with conditions
- [ ] If issues found: Project Manager routes each defect to owning agent (SEO Agent for metadata issues; Content Agent for copy issues; Design Agent for visual/accessibility issues; Developer Agent for functional/performance/responsive bugs; Strategist Agent for business-fact errors) and re-triggers that agent — does not fix issues directly
- [ ] Re-run QA after each fix cycle until all critical and high defects are resolved
- [ ] **APPROVAL GATE: Human operator must confirm release-approval.md is PASS before Stage 7 is dispatched**
- [ ] Record gate decision in `_status.md`
- [ ] Append completion row to `_status.md`

---

## Stage 7 — Deployment ⬜ Pending

- [ ] Run Deployment Agent (`/deploy primax`) — requires QA PASS gate approval
- [ ] Confirm DNS management responsibility is resolved (client or PRYNZ — see Pending Client Input)
- [ ] Build production bundle (`npm run build`)
- [ ] Deploy to chosen hosting platform (Vercel, Netlify, or Cloudflare Pages recommended for Vite/SPA)
- [ ] Connect custom domain: primaxgroupllc.com
- [ ] Verify live site is reachable at primaxgroupllc.com; confirm HTTPS
- [ ] Produce `07-deployment/deployment-guide.md` — live URL, platform, deploy steps, env var setup instructions (for client's records)
- [ ] Produce `07-deployment/production-checklist.md` — post-launch checks completed
- [ ] Append completion row to `_status.md`

---

## Close-out ⬜ Pending (after live URL confirmed)

- [ ] Write `project-summary.md` — client-facing summary of what was built, key decisions, live URL, recommended next steps (analytics review cadence, content updates, potential next features)
- [ ] Assemble `/deliverables` package per `SOPs/SOP-00-overview.md` §Final Package
- [ ] Mark project `PROJECT_CLOSED` in `_status.md`

---

## Pending Client Input

These items are blocking or will block specific pipeline stages if not resolved before that stage is dispatched. Each was flagged in `00-brief.md`.

| # | Question | Blocking Stage | Source in Brief |
|---|---|---|---|
| CI-1 | Confirm brand hex colors and any font preferences (observed palette is teal/green — hex values needed for design system) | Stage 4 (Design) | §5 Brand Assets |
| CI-2 | Confirm whether professional photography is available to replace stock images on the current template | Stage 4 (Design) / Stage 5 (Dev) | §5 Brand Assets |
| CI-3 | Supply direct competitor URLs for SEO competitive gap analysis | Stage 2 (SEO) — non-blocking but limits analysis | §4 Competitors |
| CI-4 | Confirm email notification service for booking confirmations (e.g., SendGrid, Resend, Postmark) and provide any existing account details | Stage 5 (Development) | §6 Features |
| CI-5 | Confirm DNS management for deployment: will the client update DNS records, or should PRYNZ manage this? | Stage 7 (Deployment) | §7 Domain & Hosting |
| CI-6 | Confirm desired launch date and any hard constraints (e.g., seasonal event, marketing campaign start) | Planning — affects priority and scheduling | §8 Timeline |
| CI-7 | Provide Supabase project URL and anon key for `.env` configuration (values stay out of the repo; names only documented in `build-notes.md`) | Stage 5 (Development) | §6 Features |
| CI-8 | Confirm whether a full wordmark/logo file exists beyond `favicon.svg` in `/public/` | Stage 4 (Design) / Stage 5 (Dev) | §5 Brand Assets |
| CI-9 | Supply real customer testimonials (names, quotes, optional star rating) for the Testimonials section; if none available, confirm use of placeholder copy at launch | Stage 3 (Content) | §3 Audience |
| CI-10 | Confirm competitor names and what the client believes those competitors do well or poorly | Stage 1 (Strategy) / Stage 2 (SEO) | §4 Competitors |
