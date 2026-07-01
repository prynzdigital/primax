# Project Plan
**Client:** Primax Group LLC
**Stage:** Project Management
**Generated:** 2026-06-30
**Inputs Used:** 00-brief.md
**Status:** Active

---

## Project Overview

Primax Group LLC is a residential and commercial cleaning company headquartered at 332 S Michigan Ave, Chicago, IL 60604, serving Downtown Chicago, the North Side, South/West Side, and South Suburbs. The business has 10+ years of industry experience and has operated in Chicago since 2022.

The primary website goal is to capture online bookings without requiring a phone call. Secondary goals are to generate commercial/facility quote leads, build trust signals (5.0 Google rating, background-checked crews, EPA-approved eco-friendly products, on-time guarantee, 24-hour satisfaction guarantee), and broaden search visibility across a competitive Chicago cleaning market.

The site is a React + Vite + TypeScript + TailwindCSS + Supabase booking application. A complete GitHub template was downloaded and placed at `.prynz/clients/primax/`. The template was originally branded as "Lumen & Bloom Cleaning Co." and has already received a first personalization pass with Primax's real business name, contact info, services, hours, and About/Hero copy. The pipeline task is to **refine and complete** this existing application rather than build from scratch. No new framework or architecture decisions are required; the Developer Agent performs an enhancement and personalization pass against the established stack.

Industry template in use: `cleaning`.

---

## Stage Sequence and Dependencies

| Stage | Agent | Depends On | Key Outputs | Gate |
|---|---|---|---|---|
| 0 | Intake (complete) | — | `00-brief.md` | — |
| 1 | Strategist | Stage 0 | `01-strategy/business-analysis.md`, `customer-personas.md`, `conversion-strategy.md` | — |
| 2 | SEO | Stage 1 | `02-seo/seo-strategy.md`, `keyword-map.md`, `metadata.md` | — |
| 3 | Content | Stages 1, 2 | `03-content/homepage.md`, `services.md`, `about.md`, `faq.md` | — |
| 4 | Design | Stages 1, 3 | `04-design/design-system.md`, `style-guide.md`, `wireframes.md` | **APPROVAL GATE — design sign-off required before Stage 5** |
| 5 | Developer | Stages 2, 3, 4 | `/source` (enhanced existing app), `05-development/build-notes.md` | — |
| 6 | QA | Stage 5 | `06-qa/qa-report.md`, `issue-log.md`, `release-approval.md` | **APPROVAL GATE — release-approval must be PASS before Stage 7** |
| 7 | Deployment | Stage 6 | Live site at primaxgroupllc.com, `07-deployment/deployment-guide.md`, `production-checklist.md` | — |
| Close-out | Project Manager | Stage 7 | `project-summary.md`, `/deliverables` package | — |

Hard dependencies are strictly sequential per the master workflow. No stage may begin until all listed inputs exist and are marked complete in `_status.md`.

---

## Phase Breakdown

### Stage 1 — Strategy
The Strategist Agent reads `00-brief.md` and formalizes what the brief already outlines: customer personas (working professionals, busy families, college students, Airbnb hosts, office/facility managers), competitive positioning built on trust signals, and a conversion strategy centered on frictionless online booking. Because no competitor URLs were supplied, the agent must flag this gap and derive positioning from the brief's stated differentiators alone.

### Stage 2 — SEO
The SEO Agent maps keywords across Primax's service lines (residential, commercial, deep clean, move-in/move-out, Airbnb) and geography (Chicago neighborhoods + South Suburbs). It produces metadata (title tags, meta descriptions) keyed to the pages already in the template. The lack of competitor URLs limits competitive keyword gap analysis; the agent will flag this.

### Stage 3 — Content
The Content Agent writes final, publish-ready copy for each page/section of the app: Home (Hero, Services overview, Trust signals, Testimonials, CTA), Services (per-service detail pages or cards), About, and FAQ. Copy must be traceable to brief facts and SEO keyword targets. Any business facts not in the brief (e.g., exact pricing tiers, specific testimonial quotes) must be flagged `[NEEDS CLIENT INPUT: ...]` rather than invented.

### Stage 4 — Design
The Design Agent produces a design system, style guide, and wireframes aligned to the existing React/Tailwind stack. Because the template already uses a teal/green palette, the Design Agent must either confirm that palette as the official brand system or flag the need for the client to confirm hex values. The wordmark situation (only a favicon.svg exists) must be addressed — the agent will note whether it can work with the favicon or if a full wordmark asset is required before development refinement can be complete. This stage ends with a **human approval gate**; the Design Agent's output must be reviewed and approved before the Developer Agent begins the enhancement pass.

### Stage 5 — Development (Enhancement Pass)
The Developer Agent performs a targeted refinement of the existing codebase at `.prynz/clients/primax/`. This is not a greenfield build. Work includes: applying approved design system tokens (colors, typography, spacing) via Tailwind config; integrating final copy from Stage 3; ensuring all `[NEEDS CLIENT INPUT: ...]` items that have been resolved are implemented; configuring the Supabase connection (environment variable setup documented in `build-notes.md` with names only, no secrets); and confirming that `npm install && npm run dev` runs to zero errors. The email notification integration for booking confirmations is dependent on the client supplying their chosen service (SendGrid, Resend, etc.).

### Stage 6 — QA
The QA Agent validates the running app against the SEO metadata spec, design system, and content files. It checks: booking flow end-to-end, admin dashboard, responsive layout, accessibility (contrast, keyboard navigation), page performance, and presence of all required trust signals. Any defects are logged in `issue-log.md` and routed by the Project Manager to the correct owning agent. QA must issue a PASS in `release-approval.md` before deployment proceeds.

### Stage 7 — Deployment
The Deployment Agent guides or executes deployment of the Vite/React app to a hosting provider compatible with a static/SPA build (e.g., Vercel, Netlify, or Cloudflare Pages), connects it to primaxgroupllc.com, and documents the DNS changes required. DNS management responsibility (client vs. PRYNZ) is an open question that must be resolved before this stage begins.

---

## Key Milestones

| Milestone | Condition |
|---|---|
| Planning complete | `project-plan.md` and `task-list.md` written; `_status.md` updated |
| Strategy complete | All three `01-strategy/` files written and pass Strategist success criteria |
| SEO complete | All three `02-seo/` files written and pass SEO Agent success criteria |
| Content complete | All four `03-content/` files written and pass Content Agent success criteria |
| Design approved | Design Agent outputs written, human operator has approved, gate recorded in `_status.md` |
| Development complete | Enhanced `/source` runs cleanly; `build-notes.md` written |
| QA PASS | `06-qa/release-approval.md` status is PASS; all critical/high issues resolved |
| Site live | Deployment Agent confirms reachable URL at primaxgroupllc.com |
| Project closed | `project-summary.md` written; `/deliverables` assembled |

---

## Development Context Note

The `/source` for this project is the React + Vite + TypeScript + TailwindCSS + Supabase booking template already present at the client folder root (files: `index.html`, `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `src/`, `public/`). The Developer Agent must NOT scaffold a new project. It reads the existing source, applies the design system and final copy, resolves any remaining generic/template references, and validates the Supabase integration. The app already includes a functional booking flow and admin dashboard; the enhancement pass is additive and corrective, not architectural.

---

## Risks and Assumptions Surfaced from Brief

| Risk / Assumption | Severity | Owner |
|---|---|---|
| No competitor URLs supplied — SEO competitive gap analysis will be limited | Medium | Client to supply before Stage 2 if possible |
| Brand hex colors not confirmed — Design Agent will work from observed teal/green palette on current site | Medium | Client to confirm before Design gate |
| No professional photography confirmed — stock images may remain in use at launch | Low–Medium | Client to supply before Stage 5 if possible |
| Email notification service not chosen — booking confirmation emails cannot be implemented until decided | High | Client to decide before Stage 5 |
| DNS management responsibility unclear — deployment cannot complete without this resolved | High | Client to confirm before Stage 7 |
| No desired launch date — timeline planning is unconstrained but may become urgent | Medium | Client to supply at any point |
| Supabase project URL and anon key not supplied — `.env` cannot be finalized until provided | High | Client to supply before Stage 5 |
| Wordmark asset missing (only favicon.svg in `/public/`) — may affect header and OG image treatment | Medium | Design Agent to flag; client may need to supply |

---

## Estimated Effort per Stage

| Stage | Estimated Sessions |
|---|---|
| Strategy | 1 |
| SEO | 1 |
| Content | 1–2 |
| Design | 1 |
| Development (enhancement pass) | 1–2 (reduced vs. greenfield due to existing template) |
| QA | 1 |
| Deployment | 1 |
| **Total** | **7–9 sessions** |
