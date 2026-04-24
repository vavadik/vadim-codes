# TASK-03 — Prisma Room Schema

**Type:** Infrastructure  
**Phase:** 0 — Foundation  
**Estimate:** S  
**Depends on:** TASK-01

## Goal

Define the `Room` model in the Prisma schema so room metadata (and eventually statistics) can be persisted and TTL-based cleanup can be queried.

## Scope

### Schema (`packages/poker-db/prisma/schema.prisma`)

```prisma
model Room {
  id             String   @id
  title          String   @default("")
  deck           String   @default("fibonacci")
  isPublicMode   Boolean  @default(false)
  createdAt      DateTime @default(now())
  lastActivityAt DateTime @default(now())
}
```

- Run `prisma migrate dev --name init_room`.
- Regenerate the Prisma client.

### Backend (`apps/poker-api`)

- In `RoomService.createRoom()`: persist a new `Room` row via `PrismaService`.
- On `RoomService.deleteRoom()`: delete the row.
- On participant connect/disconnect: update `lastActivityAt`.

## Acceptance Criteria

- [ ] Migration runs cleanly against the local PostgreSQL instance.
- [ ] `POST /api/rooms` creates a row in the `Room` table.
- [ ] Deleting a room removes the row.
- [ ] `lastActivityAt` updates on each participant join/leave.

## Notes

- Active room state (participants, votes, deck values) stays in-memory — the DB row is only for metadata and TTL queries.
- TTL cleanup cron job is implemented in PS-14.
