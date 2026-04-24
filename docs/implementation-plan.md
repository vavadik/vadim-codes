# Scrum Poker — Implementation Plan

> Progress legend: ⬜ not started · 🔄 in progress · ✅ done · ❌ blocked

---

## Phase 0 — Foundation

Infrastructure tasks with no UI. Must be completed before any Phase 1 story can ship.

| #       | Story                                                                              | Status | Notes                                              |
| ------- | ---------------------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| PS-00   | [Anonymous session identity](stories/PS-00-anonymous-session.md)                   | ✅     | sessionId in localStorage, useSession() composable |
| TASK-01 | [WebSocket gateway & in-memory room service](stories/TASK-01-websocket-gateway.md) | ✅     | NestJS WS gateway + RoomService (sessionId-keyed)  |
| TASK-02 | [Room creation REST contract & endpoint](stories/TASK-02-room-rest-contract.md)    | ✅     | ts-rest POST /rooms + DELETE /rooms/:id            |
| TASK-03 | [Prisma room schema](stories/TASK-03-prisma-room-schema.md)                        | ✅     | Room model + first migration                       |

---

## Phase 1 — Core Flow

After this phase: a user can create a room, share the link, join, pick a card, reveal, and reset. Minimum viable session.

| #     | Story                                                     | Status | Notes                           |
| ----- | --------------------------------------------------------- | ------ | ------------------------------- |
| PS-01 | [Display name entry](stories/PS-01-name-entry.md)         | ✅     | Home page + localStorage        |
| PS-02 | [Create a room](stories/PS-02-create-room.md)             | ✅     | REST call + navigate to room    |
| PS-03 | [Join a room via invite link](stories/PS-03-join-room.md) | ✅     | WS join, roomState, late joiner |
| PS-04 | [Select / change a card](stories/PS-04-select-card.md)    | ✅     | Card hand + selectCard event    |
| PS-05 | [Reveal cards](stories/PS-05-reveal-cards.md)             | ✅     | Master reveal + card flip       |
| PS-06 | [Reset round](stories/PS-06-reset-round.md)               | ✅     | Clear votes, restart voting     |

---

## Phase 2 — Game Features

After this phase: vote visibility, task context, results analytics, and deck flexibility are all working.

| #     | Story                                                             | Status | Notes                                      |
| ----- | ----------------------------------------------------------------- | ------ | ------------------------------------------ |
| PS-07 | [Vote status indicators](stories/PS-07-vote-status-indicators.md) | ✅     | PlayerSeat component: idle/voted/revealed  |
| PS-08 | [Set current task](stories/PS-08-set-current-task.md)             | ✅     | Inline edit for master, read-only others   |
| PS-09 | [Results summary](stories/PS-09-results-summary.md)               | ✅     | Average + histogram after reveal           |
| PS-10 | [Card deck selection](stories/PS-10-deck-selection.md)            | ✅     | Fibonacci / T-shirt / Powers of 2 / Custom |

---

## Phase 3 — Room Management

After this phase: facilitators have full control; rooms clean themselves up.

| #     | Story                                                       | Status | Notes                                                                  |
| ----- | ----------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| PS-11 | [Transfer master role](stories/PS-11-transfer-master.md)    | ✅     | transferMaster WS event; leaderless badge in header                    |
| PS-12 | [Public mode](stories/PS-12-public-mode.md)                 | ✅     | togglePublicMode WS event; Public badge in header                      |
| PS-13 | [Room settings modal](stories/PS-13-room-settings-modal.md) | ✅     | Gear icon → RoomSettingsModal (title, deck, participants, danger zone) |
| PS-14 | [Room auto-expiry (TTL)](stories/PS-14-room-ttl.md)         | ✅     | @nestjs/schedule cron every 30 min; RoomScheduler                      |
| PS-18 | [My rooms panel](stories/PS-18-my-rooms.md)                 | ✅     | MyRoomsPanel on home page; owned + recent sections                     |

---

## Phase 4 — UX Polish

After this phase: the app looks and feels like a real poker table.

| #     | Story                                                     | Status | Notes                                    |
| ----- | --------------------------------------------------------- | ------ | ---------------------------------------- |
| PS-15 | [Poker table layout](stories/PS-15-poker-table-layout.md) | ⬜     | Rounded-rect table, players on perimeter |
| PS-16 | [Card hand fan layout](stories/PS-16-card-hand-fan.md)    | ⬜     | Overlapping fan, hover/select animations |
| PS-17 | [Light / dark theme](stories/PS-17-theme-support.md)      | ⬜     | OS default, localStorage, felt colour    |

---

## Dependency Graph

```
PS-00 ──┬──▶ PS-01 ──▶ PS-02 ──▶ (room page, needs PS-03)
        │
        └──▶ PS-03 (join sends sessionId) ──┬──▶ PS-04 ──┬──▶ PS-05 ──▶ PS-06
                                            │             │             │
TASK-01 ──┬──▶ PS-03                        │             │             └──▶ PS-09
          │                                 │             └──▶ PS-07
TASK-02 ──┘                                 │             └──▶ PS-10
                                            ├──▶ PS-08
TASK-03 ──▶ PS-14                           ├──▶ PS-11 ──▶ PS-13
                                            ├──▶ PS-12 ──▶ PS-13
                                            └──▶ PS-18

PS-07 ──▶ PS-15 ──▶ PS-17
PS-04 ──▶ PS-16
```

---

## Future Milestones (out of scope for v1)

- **SSO / user accounts** — persistent rooms, per-user statistics
- **Jira / Linear integration** — import stories as tasks
- **Voting timer** — auto-reveal after countdown
- **Kick participant** — moderation
- **Session history** — replay past estimates
