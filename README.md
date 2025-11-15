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

As Auth0, Stripe, Supabase, and the database are wired up, the app will expect (at minimum) variables like:

- Auth0:
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`
  - `AUTH0_DOMAIN`
  - `AUTH0_SECRET`
  - `APP_BASE_URL`
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_BASIC_PRICE_ID`
  - `STRIPE_PRO_PRICE_ID`
- Supabase / Database:
  - `POSTGRES_URL_NON_POOLING` (primary Prisma connection string; Supabase non-pooling URL)
  - `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, etc. (created by Vercel’s Supabase integration)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for client-side Supabase usage)
  - `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_URL` (server-side only; never exposed to the client)
- Storage:
  - Vercel Blob:
    - `BLOB_READ_WRITE_TOKEN` (for server-side uploads)
    - `BLOB_READ_ONLY_TOKEN` (optional, for read-only contexts)

These will be documented more precisely as those integrations are implemented.

### Database Setup (Local)

Prisma is configured to use PostgreSQL via the `POSTGRES_PRISMA_URL` environment variable, matching Vercel’s Supabase defaults.

1. Create a local or remote PostgreSQL database (for example, `leyline`).
2. Copy `.env.example` to `.env` and set `POSTGRES_PRISMA_URL` accordingly, e.g.:

   ```bash
   POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/leyline?schema=public"
   ```

3. Run Prisma migrations once you are ready:

   ```bash
   pnpm prisma:migrate --name init
   ```

4. (Optional) Regenerate the Prisma client after schema changes:

   ```bash
   pnpm prisma:generate
   ```

## Transition Plan

For the full functional and UX specification of the legacy Leyline app and the target Next.js implementation, see `TRANSITION_PLAN.md`.
