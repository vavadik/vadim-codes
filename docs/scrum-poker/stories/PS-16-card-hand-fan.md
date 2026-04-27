# PS-16 — Card Hand Fan Layout

**Type:** User Story  
**Phase:** 4 — UX Polish  
**Estimate:** M  
**Depends on:** PS-04

## Story

> As a participant, I want my selectable cards displayed as a fan of overlapping cards at the bottom of the screen so the UI feels like holding a hand of real playing cards.

## Acceptance Criteria

- [ ] Cards are rendered in a horizontal fan: each card is slightly rotated and offset so they overlap, with the centre card straight and edges angled outward.
- [ ] Hovering a card lifts it vertically (translate-Y) and brings it to full opacity/scale.
- [ ] Clicking a card selects it: it remains lifted and gains a highlighted border or glow; other cards return to rest.
- [ ] The selected card stays visually prominent while the round is ongoing.
- [ ] Cards spread out to fill the available horizontal width without clipping; the spread angle adapts to the number of cards.
- [ ] On mobile / narrow viewport the cards scroll horizontally instead of overlapping (graceful degradation).

## Technical Notes

- `CardHand.vue` receives `cards: string[]`, `selectedCard: string | null`, emits `select(value: string)`.
- Fan effect: CSS `transform: rotate(Xdeg) translateY(Ypx)` computed per-card based on index and total count.
- Transition between rest / hover / selected states with `transition: transform 150ms ease, box-shadow 150ms ease`.
- Card aspect ratio: 2.5 : 3.5 (standard playing card proportion).
