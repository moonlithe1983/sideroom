create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_is_read_created_at_idx
  on public.notifications (user_id, is_read, created_at desc);

create or replace function public.handle_new_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner_id uuid;
  parent_comment_owner_id uuid;
begin
  select p.user_id
    into post_owner_id
  from public.posts p
  where p.id = new.post_id
    and p.status <> 'removed'
    and p.moderation_status in ('clean', 'flagged', 'under_review');

  if post_owner_id is not null and post_owner_id <> new.user_id then
    insert into public.notifications (user_id, type, entity_type, entity_id)
    values (post_owner_id, 'new_comment', 'comment', new.id);
  end if;

  if new.parent_comment_id is not null then
    select c.user_id
      into parent_comment_owner_id
    from public.comments c
    where c.id = new.parent_comment_id
      and c.is_deleted = false
      and c.moderation_status in ('clean', 'flagged', 'under_review');

    if parent_comment_owner_id is not null
      and parent_comment_owner_id <> new.user_id
      and parent_comment_owner_id <> post_owner_id then
      insert into public.notifications (user_id, type, entity_type, entity_id)
      values (parent_comment_owner_id, 'comment_reply', 'comment', new.id);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists comments_notify_activity on public.comments;
create trigger comments_notify_activity
after insert on public.comments
for each row
execute procedure public.handle_new_comment_notification();

create or replace function public.handle_new_post_reaction_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner_id uuid;
  notification_type text;
begin
  if new.target_type <> 'post' or new.reaction_type not in ('upvote', 'helpful') then
    return new;
  end if;

  select p.user_id
    into post_owner_id
  from public.posts p
  where p.id = new.target_id
    and p.status <> 'removed'
    and p.moderation_status in ('clean', 'flagged', 'under_review');

  if post_owner_id is null or post_owner_id = new.user_id then
    return new;
  end if;

  notification_type := case
    when new.reaction_type = 'helpful' then 'post_helpful'
    else 'post_upvote'
  end;

  insert into public.notifications (user_id, type, entity_type, entity_id)
  values (post_owner_id, notification_type, 'reaction', new.id);

  return new;
end;
$$;

drop trigger if exists reactions_notify_activity on public.reactions;
create trigger reactions_notify_activity
after insert on public.reactions
for each row
execute procedure public.handle_new_post_reaction_notification();

create or replace function public.get_notifications(
  input_limit integer default 30,
  input_offset integer default 0,
  input_unread_only boolean default false
)
returns table (
  notification_id uuid,
  notification_type text,
  entity_type text,
  entity_id uuid,
  post_id uuid,
  post_title text,
  actor_label text,
  message_title text,
  message_preview text,
  is_read boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with scoped_notifications as (
    select
      n.id,
      n.type,
      n.entity_type,
      n.entity_id,
      n.is_read,
      n.created_at,
      case
        when n.entity_type = 'comment' then c.user_id
        when n.entity_type = 'reaction' then r.user_id
        else null
      end as actor_user_id,
      case
        when n.entity_type = 'comment' then c.post_id
        when n.entity_type = 'reaction' and r.target_type = 'post' then r.target_id
        else null
      end as linked_post_id,
      c.body as comment_body,
      p.title as linked_post_title
    from public.notifications n
    left join public.comments c
      on n.entity_type = 'comment'
     and n.entity_id = c.id
     and c.is_deleted = false
     and c.moderation_status in ('clean', 'flagged', 'under_review')
    left join public.reactions r
      on n.entity_type = 'reaction'
     and n.entity_id = r.id
     and r.target_type = 'post'
     and r.reaction_type in ('upvote', 'helpful')
    left join public.posts p
      on (
        (n.entity_type = 'comment' and p.id = c.post_id)
        or (n.entity_type = 'reaction' and r.target_type = 'post' and p.id = r.target_id)
      )
     and p.status <> 'removed'
     and p.moderation_status in ('clean', 'flagged', 'under_review')
    where auth.uid() is not null
      and public.community_viewer_ready()
      and n.user_id = auth.uid()
      and (not input_unread_only or n.is_read = false)
  )
  select
    scoped.id as notification_id,
    scoped.type as notification_type,
    scoped.entity_type,
    scoped.entity_id,
    scoped.linked_post_id as post_id,
    scoped.linked_post_title as post_title,
    coalesce(actor_profile.handle, 'Someone') as actor_label,
    case scoped.type
      when 'new_comment' then coalesce(actor_profile.handle, 'Someone') || ' commented on your post'
      when 'comment_reply' then coalesce(actor_profile.handle, 'Someone') || ' replied to your comment'
      when 'post_helpful' then coalesce(actor_profile.handle, 'Someone') || ' marked your post helpful'
      when 'post_upvote' then coalesce(actor_profile.handle, 'Someone') || ' upvoted your post'
      else 'New activity on your content'
    end as message_title,
    case
      when scoped.type in ('new_comment', 'comment_reply') then
        case
          when scoped.comment_body is null or btrim(scoped.comment_body) = '' then null
          when char_length(btrim(scoped.comment_body)) <= 160 then btrim(scoped.comment_body)
          else left(btrim(scoped.comment_body), 157) || '...'
        end
      when scoped.linked_post_title is not null then
        'On ' || scoped.linked_post_title
      else null
    end as message_preview,
    scoped.is_read,
    scoped.created_at
  from scoped_notifications scoped
  left join public.users actor_user
    on actor_user.id = scoped.actor_user_id
   and actor_user.status = 'active'
  left join public.user_profiles actor_profile
    on actor_profile.user_id = actor_user.id
  left join public.blocked_users bu
    on bu.user_id = auth.uid()
   and bu.blocked_user_id = scoped.actor_user_id
  where bu.id is null
    and scoped.linked_post_id is not null
  order by scoped.created_at desc
  limit greatest(1, least(coalesce(input_limit, 30), 50))
  offset greatest(coalesce(input_offset, 0), 0);
$$;

create or replace function public.get_unread_notification_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with scoped_notifications as (
    select
      n.id,
      case
        when n.entity_type = 'comment' then c.user_id
        when n.entity_type = 'reaction' then r.user_id
        else null
      end as actor_user_id,
      case
        when n.entity_type = 'comment' then c.post_id
        when n.entity_type = 'reaction' and r.target_type = 'post' then r.target_id
        else null
      end as linked_post_id
    from public.notifications n
    left join public.comments c
      on n.entity_type = 'comment'
     and n.entity_id = c.id
     and c.is_deleted = false
     and c.moderation_status in ('clean', 'flagged', 'under_review')
    left join public.reactions r
      on n.entity_type = 'reaction'
     and n.entity_id = r.id
     and r.target_type = 'post'
     and r.reaction_type in ('upvote', 'helpful')
    left join public.posts p
      on (
        (n.entity_type = 'comment' and p.id = c.post_id)
        or (n.entity_type = 'reaction' and r.target_type = 'post' and p.id = r.target_id)
      )
     and p.status <> 'removed'
     and p.moderation_status in ('clean', 'flagged', 'under_review')
    where auth.uid() is not null
      and public.community_viewer_ready()
      and n.user_id = auth.uid()
      and n.is_read = false
      and p.id is not null
  )
  select count(*)::integer
  from scoped_notifications scoped
  left join public.blocked_users bu
    on bu.user_id = auth.uid()
   and bu.blocked_user_id = scoped.actor_user_id
  where bu.id is null
    and scoped.linked_post_id is not null;
$$;

create or replace function public.mark_notification_read(input_notification_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before viewing notifications.';
  end if;

  update public.notifications
    set is_read = true
  where id = input_notification_id
    and user_id = auth.uid();

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before viewing notifications.';
  end if;

  update public.notifications
    set is_read = true
  where user_id = auth.uid()
    and is_read = false;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.get_notifications(integer, integer, boolean) from public;
revoke all on function public.get_unread_notification_count() from public;
revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.mark_all_notifications_read() from public;

grant execute on function public.get_notifications(integer, integer, boolean) to authenticated;
grant execute on function public.get_unread_notification_count() to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
