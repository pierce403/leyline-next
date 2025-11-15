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

