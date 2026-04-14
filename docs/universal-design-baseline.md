# SideRoom Universal Design Baseline

Date: 2026-04-13
Status: active repo standard

## Scope

This baseline applies to every core screen:

- auth
- onboarding
- home feed
- search
- composer
- post detail
- inbox
- me/profile
- moderation
- trust
- policies/support
- missing-config and setup-gate screens

## Required UI Rules

- Use readable type hierarchy. Critical labels, validation, state text, and action copy must not rely on tiny text.
- Support font scaling for text and text inputs wherever React Native supports it.
- Keep touch targets comfortably tappable. Interactive controls should aim for at least 48 by 48 dp.
- Show visible focus treatment for buttons, chips, links, and pressable cards.
- Never rely on color alone to explain state. Pair color with text labels, badges, or summaries.
- Keep contrast strong in both light and dark themes.
- Give every interactive control an accessibility label, role, and state. Add hints when the outcome is not obvious.
- Give icon-driven or compact navigation items explicit screen-reader names.
- Every empty, loading, success, warning, blocked, offline, and error state must explain what happened and what the user can do next.
- Honor reduced-motion preferences where motion exists. If a polished effect conflicts with clarity, use the simpler option.
- Use plain-language copy that reduces cognitive load and avoids internal jargon.
- Keep validation specific and forgiving. Do not silently disable submit actions without visible explanation.
- Anonymous-posting surfaces must explicitly explain what is public and what moderators can still see internally.
- Keep navigation predictable. Back behavior should not strand users on dead-end screens.
- Respect safe areas, keyboard overlap, and small screens.

## Form Rules

- Visible labels stay present even when the field has content.
- Helper text should explain format, privacy, or recovery when the user needs that context.
- Error text should name the problem and the next correction clearly.
- Placeholder text is only an example, never the only label.
- Submit buttons should say what they do and, when disabled, the screen should explain why.

## State Message Rules

- Loading: say what the app is trying to load.
- Empty: explain whether the state is normal and how to move forward.
- Error: say what failed and offer a retry or alternate path when possible.
- Success: confirm the result in plain language.
- Blocked: explain the boundary so the app never feels broken.

## Trust And Safety Rules

- Report and block actions must be understandable without subtle color cues.
- Moderation actions must describe the outcome in human language, not internal shorthand.
- Trust-center, policy, and support screens must stay scannable and readable.
- Missing-config or blocked-account screens must feel explicit and intentional, not like crashed app states.

## Acceptance Standard

If a screen fails any of the rules above, it is not ready for beta confidence even if the feature technically works.
