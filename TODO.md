# TODO: Leyline Next.js Transition

High-level implementation tasks derived from `TRANSITION_PLAN.md`.

## Infrastructure & Core

- [x] Wire up Prisma with PostgreSQL and define the core domain schema (users, memberships, subscriptions, education, companies, investments).
- [x] Configure Vercel Blob storage for media assets (course images/videos).
- [x] Add environment variable validation and configuration bootstrap (e.g., per-environment config module).

## Authentication & Authorization

- [ ] Integrate Auth0 using the official Next.js SDK.
- [ ] Implement login/logout, session handling, and route protection for `(app)` and `admin` areas.
- [ ] Map Auth0 roles and app_metadata to Leyline access types (Free, Basic, Pro, Sales, Owner, ContentAdmin, Admin, SuperAdmin, Master).
- [ ] Build an admin setup wizard (under `/admin/settings`) to guide initial Auth0 configuration.

## Billing (Stripe)

- [ ] Integrate Stripe for subscriptions (`leyline_basic`, `leyline_pro`).
- [ ] Implement subscription creation, plan changes, and cancellation flows.
- [ ] Handle Stripe webhooks to keep local membership state in sync.
- [ ] Expose membership info in `/account/subscriptions` and in the navbar badge.

## Education & Content

- [ ] Implement the education dashboard (`/education`) with course cards, progress, and access gating.
- [ ] Build course/program detail views with modules and lessons.
- [ ] Implement the course import pipeline for the legacy ZIP/XML format, including media upload to Blob storage.
- [ ] Create admin UIs for programs, courses, modules, lessons, and location mapping under `/admin/education/*`.

## Application UX

- [ ] Flesh out Dashboard (`/` and `/dashboard`) with investments, mock/real tables, and charts.
- [ ] Implement Companies and Portfolio flows, including modals and contextual education cards.
- [ ] Implement the full Profile and Account flows, including accreditation status and interests.
- [ ] Align all public pages (login, register, terms, privacy, welcome, landing) with the legacy UX.

## Testing & Quality

- [ ] Add unit and integration tests for critical server logic (auth, billing, import).
- [ ] Add basic component tests for key pages and layouts.
- [ ] Set up CI (GitHub Actions) to run `pnpm lint`, `pnpm test`, and `pnpm build` on pull requests.
