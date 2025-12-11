# Agent Guidelines for `leyline-next`

This file defines how coding agents should work in this repo.

## General Expectations

- Use **TypeScript** and the **Next.js App Router** for all new application code.
- Use **pnpm** for all node-related commands (no `npm`/`yarn`).
- Keep changes **focused and minimal**; do not refactor unrelated areas.
- Prefer **server components** by default; use client components only when needed.

## Project Conventions

- Styling:
  - Use **TailwindCSS** utility classes.
  - Follow the existing visual language (light theme, Roboto/Raleway, Leyline colors).
- Layout:
  - Public pages live in `app/(public)`.
  - Authenticated app pages live in `app/(app)`.
  - Admin pages live under `app/(app)/admin`.
- Routing:
  - Match URLs and UX described in `TRANSITION_PLAN.md`.
  - Keep route file names consistent with existing patterns.

## Tooling & Commands

- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev`
- Lint: `pnpm lint`
- Tests: `pnpm test`
- Production build: `pnpm build`

Before finishing any substantial change:

- Run `pnpm lint` and fix issues in the touched files.
- Run `pnpm test` and ensure tests pass.
- For changes that affect routing or types, prefer also running `pnpm build`.

## Code Style

- Maintain strict TypeScript types; avoid `any` unless absolutely necessary.
- Use descriptive names; avoid single-letter variables except for very short scopes.
- Keep components small and focused; extract helpers when a file grows too large.
- Do not add inline comments unless they clarify non-obvious behavior.

## Security & Secrets

- Never hard-code secrets or private keys.
- All secrets should flow through environment variables and, in production, Vercel project settings.
- Be careful when handling anything related to **Auth0**, **Stripe**, or user PII; follow `SECURITY.md`.

## Task Tracking

- Keep `TODO.md` in sync with the current state of the project.
  - When you complete a task listed there, update the corresponding checkbox.
  - When you add significant new work items, add them to `TODO.md` in the appropriate section.

## Git Workflow

- At the end of each self-contained update or feature change:
  - Ensure `pnpm lint`, `pnpm test`, and `pnpm build` have been run (when relevant).
  - Commit the changes with a concise, descriptive message.
  - Push the commit to the default remote branch so GitHub and Vercel stay in sync.

## Database Migrations

- Use **Prisma** for database schema management.
- The project uses Supabase with a connection pooler.
- For schema changes:
  - Modify `prisma/schema.prisma`.
  - Use `prisma migrate dev` to generate and apply migrations locally/in development.
  - **IMPORTANT:** Prisma migrations require a direct database connection (not the pooler).
  - You must set the correct env var to bypass the pooler when running migrations:
    ```bash
    export POSTGRES_PRISMA_URL="$POSTGRES_URL_NON_POOLING"
    npx prisma migrate dev --name <migration_name>
    ```
  - `prisma db push` can be used for rapid prototyping but `migrate dev` is preferred for tracking history.
  - If `prisma migrate dev` hangs, check that you are using the non-pooling URL.

## Testing Methodology

- **Browser Subagent Testing**:
  - We use a browser subagent to perform end-to-end tests locally before pushing changes.
  - This involves navigating through the actual UI flow (e.g., clicking links, buttons) to verify functionality.
  - **Handling Mock vs Real Data scenarios**:
    - When testing without a full database or auth session, the app may fall back to `MOCK_COMPANIES` or `MOCK_DETAILS`.
    - It is crucial to ensure that links and data fetching logic handle both UUIDs (from real DB) and mock IDs (string integers like '1', '2') correctly.
    - Specifically, verify that pages expecting dynamic `params` (like `[companyId]`) can gracefully fallback to mock data when database lookups fail or return null.
  - Always verify the browser subagent's success by checking the captured screenshots, not just the text logs.

- **User Injection for Development**:
  - To test authenticated actions (like adding companies, notes, documents) without a full Auth0 session in local development:
  - We inject a specific mock `auth0UserId` (e.g., from the seed data) in the server actions when `session.user` is missing AND `NODE_ENV` is 'development'.
  - This allows the browser subagent to perform full end-to-end writes to the local database.
  - **Important**: Ensure this logic is strictly guarded by checks for `process.env.NODE_ENV === 'development'` to prevent security risks in production.

## React 19 / Next.js Compatibility

- **Hook Migration**:
  - Use `useActionState` from `react` instead of `useFormState` from `react-dom`. The latter is deprecated/renamed in recent React/Next.js versions.
  - Ensure imports are updated to: `import { useActionState } from 'react';`.
  - `useFormStatus` should still be imported from `react-dom`.

## UI/UX & Components

- **SVG Charts**:
  - When using inline SVGs for charts (like in the dashboard), always include a `viewBox` attribute (e.g., `viewBox="0 0 width height"`). This ensures the SVG content scales correctly and prevents overflow issues across different resolutions.
- **Client-Side Filtering**:
  - For lists (e.g., companies) or dropdowns (e.g., company selection), prefer client-side filtering for better UX if the dataset is reasonably small.
  - Custom Combobox components can be created to replace standard `<select>` elements when search/filter functionality is needed.
