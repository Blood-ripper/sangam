# Sangam

Sangam is a verified network connecting job seekers, founders, startups, mentors, and recruiters.

## Tech stack

- **Framework:** Next.js 16 (App Router) — `next@16.4.2`
- **Language:** TypeScript 5
- **UI:** React 19 (`react@19.3.0`, `react-dom@19.3.0`)
- **Styling:** Tailwind CSS v4 (with `@tailwindcss/turbopack`, `tw-animate-css`)
- **Components:** shadcn/ui on Radix UI (`radix-ui`, `class-variance-authority`, `clsx`, `lucide-react`)
- **Database / auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Forms & validation:** `react-hook-form` + `zod`
- **ML / embeddings:** `@xenova/transformers`
- **Dates:** `date-fns`
- **Lint:** ESLint 9 (`eslint-config-next`)

## Commands

```bash
npm run dev     # start the dev server (next dev)
npm run build   # production build (next build)
npm run start   # serve the production build (next start)
npm run lint    # lint with ESLint
```

## Architecture

There is **no `src/` directory** — `app/`, `components/`, and `lib/` live at the repo root.

- **`app/`** — Next.js App Router: routes, layouts, pages, and server components.
- **`lib/supabase/`** — Supabase client factories (browser and server clients).
- **`lib/db/`** — typed database helpers; all data access goes through here.
- **`components/ui/`** — shadcn/ui components.
- **`lib/utils.ts`** — shared utilities (e.g. `cn`).

## Hard rules

- **Never commit `.env.local`** (or any secrets).
- **Always use Row-Level Security (RLS)** on Supabase tables — never rely on client-side checks alone.
- **The service role key is server-only.** Never import or reference it in client code; it must stay in Server Components, Route Handlers, or Server Actions.
- **No raw SQL in components.** Query through the typed helpers in `lib/db/`.

## Gotchas

- **Tailwind v4 config lives in CSS, not JS.** Configure via `@theme`/`@import` in `app/globals.css` — there is no `tailwind.config.js`.
- **`@xenova/transformers` runs server-side only.** Never import it into a Client Component or bundle it for the browser.
- **Supabase SSR needs the right client for the context:** use `createServerClient` (from `lib/supabase/`) in Server Components, Route Handlers, and Server Actions; use `createBrowserClient` in Client Components.
