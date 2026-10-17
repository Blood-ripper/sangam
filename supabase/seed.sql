-- supabase/seed.sql
-- Demo data with explicit roles for the live walkthrough (see DEMO.md).
-- Re-runnable: every row has a fixed UUID and every insert is an upsert
-- (ON CONFLICT ... DO UPDATE / DO NOTHING), so running this twice updates
-- rows in place instead of duplicating them.
--
-- profiles.id must equal a real auth.users.id (FK), so this does NOT
-- hardcode user ids. It looks each one up by email, exactly as asked:
--   select id from auth.users where email = '...'
-- That means all 6 people below must have signed in at least once
-- (Google OAuth, email OTP, or the password test path) before this will
-- run — the DO block raises a clear error naming any that haven't.
--
-- Demo roles:
--   hackerxlover@gmail.com         seeker  "Shivam Pandey" — skills
--                                   {React, JavaScript}, missing TypeScript
--                                   for Pixel Labs' Frontend Intern
--   gcollab749@gmail.com           recruiter — owns the Pixel Labs
--                                   openings. This is a real person's own
--                                   account (whoever is running this demo
--                                   signed in as this address), so only
--                                   role/verified_domain/hire_proof_score
--                                   are set below — never name/skills/goal.
--   ritwikarora90@gmail.com        founder — owns the Campus Tiffin idea
--   muskansolanki697@gmail.com     mentor  "Muskan Solanki" — skills
--                                   {UI/UX, Figma}
--   shivangitripathee07@gmail.com  mentor
--   sumikshagoyal07@gmail.com      seeker — skills {React, TypeScript},
--                                   a full match for Frontend Intern
--
-- UUID scheme (so ids are easy to recognize while reading this file):
--   1xxxxxxx-... opportunities   4xxxxxxx-... qa_posts
--   2xxxxxxx-... ideas           5xxxxxxx-... reviews
--   3xxxxxxx-... polls           6xxxxxxx-... applications
--
-- No hire_events are seeded, and every application below is 'applied'.
-- That's deliberate: DEMO.md's "mark hired -> confirm hire -> Hire-Proof
-- updates" step is the live app creating that hire_event from scratch
-- (PATCH /api/applications to 'hired', then POST /api/hire/confirm) and
-- recalc_hire_proof() recomputing the score in front of whoever's
-- watching. Pre-seeding a confirmed hire for Pixel Labs would make that
-- score already high before the demo even starts.
--
-- idea_pulse convention used here (not a DB rule — there's no trigger or
-- generated column for it): round(average "yes" % across the idea's two
-- polls). Campus Tiffin: (80% + 56%) / 2 = 68.
--
-- Known limitation: re-running this file does NOT reset a Hire-Proof
-- score that a previous live demo already changed (recalc_hire_proof
-- recomputes from ALL historical hire_events, including ones the demo
-- itself created last time). To demo from a clean score again, delete
-- the application + hire_event the previous run created (they won't have
-- one of the fixed UUIDs below), or `supabase db reset` before reseeding.

do $$
declare
  v_shivam   uuid; -- hackerxlover@gmail.com         seeker "Shivam Pandey"
  v_self     uuid; -- gcollab749@gmail.com           recruiter, Pixel Labs
  v_ritwik   uuid; -- ritwikarora90@gmail.com        founder, Campus Tiffin
  v_muskan   uuid; -- muskansolanki697@gmail.com     mentor "Muskan Solanki"
  v_shivangi uuid; -- shivangitripathee07@gmail.com  mentor
  v_sumiksha uuid; -- sumikshagoyal07@gmail.com      seeker, full skill match
  v_missing  text;
begin
  select id into v_shivam   from auth.users where email = 'hackerxlover@gmail.com';
  select id into v_self     from auth.users where email = 'gcollab749@gmail.com';
  select id into v_ritwik   from auth.users where email = 'ritwikarora90@gmail.com';
  select id into v_muskan   from auth.users where email = 'muskansolanki697@gmail.com';
  select id into v_shivangi from auth.users where email = 'shivangitripathee07@gmail.com';
  select id into v_sumiksha from auth.users where email = 'sumikshagoyal07@gmail.com';

  select string_agg(email, ', ') into v_missing
  from (values
    ('hackerxlover@gmail.com', v_shivam),
    ('gcollab749@gmail.com', v_self),
    ('ritwikarora90@gmail.com', v_ritwik),
    ('muskansolanki697@gmail.com', v_muskan),
    ('shivangitripathee07@gmail.com', v_shivangi),
    ('sumikshagoyal07@gmail.com', v_sumiksha)
  ) as t(email, id)
  where t.id is null;

  if v_missing is not null then
    raise exception
      'seed.sql: no auth.users row for: %. Each person must sign in to the app at least once before this seed can run.',
      v_missing;
  end if;

  -- ---------------------------------------------------------------------
  -- profiles — the four fully-fabricated demo personas
  -- ---------------------------------------------------------------------
  insert into public.profiles
    (id, name, role, skills, goal, hire_proof_score, verified_domain, email_verified, dpdp_consent)
  values
    (v_shivam,   'Shivam Pandey',    'seeker', array['React', 'JavaScript'],
     'Looking for a frontend internship', 0, null, true, true),
    (v_ritwik,   'Ritwik Arora',     'founder', null, null, 0, null, true, true),
    (v_muskan,   'Muskan Solanki',   'mentor', array['UI/UX', 'Figma'], null, 0, null, true, true),
    (v_shivangi, 'Shivangi Tripathi','mentor', null, null, 0, null, true, true),
    (v_sumiksha, 'Sumiksha Goyal',   'seeker', array['React', 'TypeScript'],
     'Looking for a frontend or full-stack internship', 0, null, true, true)
  on conflict (id) do update set
    name             = excluded.name,
    role             = excluded.role,
    skills           = excluded.skills,
    goal             = excluded.goal,
    hire_proof_score = excluded.hire_proof_score,
    verified_domain  = excluded.verified_domain,
    email_verified   = excluded.email_verified,
    dpdp_consent     = excluded.dpdp_consent;

  -- gcollab749@gmail.com is a real person's own account, not a fabricated
  -- test persona. Only the fields this demo actually needs are set, and
  -- name/skills/goal are deliberately left out of both the insert columns
  -- and the update set — if they've already onboarded for real, that
  -- stays untouched. hire_proof_score starts low on purpose; it's recomputed
  -- live by recalc_hire_proof() during the demo's confirm-hire step.
  insert into public.profiles (id, role, verified_domain, email_verified, dpdp_consent)
  values (v_self, 'recruiter', 'pixellabs.io', true, true)
  on conflict (id) do update set
    role             = excluded.role,
    verified_domain  = excluded.verified_domain;

  -- ---------------------------------------------------------------------
  -- opportunities (6) — Pixel Labs now belongs to v_self; the Campus
  -- Tiffin co-founder call now belongs to v_ritwik, its founder. BuildFast
  -- and GreenTech keep their original owners (v_ritwik, v_muskan), even
  -- though those two are no longer 'recruiter' profiles — opportunities
  -- aren't part of this demo's path, and the FK doesn't care about the
  -- owner's role label.
  -- ---------------------------------------------------------------------
  insert into public.opportunities
    (id, recruiter_id, title, company, type, description, required_skills, stipend_text, seats, deadline, status)
  values
    ('10000000-0000-0000-0000-000000000001', v_self,
     'Frontend Intern', 'Pixel Labs', 'Remote',
     'Build and ship UI for our design-to-code platform. Fully remote, flexible hours.',
     array['React', 'TypeScript'], 'Rs 15,000/month', 3,
     (current_date + interval '30 days')::date, 'active'),

    ('10000000-0000-0000-0000-000000000002', v_ritwik,
     'Backend Intern', 'BuildFast', 'Internship',
     'Work on our Node/Postgres API and internal tooling.',
     array['Node', 'SQL'], 'Rs 12,000/month', 2,
     (current_date + interval '25 days')::date, 'active'),

    ('10000000-0000-0000-0000-000000000003', v_muskan,
     'ML Intern', 'GreenTech', 'Internship',
     'Train and evaluate models for crop-yield prediction.',
     array['Python', 'ML'], 'Rs 18,000/month', 2,
     (current_date + interval '20 days')::date, 'active'),

    ('10000000-0000-0000-0000-000000000004', v_ritwik,
     'Full-Stack Developer', 'BuildFast', 'Job',
     'Own features end-to-end across our React/Node stack.',
     array['React', 'Node', 'SQL'], '₹8 LPA', 1,
     (current_date + interval '45 days')::date, 'active'),

    ('10000000-0000-0000-0000-000000000005', v_self,
     'Campus Innovate Hackathon', 'Pixel Labs', 'Hackathon',
     'Build a product in 36 hours. Mentors from Pixel Labs on-site.',
     array['React', 'UI/UX'], '₹50,000 prize pool', 50,
     (current_date + interval '10 days')::date, 'active'),

    ('10000000-0000-0000-0000-000000000006', v_ritwik,
     'Technical Co-founder — Campus Tiffin', 'Campus Tiffin', 'Co-founder',
     'Looking for a technical co-founder to build our ordering platform.',
     array['React', 'Node'], 'Equity-based', 1,
     (current_date + interval '60 days')::date, 'active')
  on conflict (id) do update set
    recruiter_id     = excluded.recruiter_id,
    title             = excluded.title,
    company           = excluded.company,
    type              = excluded.type,
    description       = excluded.description,
    required_skills   = excluded.required_skills,
    stipend_text      = excluded.stipend_text,
    seats             = excluded.seats,
    deadline          = excluded.deadline,
    status            = excluded.status;

  -- ---------------------------------------------------------------------
  -- ideas (3) — Campus Tiffin's founder is now v_ritwik. EV Charging
  -- Locator and Peer Tutoring keep their original founders (v_shivangi,
  -- v_sumiksha); neither is part of this demo's path.
  -- ---------------------------------------------------------------------
  insert into public.ideas
    (id, founder_id, title, problem, target_users, model, idea_pulse, status)
  values
    ('20000000-0000-0000-0000-000000000001', v_ritwik,
     'Campus Tiffin',
     'Students want home-style meals without the hassle of cooking or long mess queues.',
     'College students in hostels and PGs',
     'Subscription tiffin service with campus pickup points', 68, 'validating'),

    ('20000000-0000-0000-0000-000000000002', v_shivangi,
     'EV Charging Locator',
     'Finding a working, available EV charger nearby is unreliable.',
     'EV owners in tier-1 Indian cities',
     'Freemium app with a paid real-time availability tier', 45, 'validating'),

    ('20000000-0000-0000-0000-000000000003', v_sumiksha,
     'Peer Tutoring',
     'Students struggle to find affordable, trustworthy peer tutors for specific courses.',
     'University students',
     'Marketplace connecting senior students with juniors, small platform fee', 52, 'draft')
  on conflict (id) do update set
    founder_id   = excluded.founder_id,
    title        = excluded.title,
    problem      = excluded.problem,
    target_users = excluded.target_users,
    model        = excluded.model,
    idea_pulse   = excluded.idea_pulse,
    status       = excluded.status;

  -- ---------------------------------------------------------------------
  -- polls (2 per idea = 6) — unaffected by the role changes above.
  -- ---------------------------------------------------------------------
  insert into public.polls (id, idea_id, question, yes_count, no_count)
  values
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Would you use it?', 80, 20),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Would you pay Rs 499/month?', 56, 44),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Would you use it?', 60, 40),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Would you pay Rs 499/month?', 30, 70),
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'Would you use it?', 70, 30),
    ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'Would you pay Rs 499/month?', 34, 66)
  on conflict (id) do update set
    idea_id   = excluded.idea_id,
    question  = excluded.question,
    yes_count = excluded.yes_count,
    no_count  = excluded.no_count;

  -- ---------------------------------------------------------------------
  -- applications (6) — all Sumiksha (full skill match), all still
  -- 'applied', on every opening so each recruiter dashboard has at least
  -- one applicant to show. Shivam has NO seeded application here: the
  -- live demo creates his via the real apply flow (skill-gap -> "apply
  -- anyway"), starting from a clean slate.
  -- ---------------------------------------------------------------------
  insert into public.applications
    (id, opportunity_id, seeker_id, status, hire_confirmed, confirmed_at, applied_at)
  values
    ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', v_sumiksha,
     'applied', false, null, now() - interval '10 days'),
    ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', v_sumiksha,
     'applied', false, null, now() - interval '6 days'),
    ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', v_sumiksha,
     'applied', false, null, now() - interval '4 days'),
    ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', v_sumiksha,
     'applied', false, null, now() - interval '1 day'),
    ('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', v_sumiksha,
     'applied', false, null, now() - interval '3 days'),
    ('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', v_sumiksha,
     'applied', false, null, now() - interval '1 day')
  on conflict (id) do update set
    opportunity_id  = excluded.opportunity_id,
    seeker_id       = excluded.seeker_id,
    status          = excluded.status,
    hire_confirmed  = excluded.hire_confirmed,
    confirmed_at    = excluded.confirmed_at,
    applied_at      = excluded.applied_at;

  -- ---------------------------------------------------------------------
  -- qa_posts (5 — opportunity_id/idea_id have no FK by design, see
  -- 0001_core_schema.sql, so either (or neither) may be set). Post #2's
  -- author moved from the old Pixel Labs recruiter persona to v_self,
  -- who owns Pixel Labs now.
  -- ---------------------------------------------------------------------
  insert into public.qa_posts (id, opportunity_id, idea_id, author_id, body, upvotes)
  values
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', null, v_sumiksha,
     'Is this role open to first-year students?', 3),
    ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', null, v_self,
     'Yes — we welcome first-years with strong React fundamentals.', 5),
    ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', null, v_shivangi,
     'Do you require prior ML research experience?', 1),
    ('40000000-0000-0000-0000-000000000004', null, '20000000-0000-0000-0000-000000000001', v_sumiksha,
     'Will this be available outside the main campus too?', 4),
    ('40000000-0000-0000-0000-000000000005', null, '20000000-0000-0000-0000-000000000002', v_muskan,
     'Which cities will you launch in first?', 2)
  on conflict (id) do update set
    opportunity_id = excluded.opportunity_id,
    idea_id        = excluded.idea_id,
    author_id      = excluded.author_id,
    body           = excluded.body,
    upvotes        = excluded.upvotes;

  -- ---------------------------------------------------------------------
  -- reviews (3 — one per target_type: recruiter, mentor, startup).
  -- #1's target moved to v_self (the actual Pixel Labs recruiter now).
  -- #2's reviewer moved to v_ritwik (the founder persona, pitching to a
  -- mentor makes more sense than one mentor reviewing another).
  -- ---------------------------------------------------------------------
  insert into public.reviews (id, reviewer_id, target_id, target_type, rating, body, verified)
  values
    ('50000000-0000-0000-0000-000000000001', v_sumiksha, v_self, 'recruiter', 5,
     'Smooth hiring process, quick feedback.', true),
    ('50000000-0000-0000-0000-000000000002', v_ritwik, v_muskan, 'mentor', 4,
     'Gave me great feedback on my pitch deck.', false),
    ('50000000-0000-0000-0000-000000000003', v_sumiksha, '20000000-0000-0000-0000-000000000001', 'startup', 5,
     'Would love to see this come to our campus!', false)
  on conflict (id) do update set
    reviewer_id = excluded.reviewer_id,
    target_id   = excluded.target_id,
    target_type = excluded.target_type,
    rating      = excluded.rating,
    body        = excluded.body,
    verified    = excluded.verified;

end $$;
