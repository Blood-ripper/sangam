# Sangam — demo script

## Before you start

1. Each account below must have signed in to the app at least once (`supabase/seed.sql` looks up `auth.users` by email and raises an error naming anyone who hasn't).
2. Run `supabase/seed.sql` against the linked project.
3. Have five browser profiles/tabs ready, or just sign out and back in between steps — the script below assumes the latter.

## Accounts

| Email | Role | Notes |
| --- | --- | --- |
| `hackerxlover@gmail.com` | Seeker — **Shivam Pandey** | Skills: React, JavaScript. Missing TypeScript for Pixel Labs' Frontend Intern — this is what triggers the Skill-Gap Coach. |
| `gcollab749@gmail.com` | Recruiter | Owns the Pixel Labs openings. **This is your own account**, not a fabricated persona — the seed only sets its role, verified domain, and starting Hire-Proof score. |
| `ritwikarora90@gmail.com` | Founder | Owns the Campus Tiffin idea. |
| `muskansolanki697@gmail.com` | Mentor — **Muskan Solanki** | Skills: UI/UX, Figma. |
| `shivangitripathee07@gmail.com` | Mentor | |
| `sumikshagoyal07@gmail.com` | Seeker — **Sumiksha Goyal** | Skills: React, TypeScript — a full match for Frontend Intern, already applied everywhere as background data. |

## Walkthrough

### 1. Seeker applies, hits the skill gap

1. Sign in as **`hackerxlover@gmail.com`** (Shivam Pandey) at `/auth`.
2. Go to **Feed**. Open the **Frontend Intern — Pixel Labs** card.
3. Click **Apply**. Shivam's skills (React, JavaScript) cover only half of what the listing asks for (React, TypeScript) — below the 70% readiness bar — so instead of applying, he's redirected to the skill-gap page for this opportunity.
4. On `/skill-gap/<id>`: point out the **missing skill** (TypeScript), the AI-generated **2-week free path**, and the **proof task**.
5. Click **Apply anyway** at the bottom. The application is created (status `applied`) despite the gap — Shivam decided to apply now and close the gap in parallel.

### 2. Recruiter marks the hire

1. Sign out, sign in as **`gcollab749@gmail.com`**.
2. Go to **Recruiter dashboard** (`/recruiter`).
3. Open the **Frontend Intern** opening. Its applicant table now has two rows: **Sumiksha Goyal** (seeded, full skill match) and **Shivam Pandey** (just applied).
4. On Shivam's row, change the status dropdown to **hired**.

### 3. Seeker confirms, Hire-Proof updates live

1. Sign out, sign back in as **`hackerxlover@gmail.com`**.
2. Go to **My Applications** (`/applications`). The Frontend Intern row shows a **Hired** badge and a **Confirm hire** button.
3. Click **Confirm hire**. This is the moment to call out: it flips the application and its hire event to confirmed, then recomputes the recruiter's Hire-Proof score from scratch (`recalc_hire_proof`) — the button's own label updates in place to **Verified hire** with the new score next to it.
4. Open the Pixel Labs opportunity page (or the feed) to show the **same new score** on the Hire-Proof ring there too — it's a real recompute, not a one-off number shown only on the button.

### 4. Founder validates an idea

1. Sign out, sign in as **`ritwikarora90@gmail.com`**.
2. Go to **Idea Lab** (`/idea-lab`) → open **Campus Tiffin** (Pulse 68, "Venture track unlocked" badge).
3. Cast a vote on either poll ("Would you use it?" / "Would you pay Rs 499/month?") — the yes/no split updates live for anyone else watching the same page, via Supabase Realtime.
4. Scroll to **AI critique** — Gemini-generated strengths, risks, and pivot hints for the idea, generated on the spot.

### 5. The scam block

1. Still on the recruiter dashboard (`/recruiter`, signed in as `gcollab749@gmail.com` or any signed-in account — posting isn't role-gated in the UI, only in who can see this page's real use), fill out **Post an opening** with something like:
   - **Title:** Data Entry — Work From Home
   - **Description:** "Pay a one-time Rs 2000 training/registration fee to get your starter kit, then begin immediately."
   - **Stipend:** Rs 60,000/month
2. Submit. Gemini's scam check flags the training-fee request and the unrealistic stipend, the listing is saved with `status = 'blocked'` instead of `active`, and the form surfaces it as **"Listing blocked: `<flags>`"** instead of adding it to the list.

## Resetting between runs

Re-running `seed.sql` is safe (every row upserts), but it does **not** undo what a previous live demo already did: step 3's "confirm hire" creates a real application + hire event with a real id, and `recalc_hire_proof` has already written a new score to `gcollab749`'s profile from it. Seeding again won't touch either of those (they don't have one of the seed's fixed ids), so the Hire-Proof score will already be elevated going into a second run-through.

To demo from a clean score again: delete the application Shivam's account created against Frontend Intern (and its matching `hire_events` row), or just `supabase db reset` before reseeding.
