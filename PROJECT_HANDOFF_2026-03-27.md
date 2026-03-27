# SideRoom Project Handoff

Date: 2026-03-27
Workspace: `C:\Users\moonl\sideroom`

## Executive Summary

SideRoom is still a serious Android-first MVP foundation, not a starter shell. The core community product loop remains implemented: secure auth shell, onboarding, feed, search, post composer, post detail, comments, reactions, saves, reporting, blocking, inbox, moderation, personal activity, and author-controlled thread resolution.

The most important work completed on 2026-03-27 was not feature work. It was engineering hardening:

- the Expo and React Native toolchain was upgraded to the Expo 55 line
- dependency security issues were remediated until `npm audit --json` returned `0` vulnerabilities
- a real native Android debug build was created and installed on the emulator
- the app was smoke-tested in that native Android environment
- the app launched successfully and rendered the expected missing-backend setup gate instead of crashing
- the workspace was then cleaned back to the managed / no-local-native-folder state so GitHub and `expo-doctor` stay clean
- the local repo is now connected to GitHub at `https://github.com/moonlithe1983/sideroom`

The product is still not launch-ready. The biggest remaining blockers are still live Supabase setup and validation, seeded launch content, live Google auth enablement and testing, stronger staff-security controls, and beta / Google Play readiness work.

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
- An in-app Trust Center explains privacy, moderation, reporting, and remaining launch-trust blockers in plain English.
- An in-app Policies and Support screen exposes policy links, support contact, and draft Google Play listing copy from shared release metadata.

### Engineering and tooling work completed on 2026-03-27

- Upgraded the app from the older Expo 54 line to:
  - `expo` `55.0.8`
  - `react-native` `0.83.2`
  - `react` / `react-dom` `19.2.0`
- Updated Expo-compatible package versions in `package.json`.
- Added dependency overrides for patched `minimatch` and `brace-expansion` so the dependency audit is clean.
- Removed now-invalid Expo config fields from `app.json` that `expo-doctor` rejected after the SDK upgrade.
- Normalized the app color-scheme hook so the React Native 0.83 `ColorSchemeName` typing change does not break compilation.
- Performed a native Android emulator smoke test using `expo run:android`.
- Generated a local native `android/` folder and a native debug APK as part of that smoke test.
- Removed the generated local `android/` and `.expo/` folders afterward so the tracked repo stays in a clean managed state.
- Initialized the local Git repository, connected `origin`, and pushed `main` to GitHub.

### Security and privacy protections implemented

- Encrypted local session storage.
- Secure-store helper layer for device-protected values.
- Screenshot blocking where supported.
- Biometric relock when the device supports strong biometrics.
- Supabase row-level security on the core data model.
- Sanitized RPCs for public/mobile reads instead of broad raw-table reads.
- Protected report, block, moderation, notification, and personal-activity RPCs.
- Dependency hardening completed until `npm audit --json` reported `0` vulnerabilities.

### Important reality check

- The app still depends on a live Supabase project that has not been set up or validated end to end in this workspace.
- There is still no local `.env` or `.env.local` with real backend values.
- The native Android smoke pass proved the app boots cleanly into the missing-config gate.
- The native Android smoke pass did **not** validate real auth, onboarding, feed data, moderation data, or Google sign-in because the live backend is still missing.

## App Structure

### Routes

- `app/_layout.tsx`
  - Root auth/security gate, auth redirect completion state, account-status gate, and stack setup.
- `app/auth/callback.tsx`
  - Dedicated screen shown while secure sign-in redirects complete.
- `app/modal.tsx`
  - Safety / disclaimer modal.
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
  - Notifications / inbox.
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
  - Feed / search / post / comment / save / vote / helpful / report / block / personal-activity / status RPC wrappers.
- `lib/notifications/api.ts`
  - Inbox RPC wrappers.
- `lib/moderation/api.ts`
  - Staff moderation queue / action RPC wrappers.
- `lib/format/relative-time.ts`
  - Shared relative-time formatting.
- `hooks/use-color-scheme.ts`
  - Now normalizes the returned scheme to `'light' | 'dark'` after the React Native 0.83 upgrade.
- `hooks/use-color-scheme.web.ts`
  - Same normalization for web / hydration-safe behavior.

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

For the easiest fresh database setup, use:

- `supabase/bootstrap/full-setup.sql`

## Auth and Environment

### Environment variables required

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use `.env.example` as the template.

### Launch metadata source of truth

- `config/release-metadata.json`

### Native release identifier

- Android package name: `com.moonlithe.sideroom`

### Auth redirect

Add this redirect URI in Supabase auth settings:

- `sideroom://auth/callback`

### Auth status

- Email magic-link auth is implemented.
- Google auth is implemented in the mobile client and still needs live Supabase provider configuration plus runtime validation.

## Native Android and Tooling State

### Current package / framework state

At the time of this handoff, the important versions are:

- `expo` `55.0.8`
- `react-native` `0.83.2`
- `react` `19.2.0`
- `react-dom` `19.2.0`
- `eslint-config-expo` `~55.0.0`

### Native Android smoke-test notes

The 2026-03-27 emulator smoke pass used:

- Android emulator AVD: `Medium_Phone_API_36.1`
- command path: `npx expo run:android`
- local JDK path required for this machine:
  - `C:\Program Files\Android\Android Studio\jbr`

Important local detail:

- `expo run:android` created a local `android/` folder in this workspace.
- That folder was intentionally removed after the smoke pass.
- The workspace is currently back in the managed / no-local-native-folder state.
- If native local debugging is needed again, rerun `npx expo run:android` and expect Expo to recreate `android/` locally.

Artifacts created by the smoke pass:

- native debug APK:
  - `android/app/build/outputs/apk/debug/app-debug.apk`

That APK path is only available immediately after a local native build. It is not retained in the
current cleaned workspace.

### Expo Doctor state on 2026-03-27

`npx expo-doctor` now passes cleanly:

- `17/17` checks passed

Why this changed:

- the workspace now has a real `.git` directory
- the local `.expo/` cache folder was removed
- the generated local `android/` folder was removed after the native smoke pass

## Local Run and Verification Commands

Use these first when resuming:

- `npm install`
- `npm run backend:preflight`
- `npm run release:preflight`
- `npm run backend:bundle`
- `npm run handoff:docx`
- `npm run launch:seed`
- `npx tsc --noEmit`
- `npm run lint`
- `npm audit --json`
- `npx expo-doctor`
- `npx expo start`

For local native Android debug work in this workspace:

- set `JAVA_HOME` to `C:\Program Files\Android\Android Studio\jbr`
- then run `npx expo run:android`

## What Has Been Verified Locally

These commands passed on 2026-03-27:

- `npx tsc --noEmit`
- `npm run lint`
- `npm audit --json`
- `npx expo-doctor`

`npm audit --json` reported:

- `0` vulnerabilities

`npx expo-doctor` reported:

- `17/17` checks passed

Backend / release preflights still report the expected setup blockers rather than unexpected regressions:

- `npm run backend:preflight`
- `npm run release:preflight`

As of this handoff, the red local blockers are still:

- no `.env` or `.env.local`
- missing `EXPO_PUBLIC_SUPABASE_URL`
- missing `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- placeholder support email in `config/release-metadata.json`
- placeholder support URL in `config/release-metadata.json`
- placeholder privacy policy URL in `config/release-metadata.json`
- placeholder terms URL in `config/release-metadata.json`

The remaining release warnings are still:

- placeholder marketing URL in `config/release-metadata.json`
- missing `supabase/bootstrap/seed-authors.json`
- launch-content SQL is still template-only

Additional smoke-test validation completed on 2026-03-27:

- A real native Android debug build was produced and installed on the emulator.
- The installed app package was confirmed as `com.moonlithe.sideroom`.
- The app launched successfully.
- `MainActivity` resumed cleanly without a crash.
- A UI dump confirmed that the app rendered the expected missing-backend screen with:
  - `Supabase setup required`
  - `MISSING ENVIRONMENT`
  - the missing variable names
- No additional runtime code fix was required during this smoke pass.

## What Has Not Been Verified Yet

- Live Supabase project creation and migration application.
- Real auth redirects against Supabase.
- Real email sign-in against the live backend.
- Real Google sign-in against the live backend.
- End-to-end onboarding against live data.
- End-to-end notification generation using multiple real accounts.
- End-to-end moderation actions using moderator / admin accounts.
- End-to-end validation of saved posts, authored-post history, and author resolution flows against live data.
- EAS preview builds on Android.
- EAS production builds on Android.
- Real-device validation of biometrics and screenshot blocking after the Expo 55 toolchain upgrade.

## Security Posture Right Now

### Already in place

- Secure local storage for auth / session material.
- Client privacy protections at the OS / app level.
- Client-side auth redirect handling with a dedicated completion state.
- RLS-backed schema.
- Protected RPCs for all core community surfaces added so far.
- Moderation audit-log writes through `public.moderation_actions`.
- Suspended and banned accounts are blocked explicitly in the client shell as well as by backend readiness checks.
- The current dependency tree is locally hardened and `npm audit --json` is clean.

### Still missing before handling real personal data at scale

- Live verification of all RLS and auth behavior.
- MFA and stronger least-privilege controls for staff / admin accounts.
- Redacted crash reporting and analytics.
- Private storage buckets and signed-access upload strategy, if uploads are added.
- Incident-response playbook and operational account-recovery path.
- Encrypted backup and retention / deletion policy implementation.

## Product Gaps Still Open

- Live Google auth validation against the real Supabase project.
- Seeded launch content across all topics.
- Preview and production release builds through EAS.
- Placeholder support, privacy-policy, terms, and marketing values still need to be replaced in `config/release-metadata.json`.
- Beta-tested moderation operations and harmful-content drills.
- Final brand, marketing site, legal docs, and app-store materials.
- Real-world trust and retention validation with beta users.

## Launch-Readiness Definition

The source of truth for "ready to upload to the app stores" is:

- `docs/launch-readiness-plan.md`

At a high level, SideRoom is ready for store submission only when all of these are true:

- The MVP loop works end to end on Android.
- The UI feels polished, consistent, and trustworthy rather than prototype-like.
- Security, moderation, privacy, and legal requirements for personal information are in place and tested.
- Closed-beta users can complete the core loop and report that the app feels safe and useful.
- Store assets, disclosures, support contact, and release builds are ready.

Current recommendation as of 2026-03-27:

- Do not treat engineering as finished yet.
- Start launch, legal, content, and monetization prep in parallel now.
- Shift mostly out of feature work only after live validation, seeded content, auth expansion, and beta quality gates are met.

## Recommended Next-Step Order

1. Create the live Supabase project and apply all seven migrations.
2. Add the real env vars locally and validate the auth callback flow.
3. Enable Google in Supabase auth providers and keep `sideroom://auth/callback` configured.
4. Test the full community loop with multiple accounts:
   - onboarding
   - email sign-in
   - Google sign-in
   - create post
   - comment
   - vote / helpful / save
   - search
   - report / block
   - inbox
   - moderation
   - saved posts / my posts
   - resolve / reopen post
5. Seed strong launch content so first-time users do not hit an empty app.
6. Add the real env values locally, rerun `npm run release:preflight`, and clear the remaining repo-side blockers.
7. Use `docs/preview-build-runbook.md` to generate Android preview builds with the current `com.moonlithe.sideroom` package name.
8. Use `docs/device-smoke-checklist.md` to test auth, onboarding, posting, moderation, inbox, restrictions, trust surfaces, and the Policies and Support screen on real devices.
9. Replace the placeholder support, privacy-policy, terms, and marketing values in `config/release-metadata.json`.
10. Use `docs/google-play-submission-checklist.md` to prepare listing, policy, and testing-track requirements before public release.
11. Tighten staff security with MFA, least-privilege rules, and redacted operational logging.
12. Run a closed beta before any public store submission.

## First Session Back Checklist

If I were picking this up fresh, I would do the following in order:

1. Read:
   - `docs/project-status.md`
   - `docs/security-baseline.md`
   - `docs/supabase-setup.md`
   - `docs/launch-readiness-plan.md`
2. Assume the workspace should stay in the no-local-native-folder managed workflow unless you intentionally need a fresh native debug build.
3. Confirm `.env` is populated with the real Supabase URL and publishable key.
4. Create or inspect the Supabase project and verify all seven migrations are applied in order.
5. Run:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm audit --json`
   - `npm run release:preflight`
6. If continuing native Android local work, set:
   - `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`
7. Read:
   - `docs/preview-build-runbook.md`
   - `docs/device-smoke-checklist.md`
8. Enable Google in Supabase auth providers, then test the full flow with multiple accounts and at least one staff account before building more features.

For the easiest fresh database setup, generate and use `supabase/bootstrap/full-setup.sql` instead
of manually copying seven separate files.

For the easiest launch-content setup after the backend is live, use
`data/launch-seed/seed-content.json`, fill `supabase/bootstrap/seed-authors.json`, and run
`npm run launch:seed`.

## Operational Notes For Pickup

- If a feature appears implemented but "does not work," the first thing to check is almost certainly missing Supabase env / config or unapplied migrations.
- The current architecture intentionally prefers RPCs over broad direct table reads because anonymous identity and moderation safety are core product constraints.
- The Me tab, inbox, and moderation surfaces all depend on backend state that still needs live validation with real users and roles.
- The current Android package is `com.moonlithe.sideroom`; only change it if brand or legal review forces it before Google Play submission.
- The staff moderation tab is hidden for non-staff users in the tab layout and still guards access in the screen itself.
- Removed posts are intentionally not openable through the normal post-detail route.
- The repo is now connected to GitHub at `https://github.com/moonlithe1983/sideroom`.
- The local `android/` folder does **not** currently exist because it was removed after the native smoke test cleanup.
- If you recreate `android/` with `npx expo run:android`, keep it out of Git and remove it again when you are done if you want the repo to stay in the clean managed state.
- The native smoke test proved the missing-config gate is working correctly, so the next meaningful smoke test should happen **after** real Supabase env values are provided.
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

This repository is still a serious MVP foundation with a coherent security model, core community loop, moderation path, and a clear next execution order.

The most important changes from the last handoff are:

- the dependency tree is now locally hardened and audit-clean
- the Expo / React Native stack is now on the Expo 55 line
- the app has passed a real native Android emulator smoke boot into the missing-config gate
- the workspace has been cleaned back to the managed / GitHub-friendly state and `expo-doctor` now passes cleanly
- the live backend is still not connected

The next person should start with live Supabase setup and end-to-end validation, not by redesigning the product or rebuilding the current app structure.
