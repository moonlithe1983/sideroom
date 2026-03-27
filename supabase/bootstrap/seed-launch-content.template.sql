-- SideRoom Launch Content Seed
-- Generated automatically by scripts/build-launch-seed.js
-- This script expects the listed author accounts to already exist in public.users
-- and to have completed onboarding so their public handles are available.

begin;

create temporary table if not exists temp_launch_posts (
  seed_key text primary key,
  post_id uuid not null
) on commit drop;

do $$
begin
  if not exists (
    select 1
    from public.users
    where email = 'campus.rae@example.com'
  ) then
    raise exception 'Seed author "campus_rae" with email campus.rae@example.com is missing from public.users. Sign in with that account first.';
  end if;

  if not exists (
    select 1
    from public.user_profiles profile
    join public.users account on account.id = profile.user_id
    where account.email = 'campus.rae@example.com'
  ) then
    raise exception 'Seed author "campus_rae" has not completed onboarding yet.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.users
    where email = 'clearbound.jules@example.com'
  ) then
    raise exception 'Seed author "clearbound_jules" with email clearbound.jules@example.com is missing from public.users. Sign in with that account first.';
  end if;

  if not exists (
    select 1
    from public.user_profiles profile
    join public.users account on account.id = profile.user_id
    where account.email = 'clearbound.jules@example.com'
  ) then
    raise exception 'Seed author "clearbound_jules" has not completed onboarding yet.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.users
    where email = 'guide.ivy@example.com'
  ) then
    raise exception 'Seed author "guide_ivy" with email guide.ivy@example.com is missing from public.users. Sign in with that account first.';
  end if;

  if not exists (
    select 1
    from public.user_profiles profile
    join public.users account on account.id = profile.user_id
    where account.email = 'guide.ivy@example.com'
  ) then
    raise exception 'Seed author "guide_ivy" has not completed onboarding yet.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.users
    where email = 'late.noah@example.com'
  ) then
    raise exception 'Seed author "late_shift_noah" with email late.noah@example.com is missing from public.users. Sign in with that account first.';
  end if;

  if not exists (
    select 1
    from public.user_profiles profile
    join public.users account on account.id = profile.user_id
    where account.email = 'late.noah@example.com'
  ) then
    raise exception 'Seed author "late_shift_noah" has not completed onboarding yet.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.users
    where email = 'steady.mia@example.com'
  ) then
    raise exception 'Seed author "steady_mia" with email steady.mia@example.com is missing from public.users. Sign in with that account first.';
  end if;

  if not exists (
    select 1
    from public.user_profiles profile
    join public.users account on account.id = profile.user_id
    where account.email = 'steady.mia@example.com'
  ) then
    raise exception 'Seed author "steady_mia" has not completed onboarding yet.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'friends-family'
      and is_active = true
  ) then
    raise exception 'Topic "friends-family" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'life-decisions'
      and is_active = true
  ) then
    raise exception 'Topic "life-decisions" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'mental-load-stress'
      and is_active = true
  ) then
    raise exception 'Topic "mental-load-stress" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'money'
      and is_active = true
  ) then
    raise exception 'Topic "money" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'moving-city-life'
      and is_active = true
  ) then
    raise exception 'Topic "moving-city-life" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'relationships-dating'
      and is_active = true
  ) then
    raise exception 'Topic "relationships-dating" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'school-early-career'
      and is_active = true
  ) then
    raise exception 'Topic "school-early-career" is missing or inactive.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from public.topics
    where slug = 'work-career'
      and is_active = true
  ) then
    raise exception 'Topic "work-career" is missing or inactive.';
  end if;
end $$;

-- POST: work-career-quick-asks
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'steady.mia@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'work-career'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'My boss''s quick asks keep swallowing my whole day'
    and coalesce(body, '') = 'I like being helpful, but every ''can you do this really fast?'' turns into thirty minutes, then three hours, and then my own work slips. I don''t want to sound dramatic or difficult. I just need a way to stop volunteering my entire calendar one tiny favor at a time.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'My boss''s quick asks keep swallowing my whole day',
      'I like being helpful, but every ''can you do this really fast?'' turns into thirty minutes, then three hours, and then my own work slips. I don''t want to sound dramatic or difficult. I just need a way to stop volunteering my entire calendar one tiny favor at a time.',
      'advice_request',
      true,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('work-career-quick-asks', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'A kind boundary can still be a boundary. Try: ''I can get to that after I finish the deadline item I already own. Is that timing okay?''',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'work-career-quick-asks'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'A kind boundary can still be a boundary. Try: ''I can get to that after I finish the deadline item I already own. Is that timing okay?'''
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'If everything is urgent, nothing is. Start asking which task should move back when a new quick ask appears.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'work-career-quick-asks'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'If everything is urgent, nothing is. Start asking which task should move back when a new quick ask appears.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'work-career-quick-asks'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'work-career-quick-asks'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'work-career-quick-asks'
on conflict (user_id, post_id) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'work-career-quick-asks'
on conflict (user_id, post_id) do nothing;

-- POST: relationships-dating-calm-or-bored
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'campus.rae@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'relationships-dating'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I''m dating someone kind, but I feel calmer when we''re apart'
    and coalesce(body, '') = 'They''re thoughtful and consistent and honestly the healthiest person I''ve dated. The confusing part is that when we''re together I feel slightly restless, and when we''re apart I feel relieved instead of excited. I can''t tell whether I''m bored, scared of something healthy, or just not into it.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I''m dating someone kind, but I feel calmer when we''re apart',
      'They''re thoughtful and consistent and honestly the healthiest person I''ve dated. The confusing part is that when we''re together I feel slightly restless, and when we''re apart I feel relieved instead of excited. I can''t tell whether I''m bored, scared of something healthy, or just not into it.',
      'question',
      false,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('relationships-dating-calm-or-bored', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Sometimes calm feels unfamiliar when your past relationships were chaotic. But relief can also be information. You may need more time without forcing a forever answer.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'relationships-dating-calm-or-bored'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Sometimes calm feels unfamiliar when your past relationships were chaotic. But relief can also be information. You may need more time without forcing a forever answer.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Ask yourself whether you want more distance from this person specifically, or just more breathing room in general.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'relationships-dating-calm-or-bored'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Ask yourself whether you want more distance from this person specifically, or just more breathing room in general.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'relationships-dating-calm-or-bored'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'relationships-dating-calm-or-bored'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'relationships-dating-calm-or-bored'
on conflict (user_id, post_id) do nothing;

-- POST: money-raise-still-broke
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'late.noah@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'money'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I got a raise and still somehow feel broke every month'
    and coalesce(body, '') = 'The raise was real and I was proud of it, but it disappeared instantly into rent, groceries, and things I had been putting off for months. I thought more money would make me feel safer, but it mostly made me realize how stretched I''ve already been.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I got a raise and still somehow feel broke every month',
      'The raise was real and I was proud of it, but it disappeared instantly into rent, groceries, and things I had been putting off for months. I thought more money would make me feel safer, but it mostly made me realize how stretched I''ve already been.',
      'story',
      true,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('money-raise-still-broke', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'That sounds less like failure and more like delayed catch-up. A raise often patches old holes before it creates new comfort.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'money-raise-still-broke'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'That sounds less like failure and more like delayed catch-up. A raise often patches old holes before it creates new comfort.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'One tiny trick: split the raise into ''stability money'' and ''future money'' right away, even if the future bucket starts small.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'money-raise-still-broke'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'One tiny trick: split the raise into ''stability money'' and ''future money'' right away, even if the future bucket starts small.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'money-raise-still-broke'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'money-raise-still-broke'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'money-raise-still-broke'
on conflict (user_id, post_id) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'money-raise-still-broke'
on conflict (user_id, post_id) do nothing;

-- POST: friends-family-group-chat-dread
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'clearbound.jules@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'friends-family'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I love my family, but I dread opening the group chat'
    and coalesce(body, '') = 'There is one person who can turn any simple update into tension, guilt, or a surprise fight. I mute the chat and then feel guilty. I check the chat and feel drained. I want connection without volunteering to be emotionally on-call.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I love my family, but I dread opening the group chat',
      'There is one person who can turn any simple update into tension, guilt, or a surprise fight. I mute the chat and then feel guilty. I check the chat and feel drained. I want connection without volunteering to be emotionally on-call.',
      'advice_request',
      false,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('friends-family-group-chat-dread', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Muting a chat is not abandoning a family. It is sometimes the only way to stay kind when the tone is chaotic.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'friends-family-group-chat-dread'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Muting a chat is not abandoning a family. It is sometimes the only way to stay kind when the tone is chaotic.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Could you make a smaller side thread with the family members who feel safe? That gives you connection without the daily stress blast.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'friends-family-group-chat-dread'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Could you make a smaller side thread with the family members who feel safe? That gives you connection without the daily stress blast.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'friends-family-group-chat-dread'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'friends-family-group-chat-dread'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'friends-family-group-chat-dread'
on conflict (user_id, post_id) do nothing;

-- POST: mental-load-cant-switch-off
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'guide.ivy@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'mental-load-stress'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I''m not panicking, I just can never fully switch off'
    and coalesce(body, '') = 'Nothing dramatic is happening, which almost makes it harder to explain. I am just mentally ''on'' all the time. Tiny errands feel loud. Rest feels fake because my brain keeps a running list behind everything. I want to stop treating every normal day like a fire drill.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I''m not panicking, I just can never fully switch off',
      'Nothing dramatic is happening, which almost makes it harder to explain. I am just mentally ''on'' all the time. Tiny errands feel loud. Rest feels fake because my brain keeps a running list behind everything. I want to stop treating every normal day like a fire drill.',
      'question',
      true,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('mental-load-cant-switch-off', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'This sounds like your nervous system forgot what ''nothing urgent'' feels like. A good first step is making one daily pocket where you are not allowed to optimize anything.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'mental-load-cant-switch-off'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'This sounds like your nervous system forgot what ''nothing urgent'' feels like. A good first step is making one daily pocket where you are not allowed to optimize anything.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'When I feel like this, I need fewer open loops, not better motivation. One written parking lot list helps more than trying to remember everything harder.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'mental-load-cant-switch-off'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'When I feel like this, I need fewer open loops, not better motivation. One written parking lot list helps more than trying to remember everything harder.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'mental-load-cant-switch-off'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'mental-load-cant-switch-off'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'mental-load-cant-switch-off'
on conflict (user_id, post_id) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'mental-load-cant-switch-off'
on conflict (user_id, post_id) do nothing;

-- POST: life-decisions-moving-running-away
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'steady.mia@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'life-decisions'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I want to move cities, but I''m scared I''m just running away'
    and coalesce(body, '') = 'Part of me feels genuinely excited by the idea of starting over somewhere else. Another part of me is worried that I am romanticizing movement because I don''t know how to fix my current life from the inside. I can''t tell if this is growth or avoidance wearing good shoes.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I want to move cities, but I''m scared I''m just running away',
      'Part of me feels genuinely excited by the idea of starting over somewhere else. Another part of me is worried that I am romanticizing movement because I don''t know how to fix my current life from the inside. I can''t tell if this is growth or avoidance wearing good shoes.',
      'advice_request',
      true,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('life-decisions-moving-running-away', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Sometimes it''s both. A move can be a real opportunity and a form of escape. The useful question is whether your plan includes support, structure, and truth instead of just scenery.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'life-decisions-moving-running-away'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Sometimes it''s both. A move can be a real opportunity and a form of escape. The useful question is whether your plan includes support, structure, and truth instead of just scenery.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Try a smaller experiment first if you can. A long visit or a job search sprint can teach you a lot without requiring a full identity gamble.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'life-decisions-moving-running-away'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Try a smaller experiment first if you can. A long visit or a job search sprint can teach you a lot without requiring a full identity gamble.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'life-decisions-moving-running-away'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'life-decisions-moving-running-away'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'life-decisions-moving-running-away'
on conflict (user_id, post_id) do nothing;

-- POST: school-early-career-internship-behind
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'campus.rae@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'school-early-career'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I got the internship I wanted and immediately felt behind everyone'
    and coalesce(body, '') = 'I worked hard to get here, but now that I have it, I feel like everyone else understands the culture and pace better than I do. I keep thinking somebody is going to realize I am slower than the version of me I used in interviews.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I got the internship I wanted and immediately felt behind everyone',
      'I worked hard to get here, but now that I have it, I feel like everyone else understands the culture and pace better than I do. I keep thinking somebody is going to realize I am slower than the version of me I used in interviews.',
      'story',
      false,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('school-early-career-internship-behind', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'The first week of a good opportunity is often just your brain translating ''important'' into ''danger.'' You do not need to look natural yet.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'school-early-career-internship-behind'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'The first week of a good opportunity is often just your brain translating ''important'' into ''danger.'' You do not need to look natural yet.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'Ask one smart, specific question early instead of trying to perform confidence all day. People usually remember curiosity more kindly than silence.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'school-early-career-internship-behind'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'Ask one smart, specific question early instead of trying to perform confidence all day. People usually remember curiosity more kindly than silence.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'school-early-career-internship-behind'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'late.noah@example.com'
where seeded.seed_key = 'school-early-career-internship-behind'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'school-early-career-internship-behind'
on conflict (user_id, post_id) do nothing;

-- POST: moving-city-life-fresh-start-lonely
do $$
declare
  selected_author_id uuid;
  selected_topic_id uuid;
  resolved_post_id uuid;
begin
  select id into selected_author_id
  from public.users
  where email = 'late.noah@example.com';

  select id into selected_topic_id
  from public.topics
  where slug = 'moving-city-life'
    and is_active = true;

  select id into resolved_post_id
  from public.posts
  where user_id = selected_author_id
    and topic_id = selected_topic_id
    and title = 'I moved for a fresh start and feel lonelier than before'
    and coalesce(body, '') = 'I wanted the version of moving where I feel brave and expanded. Instead I mostly feel unanchored. The city is fine, my apartment is fine, my choice was probably fine. I just didn''t realize how much ''starting over'' also means not being known by anyone for a while.'
  limit 1;

  if resolved_post_id is null then
    insert into public.posts (
      user_id,
      topic_id,
      title,
      body,
      post_type,
      is_anonymous,
      status,
      moderation_status
    )
    values (
      selected_author_id,
      selected_topic_id,
      'I moved for a fresh start and feel lonelier than before',
      'I wanted the version of moving where I feel brave and expanded. Instead I mostly feel unanchored. The city is fine, my apartment is fine, my choice was probably fine. I just didn''t realize how much ''starting over'' also means not being known by anyone for a while.',
      'advice_request',
      true,
      'open',
      'clean'
    )
    returning id into resolved_post_id;
  end if;

  insert into temp_launch_posts (seed_key, post_id)
  values ('moving-city-life-fresh-start-lonely', resolved_post_id)
  on conflict (seed_key) do update
    set post_id = excluded.post_id;
end $$;

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'A new city usually gets better after repetition, not inspiration. One cafe, one walk, one class, one familiar face at a time.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'moving-city-life-fresh-start-lonely'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'A new city usually gets better after repetition, not inspiration. One cafe, one walk, one class, one familiar face at a time.'
  );

insert into public.comments (
  post_id,
  user_id,
  body,
  moderation_status,
  is_deleted
)
select
  seeded.post_id,
  author_account.id,
  'It helps me to separate homesickness from regret. Missing your old life does not automatically mean the move was wrong.',
  'clean',
  false
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'moving-city-life-fresh-start-lonely'
  and not exists (
    select 1
    from public.comments existing
    where existing.post_id = seeded.post_id
      and existing.user_id = author_account.id
      and existing.body = 'It helps me to separate homesickness from regret. Missing your old life does not automatically mean the move was wrong.'
  );

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'upvote'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'campus.rae@example.com'
where seeded.seed_key = 'moving-city-life-fresh-start-lonely'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.reactions (
  user_id,
  target_type,
  target_id,
  reaction_type
)
select
  author_account.id,
  'post',
  seeded.post_id,
  'helpful'
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'guide.ivy@example.com'
where seeded.seed_key = 'moving-city-life-fresh-start-lonely'
on conflict (user_id, target_type, target_id, reaction_type) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'steady.mia@example.com'
where seeded.seed_key = 'moving-city-life-fresh-start-lonely'
on conflict (user_id, post_id) do nothing;

insert into public.saves (
  user_id,
  post_id
)
select
  author_account.id,
  seeded.post_id
from temp_launch_posts seeded
join public.users author_account on author_account.email = 'clearbound.jules@example.com'
where seeded.seed_key = 'moving-city-life-fresh-start-lonely'
on conflict (user_id, post_id) do nothing;

commit;
