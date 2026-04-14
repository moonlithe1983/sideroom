# SideRoom Launch Readiness Plan

## Current Recommendation As Of 2026-04-14

Do not stop development yet.

The right move is to split work into two tracks:

1. Continue product and security development until the launch gates below are met.
2. Start non-engineering launch work now so marketing and store submission are not delayed later.

If we stopped coding today, we would be trying to market and submit an app that is not yet a polished MVP.

## What "Ready For App Stores" Means

SideRoom is ready to upload only when all of the following are true:

- The MVP feature set works end to end on Android.
- The app is stable, visually polished, and easy to understand without hand-holding.
- Security, moderation, and privacy controls are in place for real personal information.
- Beta users enjoy using it and can complete the core loop without confusion.
- All app-store materials, policies, accounts, and support operations are ready.

## Product Completion Gate

The app is not launch-ready until these core user flows are complete:

- Sign in and account creation.
- Topic selection and onboarding.
- Handle creation.
- Create post with handle or anonymous option.
- Home feed, topic feed, post detail, comments, reactions, saves, search, and thread resolution.
- Report, block, settings, and disclaimer access.
- Notifications at least at a basic MVP level.
- Moderator review queue with content removal, lock, suspend, and ban actions.

## Polish Gate

The app should feel finished, not prototype-like:

- No placeholder screens, starter text, demo assets, or broken navigation.
- Calm, readable visual design across small and large phones.
- Consistent spacing, typography, states, loading behavior, and empty states.
- Clear writing throughout onboarding, posting, reporting, and settings.
- Anonymous posting flow feels trustworthy and understandable.
- Seeded content is strong enough that first-time users do not land in an empty app.

## Security And Trust Gate

Because SideRoom will contain personal information, these are release blockers:

- Supabase authentication is fully wired and tested.
- Row-level security exists on every user-data table.
- Moderator/admin actions run through protected server-side paths, not public client access.
- Sensitive local values use secure storage only.
- Logs, analytics, and crash reporting are redacted.
- Uploads, if any, are private by default.
- Moderator tools, audit logs, and incident response basics are in place.
- Account deletion works in-app for normal member accounts and the policy explains any retained safety records honestly.
- Privacy policy, terms, and user-report handling process are ready before launch.
- Public account-deletion request path is live and matches the in-app deletion behavior.

## Beta Validation Gate

Before store submission, run a closed beta and do not move forward until all of these are true:

- No known P0 or P1 bugs remain.
- No unresolved security or privacy blocker remains.
- Crash-free sessions are at or above 99.5% during beta.
- At least 20-50 real beta users complete onboarding and use the core loop.
- Most testers can post, comment, and browse without asking how the app works.
- Feedback shows the app feels safe, useful, and emotionally comfortable.
- Moderation workflow is exercised with test reports and harmful-content scenarios.

Use these operational docs to execute that work:

- `docs/preview-build-runbook.md`
- `docs/device-smoke-checklist.md`
- `docs/google-play-submission-checklist.md`

Repo metadata that also needs to be finalized before submission:

- `config/release-metadata.json`

## Content And Community Gate

The product will feel dead at launch unless this is ready:

- Seeded posts exist across all launch topics.
- Each seeded post has realistic comments and a mix of anonymous and handle-based posting.
- Launch content matches the app's tone and safety boundaries.
- A basic moderation coverage plan exists for the first weeks after launch.
- Response-time expectations for reports and risky content are defined.

## App Store Submission Gate

Before upload, complete the operational checklist:

- Google Play Console account is active.
- Final app name is checked for store availability and legal risk.
- App icon, screenshots, subtitle, short description, long description, and keywords are ready.
- Privacy policy URL and support contact are live.
- Data safety/privacy disclosures are prepared from the real implementation, not guesses.
- Age rating questionnaire is answered conservatively and accurately.
- Test accounts and reviewer notes are prepared if needed.
- Release builds install cleanly and pass final smoke testing on Android.

## Local Repo Gate

Before anyone starts preview or production build work, run:

- `npm run release:preflight`

That command does not replace beta testing or app-store operations, but it should catch obvious
local blockers such as:

- missing real backend env values
- missing required native app identifiers
- missing EAS build profiles
- placeholder policy, terms, support, or marketing values in `config/release-metadata.json`
- missing launch/bootstrap artifacts

## How We Will Know The MVP Is Enjoyable

For a polished MVP, the question is not only "does it work?" but "do people want to come back?"

Good launch signals:

- Testers say the app feels calm, useful, and easy to trust.
- The value proposition is obvious within the first minute.
- Anonymous posting feels safe, but not confusing.
- The first feed session already contains helpful content.
- Posts get replies fast enough that the app feels alive.
- Early users save posts, comment, and return without being pushed.

Suggested internal success signals before broad launch:

- Onboarding completion is at least 70% in beta.
- At least 30% of beta users create or meaningfully engage with content.
- Day-7 retention is promising enough to justify paid acquisition or public launch testing.
- Report handling and moderation response times are operationally manageable.

## When It Is Reasonable To Shift Away From Coding

It makes sense to mostly stop product development only after the launch gates above are met.

At that point, engineering should shift from feature building to:

- final bug fixes
- release support
- analytics review
- moderation support
- post-launch improvements based on real usage

## Non-Engineering Work To Start Now

These should begin in parallel immediately:

- Choose and clear the final brand name.
- Secure domains, social handles, and basic brand assets.
- Create a landing page and waitlist.
- Prepare app-store copy, screenshots, and launch creative.
- Define launch channels such as TikTok, Instagram, Reddit, campus ambassadors, or creator partnerships.
- Prepare a beta recruitment list and a tester feedback process.
- Write privacy policy, terms, and support materials.
- Decide the first monetization hypothesis, even if it is not included in v1.

## Monetization Recommendation

Do not force monetization into the first release if it weakens trust or makes the product feel heavy.

The better path is:

1. Launch a clean, useful MVP.
2. Validate retention, engagement, and moderation quality.
3. Then test lightweight revenue options such as premium filters, enhanced privacy controls, premium digests, or AI-assisted drafting.

## Practical Next-Step Order

1. Finish the real MVP product and security work.
2. Run a closed beta and measure quality, trust, and retention.
3. Finalize branding, app-store assets, legal docs, and submission materials.
4. Submit to Google Play testing tracks, then fix issues.
5. Upload publicly only after the readiness gates are satisfied.
