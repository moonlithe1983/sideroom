create or replace function public.get_saved_posts(
  input_limit integer default 20,
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
  moderation_status text,
  is_anonymous boolean,
  created_at timestamptz,
  updated_at timestamptz,
  saved_at timestamptz,
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
    p.moderation_status,
    p.is_anonymous,
    p.created_at,
    p.updated_at,
    s.created_at as saved_at,
    coalesce(comment_counts.comment_count, 0) as comment_count,
    coalesce(helpful_counts.helpful_count, 0) as helpful_count,
    coalesce(vote_counts.net_votes, 0) as net_votes,
    true as viewer_has_saved,
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
  from public.saves s
  join public.posts p
    on p.id = s.post_id
   and p.moderation_status = 'clean'
   and p.status <> 'removed'
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
    and s.user_id = auth.uid()
    and bu.id is null
  order by s.created_at desc
  limit greatest(1, least(coalesce(input_limit, 20), 50))
  offset greatest(coalesce(input_offset, 0), 0);
$$;

create or replace function public.get_my_posts(
  input_limit integer default 20,
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
  moderation_status text,
  is_anonymous boolean,
  created_at timestamptz,
  updated_at timestamptz,
  saved_at timestamptz,
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
    p.moderation_status,
    p.is_anonymous,
    p.created_at,
    p.updated_at,
    null::timestamptz as saved_at,
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
   and u.status in ('active', 'suspended', 'banned')
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
    and public.community_viewer_ready()
    and p.user_id = auth.uid()
  order by p.created_at desc
  limit greatest(1, least(coalesce(input_limit, 20), 50))
  offset greatest(coalesce(input_offset, 0), 0);
$$;

revoke all on function public.get_saved_posts(integer, integer) from public;
revoke all on function public.get_my_posts(integer, integer) from public;

grant execute on function public.get_saved_posts(integer, integer) to authenticated;
grant execute on function public.get_my_posts(integer, integer) to authenticated;
