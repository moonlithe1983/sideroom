# SideRoom Moderation Drills

Date: 2026-04-13
Status: ready for manual drills

## Purpose

Run these drills before closed beta and again before store submission so moderation does not remain theoretical.

## Required Accounts

- Member A
- Member B
- Moderator
- Suspended or banned test account

## Drill Set

### Report triage

- Report a post for unsafe advice.
- Report a comment for harassment.
- Confirm the queue shows the right target, reason, and context.

### Action handling

- Dismiss one low-risk report.
- Remove one post.
- Lock one post.
- Remove one comment.
- Suspend one test author.
- Ban one test author.

### User-visible outcomes

- Confirm removed or locked content changes are visible in the member experience.
- Confirm suspended or banned accounts stop at the restriction screen.
- Confirm moderator action success or failure is obvious in the UI.

### Audit and safety review

- Confirm the action was recorded in moderation audit logs.
- Confirm blocked content stays hidden where expected.
- Confirm no private raw-table data leaks into member-visible surfaces.

## Exit Rule

Do not treat moderation as beta-ready until each drill above has been run against the live backend with real role separation.
