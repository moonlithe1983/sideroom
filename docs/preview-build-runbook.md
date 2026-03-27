# SideRoom Preview Build Runbook

## Purpose

This runbook is the practical path from "repo looks ready" to "real Android phones have a testable build."

Use it after the backend is live and before public app-store submission.

## What Counts As A Preview Build

A preview build is a distributable Android app build for internal testing or closed beta.

It is not the public launch build yet.

## Preconditions

Before building anything:

1. Run `npm run release:preflight`.
2. Resolve all red blockers from that command.
3. Confirm the real Supabase env values are present locally.
4. Confirm the preview/staging Supabase project is live and all migrations are applied.
5. Confirm the Google auth provider is enabled.
6. Confirm the native identifiers in `app.json` are still correct:
   - `com.moonlithe.sideroom` for Android

## Build Profiles

The repo already contains these EAS profiles in `eas.json`:

- `development`
- `preview`
- `production`

For the next step, use `preview`.

## Suggested Command Order

1. `npm install`
2. `npm run release:preflight`
3. `npm run typecheck`
4. `npm run lint`
5. `npm run audit:check`
6. `npm run doctor`
7. `npm run build:preview:android`

## After The Build Finishes

1. Install the preview build on the target phone.
2. Confirm the app launches with the correct icon, name, and scheme behavior.
3. Run the full checklist in `docs/device-smoke-checklist.md`.
4. Log every issue by severity:
   - P0 = crash, privacy, auth, or data-loss blocker
   - P1 = core-loop blocker
   - P2 = important polish issue
   - P3 = nice-to-have improvement

## Preview Build Sign-Off

Do not call the preview build successful until all of these are true:

- sign-in works on real devices
- onboarding works on real devices
- posting, comments, search, saves, inbox, block, and moderation all work
- account deletion works for normal member accounts
- restricted accounts stop at the right screen
- the Trust Center and safety language feel clear and intentional
- no P0 or P1 issues remain

## When To Cut Another Preview Build

Cut another preview build when:

- auth behavior changes
- native configuration changes
- security behavior changes
- a bug fix affects the main community loop
- moderation behavior changes

Do not spam builds for tiny copy-only changes unless they affect trust or store review.

## When To Move Toward Production Builds

Only move to the `production` profile after:

- preview builds are stable
- closed-beta feedback is acceptable
- trust and moderation gaps are closed
- store assets and legal docs are ready
- release leadership agrees the app is ready to be judged by strangers

Before the actual Google Play submission step, use:

- `docs/google-play-submission-checklist.md`

## Native Debug Note

If you use `npx expo run:android` for local native smoke testing, Expo will recreate a local
`android/` folder. That is expected for native debugging, but it should stay out of Git and can be
removed again after the smoke pass if you want the repo to return to the clean managed state.
