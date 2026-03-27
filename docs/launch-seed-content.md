# SideRoom Launch Seed Content

## Why This Exists

The MVP will feel empty and unsafe if the first users arrive to blank topics.

This launch-seed pack gives us:

- one starter post for each launch topic
- thoughtful replies so the app feels alive
- a mix of anonymous and handle-based posting
- a repeatable path for loading that content into the real Supabase project

## Files

- `data/launch-seed/seed-content.json`
  - The actual starter post, comment, save, and reaction content.
- `supabase/bootstrap/seed-authors.example.json`
  - Example mapping for the real accounts that will own the seed content.
- `scripts/build-launch-seed.js`
  - Builds SQL from the content plus author mapping.
- `supabase/bootstrap/seed-launch-content.template.sql`
  - Generated when only the example author mapping exists.
- `supabase/bootstrap/seed-launch-content.sql`
  - Generated when a real `seed-authors.json` file exists.

## How To Use It

1. Create 5 real seed accounts by signing into SideRoom:
   - `steady_mia`
   - `late_shift_noah`
   - `guide_ivy`
   - `campus_rae`
   - `clearbound_jules`
2. Complete onboarding for each one so a handle exists in `public.user_profiles`.
3. Copy `supabase/bootstrap/seed-authors.example.json` to `supabase/bootstrap/seed-authors.json`.
4. Replace the example emails with the real emails used by those accounts.
5. Run `npm run launch:seed`.
6. Apply the generated SQL file to Supabase:
   - `supabase/bootstrap/seed-launch-content.sql`

## Notes

- The generated SQL is idempotent enough for normal setup reruns:
  - posts reuse the same record if title/body/topic/author already match
  - reactions and saves use `on conflict do nothing`
  - comments skip exact duplicates for the same author and post
- Do not edit the generated SQL by hand.
- If you change the content pack, rerun `npm run launch:seed`.
