# SideRoom Account Deletion Flow

Date: 2026-04-13
Status: ready for backend validation

## Current Product Contract

- Normal member accounts can start deletion in-app from the Me tab.
- Moderator and admin accounts are intentionally redirected to support-managed deletion so moderation audit trails are preserved.
- Public documentation must also expose a web-based account deletion request path for users who cannot use the in-app flow.

## What The In-App Flow Should Do

1. Explain that deletion is permanent in the active environment.
2. Explain that staff accounts are excluded from self-serve deletion.
3. Call `delete_my_account` on the backend.
4. Sign the user out locally after a successful deletion.
5. Announce the result clearly and avoid a half-signed-in state.

## What Still Needs Validation

- Real backend deletion behavior for normal member accounts.
- Final retention language for abuse-prevention records and moderation evidence.
- Published public deletion request page that matches the in-app behavior.

## Reviewer And Support Requirement

The final support, privacy, and deletion-request pages must all describe the same reality. Do not let the in-app flow and the public support path drift.
