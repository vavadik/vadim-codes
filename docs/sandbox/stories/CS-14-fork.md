# CS-14 — Fork a Snippet

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** S

## Story

> As a developer viewing someone else's snippet, I want to save my own copy so I can modify and build on it without affecting the original.

## Acceptance Criteria

- [ ] When the user is viewing a shared snippet (`/s/:id`) belonging to another user (or any anonymous snippet), the toolbar shows a **Fork** button alongside the Save button.
- [ ] Clicking Fork (or clicking Save while viewing another user's snippet) creates a **new snippet** via the API and navigates the URL to the new ID.
- [ ] The original snippet is never mutated.
- [ ] If the user is authenticated, the forked snippet appears in their personal snippet list immediately.
- [ ] If the user is viewing their **own** snippet (authenticated, snippet is in their list), the toolbar shows only Save (which updates the existing snippet — see CS-17); Fork is hidden.
- [ ] For anonymous users, Fork and Save behave identically — both always create a new snippet.

## Technical Notes

- "Viewing another's snippet" is determined by comparing the snippet's `userId` with the current user's ID (from `useAuth()`). If the user is anonymous or the IDs differ, fork mode is active.
- The Fork button calls the same `POST /snippets` endpoint as Save — there is no separate fork endpoint. The difference is purely in UX framing.
- After fork, update the local draft (`sandbox:draft`) with the forked code and navigate to `/s/:newId`.
