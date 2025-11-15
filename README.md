# Leyline (Next.js / TypeScript)

This repo is the in-progress rebuild of the Leyline application using **Next.js (App Router)**, **TypeScript**, **TailwindCSS**, **Auth0**, **Stripe**, and a relational database, as described in `TRANSITION_PLAN.md`.

The current state includes:

- Next.js app router structure matching public, app, and admin areas.
- Global layouts and navigation (main navbar, admin sidebar).
- Stub pages for all key routes (Dashboard, Education, Companies, Portfolio, Profile, Account, Admin).

## Tech Stack

- Framework: Next.js 16 (App Router, React 19).
- Language: TypeScript.
- Styling: TailwindCSS v4, custom Leyline theme (Roboto + Raleway).
- Icons: Font Awesome.
- Package manager: pnpm.

Planned integrations (not yet fully implemented):

- Auth0 for authentication and roles.
- Stripe for subscription billing (Free / Basic / Pro).
- Prisma + PostgreSQL for data.
- Vercel Blob storage for course media.

## Getting Started (Local Development)

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Then open `http://localhost:3000` in your browser.

## Available Scripts

- `pnpm dev` – start the Next.js development server.
- `pnpm lint` – run ESLint checks.
- `pnpm test` – run Vitest tests.
- `pnpm build` – create a production build (also runs TypeScript checks).
- `pnpm start` – start the production server (after `pnpm build`).

## Deployment on Vercel

This project is structured to deploy directly on Vercel from the repo root:

- Vercel detects Next.js automatically.
- `vercel.json` pins `pnpm build` and `pnpm install` as the build/install commands.
- The production app will run the same build as `pnpm build` locally.

### Environment Variables (Planned)

As Auth0, Stripe, and the database are wired up, the app will expect (at minimum) variables like:

- Auth0:
  - `AUTH0_ISSUER_BASE_URL`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`
  - `AUTH0_BASE_URL`
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_BASIC_PRICE_ID`
  - `STRIPE_PRO_PRICE_ID`
- Database:
  - `DATABASE_URL`
- Storage:
  - Vercel Blob or other storage configuration (names TBD during implementation).

These will be documented more precisely as those integrations are implemented.

## Transition Plan

For the full functional and UX specification of the legacy Leyline app and the target Next.js implementation, see `TRANSITION_PLAN.md`.
