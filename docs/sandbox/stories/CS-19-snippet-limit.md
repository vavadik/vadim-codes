# CS-19 — Snippet Limit per User

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** S

## Story

> As an authenticated user approaching my snippet limit, I want to be clearly warned so I know to clean up old snippets before I lose the ability to save new ones.

## Acceptance Criteria

- [ ] Each authenticated user is limited to **100 saved snippets**.
- [ ] When a user's snippet count reaches **90** (90% of limit), a warning banner appears in the left pane: "You're using 90 of 100 snippet slots. Delete old snippets to free up space."
- [ ] When the user attempts to save a snippet while already at 100, the save is **blocked**: the API returns 409 and the frontend shows an error message: "You've reached your 100-snippet limit — delete some old snippets to save new ones."
- [ ] The error message includes a visible link/button to scroll the snippet list into focus, making it easy to delete old items.
- [ ] Anonymous users are not subject to this limit (each save is independent; expiry handles cleanup).

## API Behaviour

```
POST /snippets (authenticated, at limit)
409 Conflict: { error: 'SNIPPET_LIMIT_REACHED', limit: 100, count: 100 }
```

## Technical Notes

- The API checks the count before inserting: `SELECT COUNT(*) FROM snippets WHERE user_id = $1`.
- The frontend reads the current count from the snippet list length in `useSnippets()` — no extra API call needed for the warning threshold check.
- The 90-snippet warning banner is computed: `isAuthenticated && snippets.length >= 90`.
- The banner is dismissible for the session (same pattern as the anonymous nudge in CS-15) but reappears on the next visit.
