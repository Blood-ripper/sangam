-- supabase/seed.sql
-- Realistic sample data for local/demo use. Re-runnable: every row below
-- has a fixed UUID and every insert is an upsert (ON CONFLICT ... DO
-- UPDATE), so running this twice updates rows in place instead of
-- duplicating them.
--
-- profiles.id must equal a real auth.users.id (FK), so this does NOT
-- hardcode user ids. It looks each one up by email, exactly as asked:
--   select id from auth.users where email = '...'
-- That means all 6 people below must have signed in at least once
-- (Google OAuth, email OTP, or the password test path) before this will
-- run — the DO block raises a clear error naming any that haven't.
--
-- UUID scheme (so ids are easy to recognize while reading this file):
--   1xxxxxxx-... opportunities   4xxxxxxx-... qa_posts
--   2xxxxxxx-... ideas           5xxxxxxx-... reviews
--   3xxxxxxx-... polls           6xxxxxxx-... applications
--                                 7xxxxxxx-... hire_events
--
-- idea_pulse convention used here (not a DB rule — there's no trigger or
-- generated column for it): round(average "yes" % across the idea's two
-- polls). Campus Tiffin: (80% + 56%) / 2 = 68.

do $$
declare
  v_aditi    uuid; -- hackerxlover@gmail.com        recruiter @ Pixel Labs
  v_ritwik   uuid; -- ritwikarora90@gmail.com        recruiter @ BuildFast
  v_muskan   uuid; -- muskansolanki697@gmail.com     recruiter @ GreenTech
  v_shivangi uuid; -- shivangitripathee07@gmail.com  founder
  v_sumiksha uuid; -- sumikshagoyal07@gmail.com      seeker
  v_self     uuid; -- gcollab749@gmail.com           left alone, see below
  v_missing  text;
begin
  select id into v_aditi    from auth.users where email = 'hackerxlover@gmail.com';
  select id into v_ritwik   from auth.users where email = 'ritwikarora90@gmail.com';
  select id into v_muskan   from auth.users where email = 'muskansolanki697@gmail.com';
  select id into v_shivangi from auth.users where email = 'shivangitripathee07@gmail.com';
  select id into v_sumiksha from auth.users where email = 'sumikshagoyal07@gmail.com';
  select id into v_self     from auth.users where email = 'gcollab749@gmail.com';

  select string_agg(email, ', ') into v_missing
  from (values
    ('hackerxlover@gmail.com', v_aditi),
    ('ritwikarora90@gmail.com', v_ritwik),
    ('muskansolanki697@gmail.com', v_muskan),
    ('shivangitripathee07@gmail.com', v_shivangi),
    ('sumikshagoyal07@gmail.com', v_sumiksha),
    ('gcollab749@gmail.com', v_self)
  ) as t(email, id)
  where t.id is null;

  if v_missing is not null then
    raise exception
      'seed.sql: no auth.users row for: %. Each person must sign in to the app at least once before this seed can run.',
      v_missing;
  end if;

  -- ---------------------------------------------------------------------
  -- profiles
  -- ---------------------------------------------------------------------
  insert into public.profiles
    (id, name, role, hire_proof_score, verified_domain, email_verified, dpdp_consent)
  values
    (v_aditi,    'Aditi Rao',        'recruiter', 88, 'pixellabs.io',  true, true),
    (v_ritwik,   'Ritwik Arora',     'recruiter', 64, 'buildfast.dev', true, true),
    (v_muskan,   'Muskan Solanki',   'recruiter', 41, 'greentech.in',  true, true),
    (v_shivangi, 'Shivangi Tripathi','founder',    0, null,            true, true),
    (v_sumiksha, 'Sumiksha Goyal',   'seeker',     0, null,            true, true)
  on conflict (id) do update set
    name             = excluded.name,
    role             = excluded.role,
    hire_proof_score = excluded.hire_proof_score,
    verified_domain  = excluded.verified_domain,
    email_verified   = excluded.email_verified,
    dpdp_consent     = excluded.dpdp_consent;

  -- Seeker persona needs skills + a goal for the embedding-based feed to
  -- have something real to match against.
  update public.profiles
  set skills = array['React', 'TypeScript', 'Node'],
      goal = 'Looking for a frontend or full-stack internship'
  where id = v_sumiksha;

  -- gcollab749@gmail.com is a real person's own account, not a fabricated
  -- test persona — deliberately NOT upserted with made-up name/role/skills.
  -- This only ensures the row exists (same as the on_auth_user_created
  -- trigger would for a fresh signup) so later FK references resolve,
  -- without ever overwriting whatever they've set for themselves.
  insert into public.profiles (id)
  values (v_self)
  on conflict (id) do nothing;

  -- ---------------------------------------------------------------------
  -- opportunities (6)
  -- ---------------------------------------------------------------------
  insert into public.opportunities
    (id, recruiter_id, title, company, type, description, required_skills, stipend_text, seats, deadline, status)
  values
    ('10000000-0000-0000-0000-000000000001', v_aditi,
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

    ('10000000-0000-0000-0000-000000000005', v_aditi,
     'Campus Innovate Hackathon', 'Pixel Labs', 'Hackathon',
     'Build a product in 36 hours. Mentors from Pixel Labs on-site.',
     array['React', 'UI/UX'], '₹50,000 prize pool', 50,
     (current_date + interval '10 days')::date, 'active'),

    ('10000000-0000-0000-0000-000000000006', v_shivangi,
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
  -- ideas (3)
  -- ---------------------------------------------------------------------
  insert into public.ideas
    (id, founder_id, title, problem, target_users, model, idea_pulse, status)
  values
    ('20000000-0000-0000-0000-000000000001', v_shivangi,
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
  -- polls (2 per idea = 6)
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
  -- applications (6 — one per opportunity, so every opening has at least
  -- one applicant for the recruiter dashboard to show)
  -- ---------------------------------------------------------------------
  insert into public.applications
    (id, opportunity_id, seeker_id, status, hire_confirmed, confirmed_at, applied_at)
  values
    ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', v_sumiksha,
     'hired', true, now() - interval '2 days', now() - interval '10 days'),
    ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', v_shivangi,
     'reviewing', false, null, now() - interval '6 days'),
    ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', v_sumiksha,
     'hired', false, null, now() - interval '4 days'),
    ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', v_shivangi,
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
  -- hire_events (2 — one confirmed, one claimed but not yet confirmed),
  -- matching the two 'hired' applications above.
  -- ---------------------------------------------------------------------
  insert into public.hire_events (id, application_id, claimed_at, confirmed_at, stipend_paid)
  values
    ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
     now() - interval '3 days', now() - interval '2 days', true),
    ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003',
     now() - interval '1 day', null, false)
  on conflict (id) do update set
    application_id = excluded.application_id,
    claimed_at     = excluded.claimed_at,
    confirmed_at   = excluded.confirmed_at,
    stipend_paid   = excluded.stipend_paid;

  -- ---------------------------------------------------------------------
  -- qa_posts (5 — opportunity_id/idea_id have no FK by design, see
  -- 0001_core_schema.sql, so either (or neither) may be set)
  -- ---------------------------------------------------------------------
  insert into public.qa_posts (id, opportunity_id, idea_id, author_id, body, upvotes)
  values
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', null, v_sumiksha,
     'Is this role open to first-year students?', 3),
    ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', null, v_aditi,
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
  -- reviews (3 — one per target_type: recruiter, mentor, startup)
  -- ---------------------------------------------------------------------
  insert into public.reviews (id, reviewer_id, target_id, target_type, rating, body, verified)
  values
    ('50000000-0000-0000-0000-000000000001', v_sumiksha, v_aditi, 'recruiter', 5,
     'Smooth hiring process, quick feedback.', true),
    ('50000000-0000-0000-0000-000000000002', v_shivangi, v_muskan, 'mentor', 4,
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
