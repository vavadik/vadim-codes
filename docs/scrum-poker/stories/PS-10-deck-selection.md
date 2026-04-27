# PS-10 — Card Deck Selection

**Type:** User Story  
**Phase:** 2 — Game Features  
**Estimate:** S  
**Depends on:** PS-04

## Story

> As a room master, I want to choose the card deck that fits my team's estimation style so we use the right scale.

## Acceptance Criteria

- [ ] The master toolbar contains a deck selector (dropdown / select).
- [ ] Available options: Fibonacci, T-shirt, Powers of 2, Custom.
- [ ] Selecting a built-in deck emits `setDeck { deck: DeckName }` to the server.
- [ ] The server updates `room.deck` / `room.deckValues` and broadcasts `deckChanged { deck, deckValues }`.
- [ ] All clients update their card hand to show the new set of cards.
- [ ] **Custom deck**: selecting "Custom" reveals a text input where the master types comma-separated values (e.g. `1, 2, 4, 8`). Confirmed with Enter or a "Apply" button; emits `setDeck { deck: 'custom', deckValues: string[] }`.
- [ ] If the deck changes mid-round, all current selections are cleared (equivalent to a reset) and all clients are notified.
- [ ] Special cards (?, ☕, ∞) are always present regardless of the selected deck.
- [ ] Non-master participants see the current deck name as read-only info (no dropdown).

## Technical Notes

- Default deck on room creation: Fibonacci.
- Deck values are validated server-side: non-empty array, max 20 values, each value max 8 chars.
