# PS-17 — Light / Dark Theme

**Type:** User Story  
**Phase:** 4 — UX Polish  
**Estimate:** S  
**Depends on:** PS-15

## Story

> As a participant, I want to switch between light and dark mode so the app is comfortable in any lighting environment.

## Acceptance Criteria

- [ ] A theme toggle button (sun / moon icon) is visible in the room header and on the home page.
- [ ] Clicking it toggles between light and dark mode; preference is saved to `localStorage`.
- [ ] On first visit the theme defaults to the OS preference (`prefers-color-scheme`).
- [ ] The poker table felt colour changes with the theme:
  - Light mode: green felt (`#35654d` or similar).
  - Dark mode: dark charcoal felt (`#1a2e23` or similar).
- [ ] All DaisyUI component colours follow the active theme automatically via the `data-theme` attribute.
- [ ] The toggle is accessible (keyboard focusable, aria-label reflects current state).

## Technical Notes

- `useTheme.ts` is already scaffolded in `apps/poker-web/src/composables/` — extend it to persist to localStorage and initialise from `prefers-color-scheme`.
- DaisyUI theme names: `light` / `dark` (or custom poker themes if defined in `tailwind.config`).
- Table felt colour is a CSS variable (`--felt-color`) toggled by the `data-theme` attribute on `<html>`.
