-- 0003_rls_fix.sql
-- opportunities_select_active (0002_rls.sql) only exposes status = 'active'
-- listings, even to their own owner. Add a second, additive SELECT policy
-- so the owning recruiter can always see their own listings regardless of
-- status (draft, paused, filled, etc). Postgres OR's multiple permissive
-- policies for the same command together, so this just widens access for
-- the owner without touching the existing public policy.
create policy opportunities_select_owner
  on public.opportunities
  for select
  to authenticated
  using (auth.uid() = recruiter_id);
