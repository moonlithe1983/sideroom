# SideRoom Release Preflight

## What This Is

Run this command when you want a quick local answer to:

- "Is this repo set up well enough to start preview builds?"
- "What is still obviously missing before store-upload work?"

Command:

- `npm run release:preflight`

This is a local readiness check only. It does not contact Supabase, Google, or Expo services.

## What It Checks

- real Supabase env values exist locally instead of example placeholders
- `app.json` has the important release fields we need to stop guessing
- `eas.json` exists with development, preview, production, and submit profiles
- `config/release-metadata.json` has real policy, support, and store-copy values instead of placeholders
- the in-app Policies and Support surface can share that same metadata instead of drifting from store copy
- the core launch docs and handoff docs exist
- the device-smoke and preview-build runbooks exist
- the Google Play submission checklist exists
- the bootstrap SQL, launch-content source files, and required app assets exist

## What It Will Still Leave To Humans

Even when this command passes, the app is not automatically store-ready. People still need to
finish and verify:

- real beta testing
- the flows in `docs/device-smoke-checklist.md`
- the preview-build process in `docs/preview-build-runbook.md`
- account deletion behavior for account-based releases
- store screenshots and descriptions
- privacy policy, terms, support contact, and marketing links
- reviewer notes and test accounts
- live Supabase setup
- final preview and production smoke tests

## Expected Blockers Right Now

As of 2026-03-27, the main local blockers should still be:

- no real Supabase env values yet
- no real privacy-policy, terms, or support URLs in `config/release-metadata.json` yet
- no real support email in `config/release-metadata.json` yet
- no real `seed-authors.json`, which means launch seed SQL is still template-only

Local repo hygiene is otherwise in a good place right now:

- `npm run typecheck` passes
- `npm run lint` passes
- `npm run audit:check` reports `0` vulnerabilities
- `npm run doctor` passes `17/17` in the current workspace

The native Android package is now set to:

- `com.moonlithe.sideroom` for Android

That is intentional. The command is supposed to tell us the truth instead of pretending the app is
upload-ready when key setup pieces are still missing.
