create index if not exists reports_status_created_at_idx
  on public.reports (status, created_at desc);

create index if not exists reports_target_status_idx
  on public.reports (target_type, target_id, status);

create index if not exists moderation_actions_target_created_at_idx
  on public.moderation_actions (target_type, target_id, created_at desc);

create or replace function public.get_moderation_queue(
  input_status text default 'open',
  input_limit integer default 30,
  input_offset integer default 0
)
returns table (
  report_id uuid,
  report_status text,
  report_reason text,
  report_details text,
  reported_at timestamptz,
  target_type text,
  target_id uuid,
  post_id uuid,
  post_title text,
  target_preview text,
  target_author_id uuid,
  target_author_label text,
  target_account_status text,
  reporter_user_id uuid,
  reporter_label text,
  open_reports_for_target bigint,
  target_moderation_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as report_id,
    r.status as report_status,
    r.reason as report_reason,
    r.details as report_details,
    r.created_at as reported_at,
    r.target_type,
    r.target_id,
    case
      when r.target_type = 'post' then p.id
      when r.target_type = 'comment' then cp.id
      else null
    end as post_id,
    case
      when r.target_type = 'post' then p.title
      when r.target_type = 'comment' then cp.title
      else null
    end as post_title,
    case
      when r.target_type = 'post' then
        case
          when p.body is null or btrim(p.body) = '' then null
          when char_length(btrim(p.body)) <= 220 then btrim(p.body)
          else left(btrim(p.body), 217) || '...'
        end
      when r.target_type = 'comment' then
        case
          when c.body is null or btrim(c.body) = '' then null
          when char_length(btrim(c.body)) <= 220 then btrim(c.body)
          else left(btrim(c.body), 217) || '...'
        end
      else null
    end as target_preview,
    coalesce(p.user_id, c.user_id) as target_author_id,
    coalesce(target_profile.handle, 'Unknown user') as target_author_label,
    target_user.status as target_account_status,
    r.reporter_user_id,
    coalesce(reporter_profile.handle, 'Reporter') as reporter_label,
    coalesce(open_reports.open_reports_for_target, 0) as open_reports_for_target,
    case
      when r.target_type = 'post' then p.moderation_status
      when r.target_type = 'comment' then c.moderation_status
      else null
    end as target_moderation_status
  from public.reports r
  left join public.posts p
    on r.target_type = 'post'
   and r.target_id = p.id
  left join public.comments c
    on r.target_type = 'comment'
   and r.target_id = c.id
  left join public.posts cp
    on r.target_type = 'comment'
   and c.post_id = cp.id
  left join public.users target_user
    on target_user.id = coalesce(p.user_id, c.user_id)
  left join public.user_profiles target_profile
    on target_profile.user_id = target_user.id
  left join public.user_profiles reporter_profile
    on reporter_profile.user_id = r.reporter_user_id
  left join lateral (
    select count(*)::bigint as open_reports_for_target
    from public.reports sibling_reports
    where sibling_reports.target_type = r.target_type
      and sibling_reports.target_id = r.target_id
      and sibling_reports.status = 'open'
  ) as open_reports on true
  where auth.uid() is not null
    and public.app_is_staff()
    and (
      coalesce(nullif(lower(trim(input_status)), ''), 'open') = 'all'
      or r.status = coalesce(nullif(lower(trim(input_status)), ''), 'open')
    )
  order by
    case r.status
      when 'open' then 0
      when 'reviewed' then 1
      when 'actioned' then 2
      when 'dismissed' then 3
      else 4
    end asc,
    r.created_at desc
  limit greatest(1, least(coalesce(input_limit, 30), 60))
  offset greatest(coalesce(input_offset, 0), 0);
$$;

create or replace function public.resolve_report(
  input_report_id uuid,
  input_action text,
  input_notes text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_report public.reports%rowtype;
  normalized_action text;
  normalized_notes text;
  target_user_id uuid;
  target_user_role text;
  reviewer_role text;
  remaining_open_reports integer;
begin
  if auth.uid() is null or not public.app_is_staff() then
    raise exception 'Staff access required.';
  end if;

  normalized_action := lower(trim(coalesce(input_action, '')));
  normalized_notes := nullif(trim(coalesce(input_notes, '')), '');

  if normalized_action not in (
    'dismiss',
    'remove_post',
    'lock_post',
    'remove_comment',
    'suspend_author',
    'ban_author'
  ) then
    raise exception 'Choose a valid moderation action.';
  end if;

  select *
    into current_report
  from public.reports
  where id = input_report_id
  for update;

  if not found then
    raise exception 'This report was not found.';
  end if;

  if current_report.status in ('actioned', 'dismissed') then
    raise exception 'This report has already been closed.';
  end if;

  if current_report.target_type = 'post' then
    select p.user_id, u.role
      into target_user_id, target_user_role
    from public.posts p
    join public.users u
      on u.id = p.user_id
    where p.id = current_report.target_id;
  elsif current_report.target_type = 'comment' then
    select c.user_id, u.role
      into target_user_id, target_user_role
    from public.comments c
    join public.users u
      on u.id = c.user_id
    where c.id = current_report.target_id;
  else
    raise exception 'Unsupported report target.';
  end if;

  if target_user_id is null then
    raise exception 'Target content is unavailable.';
  end if;

  select role
    into reviewer_role
  from public.users
  where id = auth.uid();

  if reviewer_role is null then
    raise exception 'Staff account not found.';
  end if;

  if normalized_action in ('suspend_author', 'ban_author') then
    if target_user_id = auth.uid() then
      raise exception 'You cannot moderate your own account.';
    end if;

    if target_user_role in ('moderator', 'admin') and reviewer_role <> 'admin' then
      raise exception 'Only admins can moderate staff accounts.';
    end if;
  end if;

  if normalized_action = 'dismiss' then
    update public.reports
      set status = 'dismissed',
          reviewed_by = auth.uid(),
          reviewed_at = timezone('utc', now())
    where id = current_report.id;

    select count(*)::integer
      into remaining_open_reports
    from public.reports
    where target_type = current_report.target_type
      and target_id = current_report.target_id
      and status = 'open';

    if remaining_open_reports = 0 then
      if current_report.target_type = 'post' then
        update public.posts
          set moderation_status = case
            when moderation_status = 'flagged' then 'clean'
            else moderation_status
          end
        where id = current_report.target_id
          and status <> 'removed';
      else
        update public.comments
          set moderation_status = case
            when moderation_status = 'flagged' then 'clean'
            else moderation_status
          end
        where id = current_report.target_id
          and is_deleted = false;
      end if;
    end if;

    insert into public.moderation_actions (
      moderator_user_id,
      target_type,
      target_id,
      action_type,
      reason,
      notes
    )
    values (
      auth.uid(),
      current_report.target_type,
      current_report.target_id,
      'dismiss_report',
      current_report.reason,
      normalized_notes
    );

    return true;
  end if;

  if normalized_action = 'remove_post' then
    if current_report.target_type <> 'post' then
      raise exception 'This action is only valid for post reports.';
    end if;

    update public.posts
      set moderation_status = 'removed',
          status = 'removed'
    where id = current_report.target_id;

    insert into public.moderation_actions (
      moderator_user_id,
      target_type,
      target_id,
      action_type,
      reason,
      notes
    )
    values (
      auth.uid(),
      'post',
      current_report.target_id,
      'remove_post',
      current_report.reason,
      normalized_notes
    );
  elsif normalized_action = 'lock_post' then
    if current_report.target_type <> 'post' then
      raise exception 'This action is only valid for post reports.';
    end if;

    update public.posts
      set status = 'locked',
          moderation_status = case
            when moderation_status = 'clean' then 'under_review'
            else moderation_status
          end
    where id = current_report.target_id;

    insert into public.moderation_actions (
      moderator_user_id,
      target_type,
      target_id,
      action_type,
      reason,
      notes
    )
    values (
      auth.uid(),
      'post',
      current_report.target_id,
      'lock_post',
      current_report.reason,
      normalized_notes
    );
  elsif normalized_action = 'remove_comment' then
    if current_report.target_type <> 'comment' then
      raise exception 'This action is only valid for comment reports.';
    end if;

    update public.comments
      set is_deleted = true,
          moderation_status = 'removed'
    where id = current_report.target_id;

    insert into public.moderation_actions (
      moderator_user_id,
      target_type,
      target_id,
      action_type,
      reason,
      notes
    )
    values (
      auth.uid(),
      'comment',
      current_report.target_id,
      'remove_comment',
      current_report.reason,
      normalized_notes
    );
  elsif normalized_action = 'suspend_author' then
    update public.users
      set status = 'suspended'
    where id = target_user_id
      and status <> 'banned';

    insert into public.moderation_actions (
      moderator_user_id,
      target_type,
      target_id,
      action_type,
      reason,
      notes
    )
    values (
      auth.uid(),
      'user',
      target_user_id,
      'suspend_author',
      current_report.reason,
      normalized_notes
    );
  elsif normalized_action = 'ban_author' then
    update public.users
      set status = 'banned'
    where id = target_user_id;

    update public.posts
      set moderation_status = 'removed',
          status = 'removed'
    where user_id = target_user_id
      and status <> 'removed';

    update public.comments
      set is_deleted = true,
          moderation_status = 'removed'
    where user_id = target_user_id
      and is_deleted = false;

    insert into public.moderation_actions (
      moderator_user_id,
      target_type,
      target_id,
      action_type,
      reason,
      notes
    )
    values (
      auth.uid(),
      'user',
      target_user_id,
      'ban_author',
      current_report.reason,
      normalized_notes
    );
  end if;

  update public.reports
    set status = 'actioned',
        reviewed_by = auth.uid(),
        reviewed_at = timezone('utc', now())
  where target_type = current_report.target_type
    and target_id = current_report.target_id
    and status in ('open', 'reviewed');

  return true;
end;
$$;

revoke all on function public.get_moderation_queue(text, integer, integer) from public;
revoke all on function public.resolve_report(uuid, text, text) from public;

grant execute on function public.get_moderation_queue(text, integer, integer) to authenticated;
grant execute on function public.resolve_report(uuid, text, text) to authenticated;
