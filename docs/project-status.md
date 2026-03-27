# SideRoom Project Status

## Snapshot As Of 2026-03-27

SideRoom is no longer a starter scaffold. The repository now contains a real Android-first MVP foundation with the core community loop, moderation path, security shell, Supabase integration layer, launch runbooks, and release preflight tooling in place.

The current GitHub-ready repo state is:

- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm audit --json` reports `0` vulnerabilities
- `npx expo-doctor` passes `17/17`
- the app boots into the missing-config gate when backend env values are absent

## What Is Implemented

- Secure auth shell with encrypted session persistence
- Email magic-link sign-in
- Google OAuth client wiring through Supabase
- Dedicated auth callback completion state
- Onboarding with handle creation and topic selection
- Home feed with topic filtering
- Search with sanitized results
- Post composer with anonymous or handle-based identity mode
- Post detail with comments, helpful reactions, saves, reports, and blocking
- Inbox for replies and positive post reactions
- Me tab with saved posts and authored posts
- Author controls for `open` and `resolved` thread status
- Staff moderation queue with dismiss, remove, lock, suspend, and ban actions
- Trust Center plus Policies and Support screens

## Security And Reliability Work Already Done

- Device-backed secure storage helpers
- Encrypted Supabase session persistence
- Screenshot blocking where supported
- Biometric relock where strong biometrics are enrolled
- Supabase row-level security across the core schema
- RPC-first community reads and actions instead of broad raw-table access
- Moderation audit-log writes
- Dependency hardening until `npm audit --json` returned `0` vulnerabilities
- Expo 55 / React Native 0.83 upgrade with type and config fixes
- Native Android smoke boot completed earlier, then local generated folders were removed so the repo stays clean

## What Is Still Blocking Launch

- No live Supabase project has been validated end to end from this workspace yet.
- No local `.env` or `.env.local` exists with the real Supabase URL and publishable key.
- Google still needs to be enabled and tested in the live Supabase project.
- `config/release-metadata.json` still has placeholder support, privacy-policy, terms, and marketing values.
- `supabase/bootstrap/seed-authors.json` is still missing, so launch seed SQL remains template-only.
- Closed-beta trust validation, real-device preview builds, and Google Play operational work are still open.

## Recommended Next Order

1. Create the live Supabase project and apply all seven migrations.
2. Add the real env values locally and rerun `npm run backend:preflight`.
3. Enable Google in Supabase and validate both auth methods end to end.
4. Test the full multi-account loop: onboarding, posting, comments, inbox, moderation, saved posts, and post resolution.
5. Replace placeholder release metadata values and rerun `npm run release:preflight`.
6. Seed launch content with real seed accounts.
7. Generate preview Android builds and run the device smoke checklist before any wider beta.

## Repo Readiness Bottom Line

The repository is now in a good GitHub state: the codebase, docs, validation commands, and handoff are aligned with current behavior, and no generated local Expo or native folders are being kept in source control. The product itself still needs live backend setup and release operations before it can be treated as beta-ready or store-ready.
