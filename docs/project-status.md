# SideRoom Project Status

## What Was Already Accomplished Before 2026-03-23

- The product brief is strong and detailed.
- The MVP scope, audience, moderation posture, disclaimer language, data model, and build order are already defined.
- The handoff provides enough direction to start implementation without reopening the main product decisions.

## What The Repository Actually Looked Like

- The codebase was still the default Expo starter.
- No SideRoom-specific auth, onboarding, feeds, post composer, comments, search, moderation, admin tooling, or backend integration existed yet.
- In other words, strategy was finished, but implementation had barely started.

## What Was Added Today

- A SideRoom project-status screen replaced the Expo starter content.
- A dedicated security screen now tracks client protections and the backend controls still required before launch.
- The app root now enables screenshot blocking where supported and biometric relock when strong biometrics are enrolled.
- Reusable secure-storage helpers were added for device-only encrypted storage.
- Supabase client infrastructure was added with encrypted session persistence.
- A signed-out state, missing-config state, and onboarding gate now exist in the mobile app shell.
- Google OAuth is now wired into the mobile auth flow alongside email magic links, pending live Supabase provider setup and validation.
- The auth shell now keeps users on a dedicated callback completion state during secure sign-in redirects instead of dropping back to the normal sign-in screen mid-flow.
- Suspended and banned accounts now stop at an explicit account-status gate so moderation restrictions are clear and consistent at the client level.
- A real Android emulator smoke test exposed an `Intl.RelativeTimeFormat` runtime crash in Expo Go, and the formatter now falls back safely on runtimes where that API is unavailable.
- A local `backend:preflight` command now checks env presence, redirect alignment, and migration-file readiness before live Supabase setup begins.
- A local `backend:bundle` command now generates `supabase/bootstrap/full-setup.sql` so a brand-new Supabase project can be initialized from one ordered SQL bundle.
- A local `launch:seed` command plus launch-content pack now generate repeatable starter community content so the app does not open empty once real accounts exist.
- A local `release:preflight` command plus `eas.json` build profiles now flag obvious store-upload blockers before preview and production build work begins.
- An in-app Trust Center now explains privacy, moderation, reporting, and remaining launch-trust blockers in plain English.
- The native Android package is now set to `com.moonlithe.sideroom`.
- Dedicated runbooks now exist for real-device smoke testing and preview-build execution so the team can move straight into beta prep once the backend is live.
- A dedicated Google Play submission checklist now exists so Android launch operations have a concrete final-mile checklist.
- The Android-only cleanup now also removes leftover iOS runtime branches and the unused `expo-symbols` dependency from the codebase.
- Policy links, support contact, and Google Play draft copy now live in a shared metadata file and an in-app Policies and Support screen.
- A local `handoff:docx` command now regenerates the latest dated Word handoff from the newest markdown handoff source.
- An initial Supabase migration now defines the core schema, seeded topics, onboarding RPC, and row-level security policies.
- The app now has a secure community loop with feed, post detail, comments, search, reporting, blocking, and an inbox for replies and positive reactions.
- Staff moderation now has a protected queue with dismiss, remove, lock, suspend, and ban actions that write audit-log entries.
- The Me tab now exposes saved posts and authored posts so users can revisit helpful threads and see moderation-related status transparently.
- Post authors can now mark threads resolved or reopen them, and locked posts now block new replies correctly.

## Highest-Priority Next Steps

1. Create the live Supabase project, apply the migration, and verify auth redirects plus RLS behavior end to end.
2. Enable and validate Google auth in the live Supabase project.
3. Seed high-quality launch content, validate notifications and moderation behavior, and pressure-test the community loop with real beta accounts.
4. Add the real Supabase env values locally, then run `npm run release:preflight` until the repo-side blockers are gone.
5. Use `docs/preview-build-runbook.md` to generate Android preview builds with the current `com.moonlithe.sideroom` package name.
6. Use `docs/device-smoke-checklist.md` to smoke-test those builds on real devices before wider beta.
7. Replace the placeholder privacy-policy, terms, support, and marketing values in `config/release-metadata.json`.
8. Use `docs/google-play-submission-checklist.md` to prepare store listing, policy, and testing-track requirements before public release.
9. Add stronger staff security controls such as MFA, least-privilege access, and redacted operational logging.
10. Verify production secrets handling, retention rules, release builds, and beta readiness before real user data is collected.

## Launch Recommendation As Of 2026-03-24

- Do not stop coding yet.
- The project is still in the foundation stage, not the polished MVP stage.
- It is appropriate to start brand, marketing, app-store, and monetization planning now, but not to treat engineering as complete.
- Use `docs/launch-readiness-plan.md` as the definition of when SideRoom is truly ready to shift from build mode to launch mode.
