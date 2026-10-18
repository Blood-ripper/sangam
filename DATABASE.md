# 🗄️ Database Architecture & Documentation — Sangam

Sangam is built on a **Supabase PostgreSQL** relational database, enhanced with the **`pgvector`** extension for vector embeddings, real-time synchronization, and automated backend processes[cite: 1]. 

This document outlines the schema design, tables, relationships, and security policies implemented for the platform.

---

## 🛠️ Core Database Technologies

* **Primary Database:** PostgreSQL (hosted via Supabase)[cite: 1]
* **AI & Search Layer:** `pgvector` extension for storing and querying MiniLM embeddings (used for semantic job matching and idea critiques)[cite: 1]
* **Real-time Sync:** Supabase Realtime for live polls, instant Q&A updates, and dynamic feed updates[cite: 1]
* **File & Media Storage:** Supabase Storage buckets for secure handling of candidate resumes and official offer proofs[cite: 1]
* **Security & Auth:** Supabase Auth (Google OAuth + Email OTP), Row-Level Security (RLS) policies, and JWT tokens conforming to DPDP consent guidelines[cite: 1]
* **Background Automation:** PostgreSQL `pg_cron` and Supabase Edge Functions for scheduled tasks (such as the 60-day hire verification checks for the Hire-Proof engine)[cite: 1]

---

## 📊 Database Schema & Tables

### 1. `profiles`
Stores user identity, role configurations, institutional verification details, and core attributes.
* `id` (UUID, Primary Key): Linked directly to Supabase Auth (`auth.users`).
* `full_name` (Text): The user's full name.
* `age` (Integer): User age.
* `gender` (Text): Optional gender specification.
* `university` & `college` (Text): Institutional affiliations.
* `course` & `year` (Text): Academic details (e.g., B.Tech CSE, 3rd Year).
* `skills` (Text Array): Array of technical and professional skills.
* `goal` (Text): User's primary objective on the platform.
* `verified_badge` (Boolean): Unlocked via a verified college or company email OTP.
* `role_lanes` (Text Array): Multi-role selections (Job seeker, Founder, Startup, Mentor, Recruiter).
* `created_at` (Timestamp): Account creation timestamp.

### 2. `opportunities`
Tracks all posted openings including jobs, internships, gigs, hackathons, co-founder calls, and government schemes.
* `id` (UUID, Primary Key): Unique identifier for the opportunity.
* `recruiter_id` (UUID, Foreign Key): References `profiles(id)` of the posting startup/recruiter.
* `role_title` (Text): Title of the position.
* `seats` (Integer): Number of openings available.
* `stipend` (Text): Compensation details.
* `deadline` (Timestamp): Application deadline.
* `requirements` (Text Array): Required skill set.
* `embedding` (Vector 384): MiniLM vector embedding used for AI match percentage calculations.
* `status` (Text): Current listing state (`active`, `blocked` via automated scam/fee-ask filters).
* `created_at` (Timestamp): Creation timestamp.

### 3. `applications`
Manages the end-to-end application lifecycle and hire verification loop.
* `id` (UUID, Primary Key): Unique application ID.
* `opportunity_id` (UUID, Foreign Key): References `opportunities(id)`.
* `candidate_id` (UUID, Foreign Key): References `profiles(id)`.
* `status` (Text): Current stage (`applied`, `shortlisted`, `offered`, `hired`, `unproven`).
* `resume_url` (Text): Path to the resume stored in Supabase Storage.
* `offer_proof_url` (Text): Path to official offer documentation.
* `candidate_confirmed_hire` (Boolean): Flag updated when the candidate confirms their hire (triggers the Hire-Proof score update).
* `created_at` (Timestamp): Application submission time.

### 4. `ideas` (Idea Lab)
Handles student startup ideas, AI-driven validation, and venture tracking.
* `id` (UUID, Primary Key): Unique idea identifier.
* `founder_id` (UUID, Foreign Key): References `profiles(id)`.
* `title` (Text): Startup or project title.
* `problem_statement` (Text): Description of the problem being solved.
* `target_users` (Text): Intended target audience.
* `business_model` (Text): Monetization strategy.
* `ai_lean_canvas_critique` (Text): AI-generated feedback highlighting gaps and risks.
* `idea_pulse_score` (Numeric): Community and AI-voted score (unlocks venture track if $\ge 60$).
* `venture_track_unlocked` (Boolean): True if the idea passes validation thresholds.
* `created_at` (Timestamp): Submission timestamp.

### 5. `polls`
Powers community validation loops (e.g., "Would you use it?", "Would you pay?", "Was the interview fair?").
* `id` (UUID, Primary Key): Unique poll ID.
* `reference_id` (UUID): Links to an `idea_id` or interview instance.
* `question_text` (Text): The prompt being voted on.
* `poll_type` (Text): Category of the poll.
* `yes_votes` & `no_votes` (Integer): Real-time vote counters tracked via Supabase Realtime.
* `total_votes` (Integer): Aggregate count.

### 6. `recruiter_stats` (Hire-Proof Engine)
Computes and updates recruiter credibility and transparency metrics.
* `recruiter_id` (UUID, Primary Key): References `profiles(id)`.
* `hire_proof_score` (Numeric): Dynamic score (0–100) calculated from candidate-confirmed hires, reply rates, paid stipends, verified reviews, and CIN/GSTIN checks[cite: 1].
* `verified_reviews_count` (Integer): Count of reviews from verified applicants/interns.
* `flags_count` (Integer): Number of flagged listings or policy violations.

---

## 🔒 Security & Row-Level Security (RLS)

* **Row-Level Security (RLS):** Enabled across all core tables (`profiles`, `opportunities`, `applications`, `ideas`) to prevent unauthorized data exposure.
* **Access Control Rules:**
  * Public users and guests can view active opportunities, public profiles, and vote in community polls.
  * Only verified users can apply for roles or post startup ideas.
  * Only candidates who have completed an application cycle can submit reviews or confirm hires to update the Recruiter Reality Check engine.