# CS-01 — Theme Support (Dark / Light)

**Type:** User Story  
**Phase:** 0 — Foundation  
**Estimate:** S

## Story

> As a developer, I want to switch between dark and light themes so the sandbox matches my working environment and reduces eye strain.

## Acceptance Criteria

- [ ] The app ships with a **dark theme** and a **light theme**.
- [ ] A theme toggle control is visible in the settings section of the left pane.
- [ ] Switching themes applies immediately across the entire app — no page reload.
- [ ] The selected theme is stored in `localStorage` under `sandbox:theme` and restored on next visit.
- [ ] If no preference is stored, the app defaults to the user's OS preference (`prefers-color-scheme`).
- [ ] The Monaco editor theme updates in sync with the app theme (e.g. `vs-dark` / `vs`).

## `useTheme()` API

```ts
const { theme, toggleTheme, setTheme } = useTheme();
// theme: Ref<'dark' | 'light'>
// toggleTheme(): void
// setTheme(t: 'dark' | 'light'): void
```

## Technical Notes

- Implement theme via a CSS class on `<html>` or `<body>` (e.g. `class="theme-dark"`).
- Define all colour tokens as CSS custom properties, overridden per theme class — avoids scattered conditional styles.
- `useTheme()` is a composable that wraps localStorage reads/writes and syncs the DOM class.
- Monaco's theme is set via `monaco.editor.setTheme()` whenever `theme` changes — wire this up in the editor composable.
