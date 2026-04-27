# CS-04 — Monaco Editor Core

**Type:** User Story  
**Phase:** 0 — Foundation  
**Estimate:** M

## Story

> As a developer, I want a proper code editor in the browser so writing JavaScript feels natural, not like filling out a form field.

## Acceptance Criteria

- [ ] Monaco Editor is embedded in the center pane.
- [ ] The editor is configured for **JavaScript** with full syntax highlighting.
- [ ] **Line numbers** are shown.
- [ ] **Bracket matching** and **auto-indentation** are enabled.
- [ ] The following keyboard shortcuts work out of the box:
  - `Ctrl+/` — toggle line comment
  - `Tab` / `Shift+Tab` — indent / dedent selection
  - `Ctrl+Z` / `Ctrl+Shift+Z` — undo / redo
  - `Ctrl+D` — select next occurrence
- [ ] The editor fills its pane and resizes correctly when the browser window is resized.
- [ ] The editor is accessible via a `useEditor()` composable that exposes the Monaco instance and the current value.

## `useEditor()` API

```ts
const { value, setValue, setMarkers, editor } = useEditor();
// value: Ref<string> — reactive editor content
// setValue(code: string): void — replace editor content programmatically
// setMarkers(markers: monaco.editor.IMarkerData[]): void — set gutter annotations
// editor: ShallowRef<monaco.editor.IStandaloneCodeEditor | null>
```

## Technical Notes

- Load Monaco via the `@monaco-editor/loader` package (CDN-backed or bundled — decide based on build size constraints).
- Disable Monaco's built-in TypeScript/JSON workers for JS-only mode to reduce bundle overhead.
- Wire the editor's `onDidChangeModelContent` to the `value` ref.
- The `setMarkers` method wraps `monaco.editor.setModelMarkers` — called by the error-handling story (CS-11).
- Editor theme (`vs-dark` / `vs`) is controlled externally by `useTheme()` (CS-01).
