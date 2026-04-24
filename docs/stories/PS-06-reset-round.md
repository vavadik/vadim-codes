# PS-06 — Reset Round

**Type:** User Story  
**Phase:** 1 — Core Flow  
**Estimate:** S  
**Depends on:** PS-05

## Story

> As a room master, I want to reset the round so the team can vote on the next task with a clean slate.

## Acceptance Criteria

- [ ] After reveal, the master (or any participant in public mode) sees a "New round" / "Reset" button.
- [ ] Clicking it emits the `reset` event to the server.
- [ ] The server clears all `participant.selectedCard` values, sets `room.state = 'voting'`, and broadcasts `roundReset`.
- [ ] On `roundReset` all clients:
  - Hide all face-up cards (return to face-down / unplayed state).
  - Clear the results summary.
  - Re-enable the card hand for selection.
- [ ] The master toolbar returns to showing "Reveal" (disabled until at least one card is selected).

## Server Authorisation

- Reject if caller is neither master nor room is in public mode.

## Technical Notes

- `roundReset` carries no payload — clients derive new state from the absence of votes.
- The current task text is **not** cleared on reset; master must explicitly update it (PS-08).
