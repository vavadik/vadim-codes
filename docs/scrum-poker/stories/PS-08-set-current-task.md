# PS-08 — Set Current Task

**Type:** User Story  
**Phase:** 2 — Game Features  
**Estimate:** S  
**Depends on:** PS-03

## Story

> As a room master, I want to type the current task or story name so all participants know what they are estimating.

## Acceptance Criteria

- [ ] The table centre shows an inline-editable task field for the master (click to edit, Enter/blur to save).
- [ ] Non-master participants see the task as read-only text.
- [ ] On save, the master emits `setTask { task }` to the server.
- [ ] The server updates `room.currentTask` and broadcasts `taskUpdated { task }` to all clients.
- [ ] All clients update the task text in real time.
- [ ] If the task is empty the field displays a placeholder hint ("Click to set task…" for master, "No task set" for others).
- [ ] Task text is capped at 256 characters.

## Technical Notes

- Use a `<contenteditable>` span or a toggled `<input>` — keep it visually minimal (no input border until focused).
- The room title (header) uses a separate `setTitle` event — not in scope here.
