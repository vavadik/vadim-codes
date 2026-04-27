# PS-09 — Results Summary

**Type:** User Story  
**Phase:** 2 — Game Features  
**Estimate:** M  
**Depends on:** PS-05

## Story

> As a participant, I want to see a summary of all votes after the cards are revealed so the team can quickly spot agreement or outliers.

## Acceptance Criteria

- [ ] After `cardsRevealed`, a results panel appears **inline at the top** of the room (above the table).
- [ ] The panel shows:
  - **Average** — arithmetic mean of numeric-only votes (special cards ?, ☕, ∞ excluded); rounded to one decimal.
  - **Vote breakdown** — each unique value with a count and percentage of voters (e.g. "5 — 3 votes (50%)").
  - **Histogram** — horizontal bar chart where bar width is proportional to the percentage for each value; bars are sorted by card value ascending.
- [ ] Spectators (non-voters) are listed separately below the histogram with a "—" vote.
- [ ] The panel is hidden before reveal and after a reset.
- [ ] If all votes are non-numeric, no average is shown (only the breakdown).

## Technical Notes

- `ResultsSummary` is a pure display component receiving `votes: Record<participantId, string>` and `participants: Participant[]` as props.
- Average computation is done in a computed property; no server-side calculation needed.
- Histogram uses CSS `width` percentages — no chart library required.

## Out of Scope

- Persistent storage of results (future statistics feature).
