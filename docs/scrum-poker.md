# Scrum Poker — Product Requirements

## Overview

A real-time, browser-based planning poker tool for agile teams. Anonymous by default (no sign-up required); future SSO integration is planned for persistent rooms and statistics.

---

## 1. Identity & Sessions

### 1.1 Anonymous Session Identity

- On first visit a **session ID** (UUID v4) is auto-generated and stored in `localStorage` under `poker:sessionId`.
- The session ID is the user's durable anonymous identity — it persists until the user clears their browser storage.
- Alongside the session ID, the user chooses a **display name** (also stored in `localStorage` under `poker:name`, pre-filled on return visits).
- No account creation, email, or password is required.

### 1.2 What the Session ID Enables

- **Reconnect continuity** — refreshing the page or recovering from a dropped connection is seamless; the server recognises the returning session and restores participant state.
- **Vote restoration** — a selected card is keyed to the session ID and survives disconnects within the same round.
- **Master reclaim** — the room stores the master's session ID; reconnecting with the same ID reclaims master privileges instantly.
- **Room ownership** — the home page shows rooms created or recently visited by this session (stored in `localStorage`).

### 1.3 Session Expiry & Orphaned Master

- If the master's localStorage is cleared (session ID lost), the server has no way to detect this directly.
- The room becomes **leaderless**: no automatic promotion occurs. Participants who need a facilitator should create a new room, or the master should transfer privileges or enable public mode before leaving.
- A leaderless room continues to function for voting (participants can still select cards); only master-only actions (reveal, reset, set task) are blocked unless public mode was enabled.

### 1.4 Future: SSO

- A future milestone will add SSO (provider TBD) for persistent rooms and per-user statistics.
- Anonymous and authenticated sessions should coexist in the same room.

---

## 2. Room Lifecycle

### 2.1 Creating a Room

- Any user can create a room from the home page.
- On creation the user becomes the **room master**.
- The room receives a short, unique ID and a shareable **invite link** (e.g. `/room/:id`).

### 2.2 Joining a Room

- A user joins via the invite link.
- If they have no saved name they are asked to enter one before entering.
- The client sends `{ roomId, sessionId, name }` on WebSocket join.
- Users who join while a session is in progress see the current state immediately (cards face-down or face-up, current task, etc.).
- If the same session ID reconnects (refresh, network drop), the server merges the new socket into the existing participant slot, preserving name, selected card, and master status.
- The room is added to the session's `localStorage` room history (for the "my rooms" panel).

### 2.3 Room Expiry

- Anonymous rooms are deleted after **24 hours of inactivity** (no WebSocket connections).
- The TTL resets whenever at least one user is connected.
- Authenticated rooms (future) persist indefinitely.

### 2.4 Room Deletion

- The room master can explicitly delete a room at any time.

---

## 3. Room Roles & Permissions

### 3.1 Room Master

- The creator is the initial room master.
- The master can:
  - Set the **room title** and **current task** description.
  - Select the **card deck** (see §5).
  - **Reveal** all played cards.
  - **Reset** the round (hide all cards, clear selections).
  - **Transfer** master privileges to any other participant.
  - Toggle the room into **public mode**.

### 3.2 Public Mode

- When enabled, **every participant** gains master privileges (reveal, reset, set task).
- Useful for self-facilitated teams.

### 3.3 Transfer of Master

- The current master can hand off control to any named participant via a context menu or player action.
- The master role is keyed to a **session ID**, not a socket connection — the master can refresh or briefly disconnect and return to their role automatically.
- If the master's session ID is lost (localStorage cleared) and they cannot reconnect with the same ID, the room becomes **leaderless**: no automatic promotion. Other participants should create a new room, or the master should transfer or enable public mode proactively before leaving.

---

## 4. Participants & Spectators

### 4.1 Voter Status

- Every participant who **selects a card** before reveal is a **voter**.
- Participants who have **not selected a card** when the master reveals are treated as **spectators** for that round — their absence does not block reveal and their vote is not counted in the average.

### 4.2 Visibility of Votes

- While cards are face-down:
  - Other participants see a **face-down card indicator** (voted / not voted) for each player — value is hidden.
  - The room master sees the same face-down indicator (no peeking in standard mode).
- After reveal:
  - All cards flip face-up; every participant sees every vote.

---

## 5. Card Decks

### 5.1 Built-in Decks

The room master selects one deck per room (can be changed between rounds):

| Name        | Values                                |
| ----------- | ------------------------------------- |
| Fibonacci   | 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89  |
| T-shirt     | XS, S, M, L, XL, XXL                  |
| Powers of 2 | 1, 2, 4, 8, 16, 32, 64                |
| Custom      | Master-defined comma-separated values |

### 5.2 Special Cards

Always available alongside the selected deck:

| Card | Meaning                        |
| ---- | ------------------------------ |
| ?    | Unsure / needs clarification   |
| ☕   | Need a break                   |
| ∞    | Story is too large to estimate |

---

## 6. Voting Flow

1. Master sets (or updates) the **current task** text.
2. Participants pick a card from their hand; they may change selection until reveal.
3. The master clicks **Reveal** (or any participant in public mode).
4. Cards flip face-up; the **results summary** appears (see §7).
5. Master clicks **Reset** to start the next round: all cards hide, selections clear.

---

## 7. Results Summary

Displayed **inline at the top** of the table after reveal:

- **Average** of numeric votes (non-numeric and special cards excluded).
- **Vote breakdown**: each unique value and the count/percentage of players who chose it.
- **Histogram / bar chart** of the distribution.
- Individual player votes remain visible on their seat card.

---

## 8. UI / UX

### 8.1 Screens

| Route       | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `/`         | Home — enter name, create room, or paste an invite link to join |
| `/room/:id` | Poker room                                                      |

### 8.2 Room Layout

```
┌─────────────────────────────────────────────────────┐
│  RESULTS SUMMARY (visible after reveal)             │
│  avg: 5  │  histogram                               │
└─────────────────────────────────────────────────────┘

         [PlayerA ✔]   [PlayerB ✔]   [PlayerC]
        /                                       \
  [PlayerF]      ┌────────────────────┐    [PlayerD ✔]
        \        │   Current Task:    │        /
  [PlayerE ✔]   │   "User login"     │   [PlayerG]
        \        └────────────────────┘        /
         ╰────────────────────────────────────╯
           (classic poker table — rounded rect)

┌─────────────────────────────────────────────────────┐
│   YOUR HAND (overlapping fan of cards)              │
│     [1]  [2]  [3]  [5]  [8]  [13]  [?]  [☕]  [∞]  │
└─────────────────────────────────────────────────────┘
```

### 8.3 Table

- Shape: **classic poker table** — rectangle with heavily rounded corners, felt-style fill.
- Players are positioned **around the perimeter**, evenly spaced.
- Each player seat shows:
  - Display name.
  - A card face (face-down / face-up after reveal).
  - Visual indicator: ✔ voted / empty = not voted yet.
- The table center shows the **current task name**.

### 8.4 Card Hand

- The player's selectable cards are displayed at the **bottom of the screen**.
- Cards overlap each other in a **fan / spread** style reminiscent of holding physical cards.
- Hovering a card lifts it slightly; clicking selects it (highlighted border + raised position).
- After reveal, the hand is replaced by a **"Reset" prompt** (master only) or a waiting state for other players.

### 8.5 Master Controls

Accessible via a toolbar or context actions (not buried in settings):

- **Set task** — inline editable text field at the table center.
- **Reveal cards** — prominent action button.
- **Reset round** — resets all votes and hides cards.
- **Deck selector** — dropdown to change the card set (between rounds).
- **Room settings** — modal: room title, public mode toggle, master transfer, delete room, copy invite link.

### 8.6 Theme

- Supports **light and dark mode** (toggle already wired in `useTheme.ts`).
- Table felt color adapts to theme (green felt on light, dark felt on dark).

---

## 9. Real-time Protocol (WebSocket)

All room state changes are broadcast via WebSocket. The connection is established when the user enters the room page and closed on navigation away.

### 9.1 Client → Server Events

| Event              | Payload             | Description                       |
| ------------------ | ------------------- | --------------------------------- |
| `join`             | `{ roomId, name }`  | Enter the room                    |
| `selectCard`       | `{ value }`         | Pick or change card               |
| `reveal`           | —                   | Flip all cards (master / public)  |
| `reset`            | —                   | Clear all votes (master / public) |
| `setTask`          | `{ task }`          | Update current task text          |
| `setTitle`         | `{ title }`         | Update room title                 |
| `setDeck`          | `{ deck }`          | Change card deck                  |
| `transferMaster`   | `{ participantId }` | Handoff master role               |
| `togglePublicMode` | `{ enabled }`       | Toggle public mode                |

### 9.2 Server → Client Events

| Event               | Payload             | Description                          |
| ------------------- | ------------------- | ------------------------------------ |
| `roomState`         | Full room snapshot  | Sent on join                         |
| `participantJoined` | Participant object  | New player entered                   |
| `participantLeft`   | `{ participantId }` | Player disconnected                  |
| `cardSelected`      | `{ participantId }` | Someone played a card (value hidden) |
| `cardsRevealed`     | `{ votes }`         | All votes with values                |
| `roundReset`        | —                   | New round started                    |
| `taskUpdated`       | `{ task }`          | Task text changed                    |
| `titleUpdated`      | `{ title }`         | Room title changed                   |
| `deckChanged`       | `{ deck }`          | Card deck swapped                    |
| `masterChanged`     | `{ participantId }` | New master assigned                  |
| `publicModeChanged` | `{ enabled }`       | Public mode toggled                  |

---

## 10. Data Model (High-level)

### Room

| Field             | Type            | Notes                                         |
| ----------------- | --------------- | --------------------------------------------- |
| `id`              | string (nanoid) | URL-safe short ID                             |
| `title`           | string          | Display title                                 |
| `currentTask`     | string          | Active story/task                             |
| `deck`            | enum / string[] | Selected card deck                            |
| `isPublicMode`    | boolean         |                                               |
| `masterSessionId` | string \| null  | Session ID of the master; `null` = leaderless |
| `state`           | enum            | `voting` \| `revealed`                        |
| `lastActivityAt`  | timestamp       | For TTL eviction                              |

### Participant

| Field          | Type           | Notes                                               |
| -------------- | -------------- | --------------------------------------------------- |
| `sessionId`    | string         | Durable anonymous identity (UUID from localStorage) |
| `socketId`     | string         | Current socket connection (changes on reconnect)    |
| `name`         | string         | Display name                                        |
| `selectedCard` | string \| null | Hidden until reveal; persists across reconnects     |
| `isSpectator`  | boolean        | Computed: no card at reveal time                    |

### LocalStorage schema (client-side)

| Key               | Type             | Notes                                                          |
| ----------------- | ---------------- | -------------------------------------------------------------- |
| `poker:sessionId` | string (UUID v4) | Generated once, never overwritten                              |
| `poker:name`      | string           | Display name, editable                                         |
| `poker:rooms`     | JSON array       | `[{ id, title, isOwner, lastVisited }]` — capped at 20 entries |

---

## 11. Technical Stack

Follows the established monorepo patterns:

| Layer           | Tech                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| Frontend        | Vue 3 + Vite + Pinia + Tailwind + DaisyUI (`apps/poker-web`)               |
| Backend         | NestJS 11 (`apps/poker-api`)                                               |
| WebSocket       | NestJS Gateway (`@nestjs/websockets` + `socket.io`)                        |
| REST/Contract   | ts-rest + Zod (`packages/poker-contracts`)                                 |
| Database        | Prisma 7 + PostgreSQL (`packages/poker-db`) — room metadata + future stats |
| Real-time state | In-memory (NestJS service) for active rooms; DB for persistence/TTL        |

---

## 12. Out of Scope (v1)

- SSO / user accounts
- Per-user statistics and history
- Jira / Linear ticket integration
- Voting timers / auto-reveal
- Mobile-native app (responsive web only)
- Emoji reactions during voting
