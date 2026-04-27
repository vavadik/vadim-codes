# CS-17 — Snippet Management (Rename, Update, Delete)

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** M

## Story

> As an authenticated developer, I want to rename, update, and delete my snippets so I can keep my list tidy and my code up to date.

## Acceptance Criteria

### Rename

- [ ] Each snippet in the list has an inline rename action (e.g. pencil icon or double-click on title).
- [ ] The title field becomes an inline input; pressing Enter or blurring saves the new title.
- [ ] Pressing Escape cancels without saving.
- [ ] The updated title is reflected in the list immediately after save.

### Update (Overwrite)

- [ ] When viewing their own snippet, an authenticated user's Save button reads **Save** (not Fork).
- [ ] Clicking Save sends a `PATCH /snippets/:id` request with the current editor content.
- [ ] The existing share link (`/s/:id`) continues to resolve to the updated code.
- [ ] The list item's `updatedAt` timestamp is refreshed and the item moves to the top of the list.

### Delete

- [ ] Each snippet in the list has a **Delete** action (e.g. trash icon, revealed on hover).
- [ ] Clicking Delete shows an inline or popover confirmation: "Delete this snippet? This cannot be undone."
- [ ] On confirm, the snippet is removed from the list immediately (optimistic update) and deleted via the API.
- [ ] If the deleted snippet is the one currently open in the editor, the URL resets to `/` and the editor retains the code as a new unsaved draft.
- [ ] If the API delete fails, the item is restored to the list and an error toast is shown.

## API Contracts

```
PATCH /snippets/:id
Auth:  required; must own the snippet
Body:  { code?: string; title?: string }
200:   { id, title, preview, updatedAt }
403:   not the owner

DELETE /snippets/:id
Auth:  required; must own the snippet
204:   success
403:   not the owner
404:   not found
```

## Technical Notes

- All three actions flow through `useSnippets()` (CS-16): `update(id, patch)` and `remove(id)`.
- Optimistic removal: remove from the local list immediately; revert if the API returns an error.
- The rename input should auto-focus and select all text when activated.
