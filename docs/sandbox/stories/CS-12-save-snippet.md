# CS-12 — Save Snippet & Shareable Link

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** M

## Story

> As any user (anonymous or authenticated), I want to save my code and get a shareable link so I can send my snippet to someone else or bookmark it for later.

## Acceptance Criteria

- [ ] A **Save** button is visible in the toolbar for all users.
- [ ] Clicking Save sends the current editor content to the API; the API responds with a short ID (e.g. `abc123`).
- [ ] After a successful save, the browser URL updates to `/s/abc123` and a **"Link copied"** toast is shown (the share URL is copied to the clipboard automatically).
- [ ] The save link in the share URL is stable and immutable — loading it at any point in the future returns the exact same code.
- [ ] If the user is authenticated, the saved snippet is also added to their personal snippet list (left pane updates immediately).
- [ ] If the save request fails (network error, server error), an error toast is shown and the URL does not change.
- [ ] The Save button is debounced — rapid clicks send only one request.
- [ ] While the save is in progress, the Save button shows a loading state and is disabled.

## API Contract

```
POST /snippets
Body:   { code: string }
Auth:   optional (Bearer token if present)
201:    { id: string, url: string }
413:    snippet exceeds size limit (500 KB)
429:    rate limit exceeded
```

## Technical Notes

- Short IDs are generated server-side (see TASK-02).
- Clipboard write uses `navigator.clipboard.writeText(url)` with a fallback for browsers that deny clipboard access (show a copyable input instead).
- The snippet record stored server-side is **immutable after creation** — no update path for the record created here. Updating an existing snippet is a separate flow (CS-17).
- Authenticated requests include the session token so the API can associate the snippet with the user.
