# CS-06 — Draft Auto-Save

**Type:** User Story  
**Phase:** 2 — Editor  
**Estimate:** S

## Story

> As a developer, I want the editor to remember what I was working on when I close or refresh the tab so I never lose unsaved progress.

## Acceptance Criteria

- [ ] Every change to the editor content is automatically persisted to `localStorage` under `sandbox:draft`, debounced to at most once per second.
- [ ] On app load, if `sandbox:draft` exists, its content is loaded into the editor.
- [ ] If no draft exists (first visit or cleared storage), the editor opens with the default starter snippet: `console.log("Hello, world!")`.
- [ ] When the user opens a shared snippet (via URL), the draft in `localStorage` is **replaced** with the snippet's code — the URL snippet takes precedence.
- [ ] A subtle, non-intrusive indicator shows "Draft saved" briefly after each auto-save (e.g. fades in and out in the toolbar area).

## Technical Notes

- The debounce logic lives in `useEditor()` (CS-04) or a thin wrapper composable — not in the component.
- When the shared-snippet route loads, call `setValue(snippetCode)` which triggers the normal onChange → localStorage write, so the draft is always in sync.
- Keep the draft key separate from snippet content (`sandbox:draft` vs. snippet data fetched from the API) to avoid conflicts.
