# CS-10 — Console Output Panel

**Type:** User Story  
**Phase:** 3 — Execution  
**Estimate:** M

## Story

> As a developer, I want to see my console output in a dedicated panel so I can debug my code the same way I would in a browser's DevTools.

## Acceptance Criteria

- [ ] The right pane contains a **Console tab** that displays output from the running snippet.
- [ ] Each entry is rendered with a visual indicator for its level:
  - `log` — default text colour
  - `info` — blue accent
  - `warn` — amber/yellow accent
  - `error` — red accent
- [ ] Multiple arguments passed to a single `console.log(a, b, c)` call are displayed space-separated on one line.
- [ ] Objects and arrays are rendered in a human-readable format (JSON-like, or a simple `JSON.stringify` with indentation — a full interactive tree is out of scope for v1).
- [ ] Console output is **cleared at the start of each new execution**.
- [ ] The console auto-scrolls to the bottom as new entries arrive.
- [ ] If there are no entries (idle state), the panel shows a placeholder: `Run your code to see output here.`
- [ ] System messages (timeout, user stop) are styled distinctly from user `console.*` calls (e.g. muted italic).

## Technical Notes

- The Console tab reads from `useExecution().messages` (a `Ref<ConsoleEntry[]>`) populated by the worker's `postMessage` events.
- Serialization of non-primitive arguments happens in the worker before `postMessage` (stringify there, display here) to avoid structured-clone edge cases.
- Use a `v-for` with a unique key (e.g. index + timestamp) and a `ref` on the scroll container with a `watchEffect` to scroll to bottom on messages change.
