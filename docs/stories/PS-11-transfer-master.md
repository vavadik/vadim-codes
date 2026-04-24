# PS-11 — Transfer Master Role

**Type:** User Story  
**Phase:** 3 — Room Management  
**Estimate:** S  
**Depends on:** PS-03

## Story

> As a room master, I want to hand off facilitator control to another participant so someone else can drive the session.

## Acceptance Criteria

- [ ] In the room settings modal (or via a context menu on a player's seat), the master can select "Make master" next to any other participant.
- [ ] This emits `transferMaster { sessionId }` to the server (target participant identified by session ID).
- [ ] The server updates `room.masterSessionId` and broadcasts `masterChanged { sessionId }`.
- [ ] All clients update their UI: the new master sees master controls; the old master loses them.
- [ ] The action is irreversible without the new master transferring back.
- [ ] The master cannot transfer the role to themselves (button is absent/disabled for their own seat).
- [ ] If the master disconnects without transferring, the room becomes **leaderless** (`masterSessionId` remains set but no socket matches it). No auto-promotion occurs.
- [ ] A leaderless room shows a subtle indicator ("No facilitator") in the header; participants can still vote but cannot reveal/reset (unless public mode is on).

## Server Authorisation

- Only the current master (matched by `sessionId`) can emit `transferMaster`.

## Technical Notes

- Master status is derived from `useRoomStore`: `isMaster = computed(() => store.masterSessionId === session.sessionId)`.
- `isLeaderless = computed(() => store.masterSessionId !== null && !store.participants.find(p => p.sessionId === store.masterSessionId && p.isConnected))`.
- The `masterChanged` event updates the crown icon on seats in real time.
