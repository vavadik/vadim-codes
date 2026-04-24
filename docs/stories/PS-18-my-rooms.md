# PS-18 — My Rooms Panel (Home Page)

**Type:** User Story  
**Phase:** 3 — Room Management  
**Estimate:** M  
**Depends on:** PS-00, PS-02, PS-03

## Story

> As a returning user, I want to see my previously created and recently visited rooms on the home page so I can jump back into a session without needing a bookmarked link.

## Acceptance Criteria

- [ ] The home page shows a "My rooms" panel listing rooms from `poker:rooms` in localStorage.
- [ ] The list is split into two sections:
  - **Owned** — rooms where `isOwner = true`, shown first with a crown icon.
  - **Recent** — rooms where `isOwner = false`, shown below.
- [ ] Each room entry shows: room title (or "Untitled room" if blank), and `lastVisited` timestamp (relative, e.g. "2 hours ago").
- [ ] Owned rooms have an **[Open]** button and a **[Delete]** button.
  - [Open] navigates to `/room/:id`.
  - [Delete] calls the delete room endpoint, removes the entry from localStorage, and removes the row.
- [ ] Recent rooms have a **[Rejoin]** button that navigates to `/room/:id`.
- [ ] If the room no longer exists (server returns 404 on join), a toast notification is shown ("Room no longer exists") and the entry is removed from the list.
- [ ] If `poker:rooms` is empty, the panel is hidden (the home page just shows "Create room").
- [ ] The panel is capped at 20 entries; oldest by `lastVisited` are pruned automatically.

## Server Changes

- `DELETE /api/rooms/:id` endpoint (REST, master-authenticated via sessionId header or query param).
- Verifies the requesting `sessionId` matches `room.masterSessionId` before deleting.

## Technical Notes

- Room list is managed by `useSession().rooms` (from PS-00).
- `addRoom` is called in `useRoom` after a successful join.
- The delete button reuses the danger-zone logic from PS-13 (room settings modal) — extract to a shared `useDeleteRoom(roomId)` composable.
- Relative timestamps: use `Intl.RelativeTimeFormat` — no external date library needed.
