# PS-15 — Poker Table Layout

**Type:** User Story  
**Phase:** 4 — UX Polish  
**Estimate:** L  
**Depends on:** PS-07

## Story

> As a participant, I want the room to look like a physical poker table with players seated around it so the experience feels familiar and spatial.

## Acceptance Criteria

- [ ] The table is rendered as a rectangle with heavily rounded corners (stadium/pill shape) centred on the page.
- [ ] Player seats are distributed evenly around the perimeter of the table — top, bottom, left, right sides — using absolute positioning calculated from the number of participants.
- [ ] The local player's own seat is always anchored at the bottom centre.
- [ ] The table surface displays the current task text (PS-08) at the centre.
- [ ] Up to ~12 players are displayed without overflow; beyond that, seats compress or scroll.
- [ ] The table scales responsively — fills available height minus the card hand area at the bottom.
- [ ] In dark mode the table surface is a dark felt colour; in light mode it is a green felt colour (PS-17).

## Layout Algorithm

Place `n` participants on the perimeter of an ellipse:

- Local player: fixed at 270° (bottom centre).
- Remaining `n-1` players: evenly distributed starting from 90° (top) going clockwise, skipping the 270° slot.

## Technical Notes

- Implement as `PokerTable.vue` — receives `participants: Participant[]` and `localParticipantId: string`.
- Use SVG or CSS absolute positioning for seat placement; SVG ellipse path is cleanest for the table border.
- `PlayerSeat.vue` (from PS-07) is used at each position.
- Seat positions are computed in a `useTableLayout(count)` composable.
