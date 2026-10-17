-- 0004_match_fn.sql
-- RPC used by app/api/feed/route.ts to rank active opportunities for a
-- seeker: a blend of embedding similarity (skills + goal vs. the
-- opportunity) and the recruiter's hire_proof_score.
--
-- SECURITY INVOKER (the default — no `security definer` here) on purpose:
-- it runs under the caller's RLS, same as a plain SELECT. That works
-- because both tables it reads already have policies open enough for any
-- authenticated user: opportunities_select_active (status = 'active') and
-- profiles_select_authenticated (anyone authenticated can select).
create or replace function public.match_opportunities(
  query_embedding vector,
  match_count int default 20
)
returns table (
  id uuid,
  recruiter_id uuid,
  title text,
  company text,
  type text,
  description text,
  required_skills text[],
  stipend_text text,
  seats int,
  deadline date,
  status text,
  created_at timestamptz,
  similarity float8,
  hire_proof_score int,
  match_score float8
)
language sql
stable
as $$
  select
    o.id,
    o.recruiter_id,
    o.title,
    o.company,
    o.type,
    o.description,
    o.required_skills,
    o.stipend_text,
    o.seats,
    o.deadline,
    o.status,
    o.created_at,
    1 - (o.embedding <=> query_embedding) as similarity,
    coalesce(p.hire_proof_score, 0) as hire_proof_score,
    -- 80% skill/goal similarity, 20% recruiter hire_proof_score (0-100,
    -- normalized to 0-1). Re-tune the 0.8/0.2 split as real usage data
    -- comes in.
    (1 - (o.embedding <=> query_embedding)) * 0.8
      + (coalesce(p.hire_proof_score, 0)::float8 / 100) * 0.2 as match_score
  from public.opportunities o
  left join public.profiles p on p.id = o.recruiter_id
  where o.status = 'active'
  order by match_score desc
  limit match_count;
$$;
