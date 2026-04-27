# PS-14 — Room Auto-Expiry (TTL)

**Type:** User Story  
**Phase:** 3 — Room Management  
**Estimate:** S  
**Depends on:** TASK-03

## Story

> As a system operator, I want anonymous rooms to be automatically deleted after 24 hours of inactivity so the database and in-memory state don't accumulate stale rooms.

## Acceptance Criteria

- [ ] When the last participant disconnects, `room.lastActivityAt` is updated in the DB.
- [ ] A NestJS scheduled task (cron) runs every 30 minutes.
- [ ] The cron queries rooms where `lastActivityAt < now() - 24h` and no sockets are connected.
- [ ] Matching rooms are deleted from both the in-memory map and the DB.
- [ ] If any participant reconnects to a TTL-expired room, they receive a "Room not found" response and are redirected to home.

## Technical Notes

- Use `@nestjs/schedule` + `@Cron(CronExpression.EVERY_30_MINUTES)`.
- Only rooms with zero live sockets qualify for deletion — check `RoomService` in-memory participant count before deleting.
- No UI change required; the frontend already handles the "room not found" case from PS-03.

## Out of Scope

- Authenticated rooms with no expiry (future milestone).
- Email notification before expiry.
