-- 0006_hire_proof.sql
-- Hire-Proof scoring: recalc_hire_proof(recruiter) recomputes a recruiter's
-- profiles.hire_proof_score from their track record, and mark_unproven()
-- flags stale, hire-less opportunities.

-- ---------------------------------------------------------------------------
-- recalc_hire_proof(recruiter uuid) returns int
--
-- Weighted components (all in [0,1] before weighting):
--   35% confirmed hires / hires claimed        (hire_events.confirmed_at /
--                                                hire_events.claimed_at)
--   20% applications replied (status <> 'applied') / total applications
--   15% stipend_paid ratio across hire_events
--   15% average verified review rating, Bayesian-smoothed (prior 3.0,
--       weight 5), scaled from a 1-5 rating into 0-1 via (avg-1)/4
--   10% verified_domain is not null
--    5% posted an opportunity in the last 30 days
--
-- security definer (owned by the migration role, which bypasses RLS) so it
-- can write profiles.hire_proof_score regardless of who calls it — the
-- intended caller is the seeker confirming a hire via /api/hire/confirm,
-- who is not the recruiter and has no RLS write access to that row.
-- ---------------------------------------------------------------------------
create or replace function public.recalc_hire_proof(recruiter uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  hires_claimed int;
  hires_confirmed int;
  total_applications int;
  replied_applications int;
  total_hire_events int;
  stipend_paid_events int;
  reviews_n int;
  reviews_sum numeric;
  bayesian_avg numeric;
  has_verified_domain boolean;
  posted_recently boolean;
  ratio_hires numeric;
  ratio_replied numeric;
  ratio_stipend numeric;
  ratio_reviews numeric;
  ratio_domain numeric;
  ratio_recency numeric;
  score int;
begin
  select
    count(*) filter (where he.claimed_at is not null),
    count(*) filter (where he.confirmed_at is not null),
    count(*) filter (where he.stipend_paid)
  into hires_claimed, hires_confirmed, stipend_paid_events
  from public.hire_events he
  join public.applications a on a.id = he.application_id
  join public.opportunities o on o.id = a.opportunity_id
  where o.recruiter_id = recruiter;

  select count(*)
  into total_hire_events
  from public.hire_events he
  join public.applications a on a.id = he.application_id
  join public.opportunities o on o.id = a.opportunity_id
  where o.recruiter_id = recruiter;

  select
    count(*),
    count(*) filter (where a.status <> 'applied')
  into total_applications, replied_applications
  from public.applications a
  join public.opportunities o on o.id = a.opportunity_id
  where o.recruiter_id = recruiter;

  select count(*), coalesce(sum(r.rating), 0)
  into reviews_n, reviews_sum
  from public.reviews r
  where r.target_id = recruiter
    and r.target_type = 'recruiter'
    and r.verified;

  select verified_domain is not null
  into has_verified_domain
  from public.profiles
  where id = recruiter;

  select exists (
    select 1 from public.opportunities
    where recruiter_id = recruiter
      and created_at >= now() - interval '30 days'
  ) into posted_recently;

  ratio_hires := case when hires_claimed = 0 then 0
    else hires_confirmed::numeric / hires_claimed end;

  ratio_replied := case when total_applications = 0 then 0
    else replied_applications::numeric / total_applications end;

  ratio_stipend := case when total_hire_events = 0 then 0
    else stipend_paid_events::numeric / total_hire_events end;

  -- Bayesian mean with a neutral prior of 3.0 at weight 5, then rescaled
  -- from the 1-5 rating range into 0-1.
  bayesian_avg := (reviews_sum + 3.0 * 5) / (reviews_n + 5);
  ratio_reviews := greatest(0, least(1, (bayesian_avg - 1) / 4));

  ratio_domain := case when coalesce(has_verified_domain, false) then 1 else 0 end;
  ratio_recency := case when posted_recently then 1 else 0 end;

  score := round((
    0.35 * ratio_hires +
    0.20 * ratio_replied +
    0.15 * ratio_stipend +
    0.15 * ratio_reviews +
    0.10 * ratio_domain +
    0.05 * ratio_recency
  ) * 100);

  score := greatest(0, least(100, score));

  update public.profiles
  set hire_proof_score = score
  where id = recruiter;

  return score;
end;
$$;

revoke all on function public.recalc_hire_proof(uuid) from public;
grant execute on function public.recalc_hire_proof(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- mark_unproven()
-- Flips opportunities to status 'unproven' once they're older than 60 days
-- and no linked application has ever been confirmed hired.
-- ---------------------------------------------------------------------------
create or replace function public.mark_unproven()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.opportunities o
  set status = 'unproven'
  where o.created_at < now() - interval '60 days'
    and o.status <> 'unproven'
    and not exists (
      select 1
      from public.applications a
      where a.opportunity_id = o.id
        and a.hire_confirmed
    );
end;
$$;

revoke all on function public.mark_unproven() from public;
grant execute on function public.mark_unproven() to service_role;
