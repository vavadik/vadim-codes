# CS-11 — Runtime Error Display

**Type:** User Story  
**Phase:** 3 — Execution  
**Estimate:** M

## Story

> As a developer, I want runtime errors to be shown both in the editor gutter and in a dedicated Errors tab so I can immediately see what went wrong and jump to the problem line.

## Acceptance Criteria

- [ ] Uncaught runtime errors are displayed in an **Errors tab** in the right pane.
- [ ] Each error entry shows:
  - Error name and message (e.g. `ReferenceError: foo is not defined`).
  - A cleaned stack trace with internal Worker/eval frames stripped.
  - Line and column number when available.
- [ ] When an error includes a line number, Monaco's **gutter annotation** (red squiggly / marker) is placed on that line.
- [ ] Gutter annotations are cleared at the start of each new execution.
- [ ] The Errors tab shows a badge/count indicator on the tab label when there are unread errors (cleared on tab open or new execution).
- [ ] If there are no errors, the Errors tab shows a placeholder: `No errors.`
- [ ] Runtime errors are also echoed to the Console tab with `error` styling so the timeline is complete.

## Technical Notes

- Error data arrives via the worker's `{ type: 'error', message, stack, lineNumber, colNumber }` message (CS-07).
- Call `useEditor().setMarkers([{ severity: MarkerSeverity.Error, message, startLineNumber, startColumn, endLineNumber, endColumn }])` to set gutter annotations.
- Stack trace cleaning: strip lines containing `blob:`, `<anonymous>`, or the worker bootstrap filename using a regex filter.
- `useExecution()` exposes `errors: Ref<RuntimeError[]>` alongside `messages`.
- The tab badge count is a computed value derived from `errors.length`; reset to 0 when the tab is activated or on `run()`.
