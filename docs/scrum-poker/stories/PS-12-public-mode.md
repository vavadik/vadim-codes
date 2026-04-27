# PS-12 — Public Mode

**Type:** User Story  
**Phase:** 3 — Room Management  
**Estimate:** S  
**Depends on:** PS-05, PS-06

## Story

> As a room master, I want to enable public mode so every participant can reveal cards and reset rounds without needing to go through me.

## Acceptance Criteria

- [ ] The room settings modal contains a "Public mode" toggle (off by default).
- [ ] Toggling it emits `togglePublicMode { enabled: boolean }` to the server.
- [ ] The server updates `room.isPublicMode` and broadcasts `publicModeChanged { enabled }`.
- [ ] When `enabled = true`:
  - Every participant sees the "Reveal" and "Reset" buttons.
  - Every participant can emit `reveal` and `reset` (server accepts from any socket).
  - The "Set task" field is editable by everyone.
- [ ] When `enabled = false`:
  - Only the master sees and can use those controls.
- [ ] An indicator (e.g. badge or label) in the room header signals when public mode is active.

## Server Authorisation

- Only the master can toggle public mode.
- Once enabled, `reveal`, `reset`, and `setTask` are accepted from any participant.
