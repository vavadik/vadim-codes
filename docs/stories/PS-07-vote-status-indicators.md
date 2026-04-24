# PS-07 — Vote Status Indicators

**Type:** User Story  
**Phase:** 2 — Game Features  
**Estimate:** S  
**Depends on:** PS-04

## Story

> As a participant, I want to see at a glance which players have already voted (without seeing their value) so I know when everyone is ready for the reveal.

## Acceptance Criteria

- [ ] Each player seat shows one of three states:
  - **Idle** — no card played yet (empty card outline or subtle placeholder).
  - **Voted** — card played, face-down (solid card back, checkmark or ✔ label).
  - **Revealed** — card face-up showing the value (after PS-05 reveal).
- [ ] The voted indicator updates in real time when a participant emits `selectCard` (server broadcasts `cardSelected { participantId }`).
- [ ] Participants who have not voted when cards are revealed remain in an "idle" state with a "—" spectator label.
- [ ] The local player's own seat reflects their selection state the same way as others.

## Technical Notes

- `PlayerSeat` component accepts props: `name`, `cardState: 'idle' | 'voted' | 'revealed'`, `cardValue?: string`.
- Transition between states with a subtle opacity/scale animation (100 ms).
- The card back design should be consistent with the overall poker theme.

## Out of Scope

- Full table layout positioning (PS-15).
