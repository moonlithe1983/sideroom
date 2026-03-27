# SideRoom Supabase Setup

## Environment Variables

Create a local env file from `.env.example` and fill in:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not commit the real values.

## Fast Preflight Check

Run this before trying live auth or real data:

- `npm run backend:preflight`
- `npm run backend:bundle`
- `npm run launch:seed`

That command checks:

- whether a local env file exists
- whether the required Supabase variables are present and not still placeholders
- whether `app.json` still matches the expected `sideroom://auth/callback` redirect setup
- whether all seven migration files are present locally

It does not contact Supabase. It is just the "are we ready to start real setup?" traffic light.

`npm run backend:bundle` generates:

- `supabase/bootstrap/full-setup.sql`

That file is the easiest copy-paste path for a brand-new Supabase project. It concatenates all
seven migrations in the correct order. Do not edit it by hand; edit the files in
`supabase/migrations/` and regenerate it instead.

`npm run launch:seed` generates starter launch content SQL from:

- `data/launch-seed/seed-content.json`
- `supabase/bootstrap/seed-authors.json` when it exists

If `seed-authors.json` does not exist yet, the script generates a template SQL file using
`seed-authors.example.json` instead.

## Auth Redirect URL

Add this redirect URL to the Supabase auth settings:

- `sideroom://auth/callback`

This matches the app scheme already configured in `app.json`.

## Social Auth Providers

Before testing provider sign-in in the app:

- Enable `Google` in the Supabase auth provider settings.
- Complete the provider credentials required by Supabase for Google.
- Keep `sideroom://auth/callback` in the allowed redirect list for Google.

The mobile client now starts Google sign-in through Supabase OAuth and routes the callback back
into the app through that deep link.

## Initial Database Setup

For the easiest brand-new project setup, apply:

- `supabase/bootstrap/full-setup.sql`

If you prefer the source files directly, apply the SQL in:

- `supabase/migrations/20260323_000001_initial_schema.sql`
- `supabase/migrations/20260323_000002_public_queries.sql`
- `supabase/migrations/20260323_000003_search_and_safety.sql`
- `supabase/migrations/20260323_000004_notifications.sql`
- `supabase/migrations/20260323_000005_moderation_tools.sql`
- `supabase/migrations/20260323_000006_personal_activity.sql`
- `supabase/migrations/20260323_000007_post_resolution.sql`

Those migrations create:

- the private `users` table
- the public `user_profiles` table
- seeded launch topics
- the first onboarding RPC
- row-level security policies for core MVP tables
- sanitized feed, post-detail, comment, save, and reaction RPCs for the mobile app
- search RPCs that respect blocking and moderation state
- report and block RPCs for post and comment safety actions
- in-app notification triggers for comments and positive post reactions
- inbox RPCs for listing notifications and marking them read safely
- a staff moderation queue with protected resolve actions and audit-log writes
- personal activity RPCs for saved posts and authored posts in the Me tab
- author-controlled post resolution plus server-enforced locked-post reply protection

## Launch Content Seeding

After the schema is live and your seed accounts have signed in once:

1. Copy `supabase/bootstrap/seed-authors.example.json` to `supabase/bootstrap/seed-authors.json`.
2. Replace the example emails with the real seed-account emails.
3. Run `npm run launch:seed`.
4. Apply `supabase/bootstrap/seed-launch-content.sql`.

Use `docs/launch-seed-content.md` for the detailed content-seeding workflow.

## Important Security Notes

- Do not place any service-role key in the mobile app.
- Use only the publishable or anon key on-device.
- Direct public feed queries are intentionally not opened yet because anonymous post identity must stay protected.
- Build sanitized feed queries as SQL views or RPCs before enabling broad post/comment reads.

## First Verification Checklist

After the project is created and the migration is applied:

1. Confirm email and Google sign-in each create or update a row in `public.users` with the expected `auth_provider`.
2. Confirm `public.topics` contains the seeded launch topics.
3. Confirm an authenticated user can call `complete_onboarding`.
4. Confirm non-staff users cannot read or update another user's private account row.
5. Confirm non-staff users cannot directly read other users' raw `posts` rows.
6. Confirm `search_posts` returns only active, clean content and excludes blocked authors.
7. Confirm `report_post` and `report_comment` create `public.reports` rows and flag the target content.
8. Confirm `block_post_author` and `block_comment_author` create `public.blocked_users` rows and hide that author's content from feed, search, and comments.
9. Confirm new comments create inbox notifications for post owners and reply targets when appropriate.
10. Confirm helpful votes and upvotes create inbox notifications for post owners but never for self-actions.
11. Confirm `get_notifications` excludes blocked authors and removed content, and `mark_notification_read` plus `mark_all_notifications_read` update only the signed-in user's inbox state.
12. Confirm `get_moderation_queue` is accessible only to moderator/admin accounts and returns report context without exposing private user rows to normal members.
13. Confirm `resolve_report` writes to `public.moderation_actions`, closes the right reports, and applies dismiss, remove, lock, suspend, and ban actions safely.
14. Confirm `get_saved_posts` returns only the signed-in user's saved posts, excludes blocked or removed content, and preserves save order.
15. Confirm `get_my_posts` returns only the signed-in user's authored posts, including moderation and post-status states needed for transparent account history.
16. Confirm authors can use `set_my_post_status` to switch only their own posts between `open` and `resolved`.
17. Confirm locked posts reject new comments both in the UI and through the `create_comment` RPC.
