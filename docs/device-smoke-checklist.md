# SideRoom Device Smoke Checklist

## Purpose

Use this checklist after the real Supabase project is live and before any broader beta or store
submission step.

The goal is simple:

- prove the core loop works on real phones
- prove trust and moderation behavior are understandable
- catch launch blockers before we invite real users

## Test Accounts Needed

Prepare at least these accounts before testing:

- Member A
- Member B
- Moderator account
- Suspended or banned account for restriction testing

If possible, give Member A and Member B different auth methods so we cover more of the sign-in
surface.

## Devices Needed

Minimum recommended set:

- 1 real Android phone

Nice to have:

- one smaller Android phone
- one larger Android phone
- one device with strong biometrics enrolled

## Before You Start

1. Run `npm run release:preflight`.
2. Confirm `.env` has the real Supabase URL and publishable key.
3. Confirm `supabase/bootstrap/full-setup.sql` has been applied to the real Supabase project.
4. Confirm Google auth is enabled in Supabase.
5. Confirm seed content exists or the app has enough real test posts to avoid empty-state confusion.
6. Install the latest preview build on the test devices.
7. Bring `docs/accessibility-test-checklist.md` so TalkBack and focus issues are captured during the same pass.

## Pass / Fail Rule

- `Pass`: the flow works as expected, with no confusing copy or broken UI.
- `Fail`: the flow breaks, leaks trust, or would make a beta user stop.
- `Needs polish`: the flow works but feels too rough for beta confidence.

Any security, privacy, auth, crash, or data-loss issue is a release blocker.

## Smoke Flows

### 1. App Launch

- Open the app from a cold start.
- Confirm the app reaches the expected first screen without crashing.
- Send the app to the background and reopen it.
- Confirm biometric relock or secure return behavior matches expectations on supported devices.

### 2. Sign-In

- Test email magic link.
- Test Google sign-in.
- Confirm the auth callback finishes cleanly and does not drop back to the wrong screen.

### 3. Onboarding

- Create a valid handle.
- Select 3 to 5 topics.
- Confirm onboarding completes and lands in the main app shell.
- Confirm bad handle formats are rejected clearly.

### 4. Feed and Search

- Open Home and confirm posts load.
- Filter by multiple topics.
- Use Search and confirm results are relevant and readable.
- Confirm empty states still feel intentional if few posts exist.

### 5. Create and Read Posts

- Create one anonymous post.
- Create one handle-based post.
- Open each post detail screen.
- Confirm author presentation matches the selected identity mode.

### 6. Comments and Reactions

- Add comments from a second account.
- Save a post.
- Upvote or otherwise react where supported.
- Mark a post helpful where supported.
- Confirm counts and UI states update correctly.

### 7. Inbox

- Confirm Member A receives the right inbox items after Member B interacts.
- Mark one item read.
- Mark all read.
- Confirm inbox navigation opens the correct post.

### 8. Report and Block

- Report a post.
- Report a comment.
- Block an author.
- Confirm blocked content disappears from feed, search, comments, and notifications for the blocker.

### 9. Moderation

- Sign in as moderator.
- Open the Mod tab.
- Confirm report queue data is visible.
- Test dismiss.
- Test remove post.
- Test lock post.
- Test remove comment.
- Test suspend or ban on a test account only.
- Confirm actions produce the expected user-visible outcomes.

### 10. Restricted Accounts

- Sign in as a suspended or banned account.
- Confirm the account stops at the restriction screen instead of entering the app shell.

### 11. Personal Activity

- Open the Me tab.
- Confirm saved posts appear in the right order.
- Confirm authored posts show the right status badges.
- Resolve and reopen one authored thread.

### 12. Trust Surfaces

- Open the safety modal.
- Open the Trust Center.
- Open the Policies and Support screen.
- Confirm the language is clear, trustworthy, and not obviously placeholder copy.
- Confirm the public account-deletion request path is visible even when the in-app deletion path also exists.

### 13. Account Deletion

- Open the Me tab and find the account deletion path without hunting for it.
- Confirm non-staff accounts can start deletion in-app.
- Confirm staff accounts are redirected to support instead of deleting moderation audit context casually.
- Confirm deleted test accounts can no longer sign back in without creating a fresh account path.
- Confirm the app does not leave a broken half-signed-in state after deletion.

## Things To Capture During Testing

- device model
- OS version
- app build version
- account used
- exact step that failed
- screenshot or screen recording if safe to capture
- whether the issue is a release blocker

## Release Blockers

Do not move to broader beta or store submission if any of these fail:

- app crash on launch or auth
- sign-in callback loop or session loss
- wrong user seeing another user's private data
- blocked content still appearing where it should be hidden
- moderator actions not sticking
- suspended or banned accounts entering the main app shell
- account deletion being missing, misleading, or leaving orphaned account access behind
- seeded content or first-run experience feeling empty and dead
