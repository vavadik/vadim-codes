# CS-13 — Open a Shared Snippet

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** S

## Story

> As a developer receiving a shared link, I want the sandbox to load the snippet's code automatically so I can read, run, and experiment with it immediately.

## Acceptance Criteria

- [ ] Navigating to `/s/:id` fetches the snippet from the API and loads the code into the editor.
- [ ] The editor is fully interactive — the viewer can edit the code freely; their edits are local and do not affect the original snippet.
- [ ] While the snippet is loading, the editor shows a loading state (skeleton or spinner); the Run button is disabled.
- [ ] If the snippet ID does not exist (404), the app shows a friendly "Snippet not found" message with a button to start a new blank snippet.
- [ ] After loading, the URL remains `/s/:id`; if the user later modifies and saves the code, a **new snippet** is created and the URL updates to the new ID (see CS-14 for fork behaviour).
- [ ] The page title updates to reflect that a shared snippet is open (e.g. `Sandbox — /s/abc123`).
- [ ] Opening a shared snippet overwrites the local draft (`sandbox:draft`) with the snippet's code.

## API Contract

```
GET /snippets/:id
Auth:   not required
200:    { id: string, code: string, createdAt: string }
404:    snippet not found or expired
```

## Technical Notes

- The route `/s/:id` is handled by Vue Router; the route component fetches the snippet on mount.
- Use `setValue(code)` from `useEditor()` — this triggers the normal draft auto-save so `sandbox:draft` stays in sync.
- If the app is loaded on `/` (no ID), the normal draft-restore flow from CS-06 applies.
