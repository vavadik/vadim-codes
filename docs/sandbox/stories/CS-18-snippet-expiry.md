# CS-18 — Snippet Expiry

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** S

## Story

> As the system, I want anonymous snippets to expire after a period of inactivity so the database doesn't fill up with abandoned one-off pastes.

## Acceptance Criteria

- [ ] Anonymous snippets (where `userId IS NULL`) expire **90 days after their last view**.
- [ ] Every time a snippet is fetched via `GET /snippets/:id`, its `lastViewedAt` timestamp is updated.
- [ ] A scheduled job runs periodically (e.g. daily) and permanently deletes snippet records where `userId IS NULL AND lastViewedAt < NOW() - INTERVAL '90 days'`.
- [ ] Authenticated user snippets (`userId IS NOT NULL`) **never expire**.
- [ ] Snippets orphaned by account deletion (CS-03) have their `lastViewedAt` reset to the deletion timestamp so they get a fresh 90-day window.
- [ ] Accessing an expired snippet returns a 404; the frontend treats this the same as a missing snippet (CS-13).

## Technical Notes

- `lastViewedAt` is a nullable timestamp column on the `snippets` table (see TASK-01). Set it on creation and on every `GET`.
- The cleanup job can be a NestJS `@Cron` task (e.g. `@Cron('0 3 * * *')` — daily at 3 AM) using `@nestjs/schedule`.
- Update in bulk: `DELETE FROM snippets WHERE user_id IS NULL AND last_viewed_at < NOW() - INTERVAL '90 days'`.
- No user-facing notification for expiry — the 404 response is the signal.
