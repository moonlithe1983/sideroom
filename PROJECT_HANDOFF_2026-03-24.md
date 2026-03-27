# SideRoom Project Handoff

Date: 2026-03-24
Workspace: `C:\Users\moonl\sideroom`

## Executive Summary

SideRoom started this week as a mostly untouched Expo starter backed by a strong product brief. The repository is now a real mobile MVP foundation with secure auth/session handling, onboarding, feed/search/create flows, post detail, comments, saves, reactions, reporting, blocking, notifications, moderation, personal activity, and author-controlled thread resolution.

The product is still not launch-ready. The biggest remaining blockers are live Supabase setup and validation, seeded launch content, live enablement and validation of Google auth, stronger staff-security controls, and beta/Google Play readiness work.

## Current Product State

### User-facing product flows implemented

- Auth shell with secure session persistence.
- Email magic-link sign-in.
- Google OAuth sign-in wired through Supabase.
- Dedicated auth-callback completion screen for secure sign-in redirects.
- Onboarding with handle creation and topic selection.
- Home feed with topic filtering.
- Search tab with topic filtering and sanitized results.
- Post composer with anonymous or handle-based posting.
- Post detail with comments, votes, helpful marks, saves, reporting, and blocking.
- Inbox tab for replies and positive post reactions.
- Me tab with saved posts and authored posts.
- Author controls to mark a post `resolved` or reopen it.
- Staff-only moderation tab with report review actions.
- Suspended and banned accounts now stop at a dedicated account-status gate instead of entering the main app shell.
- An in-app Trust Center now explains privacy, moderation, reporting, and remaining launch-trust blockers in plain English.
- An in-app Policies and Support screen now exposes policy links, support contact, and draft Google Play listing copy from shared release metadata.
- Android smoke testing in Expo Go exposed a runtime compatibility bug in `lib/format/relative-time.ts`, and the formatter now falls back safely when `Intl.RelativeTimeFormat` is unavailable.
- A local `npm run backend:preflight` command now checks whether backend setup is ready before we try real Supabase auth and data.
- A local `npm run launch:seed` command plus launch content pack now prepare realistic starter posts and comments once the real seed accounts exist.
- A local `npm run release:preflight` command plus `eas.json` now check whether the repo itself is locally prepared for preview-build and app-store upload work.
- The native Android package is now set to `com.moonlithe.sideroom`.
- Dedicated runbooks now exist for real-device smoke testing and preview-build execution once the live backend is ready.
- A dedicated Google Play submission checklist now exists so Android launch operations have a concrete final-mile checklist.
- The Android-only cleanup now also removes leftover iOS runtime branches and the unused `expo-symbols` dependency from the codebase.
- Policy links, support contact, and Google Play draft copy now live in a shared metadata file and an in-app Policies and Support screen.
- A local `npm run handoff:docx` command now regenerates the latest dated Word handoff from the newest `PROJECT_HANDOFF_*.md` file.

### Security and privacy protections implemented

- Encrypted local session storage.
- Secure-store helper layer for device-protected values.
- Screenshot blocking where supported.
- Biometric relock when the device supports strong biometrics.
- Supabase row-level security on the core data model.
- Sanitized RPCs for public/mobile reads instead of broad raw-table reads.
- Protected report, block, moderation, notification, and personal-activity RPCs.

### Important reality check

- The app still depends on a live Supabase project that has not been set up or validated end to end in this workspace.
- Local verification is clean, but several important behaviors still need runtime validation with real accounts and real data.

## App Structure

### Routes

- `app/_layout.tsx`
  - Root auth/security gate, auth redirect completion state, account-status gate, and stack setup.
- `app/auth/callback.tsx`
  - Dedicated screen shown while secure sign-in redirects complete.
- `app/modal.tsx`
  - Safety/disclaimer modal.
- `app/policies.tsx`
  - Policies and Support screen for legal links, support contact, and Google Play copy.
- `app/trust.tsx`
  - Trust Center with privacy, moderation, reporting, and launch-readiness context.
- `app/(tabs)/_layout.tsx`
  - Tab shell for Home, Search, Ask, Inbox, Me, and the staff-only Mod tab.
- `app/(tabs)/index.tsx`
  - Home feed.
- `app/(tabs)/search.tsx`
  - Search.
- `app/(tabs)/create.tsx`
  - Post composer.
- `app/(tabs)/inbox.tsx`
  - Notifications/inbox.
- `app/(tabs)/moderation.tsx`
  - Staff-only moderation queue.
- `app/(tabs)/explore.tsx`
  - Me tab with account, saved posts, and authored posts.
- `app/post/[id].tsx`
  - Post detail, safety tools, owner resolution controls, comments.

### Core client libraries

- `lib/supabase/client.ts`
  - Typed Supabase client bootstrap.
- `lib/supabase/auth-storage.ts`
  - Encrypted auth-session persistence.
- `lib/security/secure-store.ts`
  - Device-protected storage helpers.
- `lib/community/api.ts`
  - Feed/search/post/comment/save/vote/helpful/report/block/personal-activity/status RPC wrappers.
- `lib/notifications/api.ts`
  - Inbox RPC wrappers.
- `lib/moderation/api.ts`
  - Staff moderation queue/action RPC wrappers.
- `lib/format/relative-time.ts`
  - Shared relative-time formatting.

### Key supporting components

- `components/auth/*`
  - Missing-config, auth, account-status, onboarding, and auth-provider state.
- `components/security/*`
  - App security provider and gate.
- `components/community/*`
  - Post and comment presentation.
- `components/notifications/notification-card.tsx`
  - Inbox item card.
- `components/moderation/moderation-report-card.tsx`
  - Staff moderation queue card.

## Supabase Schema and Migrations

Apply these migrations in order:

1. `supabase/migrations/20260323_000001_initial_schema.sql`
   - Core tables, onboarding RPC, RLS, seeded topics.
2. `supabase/migrations/20260323_000002_public_queries.sql`
   - Sanitized public/mobile community RPCs and supporting indexes.
3. `supabase/migrations/20260323_000003_search_and_safety.sql`
   - Search, report, and block RPCs with blocked-user filtering.
4. `supabase/migrations/20260323_000004_notifications.sql`
   - Notification triggers plus inbox/read-state RPCs.
5. `supabase/migrations/20260323_000005_moderation_tools.sql`
   - Staff moderation queue and protected resolve actions with audit-log writes.
6. `supabase/migrations/20260323_000006_personal_activity.sql`
   - Saved-post and authored-post activity RPCs for the Me tab.
7. `supabase/migrations/20260323_000007_post_resolution.sql`
   - Author-controlled post resolution and server-enforced locked-post reply protection.

## Auth and Environment

### Environment variables required

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use `.env.example` as the template.

### Launch metadata source of truth

- `config/release-metadata.json`

### Native release identifier

- Android package name: `com.moonlithe.sideroom`

### Local run and verification commands

Use these first when resuming:

- `npm install`
- `npm run backend:preflight`
- `npm run release:preflight`
- `npm run backend:bundle`
- `npm run handoff:docx`
- `npm run launch:seed`
- `npx tsc --noEmit`
- `npm run lint`
- `npx expo start`

### Auth redirect

Add this redirect URI in Supabase auth settings:

- `sideroom://auth/callback`

### Auth status

- Email magic-link auth is implemented.
- Google auth is implemented in the mobile client and still needs live Supabase provider configuration plus runtime validation.

## What Has Been Verified Locally

These commands passed at the end of the last working session:

- `npx tsc --noEmit`
- `npm run lint`
- `npm audit --json`

`npm audit --json` reported `0` vulnerabilities.

Additional smoke-test validation completed on 2026-03-24:

- A live Android emulator / Expo Go smoke pass reached the real app bundle and exposed a runtime crash caused by missing `Intl.RelativeTimeFormat` support.
- That crash was fixed by adding a safe formatter fallback in `lib/format/relative-time.ts`.

Additional local release-readiness validation completed on 2026-03-24:

- `npm run release:preflight` now exists and is expected to flag the current local blockers honestly before preview and production build work begins.
- As of this handoff, the expected red items are still missing real Supabase env values plus placeholder support, privacy-policy, and terms metadata in `config/release-metadata.json`.
- The placeholder marketing URL in `config/release-metadata.json` is still only a warning, not a release-preflight failure.
- `supabase/bootstrap/seed-authors.json` and generated seed SQL are still launch-content warnings rather than repo-breaking failures.
- `npm run handoff:docx` now regenerates the latest dated handoff `.docx` from the newest markdown handoff file.

## What Has Not Been Verified Yet

- Live Supabase project creation and migration application.
- Real auth redirects against Supabase.
- A full clean first-screen render in Expo Go without offline manifest-signing limitations in this environment.
- Device/runtime validation of biometrics and screenshot blocking.
- End-to-end notification generation using multiple real accounts.
- End-to-end moderation actions using moderator/admin accounts.
- End-to-end validation of saved posts, authored-post history, and author resolution flows against live data.
- Release builds on Android.

## Security Posture Right Now

### Already in place

- Secure local storage for auth/session material.
- Client privacy protections at the OS/app level.
- Client-side auth redirect handling with a dedicated completion state.
- RLS-backed schema.
- Protected RPCs for all core community surfaces added so far.
- Moderation audit-log writes through `public.moderation_actions`.
- Suspended and banned accounts are blocked explicitly in the client shell as well as by backend readiness checks.

### Still missing before handling real personal data at scale

- Live verification of all RLS and auth behavior.
- MFA and stronger least-privilege controls for staff/admin accounts.
- Redacted crash reporting and analytics.
- Private storage buckets and signed-access upload strategy, if uploads are added.
- Incident-response playbook and operational account-recovery path.
- Encrypted backup and retention/deletion policy implementation.

## Product Gaps Still Open

- Live Google auth validation against the real Supabase project.
- Seeded launch content across all topics.
- Preview and production release builds through EAS.
- Placeholder support, privacy-policy, terms, and marketing values still need to be replaced in `config/release-metadata.json`.
- Beta-tested moderation operations and harmful-content drills.
- Final brand, marketing site, legal docs, and app-store materials.
- Real-world trust and retention validation with beta users.

## Launch-Readiness Definition

The source of truth for "ready to upload to the app stores" is `docs/launch-readiness-plan.md`.

At a high level, SideRoom is ready for store submission only when all of these are true:

- The MVP loop works end to end on Android.
- The UI feels polished, consistent, and trustworthy rather than prototype-like.
- Security, moderation, privacy, and legal requirements for personal information are in place and tested.
- Closed-beta users can complete the core loop and report that the app feels safe and useful.
- Store assets, disclosures, support contact, and release builds are ready.

Current recommendation as of 2026-03-24:

- Do not treat engineering as finished yet.
- Start launch, legal, content, and monetization prep in parallel now.
- Shift mostly out of feature work only after live validation, seeded content, auth expansion, and beta quality gates are met.

## Recommended Next-Step Order

1. Create the live Supabase project and apply all seven migrations.
2. Add the real env vars locally and validate the auth callback flow.
3. Test the full community loop with multiple accounts:
   - onboarding
   - email sign-in
   - Google sign-in
   - create post
   - comment
   - vote/helpful/save
   - search
   - report/block
   - inbox
   - moderation
   - saved posts / my posts
   - resolve / reopen post
4. Seed strong launch content so first-time users do not hit an empty app.
5. Add the real env values locally, rerun `npm run release:preflight`, and clear the remaining repo-side blockers.
6. Use `docs/preview-build-runbook.md` to generate Android preview builds with the current `com.moonlithe.sideroom` package name.
7. Use `docs/device-smoke-checklist.md` to test auth, onboarding, posting, moderation, inbox, restrictions, trust surfaces, and the Policies and Support screen on real devices.
8. Replace the placeholder support, privacy-policy, terms, and marketing values in `config/release-metadata.json`.
9. Use `docs/google-play-submission-checklist.md` to prepare listing, policy, and testing-track requirements before public release.
10. Verify Google auth end to end on real Android devices after enabling the provider in Supabase.
11. Tighten staff security with MFA, least-privilege rules, and redacted operational logging.
12. Run a closed beta before any public store submission.

## First Session Back Checklist

If I were picking this up fresh, I would do the following in order:

1. Read `docs/project-status.md`, `docs/security-baseline.md`, `docs/supabase-setup.md`, and `docs/launch-readiness-plan.md`.
2. Confirm `.env` is populated with the real Supabase URL and publishable key.
3. Create or inspect the Supabase project and verify all seven migrations are applied in order.
4. Run `npx tsc --noEmit` and `npm run lint`, then boot the app with `npx expo start`.
5. Run `npm run release:preflight` and resolve the red local release blockers it reports.
6. Read `docs/preview-build-runbook.md` and `docs/device-smoke-checklist.md` before starting real-device validation.
7. Enable Google in Supabase auth providers, then test the full flow with multiple accounts and at least one staff account before building more features.

For the easiest fresh database setup, generate and use `supabase/bootstrap/full-setup.sql` instead
of manually copying seven separate files.

For the easiest launch-content setup after the backend is live, use
`data/launch-seed/seed-content.json`, fill `supabase/bootstrap/seed-authors.json`, and run
`npm run launch:seed`.

## Operational Notes For Pickup

- If a feature appears implemented but "does not work," the first thing to check is almost certainly missing Supabase env/config or unapplied migrations.
- The current architecture intentionally prefers RPCs over broad direct table reads because anonymous identity and moderation safety are core product constraints.
- The Me tab, inbox, and moderation surfaces all depend on backend state that still needs live validation with real users and roles.
- The current Android package is `com.moonlithe.sideroom`; only change it if brand or legal review forces it before Google Play submission.
- The staff moderation tab is hidden for non-staff users in the tab layout and still guards access in the screen itself.
- Removed posts are intentionally not openable through the normal post-detail route.
- If the handoff needs to be refreshed after doc updates, run `npm run handoff:docx` to rebuild the newest dated Word handoff from the newest dated markdown handoff.

## Docs To Read First On Resume

- `docs/project-status.md`
- `docs/security-baseline.md`
- `docs/supabase-setup.md`
- `docs/launch-readiness-plan.md`
- `docs/launch-seed-content.md`
- `docs/release-preflight.md`
- `docs/preview-build-runbook.md`
- `docs/device-smoke-checklist.md`
- `docs/google-play-submission-checklist.md`
- `config/release-metadata.json`

## Handoff Bottom Line

This repository is no longer a starter shell. It is a serious MVP foundation with a coherent security model, core community loop, moderation path, and a clear next execution order. The next person should start with live Supabase setup and end-to-end validation, not by redesigning the product or rebuilding the current app structure.
