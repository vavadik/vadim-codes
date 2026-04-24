# PS-01 — Display Name Entry

**Type:** User Story  
**Phase:** 1 — Core Flow  
**Estimate:** S

## Story

> As a user visiting for the first time, I want to enter my display name so I can be identified in a poker session.

## Acceptance Criteria

- [ ] Home page (`/`) shows a name input field and a "Continue" button.
- [ ] The input is focused automatically on page load.
- [ ] Submitting an empty or whitespace-only name is prevented (inline validation).
- [ ] On submit the name is saved to `localStorage` under key `poker:name`.
- [ ] On subsequent visits the name input is pre-filled with the stored value and editable.
- [ ] Name length is capped at 32 characters.

## UI Behaviour

- The name step is shown as a simple centred card / modal before any room actions are available.
- If the user navigates directly to `/room/:id` without a saved name, they are shown the name entry inline (not redirected away) before the room join proceeds.

## Technical Notes

- Frontend only — no backend call.
- Implement as a composable `useName()` that wraps `localStorage` reads/writes.
- Reuse the existing `Input` and `Button` components from `apps/poker-web/src/components/ui/`.

## Out of Scope

- Changing the name mid-session (a future setting).
