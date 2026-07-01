# Primax Group LLC — Pipeline Status

| Stage | Agent | Status | Date | Notes |
|-------|-------|--------|------|-------|
| 00 | Intake | ✅ Complete | 2026-06-30 | Brief written from interview + website scrape |
| PM | Project Manager | ✅ Complete | 2026-06-30 | project-plan.md and task-list.md written; 10 open client questions logged; all stages pending |
| 01 | Strategy | ⬜ Pending | — | Run `/run-strategy primax` |
| 02 | SEO | ⬜ Pending | — | Run `/run-seo primax` |
| 03 | Content | ⬜ Pending | — | Run `/run-content primax` |
| 04 | Design | ⬜ Pending | — | Run `/run-design primax` · **Approval gate before Dev** |
| 05 | Development | 🟡 In progress | 2026-06-30 | Backend migrated Supabase → Neon (Postgres) + Vercel serverless API + custom JWT admin auth. See `neon/schema.sql`, `api/*`, `src/lib/api.ts`. Remaining: run schema against real Neon DB, create admin user, full `vercel dev` verification. Run `/run-development primax` for the rest of the build. |
| 06 | QA | ⬜ Pending | — | Run `/run-qa primax` · **Release gate before Deploy** |
| 07 | Deployment | ⬜ Pending | — | Run `/deploy primax` · Set `DATABASE_URL` and `JWT_SECRET` in Vercel env vars (never `VITE_`-prefixed) |
