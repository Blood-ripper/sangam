-- 0002_rls.sql
-- Row-Level Security policies for the core schema (0001_core_schema.sql).
--
-- Note on "update only column X" rules: a Postgres RLS policy's USING/WITH
-- CHECK clauses can only restrict which ROWS a statement may touch, not
-- which COLUMNS within an allowed row it may change — seekers and
-- recruiters are both the same Postgres role (`authenticated`), so a plain
-- column-level GRANT can't tell them apart either. Where the brief asks for
-- column-specific permission (applications.status vs
-- applications.hire_confirmed/confirmed_at; hire_events.confirmed_at), the
-- row-level policy below is paired with a small BEFORE UPDATE trigger that
-- rejects the write if a column outside the actor's allowed set changed.
-- This is additional to "policies" in the literal sense, flagged here for
-- visibility.

-- ---------------------------------------------------------------------------
-- Enable RLS on every table (already enabled in 0001; repeated here per the
-- brief — ENABLE ROW LEVEL SECURITY is idempotent).
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

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using (true);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- opportunities
-- ---------------------------------------------------------------------------
create policy opportunities_select_active
  on public.opportunities
  for select
  to public
  using (status = 'active');

create policy opportunities_insert_owner
  on public.opportunities
  for insert
  to authenticated
  with check (auth.uid() = recruiter_id);

create policy opportunities_update_owner
  on public.opportunities
  for update
  to authenticated
  using (auth.uid() = recruiter_id)
  with check (auth.uid() = recruiter_id);

create policy opportunities_delete_owner
  on public.opportunities
  for delete
  to authenticated
  using (auth.uid() = recruiter_id);

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
create policy applications_select_seeker
  on public.applications
  for select
  to authenticated
  using (auth.uid() = seeker_id);

create policy applications_select_recruiter
  on public.applications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = applications.opportunity_id
        and o.recruiter_id = auth.uid()
    )
  );

create policy applications_insert_seeker
  on public.applications
  for insert
  to authenticated
  with check (auth.uid() = seeker_id);

create policy applications_update_recruiter_status
  on public.applications
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = applications.opportunity_id
        and o.recruiter_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.opportunities o
      where o.id = applications.opportunity_id
        and o.recruiter_id = auth.uid()
    )
  );

create policy applications_update_seeker_hire_confirm
  on public.applications
  for update
  to authenticated
  using (auth.uid() = seeker_id)
  with check (auth.uid() = seeker_id);

-- Column-level backstop for the two update policies above: a recruiter may
-- only change `status`; a seeker may only change `hire_confirmed` /
-- `confirmed_at`. (See note at the top of this file.)
create or replace function public.enforce_applications_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_recruiter boolean;
  is_seeker boolean;
begin
  is_seeker := auth.uid() = old.seeker_id;
  is_recruiter := auth.uid() = (
    select o.recruiter_id from public.opportunities o where o.id = old.opportunity_id
  );

  if is_recruiter and not is_seeker then
    if new.hire_confirmed is distinct from old.hire_confirmed
       or new.confirmed_at is distinct from old.confirmed_at
       or new.opportunity_id is distinct from old.opportunity_id
       or new.seeker_id is distinct from old.seeker_id
       or new.applied_at is distinct from old.applied_at
    then
      raise exception 'recruiters may only update the status column on applications';
    end if;
  elsif is_seeker and not is_recruiter then
    if new.status is distinct from old.status
       or new.opportunity_id is distinct from old.opportunity_id
       or new.seeker_id is distinct from old.seeker_id
       or new.applied_at is distinct from old.applied_at
    then
      raise exception 'seekers may only update hire_confirmed and confirmed_at on applications';
    end if;
  end if;

  return new;
end;
$$;

create trigger applications_enforce_update_scope
  before update on public.applications
  for each row execute function public.enforce_applications_update_scope();

-- ---------------------------------------------------------------------------
-- ideas
-- ---------------------------------------------------------------------------
create policy ideas_select_all
  on public.ideas
  for select
  to public
  using (true);

create policy ideas_insert_founder
  on public.ideas
  for insert
  to authenticated
  with check (auth.uid() = founder_id);

create policy ideas_update_founder
  on public.ideas
  for update
  to authenticated
  using (auth.uid() = founder_id)
  with check (auth.uid() = founder_id);

create policy ideas_delete_founder
  on public.ideas
  for delete
  to authenticated
  using (auth.uid() = founder_id);

-- ---------------------------------------------------------------------------
-- polls
-- ---------------------------------------------------------------------------
create policy polls_select_all
  on public.polls
  for select
  to public
  using (true);

create policy polls_insert_idea_founder
  on public.polls
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.ideas i
      where i.id = polls.idea_id
        and i.founder_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- poll_votes
-- (the unique(poll_id, voter_id) constraint from 0001 already prevents
-- double voting, so no extra RLS is needed for that)
-- ---------------------------------------------------------------------------
create policy poll_votes_select_authenticated
  on public.poll_votes
  for select
  to authenticated
  using (true);

create policy poll_votes_insert_own
  on public.poll_votes
  for insert
  to authenticated
  with check (auth.uid() = voter_id);

-- ---------------------------------------------------------------------------
-- qa_posts
-- ---------------------------------------------------------------------------
create policy qa_posts_select_all
  on public.qa_posts
  for select
  to public
  using (true);

create policy qa_posts_insert_author
  on public.qa_posts
  for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy qa_posts_update_author
  on public.qa_posts
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy qa_posts_delete_author
  on public.qa_posts
  for delete
  to authenticated
  using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- qa_upvotes
-- ---------------------------------------------------------------------------
create policy qa_upvotes_select_all
  on public.qa_upvotes
  for select
  to public
  using (true);

create policy qa_upvotes_insert_own
  on public.qa_upvotes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reviews
-- Insert is allowed only when the reviewer shares an applications row with
-- the target: either the reviewer was the seeker and target_id is the
-- recruiter who owns that opportunity, or the reviewer was that recruiter
-- and target_id is the seeker on their opportunity's application.
-- ---------------------------------------------------------------------------
create policy reviews_select_all
  on public.reviews
  for select
  to public
  using (true);

create policy reviews_insert_linked_application
  on public.reviews
  for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.applications a
      join public.opportunities o on o.id = a.opportunity_id
      where (a.seeker_id = auth.uid() and o.recruiter_id = reviews.target_id)
         or (o.recruiter_id = auth.uid() and a.seeker_id = reviews.target_id)
    )
  );

-- ---------------------------------------------------------------------------
-- hire_events
-- ---------------------------------------------------------------------------
create policy hire_events_select_participants
  on public.hire_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.opportunities o on o.id = a.opportunity_id
      where a.id = hire_events.application_id
        and (a.seeker_id = auth.uid() or o.recruiter_id = auth.uid())
    )
  );

create policy hire_events_insert_recruiter
  on public.hire_events
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.applications a
      join public.opportunities o on o.id = a.opportunity_id
      where a.id = hire_events.application_id
        and o.recruiter_id = auth.uid()
    )
  );

create policy hire_events_update_seeker_confirm
  on public.hire_events
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = hire_events.application_id
        and a.seeker_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.applications a
      where a.id = hire_events.application_id
        and a.seeker_id = auth.uid()
    )
  );

-- Column-level backstop: the seeker's update policy above only checks row
-- ownership, so without this a seeker could also set claimed_at /
-- stipend_paid on their own hire_event. Restrict their update to
-- confirmed_at only. (See note at the top of this file.)
create or replace function public.enforce_hire_events_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_seeker boolean;
begin
  is_seeker := auth.uid() = (
    select a.seeker_id from public.applications a where a.id = old.application_id
  );

  if is_seeker then
    if new.claimed_at is distinct from old.claimed_at
       or new.stipend_paid is distinct from old.stipend_paid
       or new.application_id is distinct from old.application_id
    then
      raise exception 'seekers may only update confirmed_at on hire_events';
    end if;
  end if;

  return new;
end;
$$;

create trigger hire_events_enforce_update_scope
  before update on public.hire_events
  for each row execute function public.enforce_hire_events_update_scope();
