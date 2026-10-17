-- 0005_polls_qa_rpc.sql
-- Idea Lab (polls + Q&A) needs to increment polls.yes_count/no_count and
-- qa_posts.upvotes on behalf of any authenticated voter/upvoter, but the
-- existing RLS policies (0002_rls.sql) only let the idea's founder update
-- `polls` and only a post's author update `qa_posts`. Rather than widen
-- those UPDATE policies to all authenticated users, follow this schema's
-- existing convention (handle_new_user, enforce_applications_update_scope,
-- enforce_hire_events_update_scope) of a narrow SECURITY DEFINER function
-- that checks auth.uid() itself and performs only the one write it's named
-- for.

-- ---------------------------------------------------------------------------
-- cast_poll_vote: records the caller's vote and bumps the matching counter,
-- atomically. Relies on poll_votes' unique(poll_id, voter_id) constraint to
-- reject a repeat vote — the route handler maps that unique_violation to a
-- 409.
-- ---------------------------------------------------------------------------
create or replace function public.cast_poll_vote(
  p_poll_id uuid,
  p_vote boolean
)
returns public.polls
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.polls;
begin
  insert into public.poll_votes (poll_id, voter_id, vote)
  values (p_poll_id, auth.uid(), p_vote);

  if p_vote then
    update public.polls
      set yes_count = yes_count + 1
      where id = p_poll_id
      returning * into result;
  else
    update public.polls
      set no_count = no_count + 1
      where id = p_poll_id
      returning * into result;
  end if;

  return result;
end;
$$;

grant execute on function public.cast_poll_vote(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- add_qa_upvote: records the caller's upvote and bumps qa_posts.upvotes,
-- atomically. Relies on qa_upvotes' unique(post_id, user_id) constraint to
-- reject a repeat upvote — the route handler maps that unique_violation to
-- a 409.
-- ---------------------------------------------------------------------------
create or replace function public.add_qa_upvote(
  p_post_id uuid
)
returns public.qa_posts
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.qa_posts;
begin
  insert into public.qa_upvotes (post_id, user_id)
  values (p_post_id, auth.uid());

  update public.qa_posts
    set upvotes = upvotes + 1
    where id = p_post_id
    returning * into result;

  return result;
end;
$$;

grant execute on function public.add_qa_upvote(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: poll-card.tsx and qa-section.tsx subscribe to postgres_changes
-- on these tables. Supabase only emits those events for tables added to the
-- supabase_realtime publication.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.polls;
alter publication supabase_realtime add table public.qa_posts;
