# Sangam

**Where talent, ideas and opportunities meet. Proof, not promises.**

## The problem

Built for **PS 2, HackShift 2026**. Campus hiring runs on unverifiable claims: recruiters post listings with no track record of actually hiring anyone, founders pitch ideas with no evidence anyone wants them, and job seekers have no way to tell a real opportunity from a scam before they apply. Sangam replaces those claims with a record every party can check.

## Features

- **Hire-Proof Score** — a recruiter's score is built from confirmed hires, not listings posted.
- **Idea Pulse** — founders validate ideas against real campus polls before they build.
- **Skill-Gap Coach** — shows exactly which skills stand between a seeker's profile and a given opportunity.
- **Verified Reviews** — ratings tied to a real, verified interaction on the platform, not anonymous input.
- **AI feed** — opportunities ranked by embedding similarity to a seeker's skills and goal, blended with recruiter Hire-Proof Score.
- **Q&A** — per-opportunity and per-idea question threads.
- **Live polls** — "would you use it" / "would you pay for it" validation on every idea.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) — Postgres + pgvector + Row-Level Security + Realtime
- [Gemini Flash-Lite](https://ai.google.dev) for match reasons and AI features
- [MiniLM](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) sentence embeddings (via `@xenova/transformers`, server-side)
- [Vercel](https://vercel.com) for hosting

## Live demo

**[sangam-six-pearl.vercel.app](https://sangam-six-pearl.vercel.app)**

## Local setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd sangam

# 2. Install dependencies
npm install

# 3. Create .env.local with the following keys (ask a team member for values):
#      NEXT_PUBLIC_SUPABASE_URL
#      NEXT_PUBLIC_SUPABASE_ANON_KEY
#      SUPABASE_SERVICE_ROLE_KEY
#      GEMINI_API_KEY
#      NEXT_PUBLIC_CF_TURNSTILE_SITEKEY
#      CF_TURNSTILE_SECRET
#      NEXT_PUBLIC_APP_URL

# 4. Link the Supabase project
npx supabase link

# 5. Push migrations to your linked project
npx supabase db push

# 6. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Team

- **Shivam Pandey** — Lead
- Ritwik
- Muskan
- Shivangi
- Sumeksha
