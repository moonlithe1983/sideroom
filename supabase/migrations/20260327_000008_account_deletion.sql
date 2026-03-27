create or replace function public.delete_my_account()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
  deleted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select role
    into current_role
  from public.users
  where id = auth.uid();

  if coalesce(current_role, 'user') in ('moderator', 'admin') then
    raise exception 'Staff accounts require support-assisted deletion so moderation audit trails are preserved.';
  end if;

  delete from auth.users
  where id = auth.uid();

  get diagnostics deleted_count = row_count;

  if deleted_count = 0 then
    raise exception 'Account deletion could not find the signed-in user.';
  end if;

  return true;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
