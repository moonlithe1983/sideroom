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

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before commenting.';
  end if;

  perform 1
  from public.posts
  where id = input_post_id
    and moderation_status = 'clean'
    and status in ('open', 'resolved');

  if not found then
    raise exception 'This post is unavailable for replies.';
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

create or replace function public.set_my_post_status(
  input_post_id uuid,
  input_status text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_status text;
  current_post public.posts%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.community_viewer_ready() then
    raise exception 'Complete onboarding before updating your post.';
  end if;

  normalized_status := lower(trim(coalesce(input_status, '')));

  if normalized_status not in ('open', 'resolved') then
    raise exception 'Choose open or resolved.';
  end if;

  select *
    into current_post
  from public.posts
  where id = input_post_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'That post could not be found.';
  end if;

  if current_post.status = 'removed' or current_post.moderation_status = 'removed' then
    raise exception 'Removed posts cannot be updated.';
  end if;

  if current_post.status = 'locked' then
    raise exception 'This post is locked and cannot be changed.';
  end if;

  if current_post.status = normalized_status then
    return current_post.status;
  end if;

  update public.posts
    set status = normalized_status
  where id = current_post.id;

  return normalized_status;
end;
$$;

revoke all on function public.set_my_post_status(uuid, text) from public;

grant execute on function public.set_my_post_status(uuid, text) to authenticated;
