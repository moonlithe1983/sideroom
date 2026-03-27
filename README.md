# SideRoom

SideRoom is an Android-first Expo / React Native app for moderated peer discussion around questions people often avoid asking publicly. Members can post anonymously or with a handle, browse practical replies, save useful threads, report risky content, block harmful interactions, and use a staff moderation queue when they have elevated access.

## Current State

- The app is well beyond the Expo starter template.
- Core flows are implemented: auth shell, onboarding, home feed, search, composer, post detail, comments, saves, reactions, inbox, personal activity, reporting, blocking, moderation, trust surfaces, and policy/support screens.
- Security foundations are implemented: encrypted session persistence, secure storage helpers, screenshot blocking where supported, biometric relock, Supabase RLS-first backend design, and protected RPC-based data access.
- The repo is GitHub-ready and locally healthy:
  - `npx tsc --noEmit` passes
  - `npm run lint` passes
  - `npm audit --json` reports `0` vulnerabilities
  - `npx expo-doctor` passes `17/17`
- The app is still not launch-ready because the live backend is not configured in this workspace yet.

## What The App Does Right Now

- Email magic-link sign-in
- Google OAuth wiring through Supabase
- Handle creation and topic-based onboarding
- Topic-filtered home feed and search
- Anonymous or handle-based post creation
- Post detail with comments, saves, helpful reactions, reporting, and blocking
- Inbox for replies and positive reactions
- Me tab for saved posts and authored posts
- Author controls for `open` / `resolved` thread status
- Staff-only moderation queue with dismiss, remove, lock, suspend, and ban actions
- Trust Center plus Policies and Support screens

## What Still Blocks Real Release Work

- No local `.env` or `.env.local` with:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Live Supabase setup is still unverified.
- Google provider enablement still needs to be completed in Supabase.
- `config/release-metadata.json` still contains placeholder support, privacy-policy, terms, and marketing values.
- `supabase/bootstrap/seed-authors.json` still does not exist, so launch seed SQL remains template-only.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the local readiness checks:

   ```bash
   npm run backend:preflight
   npm run release:preflight
   npx tsc --noEmit
   npm run lint
   npm audit --json
   npx expo-doctor
   ```

3. Add the real backend config:

   - copy `.env.example` to `.env` or `.env.local`
   - replace the placeholder Supabase URL and publishable key

4. Start the app:

   ```bash
   npx expo start
   ```

Without real backend env values, the app should boot into the missing-config screen instead of crashing.

## Useful Scripts

- `npm run backend:preflight`
- `npm run release:preflight`
- `npm run backend:bundle`
- `npm run launch:seed`
- `npm run handoff:docx`
- `npm run build:preview:android`
- `npm run build:production:android`
- `npm run submit:production:android`

## Key Docs

- `PROJECT_HANDOFF_2026-03-27.md`
- `docs/project-status.md`
- `docs/security-baseline.md`
- `docs/supabase-setup.md`
- `docs/launch-readiness-plan.md`
- `docs/release-preflight.md`
- `docs/preview-build-runbook.md`
- `docs/device-smoke-checklist.md`
- `docs/google-play-submission-checklist.md`

## Native Build Note

This repo currently stays in the managed / no-local-native-folder state for GitHub cleanliness. If you run `npx expo run:android`, Expo will recreate a local `android/` folder for native debugging. Keep that folder out of Git and remove it again after local native work if you want `expo-doctor` and repo hygiene to stay clean.
