# PS-04 — Select / Change a Card Vote

**Type:** User Story  
**Phase:** 1 — Core Flow  
**Estimate:** M  
**Depends on:** PS-03

## Story

> As a participant, I want to pick a card from my hand to submit my estimate, and be able to change it before the cards are revealed.

## Acceptance Criteria

- [ ] The player's hand is displayed at the bottom of the room page showing all cards in the active deck plus the three special cards (?, ☕, ∞).
- [ ] Clicking a card emits `selectCard { value }` to the server.
- [ ] The selected card is visually highlighted (raised position, distinct border/colour).
- [ ] Clicking a different card changes the selection; another `selectCard` is emitted.
- [ ] Once cards are revealed (state = `revealed`) the hand becomes non-interactive.
- [ ] After a reset the hand becomes interactive again with no card pre-selected.

## Server Behaviour

- On `selectCard`: store `participant.selectedCard = value`.
- Broadcast `cardSelected { participantId }` to all other clients in the room (value is **not** included).

## Technical Notes

- Hand component receives `deckValues: string[]` and `selectedValue: string | null` as props.
- Emit `update:selectedValue` to parent (v-model compatible).
- Special cards are appended after the numeric/sized deck values.
- Card values for each built-in deck:
  - Fibonacci: `['0','1','2','3','5','8','13','21','34','55','89']`
  - T-shirt: `['XS','S','M','L','XL','XXL']`
  - Powers of 2: `['1','2','4','8','16','32','64']`
- Special: `['?','☕','∞']`

## Out of Scope

- Fan / overlapping visual layout (PS-16).
- Reveal animation (PS-05).
