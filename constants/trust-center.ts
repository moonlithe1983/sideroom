import { disclaimerText } from '@/constants/project-status';

export const trustCenterIntro =
  'SideRoom is designed for honest peer discussion with a security-first foundation. Private identity stays protected in public surfaces, but moderators can still intervene when safety requires it.';

export const privacyPromises = [
  'Auth sessions are stored with encrypted device-backed storage where the platform supports it.',
  'Anonymous posts hide your public handle from the feed and search results, while still remaining traceable to moderators for safety review.',
  'Community reads flow through sanitized RPCs instead of broad raw-table access so public screens do not expose internal identity data.',
  'Screenshot blocking, app-switcher privacy protection, and biometric relock are enabled where device support allows it.',
  'Normal member accounts now have an in-app deletion path, while staff-account deletion stays support-managed so moderation audit trails are not casually erased.',
] as const;

export const moderationBoundaries = [
  'SideRoom is not a place for medical, legal, crisis, mental-health, or emergency advice.',
  'Hate, harassment, doxxing, sexual exploitation, threats, and illegal facilitation are not allowed.',
  'High-risk content can be reviewed, removed, locked, or escalated by moderators when harm prevention requires it.',
  'Blocked authors are filtered out of feed, search, comments, and notifications for the member who blocked them.',
] as const;

export const reportFlow = [
  'Members can report posts and comments directly from the thread.',
  'Reports enter a protected staff moderation queue rather than exposing raw moderation tools to normal members.',
  'Moderator actions are audit-logged so dismissals, removals, locks, suspensions, and bans leave a trail.',
  'Suspended and banned accounts are stopped at the app shell instead of wandering into confusing failures.',
] as const;

export const launchTrustBlockers = [
  'A live Supabase project still needs full end-to-end validation for auth, row-level security, moderation, and notifications.',
  'Staff MFA, redacted analytics and crash reporting, and operational incident-response steps still need to be finalized.',
  'A public privacy-policy URL, terms URL, support contact, and deletion-support page still need to be published before app-store submission.',
  'Closed-beta testing still needs to prove that moderation response, trust, and crash stability are good enough for launch.',
] as const;

export const trustCenterDisclaimer = disclaimerText;
