# BUILD_PLAN.md — MIICCOF Digital Platform

Work top to bottom. Check off `[x]` as items complete and commit after each checked group.

## Phase 0 — Scaffolding (do first, one session)

- [x] Initialize Next.js 15 (App Router, TypeScript, Tailwind) in the repo
- [x] Add shadcn/ui, set up base theme tokens matching the Figma reference colors
- [x] Set up Prisma with MySQL provider, `.env.example` with `DATABASE_URL` placeholder
- [x] Define initial Prisma schema: User (with role enum), Session, VerificationToken
- [x] Set up Better Auth with email/password + email verification flow (stub SMTP for now)
- [x] Set up folder structure: `/app/(public)`, `/app/(dashboard)/[role]`, `/app/admin`,
      `/lib`, `/components`, `/prisma`
- [x] Basic CI: lint + type-check on push (GitHub Actions)
- [x] Initial commit + push

## Phase 1 — Public Site + Registration

### Public pages (CMS-backed, not hardcoded)
- [x] Content model: generic `Page` + `Section` tables so admin can edit page content
- [x] Home (hero, leadership cards, investment teaser, sponsorship teaser, events preview) —
      match Figma structure
- [x] About MIICTF
- [x] Investment Opportunities
- [x] Trade Fair
- [x] Conference Programme
- [x] Sponsors and Partners
- [x] News & Updates (list/detail — reads from News module once it exists in Phase 2)
- [x] FAQ
- [x] Contact (with working contact form → email via Hostinger SMTP)

### Registration & auth
- [x] Register page: Full Name, Email, Phone, Organization, Country, Category, Password
- [x] Email verification flow (send + confirm)
- [x] Login page
- [x] Role-based redirect after login (delegate/sponsor/exhibitor/admin land on
      different dashboards, even if those dashboards are minimal stubs for now)
- [x] Password hashing confirmed end-to-end, session management working

**Milestone check:** public site browsable, a user can register, verify email, log in,
and land on a role-appropriate (even if bare) dashboard.

## Phase 2 — Admin Portal, Modules, Reports

### Admin core
- [x] Admin layout + navigation (Dashboard, User Mgmt, Delegate, Sponsor, Exhibitor,
      Booth, News, Reports, Settings, System Logs)
- [x] Dashboard: summary cards + charts (totals, pending/approved registrations,
      latest registrations, recent announcements)
- [x] User Management: list/search/edit/deactivate users, assign roles
- [x] System Logs: audit log of admin actions (who did what, when)

### Delegate module
- [x] Admin: approve/reject/edit/search/export delegates
- [ ] Delegate dashboard: view/edit own profile (permitted fields only), announcements

### Sponsor module
- [ ] Sponsor profile fields: category, company info, brand assets, status, contacts,
      website link
- [x] Admin list/search/approve/reject/export sponsors (basic, using existing User fields)
- [ ] Sponsor-facing dashboard shows own info only

### Exhibitor + Booth modules
- [ ] Exhibitor profile: company, industry, products, contact, registration status
- [x] Admin list/search/approve/reject/export exhibitors (basic, using existing User fields)
- [x] Booth data model: Hall → Booth (number, size, category, status)
- [x] Admin: create halls
- [x] Admin: create booths and assign exhibitor ↔ booth
- [ ] Exhibitor dashboard: view own allocated booth
- [x] (Design only, no UI yet) confirm schema supports a future visual booth map

### News module
- [x] Admin CRUD, scheduled publishing, cover image upload, categories
- [x] Public News & Updates page reflects published articles automatically

### Reports
- [x] Delegates, Sponsors, Exhibitors, Countries Represented,
      Registration Statistics
- [x] Export to CSV
- [ ] Export to PDF and Excel
- [ ] Booth Allocation report (requires Booth module)

### Settings module
- [x] Admin Settings page for editable site configuration

### Security hardening pass
- [x] Confirm CSRF protection on all state-changing routes (Better Auth cookie + SameSite)
- [x] Confirm input validation (server-side, not just client) on every form
- [x] Confirm RBAC checks on every API route/server action, not just UI hiding
- [x] Review session expiry/config (7-day sessions, 1-day refresh, secure cookies)
- [ ] HTTPS confirmed in Hostinger deployment config

## Phase 3 — Deployment & Handover

- [x] Production build tested locally
- [x] Deploy to Hostinger Business Node.js hosting, connect domain + SSL (`meruinvest.co.ke`)
- [ ] Set production env vars (DB, SMTP, auth secrets) on Hostinger
- [ ] Smoke test all five roles end-to-end in production
- [ ] Write a short admin user guide (how to edit pages, approve delegates, allocate
      booths, publish news, run reports)

## Future-proofing notes (don't build now, but don't design against these)

- Multiple events (e.g. a future "Meru Women Business Summit") reusing this platform
- Payment integration for sponsors/exhibitors to pay directly through the site
- Visual booth map on top of the existing booth data model
