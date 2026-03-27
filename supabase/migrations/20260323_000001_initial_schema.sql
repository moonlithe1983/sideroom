create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  auth_provider text not null default 'email',
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  disclaimer_accepted_at timestamptz,
  onboarding_completed_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.app_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('moderator', 'admin')
  );
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  handle text not null,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint handle_format check (handle ~ '^[a-z0-9_]{3,24}$')
);

create unique index if not exists user_profiles_handle_unique
  on public.user_profiles (lower(handle));

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now()),
  is_active boolean not null default true
);

create table if not exists public.topic_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, topic_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete restrict,
  title text not null check (char_length(title) between 6 and 160),
  body text,
  post_type text not null check (post_type in ('question', 'advice_request', 'poll', 'story', 'update')),
  is_anonymous boolean not null default false,
  status text not null default 'open' check (status in ('open', 'resolved', 'locked', 'removed')),
  moderation_status text not null default 'clean' check (moderation_status in ('clean', 'flagged', 'under_review', 'removed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  parent_comment_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  is_deleted boolean not null default false,
  moderation_status text not null default 'clean' check (moderation_status in ('clean', 'flagged', 'under_review', 'removed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reaction_type text not null check (reaction_type in ('upvote', 'downvote', 'helpful')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, target_type, target_id, reaction_type)
);

create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, post_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.users (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_by uuid references public.users (id) on delete set null,
  reviewed_at timestamptz
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_user_id uuid not null references public.users (id) on delete restrict,
  target_type text not null,
  target_id uuid not null,
  action_type text not null,
  reason text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null,
  entity_type text not null,
  entity_id uuid not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  blocked_user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, blocked_user_id),
  constraint blocked_users_no_self_block check (user_id <> blocked_user_id)
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, auth_provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (id) do update
    set email = excluded.email,
        auth_provider = excluded.auth_provider,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_auth_user();

create or replace function public.protect_user_account_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.app_is_staff() then
    if new.email <> old.email
      or new.auth_provider <> old.auth_provider
      or new.role <> old.role
      or new.status <> old.status then
      raise exception 'You cannot change privileged account fields directly.';
    end if;
  end if;

  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
before update on public.users
for each row
execute procedure public.protect_user_account_update();

drop trigger if exists user_profiles_updated_at on public.user_profiles;
create trigger user_profiles_updated_at
before update on public.user_profiles
for each row
execute procedure public.touch_updated_at();

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
before update on public.posts
for each row
execute procedure public.touch_updated_at();

drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at
before update on public.comments
for each row
execute procedure public.touch_updated_at();

create or replace function public.complete_onboarding(input_handle text, input_topic_ids uuid[])
returns public.user_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_handle text;
  selected_topic_count integer;
  valid_topic_count integer;
  output_profile public.user_profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  normalized_handle := lower(trim(input_handle));
  selected_topic_count := coalesce(array_length(input_topic_ids, 1), 0);

  if normalized_handle !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'Handle must be 3 to 24 characters using letters, numbers, or underscores.';
  end if;

  if selected_topic_count < 3 or selected_topic_count > 5 then
    raise exception 'Choose between 3 and 5 topics.';
  end if;

  select count(*)
    into valid_topic_count
  from public.topics
  where id = any(input_topic_ids)
    and is_active = true;

  if valid_topic_count <> selected_topic_count then
    raise exception 'Selected topics must exist and be active.';
  end if;

  insert into public.user_profiles (user_id, handle)
  values (auth.uid(), normalized_handle)
  on conflict (user_id) do update
    set handle = excluded.handle,
        updated_at = timezone('utc', now())
  returning *
    into output_profile;

  delete from public.topic_follows
  where user_id = auth.uid();

  insert into public.topic_follows (user_id, topic_id)
  select auth.uid(), selected_topics.topic_id
  from (
    select distinct unnest(input_topic_ids) as topic_id
  ) as selected_topics;

  update public.users
    set disclaimer_accepted_at = coalesce(disclaimer_accepted_at, timezone('utc', now())),
        onboarding_completed_at = timezone('utc', now()),
        last_seen_at = timezone('utc', now())
  where id = auth.uid();

  return output_profile;
end;
$$;

create or replace function public.touch_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    update public.users
      set last_seen_at = timezone('utc', now())
    where id = auth.uid();
  end if;
end;
$$;

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.topics enable row level security;
alter table public.topic_follows enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.saves enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.notifications enable row level security;
alter table public.blocked_users enable row level security;

alter table public.users force row level security;
alter table public.user_profiles force row level security;
alter table public.topics force row level security;
alter table public.topic_follows force row level security;
alter table public.posts force row level security;
alter table public.comments force row level security;
alter table public.reactions force row level security;
alter table public.saves force row level security;
alter table public.reports force row level security;
alter table public.moderation_actions force row level security;
alter table public.notifications force row level security;
alter table public.blocked_users force row level security;

create policy "users_select_own_or_staff"
on public.users
for select
to authenticated
using (auth.uid() = id or public.app_is_staff());

create policy "users_update_own_or_staff"
on public.users
for update
to authenticated
using (auth.uid() = id or public.app_is_staff())
with check (auth.uid() = id or public.app_is_staff());

create policy "profiles_select_authenticated"
on public.user_profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own_or_staff"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id or public.app_is_staff());

create policy "profiles_update_own_or_staff"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id or public.app_is_staff())
with check (auth.uid() = user_id or public.app_is_staff());

create policy "topics_select_active"
on public.topics
for select
to authenticated
using (is_active = true);

create policy "topic_follows_select_own_or_staff"
on public.topic_follows
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "topic_follows_insert_own_or_staff"
on public.topic_follows
for insert
to authenticated
with check (auth.uid() = user_id or public.app_is_staff());

create policy "topic_follows_delete_own_or_staff"
on public.topic_follows
for delete
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "posts_select_own_or_staff_only"
on public.posts
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "posts_insert_own"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "posts_update_own_or_staff"
on public.posts
for update
to authenticated
using (auth.uid() = user_id or public.app_is_staff())
with check (auth.uid() = user_id or public.app_is_staff());

create policy "posts_delete_own_or_staff"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "comments_select_own_or_staff_only"
on public.comments
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "comments_insert_own"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "comments_update_own_or_staff"
on public.comments
for update
to authenticated
using (auth.uid() = user_id or public.app_is_staff())
with check (auth.uid() = user_id or public.app_is_staff());

create policy "comments_delete_own_or_staff"
on public.comments
for delete
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "reactions_select_own_or_staff"
on public.reactions
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "reactions_insert_own"
on public.reactions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reactions_delete_own_or_staff"
on public.reactions
for delete
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "saves_select_own_or_staff"
on public.saves
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "saves_insert_own"
on public.saves
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "saves_delete_own_or_staff"
on public.saves
for delete
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "reports_select_reporter_or_staff"
on public.reports
for select
to authenticated
using (auth.uid() = reporter_user_id or public.app_is_staff());

create policy "reports_insert_reporter"
on public.reports
for insert
to authenticated
with check (auth.uid() = reporter_user_id);

create policy "reports_update_staff"
on public.reports
for update
to authenticated
using (public.app_is_staff())
with check (public.app_is_staff());

create policy "moderation_actions_staff_only"
on public.moderation_actions
for all
to authenticated
using (public.app_is_staff())
with check (public.app_is_staff());

create policy "notifications_select_own_or_staff"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "notifications_update_own_or_staff"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id or public.app_is_staff())
with check (auth.uid() = user_id or public.app_is_staff());

create policy "blocked_users_select_own_or_staff"
on public.blocked_users
for select
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

create policy "blocked_users_insert_own"
on public.blocked_users
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "blocked_users_delete_own_or_staff"
on public.blocked_users
for delete
to authenticated
using (auth.uid() = user_id or public.app_is_staff());

revoke all on table public.users from anon, authenticated;
revoke all on table public.user_profiles from anon, authenticated;
revoke all on table public.topics from anon, authenticated;
revoke all on table public.topic_follows from anon, authenticated;
revoke all on table public.posts from anon, authenticated;
revoke all on table public.comments from anon, authenticated;
revoke all on table public.reactions from anon, authenticated;
revoke all on table public.saves from anon, authenticated;
revoke all on table public.reports from anon, authenticated;
revoke all on table public.moderation_actions from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.blocked_users from anon, authenticated;

grant select, update on public.users to authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select on public.topics to authenticated;
grant select, insert, delete on public.topic_follows to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert, delete on public.reactions to authenticated;
grant select, insert, delete on public.saves to authenticated;
grant select, insert, update on public.reports to authenticated;
grant select, insert on public.moderation_actions to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert, delete on public.blocked_users to authenticated;

revoke all on function public.complete_onboarding(text, uuid[]) from public;
revoke all on function public.touch_last_seen() from public;
grant execute on function public.complete_onboarding(text, uuid[]) to authenticated;
grant execute on function public.touch_last_seen() to authenticated;

insert into public.topics (slug, name, description)
values
  ('work-career', 'Work & Career', 'Questions about work, burnout, promotions, bosses, and changing direction.'),
  ('relationships-dating', 'Relationships & Dating', 'Dating, breakups, commitment, boundaries, and communication.'),
  ('money', 'Money', 'Budgeting, debt, pay, savings, and money stress.'),
  ('friends-family', 'Friends & Family', 'Friendships, family tension, and building support systems.'),
  ('mental-load-stress', 'Mental Load & Stress', 'Stress, emotional load, burnout, and daily pressure.'),
  ('life-decisions', 'Life Decisions', 'Big tradeoffs, uncertainty, identity questions, and crossroads moments.'),
  ('school-early-career', 'School & Early Career', 'School, first jobs, internships, and figuring out the start of adult life.'),
  ('moving-city-life', 'Moving & City Life', 'Relocating, roommates, neighborhoods, and starting over somewhere new.')
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      is_active = true;
