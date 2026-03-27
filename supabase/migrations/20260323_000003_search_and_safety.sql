create or replace function public.community_viewer_ready()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users viewer
    where viewer.id = auth.uid()
      and viewer.status = 'active'
      and viewer.disclaimer_accepted_at is not null
      and viewer.onboarding_completed_at is not null
  );
$$;

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
  left join public.blocked_users bu
    on bu.user_id = auth.uid()
   and bu.blocked_user_id = p.user_id
  left join lateral (
    select count(*)::bigint as comment_count
    from public.comments c
    left join public.blocked_users comment_blocks
      on comment_blocks.user_id = auth.uid()
     and comment_blocks.blocked_user_id = c.user_id
    where c.post_id = p.id
      and c.is_deleted = false
      and c.moderation_status = 'clean'
      and comment_blocks.id is null
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
    and public.community_viewer_ready()
    and bu.id is null
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
  left join public.blocked_users bu
    on bu.user_id = auth.uid()
   and bu.blocked_user_id = p.user_id
  left join lateral (
    select count(*)::bigint as comment_count
    from public.comments c
    left join public.blocked_users comment_blocks
      on comment_blocks.user_id = auth.uid()
     and comment_blocks.blocked_user_id = c.user_id
    where c.post_id = p.id
      and c.is_deleted = false
      and c.moderation_status = 'clean'
      and comment_blocks.id is null
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
    and public.community_viewer_ready()
    and bu.id is null
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
  left join public.blocked_users bu
    on bu.user_id = auth.uid()
   and bu.blocked_user_id = c.user_id
  where auth.uid() is not null
    and public.community_viewer_ready()
    and bu.id is null
    and c.post_id = input_post_id
    and c.is_deleted = false
    and c.moderation_status = 'clean'
  order by c.created_at asc;
$$;

create or replace function public.search_posts(
  input_query text,
  input_topic_id uuid default null,
  input_limit integer default 25
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
  with search_input as (
    select lower(trim(coalesce(input_query, ''))) as query
  )
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
  from search_input q
  join public.posts p on true
  join public.topics t
    on t.id = p.topic_id
   and t.is_active = true
  join public.users u
    on u.id = p.user_id
   and u.status = 'active'
  join public.user_profiles up
    on up.user_id = p.user_id
  left join public.blocked_users bu
    on bu.user_id = auth.uid()
   and bu.blocked_user_id = p.user_id
  left join lateral (
    select count(*)::bigint as comment_count
    from public.comments c
    left join public.blocked_users comment_blocks
      on comment_blocks.user_id = auth.uid()
     and comment_blocks.blocked_user_id = c.user_id
    where c.post_id = p.id
      and c.is_deleted = false
      and c.moderation_status = 'clean'
      and comment_blocks.id is null
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
    and public.community_viewer_ready()
    and bu.id is null
    and q.query <> ''
    and p.moderation_status = 'clean'
    and p.status <> 'removed'
    and (input_topic_id is null or p.topic_id = input_topic_id)
    and (
      lower(p.title) like '%' || q.query || '%'
      or lower(coalesce(p.body, '')) like '%' || q.query || '%'
      or lower(t.name) like '%' || q.query || '%'
    )
  order by
    case when lower(p.title) = q.query then 0 else 1 end asc,
    case when lower(p.title) like q.query || '%' then 0 else 1 end asc,
    case when lower(p.title) like '%' || q.query || '%' then 0 else 1 end asc,
    case when lower(coalesce(p.body, '')) like '%' || q.query || '%' then 0 else 1 end asc,
    coalesce(helpful_counts.helpful_count, 0) desc,
    p.created_at desc
  limit greatest(1, least(coalesce(input_limit, 25), 50));
$$;

create or replace function public.report_post(
  input_post_id uuid,
  input_reason text,
  input_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_reason text;
  normalized_details text;
  created_report_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before reporting content.';
  end if;

  perform 1
  from public.posts
  where id = input_post_id
    and moderation_status in ('clean', 'flagged', 'under_review')
    and status <> 'removed';

  if not found then
    raise exception 'This post is unavailable.';
  end if;

  normalized_reason := btrim(coalesce(input_reason, ''));
  normalized_details := nullif(btrim(coalesce(input_details, '')), '');

  if char_length(normalized_reason) < 3 or char_length(normalized_reason) > 80 then
    raise exception 'Choose a report reason.';
  end if;

  if normalized_details is not null and char_length(normalized_details) > 1000 then
    raise exception 'Report details must be 1000 characters or fewer.';
  end if;

  insert into public.reports (
    reporter_user_id,
    target_type,
    target_id,
    reason,
    details
  )
  values (
    auth.uid(),
    'post',
    input_post_id,
    normalized_reason,
    normalized_details
  )
  returning id into created_report_id;

  update public.posts
    set moderation_status = case
      when moderation_status = 'clean' then 'flagged'
      else moderation_status
    end
  where id = input_post_id;

  return created_report_id;
end;
$$;

create or replace function public.report_comment(
  input_comment_id uuid,
  input_reason text,
  input_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_reason text;
  normalized_details text;
  created_report_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before reporting content.';
  end if;

  perform 1
  from public.comments
  where id = input_comment_id
    and moderation_status in ('clean', 'flagged', 'under_review')
    and is_deleted = false;

  if not found then
    raise exception 'This comment is unavailable.';
  end if;

  normalized_reason := btrim(coalesce(input_reason, ''));
  normalized_details := nullif(btrim(coalesce(input_details, '')), '');

  if char_length(normalized_reason) < 3 or char_length(normalized_reason) > 80 then
    raise exception 'Choose a report reason.';
  end if;

  if normalized_details is not null and char_length(normalized_details) > 1000 then
    raise exception 'Report details must be 1000 characters or fewer.';
  end if;

  insert into public.reports (
    reporter_user_id,
    target_type,
    target_id,
    reason,
    details
  )
  values (
    auth.uid(),
    'comment',
    input_comment_id,
    normalized_reason,
    normalized_details
  )
  returning id into created_report_id;

  update public.comments
    set moderation_status = case
      when moderation_status = 'clean' then 'flagged'
      else moderation_status
    end
  where id = input_comment_id;

  return created_report_id;
end;
$$;

create or replace function public.block_post_author(input_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before blocking accounts.';
  end if;

  select user_id
    into target_user_id
  from public.posts
  where id = input_post_id
    and moderation_status in ('clean', 'flagged', 'under_review')
    and status <> 'removed';

  if target_user_id is null then
    raise exception 'This post is unavailable.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot block your own account.';
  end if;

  insert into public.blocked_users (user_id, blocked_user_id)
  values (auth.uid(), target_user_id)
  on conflict (user_id, blocked_user_id) do nothing;

  return true;
end;
$$;

create or replace function public.block_comment_author(input_comment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before blocking accounts.';
  end if;

  select user_id
    into target_user_id
  from public.comments
  where id = input_comment_id
    and moderation_status in ('clean', 'flagged', 'under_review')
    and is_deleted = false;

  if target_user_id is null then
    raise exception 'This comment is unavailable.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot block your own account.';
  end if;

  insert into public.blocked_users (user_id, blocked_user_id)
  values (auth.uid(), target_user_id)
  on conflict (user_id, blocked_user_id) do nothing;

  return true;
end;
$$;

revoke all on function public.community_viewer_ready() from public;
revoke all on function public.search_posts(text, uuid, integer) from public;
revoke all on function public.report_post(uuid, text, text) from public;
revoke all on function public.report_comment(uuid, text, text) from public;
revoke all on function public.block_post_author(uuid) from public;
revoke all on function public.block_comment_author(uuid) from public;

grant execute on function public.community_viewer_ready() to authenticated;
grant execute on function public.search_posts(text, uuid, integer) to authenticated;
grant execute on function public.report_post(uuid, text, text) to authenticated;
grant execute on function public.report_comment(uuid, text, text) to authenticated;
grant execute on function public.block_post_author(uuid) to authenticated;
grant execute on function public.block_comment_author(uuid) to authenticated;
