export const disclaimerText =
  'SideRoom is a community for peer discussion and shared experience. Content in this app is not medical, legal, mental-health, crisis, or emergency advice. If you need professional help, contact a qualified professional or local emergency services.';

export const accomplishedBeforeToday = [
  {
    title: 'Product scope was defined.',
    description:
      'The handoff clearly locked the audience, value proposition, platform choice, feature boundaries, and non-goals for the MVP.',
  },
  {
    title: 'Safety policy was written.',
    description:
      'The brief already defines mandatory disclaimers, prohibited positioning, high-risk topic handling, moderation categories, and enforcement priorities.',
  },
  {
    title: 'The core data model was outlined.',
    description:
      'Users, posts, comments, reactions, reports, notifications, blocking, and topic follows are all described well enough to start schema work.',
  },
  {
    title: 'The build order is already mapped.',
    description:
      'Auth, onboarding, feeds, composer, reactions, moderation, seeding, analytics, and beta prep were sequenced into clear delivery phases.',
  },
] as const;

export const currentCodebaseReality = [
  {
    title: 'The repo started as the stock Expo template.',
    description:
      'Before today there was no SideRoom auth flow, feed, composer, backend client, database schema, or moderation feature implemented in code.',
    status: 'Starter scaffold',
    tone: 'warning' as const,
  },
  {
    title: 'Today adds a security-first app shell.',
    description:
      'The default starter screens were replaced with SideRoom status and security views so future work begins from product context instead of demo code.',
    status: 'Implemented now',
    tone: 'success' as const,
  },
  {
    title: 'Today also establishes device-level protections.',
    description:
      'The app now checks secure storage availability, blocks screen capture where supported, and relocks behind device authentication when strong biometrics are enrolled.',
    status: 'Implemented now',
    tone: 'success' as const,
  },
] as const;

export const nextBuildSteps = [
  {
    title: 'Create the Supabase foundation.',
    description:
      'Set up auth providers, database migrations, typed client access, row-level security, moderator roles, and private storage buckets before any real user data is collected.',
  },
  {
    title: 'Build onboarding and identity flows.',
    description:
      'Implement sign in, topic selection, handle creation, disclaimer acceptance, and the per-post handle versus anonymous publishing controls.',
  },
  {
    title: 'Ship the main community loop.',
    description:
      'Build feed ranking, post detail, comments, reactions, saves, search, reporting, topic follows, and seeded launch content.',
  },
  {
    title: 'Finish moderation and compliance.',
    description:
      'Add an admin dashboard, auto-flagging pipeline, crisis escalation flows, audit logs, analytics, retention rules, and release hardening.',
  },
] as const;

export const clientSecurityCommitments = [
  {
    title: 'Sensitive local values belong in the device vault.',
    description:
      'New secure-storage helpers are configured for device-only storage and can require device authentication for especially sensitive values.',
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
    title: 'Use row-level security on every user-data table.',
    description:
      'Posts, comments, saves, reports, notifications, and blocked-user rows should default to deny-all, then grant only the minimum actions needed by the current user or moderator role.',
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
