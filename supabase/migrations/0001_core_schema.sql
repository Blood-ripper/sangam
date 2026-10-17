-- 0001_core_schema.sql
-- Core schema for Sangam: profiles, opportunities, applications, ideas,
-- polls, Q&A, reviews, and hire confirmation events.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists vector;    -- pgvector, for the embedding columns
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- profiles
-- One row per auth user. Seeded by the on_auth_user_created trigger below.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  age int,
  gender text,
  university text,
  college text,
  course text,
  year int,
  skills text[],
  goal text,
  role text constraint profiles_role_check
    check (role in ('seeker', 'founder', 'recruiter', 'mentor', 'admin')),
  email_verified boolean not null default false,
  dpdp_consent boolean not null default false,
  hire_proof_score int not null default 0,
  verified_domain text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- opportunities
-- ---------------------------------------------------------------------------
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references public.profiles (id) on delete cascade,
  title text,
  company text,
  type text,
  description text,
  required_skills text[],
  stipend_text text,
  seats int,
  deadline date,
  embedding vector(384),
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities (id) on delete cascade,
  seeker_id uuid references public.profiles (id) on delete cascade,
  status text not null default 'applied',
  hire_confirmed boolean not null default false,
  confirmed_at timestamptz,
  applied_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ideas
-- ---------------------------------------------------------------------------
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid references public.profiles (id) on delete cascade,
  title text,
  problem text,
  target_users text,
  model text,
  idea_pulse int not null default 0,
  status text not null default 'draft',
  embedding vector(384),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- polls
-- ---------------------------------------------------------------------------
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas (id) on delete cascade,
  question text,
  yes_count int not null default 0,
  no_count int not null default 0
);

-- ---------------------------------------------------------------------------
-- poll_votes
-- ---------------------------------------------------------------------------
create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls (id) on delete cascade,
  voter_id uuid references public.profiles (id) on delete cascade,
  vote boolean,
  unique (poll_id, voter_id)
);

-- ---------------------------------------------------------------------------
-- qa_posts
-- opportunity_id / idea_id are intentionally plain uuid (no FK): a post may
-- point at either an opportunity or an idea, or neither.
-- ---------------------------------------------------------------------------
create table public.qa_posts (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid,
  idea_id uuid,
  author_id uuid references public.profiles (id) on delete cascade,
  body text,
  upvotes int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- qa_upvotes
-- ---------------------------------------------------------------------------
create table public.qa_upvotes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.qa_posts (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  unique (post_id, user_id)
);

-- ---------------------------------------------------------------------------
-- reviews
-- target_id is intentionally plain uuid (no FK): it points at whichever
-- entity target_type names (a recruiter/mentor profile, or a startup/idea).
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references public.profiles (id) on delete cascade,
  target_id uuid,
  target_type text constraint reviews_target_type_check
    check (target_type in ('recruiter', 'startup', 'mentor')),
  rating int constraint reviews_rating_check
    check (rating between 1 and 5),
  body text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- hire_events
-- ---------------------------------------------------------------------------
create table public.hire_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications (id) on delete cascade,
  claimed_at timestamptz,
  confirmed_at timestamptz,
  stipend_paid boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Indexes: created_at, on every table that has the column.
-- applications (applied_at), polls, poll_votes, qa_upvotes, and hire_events
-- have no created_at column, so none is added for them.
-- ---------------------------------------------------------------------------
create index idx_profiles_created_at on public.profiles (created_at);
create index idx_opportunities_created_at on public.opportunities (created_at);
create index idx_ideas_created_at on public.ideas (created_at);
create index idx_qa_posts_created_at on public.qa_posts (created_at);
create index idx_reviews_created_at on public.reviews (created_at);

-- ---------------------------------------------------------------------------
-- Indexes: ivfflat on the embedding columns (cosine distance, matching
-- normalized sentence-embedding output such as @xenova/transformers models).
-- `lists` is a reasonable starting value for a small/medium table; re-tune
-- (and REINDEX) once real row counts are known — rule of thumb is
-- rows / 1000 for lists on larger tables.
-- ---------------------------------------------------------------------------
create index idx_opportunities_embedding on public.opportunities
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_ideas_embedding on public.ideas
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------------------
-- Trigger: stub a profiles row whenever a new auth user is created.
-- security definer + a pinned search_path, per Supabase's recommended
-- pattern, so the function can insert into public.profiles regardless of
-- the caller's privileges and can't be hijacked via search_path tricks.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security: enabled on every table, with no policies yet.
-- This is default-deny for the anon/authenticated roles (service_role still
-- bypasses RLS). Access policies belong in a follow-up migration once the
-- app's read/write rules per role are defined.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.ideas enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.qa_posts enable row level security;
alter table public.qa_upvotes enable row level security;
alter table public.reviews enable row level security;
alter table public.hire_events enable row level security;
