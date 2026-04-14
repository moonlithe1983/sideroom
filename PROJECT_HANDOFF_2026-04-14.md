# SideRoom Project Handoff

Date: 2026-04-14
Workspace: `C:\Users\moonl\sideroom`

## Executive Summary

SideRoom is still an Android-first MVP foundation, not a starter shell. The core product loop remains implemented: secure auth shell, onboarding, feed, search, composer, post detail, comments, reactions, saves, reporting, blocking, inbox, moderation, personal activity, trust surfaces, and account-deletion handling for normal member accounts.

The most important work completed on 2026-04-14 was launch-hardening and GitHub-readiness work rather than new product breadth:

- accessibility and universal-design hardening was added across the core flows
- clearer setup, blocked-account, error, loading, empty, and recovery states were added
- screen-reader announcements were added for major async outcomes such as sign-in, onboarding, post creation, comment submission, report submission, account deletion, and moderation actions
- a universal-design baseline and launch/accessibility gap audit were added to the repo
- account-deletion documentation now includes a public web-request placeholder path in repo metadata and Policies and Support
- release preflight now checks for that account-deletion request path and warns when accessibility or real-device evidence is still pending
- the dependency audit was cleaned again and now reports `0` vulnerabilities
- Expo patch versions were refreshed so `npm run doctor` passes cleanly again

The product is still not launch-ready. The largest remaining blockers are still live Supabase setup and validation, real Google auth validation, real seed content, real support and legal URLs, real-device smoke completion, and closed-beta execution.

## Current Product State

### User-facing product flows implemented

- Auth shell with secure session persistence
- Email magic-link sign-in
- Google OAuth sign-in wired through Supabase
- Dedicated auth-callback completion screen for secure sign-in redirects
- Onboarding with handle creation and topic selection
- Home feed with topic filtering
- Search tab with topic filtering and sanitized results
- Post composer with anonymous or handle-based posting
- Post detail with comments, votes, helpful marks, saves, reporting, and blocking
- Inbox tab for replies and positive post reactions
- Me tab with saved posts and authored posts
- Self-serve account deletion for non-staff accounts from the Me tab
- Public account-deletion request path placeholder surfaced in Policies and Support
- Author controls to mark a post `resolved` or reopen it
- Staff-only moderation tab with report-review actions
- Suspended and banned accounts stop at a dedicated account-status gate instead of entering the main app shell
- Trust Center and Policies and Support surfaces are present in-app

### Engineering and repo hardening completed on 2026-04-14

- Added shared `FormField` and `StateMessage` components for clearer form labeling and async-state handling
- Added accessibility announcement helpers and reduced-motion handling for safety-scroll behavior
- Added stronger font scaling defaults, larger touch targets, clearer focus treatment, and more descriptive accessibility metadata across shared controls
- Hardened core screens so loading, error, empty, blocked, and success states are clearer and less dead-end
- Added launch docs for:
  - accessibility gap audit
  - universal-design baseline
  - accessibility checklist
  - accessibility pass evidence
  - account deletion flow
  - moderation drills
  - real-device smoke evidence
  - closed-beta readiness
- Added `accountDeletionRequestUrl` to `config/release-metadata.json`
- Tightened `scripts/release-preflight.js`
- Ran dependency remediation so:
  - `npm run audit:check` reports `0` vulnerabilities
  - `npm run doctor` reports `17/17` checks passed

## Accessibility And Universal-Design State

### Now implemented

- Visible labels and helper text for the main auth, onboarding, search, composer, comment, and report inputs
- Clearer state banners for loading, empty, warning, success, and error states
- More descriptive accessibility labels and hints for buttons, chips, cards, moderation actions, and policy links
- Screen-reader announcements for major async events
- Larger touch targets in shared controls
- Improved focus treatment in shared buttons, chips, and action surfaces
- Stronger typography defaults for smaller metadata and pill text
- Explicit anonymous-posting explanation that does not rely on color alone
- More informative missing-config and blocked-account screens

### Still needs real-device verification

- TalkBack traversal
- External keyboard or focus traversal where relevant
- Large-font behavior on real Android devices
- Reduced-motion behavior on real Android devices

## App Structure

### Routes

- `app/_layout.tsx`
  - Root auth, security, and setup gating
- `app/auth/callback.tsx`
  - Sign-in callback completion state
- `app/modal.tsx`
  - Safety and moderation-boundary modal
- `app/policies.tsx`
  - Policies, support, and deletion-request metadata surface
- `app/trust.tsx`
  - Trust Center
- `app/(tabs)/_layout.tsx`
  - Main tab shell
- `app/(tabs)/index.tsx`
  - Home feed
- `app/(tabs)/search.tsx`
  - Search
- `app/(tabs)/create.tsx`
  - Post composer
- `app/(tabs)/inbox.tsx`
  - Inbox
- `app/(tabs)/moderation.tsx`
  - Staff moderation queue
- `app/(tabs)/explore.tsx`
  - Me tab
- `app/post/[id].tsx`
  - Post detail, reporting, blocking, reply flow

### Shared accessibility-related additions

- `components/form-field.tsx`
- `components/state-message.tsx`
- `hooks/use-reduced-motion.ts`
- `lib/accessibility/announce.ts`

## Auth, Environment, And Release Metadata

### Environment variables required

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use `.env.example` as the template.

### Launch metadata source of truth

- `config/release-metadata.json`

Current placeholder fields still blocking real release work:

- support email
- support URL
- account deletion request URL
- privacy policy URL
- terms URL
- marketing URL

### Native release identifier

- Android package name: `com.moonlithe.sideroom`

### Auth redirect

Add this redirect URI in Supabase auth settings:

- `sideroom://auth/callback`

### Auth status

- Email magic-link auth is implemented in the client
- Google auth is implemented in the client and still needs live Supabase provider enablement plus runtime validation

## Current Package And Tooling State

At the time of this handoff, the important versions are:

- `expo` `~55.0.15`
- `react-native` `0.83.4`
- `react` `19.2.0`
- `react-dom` `19.2.0`
- `expo-router` `~55.0.12`
- `eslint-config-expo` `~55.0.0`

## Local Verification State

These commands passed on 2026-04-14:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run audit:check`
- `npm run doctor`

Current results:

- `npm run audit:check`
  - `0` vulnerabilities
- `npm run doctor`
  - `17/17` checks passed

`npm run release:preflight` still fails, but it now fails only for the expected external blockers:

- no local env file with real Supabase values
- placeholder support, policy, account-deletion, and marketing metadata
- missing `supabase/bootstrap/seed-authors.json`
- pending accessibility-pass evidence
- pending real-device smoke-pass evidence

## What Has Not Been Verified Yet

- Live Supabase project creation and migration application
- Real email sign-in against the live backend
- Real Google sign-in against the live backend
- End-to-end onboarding against live data
- End-to-end notification generation using multiple real accounts
- End-to-end moderation actions using moderator and admin accounts
- End-to-end validation of saved posts, authored-post history, and author resolution flows against live data
- End-to-end validation of account deletion against the live backend
- EAS preview builds on Android
- EAS production builds on Android
- Real-device validation of accessibility, biometrics, and screenshot blocking after the latest patch refresh

## Docs Added Or Refreshed In This Pass

- `docs/accessibility-and-launch-gap-audit.md`
- `docs/universal-design-baseline.md`
- `docs/accessibility-test-checklist.md`
- `docs/accessibility-test-pass.md`
- `docs/account-deletion-flow.md`
- `docs/moderation-drills.md`
- `docs/real-device-smoke-pass.md`
- `docs/closed-beta-readiness.md`
- `docs/project-status.md`
- `docs/release-preflight.md`
- `docs/device-smoke-checklist.md`
- `docs/google-play-submission-checklist.md`
- `README.md`

## Recommended Next-Step Order

1. Create the live Supabase preview or staging project and apply all eight migrations.
2. Add the real env vars locally and rerun backend plus release preflight.
3. Enable Google in Supabase auth providers and validate both auth methods on real Android devices.
4. Test the full community loop with multiple accounts:
   - onboarding
   - create post
   - comment
   - vote / helpful / save
   - search
   - report / block
   - inbox
   - moderation
   - resolve / reopen post
   - account deletion
5. Replace placeholder release metadata values, including the public account-deletion request path.
6. Create `supabase/bootstrap/seed-authors.json`, generate real launch-content SQL, and seed the app so first-run experience is not empty.
7. Run the accessibility checklist and real-device smoke checklist on preview builds.
8. Run moderation drills and closed beta before any public store submission.

## First Session Back Checklist

1. Read:
   - `docs/project-status.md`
   - `docs/accessibility-and-launch-gap-audit.md`
   - `docs/universal-design-baseline.md`
   - `docs/security-baseline.md`
   - `docs/supabase-setup.md`
   - `docs/launch-readiness-plan.md`
2. Confirm `.env` is populated with the real Supabase URL and publishable key.
3. Verify the live Supabase project has all migrations applied.
4. Run:
   - `npm run backend:preflight`
   - `npm run release:preflight`
   - `npm run typecheck`
   - `npm run lint`
   - `npm run audit:check`
   - `npm run doctor`
5. Use:
   - `docs/accessibility-test-checklist.md`
   - `docs/device-smoke-checklist.md`
   - `docs/moderation-drills.md`
   - `docs/closed-beta-readiness.md`

## Handoff Bottom Line

This repository is still a serious MVP foundation with a coherent security model, core community loop, moderation path, and a clearer launch-readiness story than it had on 2026-03-27.

The biggest changes since the last handoff are:

- the UI and shared controls are materially more accessible and more explicit about state
- the repo now has current accessibility and launch-hardening docs instead of relying on tribal knowledge
- audit and doctor are green again after dependency and patch-version cleanup
- release preflight is stricter and more honest about external blockers

The next person should start with live Supabase setup, real-device validation, and closed-beta evidence, not by redesigning the architecture or widening product scope.
