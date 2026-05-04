# Code Sandbox — Implementation Plan

> Progress legend: ⬜ not started · 🔄 in progress · ✅ done · ❌ blocked

---

## Phase 0 — Foundation

Infrastructure and shell. No execution, no snippets, no auth. After this phase the app loads, the 3-pane layout renders, the Monaco editor accepts input, and the backend is reachable with a schema in place.

| #       | Story                                                                    | Estimate | Status | Notes |
| ------- | ------------------------------------------------------------------------ | -------- | ------ | ----- |
| TASK-01 | [DB schema — Users & Snippets](stories/TASK-01-db-schema.md)             | S        | ✅     |       |
| TASK-02 | [Short ID service (nanoid, 8-char)](stories/TASK-02-short-id-service.md) | XS       | ✅     |       |
| CS-00   | [3-pane application layout](stories/CS-00-three-pane-layout.md)          | M        | ✅     |       |
| CS-01   | [Dark / light theme](stories/CS-01-theme-support.md)                     | S        | ✅     |       |
| CS-04   | [Monaco editor core](stories/CS-04-editor-core.md)                       | M        | ✅     |       |

---

## Phase 1 — Auth

After this phase: users can sign in with Google or GitHub, view their identity in the left pane, sign out, and delete their account.

| #     | Story                                                                   | Estimate | Status | Notes |
| ----- | ----------------------------------------------------------------------- | -------- | ------ | ----- |
| CS-02 | [Google + GitHub OAuth](stories/CS-02-auth-oauth.md)                    | M        | ✅     |       |
| CS-03 | [Account deletion (orphan snippets)](stories/CS-03-account-deletion.md) | S        | ✅     |       |

---

## Phase 2 — Editor Experience

After this phase: the editor feels complete — preferences are configurable, the draft survives page refreshes, and the starter snippet greets new users.

| #     | Story                                                                            | Estimate | Status | Notes |
| ----- | -------------------------------------------------------------------------------- | -------- | ------ | ----- |
| CS-05 | [Editor preferences (font size, tab width)](stories/CS-05-editor-preferences.md) | S        | ✅     |       |
| CS-06 | [Draft auto-save to localStorage](stories/CS-06-draft-autosave.md)               | S        | ✅     |       |

---

## Phase 3 — Execution Engine

After this phase: users can run JavaScript in the browser, see console output, see inline error annotations, stop a run, and watch the elapsed timer — all without freezing the UI.

| #     | Story                                                                             | Estimate | Status | Notes |
| ----- | --------------------------------------------------------------------------------- | -------- | ------ | ----- |
| CS-07 | [Web Worker execution sandbox](stories/CS-07-execution-sandbox.md)                | L        | ✅     |       |
| CS-08 | [Execution timeout + elapsed timer](stories/CS-08-execution-timeout-and-timer.md) | S        | ✅     |       |
| CS-09 | [Cancel execution](stories/CS-09-cancel-execution.md)                             | XS       | ✅     |       |
| CS-10 | [Console output panel](stories/CS-10-console-output-panel.md)                     | M        | ✅     |       |
| CS-11 | [Runtime error display (gutter + Errors tab)](stories/CS-11-runtime-errors.md)    | M        | ✅     |       |

---

## Phase 4 — Snippets & Sharing

After this phase: the full snippet lifecycle is working — save, share, open, fork, list, rename, delete, update. Rate limiting and expiry keep the system healthy.

| #     | Story                                                                              | Estimate | Status | Notes |
| ----- | ---------------------------------------------------------------------------------- | -------- | ------ | ----- |
| CS-12 | [Save snippet + shareable link](stories/CS-12-save-snippet.md)                     | M        | ✅     |       |
| CS-13 | [Open shared snippet](stories/CS-13-open-shared-snippet.md)                        | S        | ✅     |       |
| CS-14 | [Fork a snippet](stories/CS-14-fork.md)                                            | S        | ⬜     |       |
| CS-15 | [Anonymous account nudge](stories/CS-15-anonymous-account-nudge.md)                | XS       | ⬜     |       |
| CS-16 | [Authenticated snippet list](stories/CS-16-snippet-list.md)                        | M        | ⬜     |       |
| CS-17 | [Snippet management (rename, update, delete)](stories/CS-17-snippet-management.md) | M        | ⬜     |       |
| CS-18 | [Snippet expiry (90-day anonymous)](stories/CS-18-snippet-expiry.md)               | S        | ⬜     |       |
| CS-19 | [Snippet limit (100 per user)](stories/CS-19-snippet-limit.md)                     | S        | ⬜     |       |
| CS-20 | [Server-side rate limiting](stories/CS-20-rate-limiting.md)                        | S        | ⬜     |       |

---

## Dependency Graph

```
TASK-01 ──────────────────────────────────┬──▶ CS-12
TASK-02 ──────────────────────────────────┘

CS-00 (layout shell) ──┬──▶ CS-02 ──┬──▶ CS-03
                       │            ├──▶ CS-16 ──┬──▶ CS-17
                       │            └──▶ CS-19 ──┘
                       │
                       ├──▶ CS-01 ──▶ CS-04 ──┬──▶ CS-05
                       │                      ├──▶ CS-06
                       │                      └──▶ CS-11 (setMarkers)
                       │
                       └──▶ CS-07 ──┬──▶ CS-08
                                    ├──▶ CS-09
                                    ├──▶ CS-10
                                    └──▶ CS-11

CS-12 ──┬──▶ CS-13 ──▶ CS-14
        ├──▶ CS-15
        └──▶ CS-16

CS-18 depends on TASK-01 (lastViewedAt column)
CS-20 depends on TASK-01 (snippet creation endpoint exists)
```

Key rules:

- **Phase 0** has no prerequisites — start here.
- **CS-07** (Worker sandbox) is the riskiest story and should be started early in Phase 3 to surface any browser/bundler constraints.
- **CS-12** (Save snippet) unblocks the entire Phase 4 snippet list. Complete it first within Phase 4.
- **CS-02** (Auth) can be developed in parallel with Phase 2 editor stories since they share no runtime dependencies.

---

## Story Size Reference

| Size | Rough effort |
| ---- | ------------ |
| XS   | < half day   |
| S    | ~1 day       |
| M    | 2–3 days     |
| L    | 4–5 days     |

---

## Future Milestones (out of scope for v1)

- **TypeScript support** — transpilation step in the Web Worker (e.g. esbuild-wasm)
- **Python support** — Pyodide WASM runtime
- **Snippet versioning / history** — immutable version chain per snippet
- **Public snippet gallery** — browsable feed of public snippets
- **Embed / iframe mode** — shareable embeds for blog posts and docs
- **Multiplayer / collaboration** — real-time shared editing (CRDT or OT)
- **Server-side execution** — Docker-backed runner for languages that can't run in the browser
