# SideRoom Google Play Submission Checklist

## Purpose

Use this checklist when the Android build is stable and we are preparing for Google Play testing or
public release.

This is the last-mile operational list for shipping, not for feature development.

## Store Account

- Google Play Console account is active.
- Organization, tax, and payments details are complete if monetization is planned.
- The app name is cleared for brand and legal risk.

## App Listing

- Repo source of truth: `config/release-metadata.json`
- In-app source of truth: `app/policies.tsx` should reflect that same metadata without drift.
- Final app title is chosen.
- Short description is written.
- Full description is written.
- Feature graphic is ready if used.
- App icon matches the shipped build.
- Phone screenshots reflect the real current app, not mockups.
- Category and tags are chosen conservatively.

## Policy And Trust

- Repo source of truth: `config/release-metadata.json`
- The Policies and Support screen shows the same live links and contact paths as the store listing.
- Privacy policy URL is live.
- Support email or support URL is live.
- Data safety form is filled out from the real implementation.
- Content rating questionnaire is answered conservatively.
- Account deletion/support flow is documented if required by the final implementation.
- The Trust Center and in-app safety language match the store description and policy claims.

## Release Quality

- `npm run release:preflight` has no red repo blockers except accepted external items.
- The latest Android preview build passed `docs/device-smoke-checklist.md`.
- No known P0 or P1 issues remain.
- Google sign-in works on real Android devices.
- Moderation, block, report, inbox, and restricted-account flows work on real Android devices.
- Seed content or equivalent real content prevents the app from feeling empty on first launch.

## Google Play Testing Track

- Internal or closed testing track is chosen first.
- Tester group is ready.
- Release notes are written clearly.
- A rollback plan exists if a bad build is discovered.

## Before Public Release

- Closed-beta feedback is reviewed.
- Crash rate and major UX issues are acceptable.
- Legal docs, support process, and moderation coverage are ready.
- Monetization, if any, has been tested and disclosed correctly.
- The team agrees the app is ready to be judged by strangers.

## Helpful Repo Commands

- `npm run release:preflight`
- `npm run backend:preflight`
- `npm run build:preview:android`
- `npm run build:production:android`
- `npm run submit:production:android`
