# PS-13 — Room Settings Modal

**Type:** User Story  
**Phase:** 3 — Room Management  
**Estimate:** M  
**Depends on:** PS-11, PS-12

## Story

> As a room master, I want a single settings panel where I can manage all room configuration so I don't have to hunt for controls across the UI.

## Acceptance Criteria

- [ ] A "Settings" / gear icon button is visible in the room header for the master.
- [ ] Clicking it opens a modal with the following sections:

  **General**
  - Room title — editable text field; saving emits `setTitle { title }`.
  - Copy invite link — button that copies `window.location.href` to clipboard.

  **Session**
  - Public mode toggle (PS-12).
  - Deck selector (PS-10, duplicated here for convenience).

  **Participants**
  - List of all participants; each row has a "Make master" button (PS-11) except the current master.

  **Danger zone**
  - "Delete room" button with a confirmation prompt.

- [ ] Changes take effect immediately (no "Save all" button — each control saves independently).
- [ ] Non-master participants cannot open settings (button is hidden).

## Technical Notes

- Reuse the existing `Modal` component from `apps/poker-web/src/components/ui/`.
- Room title change broadcasts `titleUpdated { title }` to all clients, who update the header.

## Out of Scope

- Kick / remove a participant (future moderation feature).
