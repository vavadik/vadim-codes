# CS-00 — 3-Pane Application Layout

**Type:** User Story  
**Phase:** 0 — Foundation  
**Estimate:** M

## Story

> As a developer visiting the sandbox, I want a clear, purposeful layout so I know where to write code, see output, and manage my snippets without hunting around.

## Acceptance Criteria

- [ ] The app renders a fixed 3-pane layout: left panel, center editor area, right output area.
- [ ] **Left pane**: contains the snippet list (visible when authenticated) and a settings section; collapses to icons when narrow.
- [ ] **Center pane**: contains the code editor and the toolbar (Run, Stop, Fork/Save buttons, elapsed timer).
- [ ] **Right pane**: contains tabbed output — Console tab and Errors tab.
- [ ] The layout fills the full viewport height with no page scroll.
- [ ] On viewports narrower than 768 px the layout degrades gracefully (e.g. right pane stacks below or is accessible via toggle); exact mobile treatment is a UX decision during implementation.
- [ ] No resizable splitters are required in v1.

## Layout Sketch

```
┌─────────────┬────────────────────────────┬───────────────┐
│  Left Pane  │       Center (Editor)       │  Right Pane   │
│             │  ┌──────────────────────┐  │  ┌──────────┐ │
│  [Snippets] │  │   Toolbar            │  │  │ Console  │ │
│  [Settings] │  ├──────────────────────┤  │  │ Errors   │ │
│             │  │                      │  │  ├──────────┤ │
│             │  │   Monaco Editor      │  │  │          │ │
│             │  │                      │  │  │  Output  │ │
│             │  │                      │  │  │          │ │
└─────────────┴──┴──────────────────────┴──┴──┴──────────┘
```

## Technical Notes

- Implement as a top-level layout component (`AppLayout.vue` or similar) that slots in child components.
- Use CSS Grid or Flexbox — avoid hardcoded pixel widths; use `fr` units or `flex: 1` so panes fill available space.
- The left pane width can be fixed (e.g. 260 px); the right pane fixed (e.g. 320 px); center takes remaining space.
- All pane content components are stubbed (empty placeholder) in this story — actual content is added in subsequent stories.
