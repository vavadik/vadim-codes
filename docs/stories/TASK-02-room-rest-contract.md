# TASK-02 — Room Creation REST Contract & Endpoint

**Type:** Infrastructure  
**Phase:** 0 — Foundation  
**Estimate:** S  
**Depends on:** TASK-01

## Goal

Define the ts-rest contract for room creation and implement the corresponding NestJS controller endpoint. This is the only REST call in the app — everything else is WebSocket.

## Scope

### Contracts (`packages/poker-contracts`)

Add `roomContract` with a single route:

```ts
POST /rooms
Body: { title?: string; deck?: DeckName }
Response 201: { id: string; inviteUrl: string }
```

Merge into the root `contract` object.

### Backend (`apps/poker-api`)

- Create `RoomModule` → `RoomController` (ts-rest) → calls `RoomService.createRoom()`.
- Return `{ id, inviteUrl: '/room/:id' }`.
- No auth required.

### Frontend (`apps/poker-web`)

- Create a typed ts-rest client hooked to the existing `/api` proxy.
- Export a `roomApi` client for use in the create-room story (PS-02).

## Acceptance Criteria

- [ ] `POST /api/rooms` returns `201` with `{ id, inviteUrl }`.
- [ ] Room ID is present in `RoomService`'s in-memory map after the call.
- [ ] ts-rest contract types are consumed by the frontend client (TypeScript compiles with no errors).
- [ ] E2e test: POST → 201 → GET `/health` still 200 (smoke test).

## Notes

- `inviteUrl` is a relative path; the client constructs the full URL using `window.location.origin`.
- No Prisma persistence yet — that is TASK-03.
