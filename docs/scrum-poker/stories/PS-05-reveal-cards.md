# PS-05 — Reveal Cards

**Type:** User Story  
**Phase:** 1 — Core Flow  
**Estimate:** M  
**Depends on:** PS-04

## Story

> As a room master, I want to reveal all cards at once so the team can see everyone's estimates and start discussing.

## Acceptance Criteria

- [ ] The master sees a prominent "Reveal" button in the master toolbar.
- [ ] Clicking "Reveal" emits the `reveal` event to the server.
- [ ] The server sets `room.state = 'revealed'` and broadcasts `cardsRevealed { votes: Record<participantId, value> }` — including the values of all participants who voted.
- [ ] Participants who had no card selected at reveal time are treated as spectators (their entry in `votes` is omitted or marked `null`).
- [ ] All clients flip every voter's face-down card to show its value.
- [ ] The "Reveal" button is disabled / hidden after reveal; the "Reset" button appears instead (PS-06).
- [ ] In public mode, any participant can reveal (not just the master).

## Server Authorisation

- Reject the event (no-op or error) if the caller is neither the master nor the room is in public mode.

## Technical Notes

- `cardsRevealed` payload includes only voters; spectator status is computed client-side by comparing `participants` to `votes` keys.
- Card flip is a CSS 3D transform (`rotateY(180deg)`) with a short transition (300 ms).
- Results summary (PS-09) is triggered by the same `cardsRevealed` event.

## Out of Scope

- Results summary content (PS-09).
- Vote status face-down indicator (PS-07).
