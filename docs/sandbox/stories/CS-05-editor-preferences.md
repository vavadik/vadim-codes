# CS-05 — Editor Preferences

**Type:** User Story  
**Phase:** 2 — Editor  
**Estimate:** S

## Story

> As a developer, I want to adjust the editor's font size and tab width so it matches my personal coding style.

## Acceptance Criteria

- [ ] The settings section in the left pane includes:
  - A **Font Size** control (numeric input or stepper; range 10–24 px, default 14).
  - A **Tab Width** control (select: 2 or 4 spaces, default 2).
- [ ] Changing either setting applies to the Monaco editor immediately without a page reload.
- [ ] Preferences are stored in `localStorage` under `sandbox:editorPrefs` as a JSON object.
- [ ] Preferences are loaded and applied when the editor mounts.
- [ ] Preferences are **not** synced to the server or user account.

## localStorage Schema

```ts
interface EditorPrefs {
  fontSize: number; // default: 14
  tabSize: 2 | 4; // default: 2
}
// stored under key: sandbox:editorPrefs
```

## Technical Notes

- Expose a `useEditorPrefs()` composable that manages the localStorage read/write and returns reactive refs.
- Apply prefs to the Monaco instance via `editor.updateOptions({ fontSize, tabSize })`.
- Wire `useEditorPrefs()` into `useEditor()` (CS-04) so the editor always initializes with stored prefs.
