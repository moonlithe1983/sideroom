create index if not exists posts_feed_idx
  on public.posts (topic_id, moderation_status, status, created_at desc);

create index if not exists comments_post_lookup_idx
  on public.comments (post_id, moderation_status, is_deleted, created_at);

create index if not exists reactions_target_lookup_idx
  on public.reactions (target_type, target_id, reaction_type);

drop policy if exists "profiles_select_authenticated" on public.user_profiles;

create policy "profiles_select_own_or_staff"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create or replace function public.get_feed_posts(
  input_topic_id uuid default null,
  input_limit integer default 25,
  input_offset integer default 0
)
returns table (
  post_id uuid,
  topic_id uuid,
  topic_name text,
  topic_slug text,
  title text,
  body_preview text,
  post_type text,
  status text,
  is_anonymous boolean,
  created_at timestamptz,
  comment_count bigint,
  helpful_count bigint,
  net_votes bigint,
  viewer_has_saved boolean,
  viewer_vote text,
  viewer_marked_helpful boolean,
  author_label text,
  author_trust_hint text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as post_id,
    t.id as topic_id,
    t.name as topic_name,
    t.slug as topic_slug,
    p.title,
    case
      when p.body is null or btrim(p.body) = '' then null
      when char_length(btrim(p.body)) <= 220 then btrim(p.body)
      else left(btrim(p.body), 217) || '...'
    end as body_preview,
    p.post_type,
    p.status,
    p.is_anonymous,
    p.created_at,
    coalesce(comment_counts.comment_count, 0) as comment_count,
    coalesce(helpful_counts.helpful_count, 0) as helpful_count,
    coalesce(vote_counts.net_votes, 0) as net_votes,
    coalesce(save_state.viewer_has_saved, false) as viewer_has_saved,
    vote_state.viewer_vote,
    coalesce(helpful_state.viewer_marked_helpful, false) as viewer_marked_helpful,
    case
      when p.is_anonymous then 'Anonymous'
      else up.handle
    end as author_label,
    case
      when age(timezone('utc', now()), u.created_at) < interval '30 days' then 'Member since this month'
      else 'Community contributor'
    end as author_trust_hint
  from public.posts p
  join public.topics t
    on t.id = p.topic_id
   and t.is_active = true
  join public.users u
    on u.id = p.user_id
   and u.status = 'active'
  join public.user_profiles up
    on up.user_id = p.user_id
  left join public.topic_follows tf
    on tf.topic_id = p.topic_id
   and tf.user_id = auth.uid()
  left join lateral (
    select count(*)::bigint as comment_count
    from public.comments c
    where c.post_id = p.id
      and c.is_deleted = false
      and c.moderation_status = 'clean'
  ) as comment_counts on true
  left join lateral (
    select count(*)::bigint as helpful_count
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.reaction_type = 'helpful'
  ) as helpful_counts on true
  left join lateral (
    select
      coalesce(sum(case when r.reaction_type = 'upvote' then 1 when r.reaction_type = 'downvote' then -1 else 0 end), 0)::bigint as net_votes
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.reaction_type in ('upvote', 'downvote')
  ) as vote_counts on true
  left join lateral (
    select true as viewer_has_saved
    from public.saves s
    where s.post_id = p.id
      and s.user_id = auth.uid()
    limit 1
  ) as save_state on true
  left join lateral (
    select r.reaction_type as viewer_vote
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.user_id = auth.uid()
      and r.reaction_type in ('upvote', 'downvote')
    limit 1
  ) as vote_state on true
  left join lateral (
    select true as viewer_marked_helpful
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.user_id = auth.uid()
      and r.reaction_type = 'helpful'
    limit 1
  ) as helpful_state on true
  where auth.uid() is not null
    and exists (
      select 1
      from public.users viewer
      where viewer.id = auth.uid()
        and viewer.status = 'active'
        and viewer.disclaimer_accepted_at is not null
        and viewer.onboarding_completed_at is not null
    )
    and p.moderation_status = 'clean'
    and p.status <> 'removed'
    and (input_topic_id is null or p.topic_id = input_topic_id)
  order by
    case when tf.user_id is not null then 1 else 0 end desc,
    case when p.status = 'open' then 1 else 0 end desc,
    coalesce(helpful_counts.helpful_count, 0) desc,
    coalesce(comment_counts.comment_count, 0) desc,
    p.created_at desc
  limit greatest(1, least(coalesce(input_limit, 25), 50))
  offset greatest(coalesce(input_offset, 0), 0);
$$;

create or replace function public.get_post_detail(input_post_id uuid)
returns table (
  post_id uuid,
  topic_id uuid,
  topic_name text,
  topic_slug text,
  title text,
  body text,
  post_type text,
  status text,
  is_anonymous boolean,
  created_at timestamptz,
  updated_at timestamptz,
  comment_count bigint,
  helpful_count bigint,
  net_votes bigint,
  viewer_has_saved boolean,
  viewer_vote text,
  viewer_marked_helpful boolean,
  viewer_is_owner boolean,
  author_label text,
  author_trust_hint text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as post_id,
    t.id as topic_id,
    t.name as topic_name,
    t.slug as topic_slug,
    p.title,
    p.body,
    p.post_type,
    p.status,
    p.is_anonymous,
    p.created_at,
    p.updated_at,
    coalesce(comment_counts.comment_count, 0) as comment_count,
    coalesce(helpful_counts.helpful_count, 0) as helpful_count,
    coalesce(vote_counts.net_votes, 0) as net_votes,
    coalesce(save_state.viewer_has_saved, false) as viewer_has_saved,
    vote_state.viewer_vote,
    coalesce(helpful_state.viewer_marked_helpful, false) as viewer_marked_helpful,
    p.user_id = auth.uid() as viewer_is_owner,
    case
      when p.is_anonymous then 'Anonymous'
      else up.handle
    end as author_label,
    case
      when age(timezone('utc', now()), u.created_at) < interval '30 days' then 'Member since this month'
      else 'Community contributor'
    end as author_trust_hint
  from public.posts p
  join public.topics t
    on t.id = p.topic_id
   and t.is_active = true
  join public.users u
    on u.id = p.user_id
   and u.status = 'active'
  join public.user_profiles up
    on up.user_id = p.user_id
  left join lateral (
    select count(*)::bigint as comment_count
    from public.comments c
    where c.post_id = p.id
      and c.is_deleted = false
      and c.moderation_status = 'clean'
  ) as comment_counts on true
  left join lateral (
    select count(*)::bigint as helpful_count
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.reaction_type = 'helpful'
  ) as helpful_counts on true
  left join lateral (
    select
      coalesce(sum(case when r.reaction_type = 'upvote' then 1 when r.reaction_type = 'downvote' then -1 else 0 end), 0)::bigint as net_votes
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.reaction_type in ('upvote', 'downvote')
  ) as vote_counts on true
  left join lateral (
    select true as viewer_has_saved
    from public.saves s
    where s.post_id = p.id
      and s.user_id = auth.uid()
    limit 1
  ) as save_state on true
  left join lateral (
    select r.reaction_type as viewer_vote
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.user_id = auth.uid()
      and r.reaction_type in ('upvote', 'downvote')
    limit 1
  ) as vote_state on true
  left join lateral (
    select true as viewer_marked_helpful
    from public.reactions r
    where r.target_type = 'post'
      and r.target_id = p.id
      and r.user_id = auth.uid()
      and r.reaction_type = 'helpful'
    limit 1
  ) as helpful_state on true
  where auth.uid() is not null
    and exists (
      select 1
      from public.users viewer
      where viewer.id = auth.uid()
        and viewer.status = 'active'
        and viewer.disclaimer_accepted_at is not null
        and viewer.onboarding_completed_at is not null
    )
    and p.id = input_post_id
    and p.moderation_status = 'clean'
    and p.status <> 'removed';
$$;

create or replace function public.get_post_comments(input_post_id uuid)
returns table (
  comment_id uuid,
  parent_comment_id uuid,
  body text,
  created_at timestamptz,
  author_label text,
  author_trust_hint text,
  viewer_is_owner boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as comment_id,
    c.parent_comment_id,
    c.body,
    c.created_at,
    up.handle as author_label,
    case
      when age(timezone('utc', now()), u.created_at) < interval '30 days' then 'Member since this month'
      else 'Community contributor'
    end as author_trust_hint,
    c.user_id = auth.uid() as viewer_is_owner
  from public.comments c
  join public.posts p
    on p.id = c.post_id
   and p.moderation_status = 'clean'
   and p.status <> 'removed'
  join public.users u
    on u.id = c.user_id
   and u.status = 'active'
  join public.user_profiles up
    on up.user_id = c.user_id
  where auth.uid() is not null
    and exists (
      select 1
      from public.users viewer
      where viewer.id = auth.uid()
        and viewer.status = 'active'
        and viewer.disclaimer_accepted_at is not null
        and viewer.onboarding_completed_at is not null
    )
    and c.post_id = input_post_id
    and c.is_deleted = false
    and c.moderation_status = 'clean'
  order by c.created_at asc;
$$;

create or replace function public.create_post(
  input_topic_id uuid,
  input_title text,
  input_body text,
  input_post_type text,
  input_is_anonymous boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_title text;
  normalized_body text;
  inserted_post_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  perform 1
  from public.users
  where id = auth.uid()
    and status = 'active'
    and disclaimer_accepted_at is not null
    and onboarding_completed_at is not null;

  if not found then
    raise exception 'Complete onboarding before creating posts.';
  end if;

  perform 1
  from public.topics
  where id = input_topic_id
    and is_active = true;

  if not found then
    raise exception 'Choose an active topic.';
  end if;

  normalized_title := btrim(coalesce(input_title, ''));
  normalized_body := nullif(btrim(coalesce(input_body, '')), '');

  if char_length(normalized_title) < 6 or char_length(normalized_title) > 160 then
    raise exception 'Title must be between 6 and 160 characters.';
  end if;

  if normalized_body is not null and char_length(normalized_body) > 5000 then
    raise exception 'Body must be 5000 characters or fewer.';
  end if;

  if input_post_type not in ('question', 'advice_request', 'poll', 'story', 'update') then
    raise exception 'Choose a valid post type.';
  end if;

  insert into public.posts (
    user_id,
    topic_id,
    title,
    body,
    post_type,
    is_anonymous
  )
  values (
    auth.uid(),
    input_topic_id,
    normalized_title,
    normalized_body,
    input_post_type,
    coalesce(input_is_anonymous, false)
  )
  returning id into inserted_post_id;

  return inserted_post_id;
end;
$$;

create or replace function public.create_comment(
  input_post_id uuid,
  input_body text,
  input_parent_comment_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_body text;
  inserted_comment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  perform 1
  from public.users
  where id = auth.uid()
    and status = 'active'
    and disclaimer_accepted_at is not null
    and onboarding_completed_at is not null;

  if not found then
    raise exception 'Complete onboarding before commenting.';
  end if;

  perform 1
  from public.posts
  where id = input_post_id
    and moderation_status = 'clean'
    and status <> 'removed';

  if not found then
    raise exception 'This post is unavailable.';
  end if;

  if input_parent_comment_id is not null then
    perform 1
    from public.comments
    where id = input_parent_comment_id
      and post_id = input_post_id
      and is_deleted = false
      and moderation_status = 'clean';

    if not found then
      raise exception 'Parent comment is unavailable.';
    end if;
  end if;

  normalized_body := btrim(coalesce(input_body, ''));

  if char_length(normalized_body) = 0 or char_length(normalized_body) > 5000 then
    raise exception 'Comment must be between 1 and 5000 characters.';
  end if;

  insert into public.comments (
    post_id,
    user_id,
    parent_comment_id,
    body
  )
  values (
    input_post_id,
    auth.uid(),
    input_parent_comment_id,
    normalized_body
  )
  returning id into inserted_comment_id;

  return inserted_comment_id;
end;
$$;

create or replace function public.toggle_save_post(input_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  perform 1
  from public.users
  where id = auth.uid()
    and status = 'active'
    and disclaimer_accepted_at is not null
    and onboarding_completed_at is not null;

  if not found then
    raise exception 'Complete onboarding before saving posts.';
  end if;

  perform 1
  from public.posts
  where id = input_post_id
    and moderation_status = 'clean'
    and status <> 'removed';

  if not found then
    raise exception 'This post is unavailable.';
  end if;

  if exists (
    select 1
    from public.saves
    where user_id = auth.uid()
      and post_id = input_post_id
  ) then
    delete from public.saves
    where user_id = auth.uid()
      and post_id = input_post_id;

    return false;
  end if;

  insert into public.saves (user_id, post_id)
  values (auth.uid(), input_post_id)
  on conflict (user_id, post_id) do nothing;

  return true;
end;
$$;

create or replace function public.set_post_vote(
  input_post_id uuid,
  input_vote_type text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  perform 1
  from public.users
  where id = auth.uid()
    and status = 'active'
    and disclaimer_accepted_at is not null
    and onboarding_completed_at is not null;

  if not found then
    raise exception 'Complete onboarding before voting on posts.';
  end if;

  perform 1
  from public.posts
  where id = input_post_id
    and moderation_status = 'clean'
    and status <> 'removed';

  if not found then
    raise exception 'This post is unavailable.';
  end if;

  if input_vote_type is not null and input_vote_type not in ('upvote', 'downvote') then
    raise exception 'Vote must be upvote, downvote, or null.';
  end if;

  delete from public.reactions
  where user_id = auth.uid()
    and target_type = 'post'
    and target_id = input_post_id
    and reaction_type in ('upvote', 'downvote');

  if input_vote_type is null then
    return null;
  end if;

  insert into public.reactions (user_id, target_type, target_id, reaction_type)
  values (auth.uid(), 'post', input_post_id, input_vote_type);

  return input_vote_type;
end;
$$;

create or replace function public.toggle_post_helpful(input_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  perform 1
  from public.users
  where id = auth.uid()
    and status = 'active'
    and disclaimer_accepted_at is not null
    and onboarding_completed_at is not null;

  if not found then
    raise exception 'Complete onboarding before marking posts helpful.';
  end if;

  perform 1
  from public.posts
  where id = input_post_id
    and moderation_status = 'clean'
    and status <> 'removed';

  if not found then
    raise exception 'This post is unavailable.';
  end if;

  if exists (
    select 1
    from public.reactions
    where user_id = auth.uid()
      and target_type = 'post'
      and target_id = input_post_id
      and reaction_type = 'helpful'
  ) then
    delete from public.reactions
    where user_id = auth.uid()
      and target_type = 'post'
      and target_id = input_post_id
      and reaction_type = 'helpful';

    return false;
  end if;

  insert into public.reactions (user_id, target_type, target_id, reaction_type)
  values (auth.uid(), 'post', input_post_id, 'helpful');

  return true;
end;
$$;

revoke all on function public.get_feed_posts(uuid, integer, integer) from public;
revoke all on function public.get_post_detail(uuid) from public;
revoke all on function public.get_post_comments(uuid) from public;
revoke all on function public.create_post(uuid, text, text, text, boolean) from public;
revoke all on function public.create_comment(uuid, text, uuid) from public;
revoke all on function public.toggle_save_post(uuid) from public;
revoke all on function public.set_post_vote(uuid, text) from public;
revoke all on function public.toggle_post_helpful(uuid) from public;

grant execute on function public.get_feed_posts(uuid, integer, integer) to authenticated;
grant execute on function public.get_post_detail(uuid) to authenticated;
grant execute on function public.get_post_comments(uuid) to authenticated;
grant execute on function public.create_post(uuid, text, text, text, boolean) to authenticated;
grant execute on function public.create_comment(uuid, text, uuid) to authenticated;
grant execute on function public.toggle_save_post(uuid) to authenticated;
grant execute on function public.set_post_vote(uuid, text) to authenticated;
grant execute on function public.toggle_post_helpful(uuid) to authenticated;
