# PS-00 — Anonymous Session Identity

**Type:** User Story  
**Phase:** 0 — Foundation  
**Estimate:** S

## Story

> As a returning user, I want the app to remember who I am without signing up so I can rejoin my rooms and reclaim my master role after a page refresh.

## Acceptance Criteria

- [ ] On first visit a UUID v4 `sessionId` is generated and stored in `localStorage` under `poker:sessionId`.
- [ ] If a `sessionId` already exists in `localStorage` it is reused — never overwritten.
- [ ] The `sessionId` is exposed via a `useSession()` composable and available throughout the app.
- [ ] The composable also manages `poker:name` (display name) and `poker:rooms` (room history list).
- [ ] All WebSocket `join` events include `{ sessionId, name }` alongside `roomId`.

## localStorage Schema

| Key               | Value                                         | Notes                                   |
| ----------------- | --------------------------------------------- | --------------------------------------- |
| `poker:sessionId` | UUID v4 string                                | Written once on first visit             |
| `poker:name`      | string                                        | User-chosen display name                |
| `poker:rooms`     | JSON: `{ id, title, isOwner, lastVisited }[]` | Max 20 entries, pruned by `lastVisited` |

## `useSession()` API

```ts
const { sessionId, name, setName, rooms, addRoom, removeRoom } = useSession();
```

- `sessionId`: readonly string (auto-generated, immutable)
- `name` / `setName(v)`: reactive display name backed by localStorage
- `rooms`: reactive array of visited room records
- `addRoom({ id, title, isOwner })`: upserts into the list, updates `lastVisited`, prunes to 20
- `removeRoom(id)`: removes a room from the list

## Technical Notes

- Pure frontend composable — no backend call.
- Use `crypto.randomUUID()` (available in all modern browsers) for generation.
- `rooms` list is pruned to 20 entries sorted by `lastVisited` descending when adding.
- No expiry logic here: the session lives until the user explicitly clears localStorage.
