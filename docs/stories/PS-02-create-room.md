# PS-02 — Create a Room

**Type:** User Story  
**Phase:** 1 — Core Flow  
**Estimate:** S  
**Depends on:** PS-01, TASK-01, TASK-02

## Story

> As a user, I want to create a poker room and receive a shareable invite link so I can invite my team.

## Acceptance Criteria

- [ ] Home page has a "Create room" button (available after name is set).
- [ ] Clicking it calls `POST /api/rooms` and navigates to `/room/:id` on success.
- [ ] The room page displays a copyable invite URL (`window.location.href`).
- [ ] While the request is in flight the button shows a loading state.
- [ ] On network error a user-visible error message is shown.
- [ ] The creating user is automatically the room master upon joining.

## UI Behaviour

- The "Create room" CTA is the primary action on the home page.
- Optionally a room title can be typed before creating (single text field, optional).
- The invite link is shown in the room header with a "Copy link" icon button; clicking copies to clipboard and shows a brief "Copied!" tooltip.

## Technical Notes

- Uses the ts-rest `roomApi` client from TASK-02.
- Vue Router `push` to `/room/:id` after successful response.
- Master status is established on WebSocket join (PS-03) using the `creatorId` returned by the server.

## Out of Scope

- Choosing deck on creation screen (done later via PS-10 inside the room).
