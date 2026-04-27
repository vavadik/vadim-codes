# TASK-01 — WebSocket Gateway & In-Memory Room Service

**Type:** Infrastructure  
**Phase:** 0 — Foundation  
**Estimate:** M

## Goal

Stand up the NestJS WebSocket gateway and an in-memory `RoomService` that manages the lifecycle of all active rooms. This is the backbone all real-time features are built on.

## Scope

### Backend (`apps/poker-api`)

- Install `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`.
- Create `RoomGateway` (`@WebSocketGateway`) with a single `handleConnection` / `handleDisconnect` pair.
- Create `RoomService` with in-memory `Map<roomId, Room>` state:
  - `Room` shape: `{ id, title, currentTask, deck, deckValues, isPublicMode, masterSessionId: string|null, state: 'voting'|'revealed', participants: Map<sessionId, Participant>, lastActivityAt }`.
  - `Participant` shape: `{ sessionId, socketId, name, selectedCard: string|null }`.
  - Methods: `createRoom`, `getRoom`, `deleteRoom`, `addParticipant`, `removeParticipant`, `reconnectParticipant`.
- On `handleDisconnect`: mark the participant's `socketId` as stale but **keep their entry** (preserving `selectedCard`, name, and master status) to allow seamless reconnect. If the room has zero live sockets, update `lastActivityAt` for TTL tracking.
- `reconnectParticipant(sessionId, newSocketId)`: updates `socketId` in the existing participant slot without touching `selectedCard` or any other state.
- Wire both into `AppModule`.

### Contracts (`packages/poker-contracts`)

- Add shared TypeScript types for `Room`, `Participant`, `RoomState`, `DeckName` (Fibonacci | T-shirt | PowersOfTwo | Custom).
- Export from `packages/poker-contracts/src/index.ts`.

## Acceptance Criteria

- [ ] `RoomGateway` starts alongside NestJS without errors.
- [ ] `RoomService.createRoom()` returns a room with a unique nanoid.
- [ ] `RoomService.addParticipant()` / `removeParticipant()` mutate the room's participant map.
- [ ] Unit tests cover `createRoom`, `addParticipant`, `removeParticipant`.

## Notes

- No client events are handled yet — that starts in PS-03 (join room).
- Use `nanoid` (already in ecosystem) for room IDs; length 8–10 chars.
- Keep `RoomService` framework-agnostic (no Socket.io imports) so it's easily unit-tested.
