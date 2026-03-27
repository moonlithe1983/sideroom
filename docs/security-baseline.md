# SideRoom Security Baseline

## Client Protections Implemented Now

- Device-local secure storage is available through `lib/security/secure-store.ts`.
- Protected storage can require device authentication for especially sensitive values.
- Supabase auth sessions are stored in encrypted local storage instead of plain AsyncStorage.
- Screen capture is blocked where the platform supports it.
- The app relocks when it backgrounds if strong biometrics are enrolled and secure storage is available.
- Secure auth redirects now land on a dedicated callback-completion state in the app shell.
- Suspended and banned accounts are blocked explicitly in the client shell before community surfaces load.
- Non-staff accounts now have an in-app self-serve deletion path instead of a support-only dead end.
- The current dependency tree is locally hardened and `npm run audit:check` reports `0` vulnerabilities.

## Still Required Before Handling Real Personal Data

- Apply and verify all eight Supabase migrations in a live project, including auth redirects and row-level security behavior.
- Private storage buckets with signed access only.
- Moderator and admin actions beyond the current queue moved behind protected server-side paths consistently, with no direct raw-table workflows.
- MFA and least-privilege access for moderator and admin tools.
- Audit logging for moderation, account-state changes, and sensitive reads.
- Final retention language for account deletion and any data that must be preserved for abuse prevention.
- Encrypted backups, incident response steps, and a tested account-recovery path.

## Data Handling Rules

- Collect only data that directly supports trust, moderation, and the core advice experience.
- Keep anonymous public posting separate from internal moderation identity.
- Never send raw sensitive content to logs, analytics, or crash reporting without redaction.
- Define deletion and retention rules before launch, not after launch.
