export const disclaimerText =
  'SideRoom is a community for peer discussion and shared experience. Content in this app is not medical, legal, mental-health, crisis, or emergency advice. If you need professional help, contact a qualified professional or local emergency services.';

export const accomplishedBeforeToday = [
  {
    title: 'The MVP scope and trust posture were already defined.',
    description:
      'The original brief locked the audience, value proposition, moderation boundaries, disclaimer language, and phased build order before implementation began.',
  },
  {
    title: 'The app now has a real community product loop.',
    description:
      'Auth, onboarding, feed, search, composer, post detail, comments, reactions, saves, inbox, moderation, and personal activity are all implemented in code.',
  },
  {
    title: 'Security-first foundations are in place.',
    description:
      'Encrypted session storage, secure-store helpers, screenshot blocking where supported, biometric relock, row-level security, and RPC-based reads/actions are all part of the current baseline.',
  },
  {
    title: 'The engineering toolchain has been hardened.',
    description:
      'The repo is on Expo 55, the dependency audit is clean, and the main validation commands pass locally.',
  },
] as const;

export const currentCodebaseReality = [
  {
    title: 'This is no longer the Expo starter.',
    description:
      'The repository now contains a real Android-first MVP foundation instead of placeholder demo screens.',
    status: 'Implemented now',
    tone: 'success' as const,
  },
  {
    title: 'Missing backend config is handled intentionally.',
    description:
      'When real Supabase env values are absent, the app shows a dedicated missing-config screen instead of crashing into broken auth or empty data flows.',
    status: 'Verified locally',
    tone: 'success' as const,
  },
  {
    title: 'Launch readiness still depends on live services.',
    description:
      'The app shell is healthy, but real auth, real data, moderation validation, and release operations still require a live Supabase project and final release metadata.',
    status: 'Still blocked',
    tone: 'warning' as const,
  },
] as const;

export const nextBuildSteps = [
  {
    title: 'Connect the live backend.',
    description:
      'Create the Supabase project, add the real env values locally, apply all seven migrations, and verify email plus Google auth end to end.',
  },
  {
    title: 'Pressure-test the real community loop.',
    description:
      'Use multiple accounts to validate posting, comments, inbox behavior, saved posts, moderation actions, blocking, and thread resolution against live data.',
  },
  {
    title: 'Finish launch metadata and seed content.',
    description:
      'Replace placeholder support, policy, and marketing values, create the real seed-authors file, and generate launch content SQL from real seed accounts.',
  },
  {
    title: 'Move into preview-build and beta work.',
    description:
      'Run release preflight, create preview Android builds, execute the device smoke checklist, and close trust or moderation gaps before broader beta.',
  },
] as const;

export const clientSecurityCommitments = [
  {
    title: 'Sensitive local values belong in the device vault.',
    description:
      'Secure-storage helpers are configured for device-only storage and can require device authentication for especially sensitive values.',
  },
  {
    title: 'The app should visually protect private content.',
    description:
      'Screenshot blocking is enabled where the platform allows it, and app preview leakage is reduced where the OS exposes those controls.',
  },
  {
    title: 'Private content relocks automatically.',
    description:
      'When strong biometrics are enrolled, SideRoom relocks as soon as the app becomes inactive or moves to the background.',
  },
] as const;

export const backendSecurityRequirements = [
  {
    title: 'Verify all seven Supabase migrations in a live project.',
    description:
      'Posts, comments, saves, reports, notifications, blocked-user rows, and moderation flows still need end-to-end validation under the real auth and row-level security rules.',
  },
  {
    title: 'Keep service-role access out of the mobile app.',
    description:
      'Moderator actions, admin analytics, content takedowns, and privileged lookups must run in protected server or edge-function environments, never from public client credentials.',
  },
  {
    title: 'Store uploads in private buckets only.',
    description:
      'Any profile media or moderation evidence should be private by default, served through signed URLs, and covered by retention and deletion rules.',
  },
  {
    title: 'Encrypt backups and enable audit logging.',
    description:
      'Production data needs encrypted backups, access logging, moderator action trails, incident review steps, and an emergency revoke path for compromised accounts.',
  },
  {
    title: 'Require strong admin authentication.',
    description:
      'Moderator and admin tools should require MFA, least-privilege roles, device checks, and explicit logging for every sensitive action.',
  },
] as const;

export const sensitiveDataRules = [
  {
    title: 'Minimize what you collect.',
    description:
      'Do not collect profile fields, analytics dimensions, or notification payload data unless they directly improve moderation, trust, or core community utility.',
  },
  {
    title: 'Never expose internal identity in public views.',
    description:
      'Anonymous posts must remain traceable for moderation internally while keeping user IDs, emails, and auth-provider details out of public responses.',
  },
  {
    title: 'Keep logs and analytics scrubbed.',
    description:
      'Never send raw post bodies, emails, tokens, or report details to analytics, crash tracking, or console logs without a deliberate redaction policy.',
  },
  {
    title: 'Design for deletion and retention up front.',
    description:
      'Every stored datum should have a clear owner, retention rule, moderation visibility rule, and deletion path before launch.',
  },
] as const;

export const moderationTriggers = [
  'Self-harm or suicide language',
  'Abuse, coercion, or immediate danger',
  'Criminal acts or illegal facilitation',
  'Medical symptoms, medication, or pregnancy emergencies',
  'Legal strategy requests covering lawsuits, immigration, contracts, custody, or criminal defense',
  'Hate speech, doxxing, sexual exploitation, minors, or explicit harassment',
] as const;
