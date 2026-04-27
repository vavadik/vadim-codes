# CS-16 — Authenticated Snippet List

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** M

## Story

> As an authenticated developer, I want to see a list of all my saved snippets in the left panel so I can quickly return to previous work.

## Acceptance Criteria

- [ ] The left pane shows a **Snippet List** section for authenticated users, hidden for anonymous users.
- [ ] The list is fetched from the API on sign-in and on each app load when the user is authenticated.
- [ ] Each list item displays:
  - Title (if set) or a first-line preview of the code (truncated to ~40 characters).
  - Relative timestamp (e.g. "2 hours ago", "Jan 14").
- [ ] Clicking a list item navigates to `/s/:id` and loads that snippet into the editor.
- [ ] The active/open snippet is visually highlighted in the list.
- [ ] The list is sorted by last-updated timestamp, newest first.
- [ ] A loading skeleton is shown while the list is being fetched.
- [ ] If the list is empty, a placeholder is shown: "No snippets yet. Save one to get started."
- [ ] When a new snippet is saved (CS-12) or forked (CS-14), it is prepended to the list immediately without a full refetch.

## API Contract

```
GET /snippets (authenticated)
Auth:   required (Bearer token)
200:    { snippets: { id, title, preview, updatedAt }[] }
```

## Technical Notes

- Expose list state from a `useSnippets()` composable / Pinia store: `{ snippets, loading, fetch, prepend, remove, update }`.
- The `preview` field is computed server-side (first non-empty line, truncated to 80 chars) so the client doesn't need to handle code parsing.
- Pagination is out of scope for v1; the API returns all snippets up to the 100-item limit.
