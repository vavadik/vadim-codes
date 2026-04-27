# PS-03 — Join a Room via Invite Link

**Type:** User Story  
**Phase:** 1 — Core Flow  
**Estimate:** M  
**Depends on:** PS-01, TASK-01

## Story

> As a user, I want to open an invite link and immediately be placed in the poker room so I can participate without any sign-up.

## Acceptance Criteria

- [ ] Navigating to `/room/:id` opens the room page.
- [ ] If the user has no saved name, the name entry form is shown inline before connecting.
- [ ] The client emits a `join` event (`{ roomId, sessionId, name }`) over WebSocket.
- [ ] The server responds with `roomState` — the full current room snapshot — and the client renders it.
- [ ] **New participant**: if the `sessionId` is not found in the room, a new participant slot is created and `participantJoined` is broadcast.
- [ ] **Reconnecting participant**: if the `sessionId` is already in the room (e.g. after a refresh), the server updates `socketId`, replies with `roomState`, and does **not** broadcast `participantJoined` (no duplicate seat).
- [ ] **Master reconnect**: if the reconnecting `sessionId` matches `room.masterSessionId`, master privileges are restored silently.
- [ ] If the room ID does not exist, a "Room not found" message is displayed with a link back to home.
- [ ] When a participant's socket drops, remaining participants see a visual "disconnected" indicator — the seat is not removed immediately. If the socket does not reconnect within 60 seconds, `participantLeft` is broadcast and the slot is removed.

## Late-Joiner Behaviour

- If joining mid-round (state = `voting`): see other players' face-down cards and the current task.
- If joining mid-round (state = `revealed`): see all cards face-up and the results summary.

## Technical Notes

- Create `useRoom(roomId)` composable that:
  - Reads `sessionId` and `name` from `useSession()`.
  - Opens a `socket.io-client` connection to the API.
  - Emits `join { roomId, sessionId, name }` and listens for `roomState`, `participantJoined`, `participantLeft`.
  - Stores state in a Pinia `useRoomStore`.
  - Calls `useSession().addRoom({ id, title, isOwner })` after a successful `roomState` response.
- Room page (`/room/:id`) mounts `useRoom` and tears down the socket on `onUnmounted`.
- The 60-second reconnect grace window is managed server-side with a `setTimeout` per disconnected slot.
- The `RoomGateway` on the server joins the socket to a socket.io room (`roomId`) on `join` event.

## Out of Scope

- Card selection UI (PS-04).
- Full table layout (PS-15).
