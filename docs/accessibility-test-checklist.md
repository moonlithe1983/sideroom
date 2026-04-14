# SideRoom Accessibility Test Checklist

Date: 2026-04-13
Status: ready for manual testing

## Devices

- 1 Android phone with TalkBack enabled
- 1 Android phone with larger font size and display size enabled if available
- External keyboard or emulator keyboard traversal where relevant

## Core Checks

### Global

- App launches without clipped text at larger font sizes.
- Focus order matches the visual order.
- Every button, chip, link, tab, and pressable card is named clearly by TalkBack.
- State is not communicated only by color.
- Error, loading, success, and blocked states are read clearly.

### Auth And Onboarding

- Email field has a stable label, not just placeholder text.
- Google sign-in button and magic-link button announce clearly.
- Invalid handle rules are spoken clearly.
- Topic chips announce selected and not-selected states.
- Onboarding completion is announced.

### Feed, Search, Composer

- Feed cards announce title plus meaningful summary context.
- Search field, search button, and clear button all read clearly.
- Anonymous-posting toggle explains public anonymity versus moderator traceability.
- Composer validation remains readable at larger text sizes.
- Post creation success is announced.

### Post Detail

- Vote, helpful, save, report, and block actions are understandable without sight.
- Report flow identifies whether the target is the post or a comment.
- Comment field has a stable label.
- Comment submission success or failure is announced.

### Inbox, Profile, Moderation

- Notification cards announce unread state and related post context.
- Account deletion controls explain when self-serve deletion is allowed versus support-managed.
- Moderation actions read clearly and announce success or failure.
- Blocked-account screens explain the boundary and offer a way to sign out.

### Trust, Policies, Support

- Trust Center remains readable with larger text.
- Policy, support, and account-deletion links are named clearly.
- Placeholder links are visibly marked as pending when still unresolved.

## Sign-Off Rule

Do not mark accessibility complete until TalkBack, large-text, and keyboard traversal issues with P0 or P1 severity are closed.
