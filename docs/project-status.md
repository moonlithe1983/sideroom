# SideRoom Project Status

## Snapshot As Of 2026-04-14

SideRoom is no longer a starter scaffold. The repository now contains a real Android-first MVP foundation with the core community loop, moderation path, security shell, Supabase integration layer, universal-design baseline, launch runbooks, and release preflight tooling in place.

The current GitHub-ready repo state is:

- `npm run typecheck` passes
- `npm run lint` passes
- `npm run audit:check` reports `0` vulnerabilities
- `npm run doctor` passes `17/17`
- the app boots into the missing-config gate when backend env values are absent
- GitHub Actions workflows now cover validation and dependency review on pull requests
- release preflight still reports only the expected external blockers instead of pretending the app is upload-ready

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
- Self-serve account deletion path for non-staff accounts
- Public account-deletion request path placeholder surfaced in Policies and Support
- Author controls for `open` and `resolved` thread status
- Staff moderation queue with dismiss, remove, lock, suspend, and ban actions
- Trust Center plus Policies and Support screens
- Shared accessibility hardening for labels, state messaging, announcements, focus treatment, and larger touch targets across core flows

## Security And Reliability Work Already Done

- Device-backed secure storage helpers
- Encrypted Supabase session persistence
- Screenshot blocking where supported
- Biometric relock where strong biometrics are enrolled
- Supabase row-level security across the core schema
- RPC-first community reads and actions instead of broad raw-table access
- Moderation audit-log writes
- Dependency hardening until the local audit returned `0` vulnerabilities
- Expo 55 / React Native 0.83 upgrade with current patch-alignment fixes
- Native Android smoke boot completed successfully, and any generated local `android/` folder stays ignored by Git for local debugging
- GitHub Actions validation and dependency-review workflows were added for pull requests
- Accessibility audit, universal-design baseline, accessibility checklist, moderation drills, account-deletion flow, and closed-beta readiness docs were added to the repo

## What Is Still Blocking Launch

- No live Supabase project has been validated end to end from this workspace yet.
- No local `.env` or `.env.local` exists with the real Supabase URL and publishable key.
- The recommended environment split is still only a plan right now: preview/staging and production Supabase projects should be separated before real users arrive.
- Google still needs to be enabled and tested in the live Supabase project.
- `config/release-metadata.json` still has placeholder support, privacy-policy, terms, account-deletion, and marketing values.
- `supabase/bootstrap/seed-authors.json` is still missing, so launch seed SQL remains template-only.
- Accessibility pass completion, real-device preview-build smoke completion, closed-beta trust validation, and Google Play operational work are still open.

## Recommended Next Order

1. Create the live Supabase project and apply all eight migrations.
2. Add the real env values locally and rerun `npm run backend:preflight`.
3. Enable Google in Supabase and validate both auth methods end to end.
4. Test the full multi-account loop: onboarding, posting, comments, inbox, moderation, saved posts, and post resolution.
5. Replace placeholder release metadata values and rerun `npm run release:preflight`.
6. Seed launch content with real seed accounts.
7. Generate preview Android builds and run the device smoke checklist before any wider beta.

## Repo Readiness Bottom Line

The repository is now in a good GitHub state: the codebase, docs, validation commands, and handoff are aligned with current behavior, and no generated local Expo or native folders are being kept in source control. The product itself still needs live backend setup and release operations before it can be treated as beta-ready or store-ready.
