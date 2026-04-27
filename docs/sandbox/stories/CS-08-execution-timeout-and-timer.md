# CS-08 — Execution Timeout & Elapsed Timer

**Type:** User Story  
**Phase:** 3 — Execution  
**Estimate:** S

## Story

> As a developer, I want the sandbox to automatically stop runaway code and show me how long my snippet has been running so I can spot performance issues at a glance.

## Acceptance Criteria

- [ ] When code starts running, a **live elapsed-time counter** appears in the toolbar (e.g. `3.2s`), updating every 100 ms.
- [ ] The counter stops and shows the final duration when execution completes, is cancelled, or times out.
- [ ] If execution exceeds the configured timeout, the worker is **terminated** automatically.
- [ ] After a timeout, the Console tab displays a clear message: `Execution timed out after Xs.`
- [ ] The timeout duration is read from the environment variable `VITE_EXECUTION_TIMEOUT_MS` (frontend) / `EXECUTION_TIMEOUT_MS` (backend if needed). Default: **10000** (10 seconds).
- [ ] The UI returns to idle state after a timeout (Run button re-enabled, Stop button hidden).

## Technical Notes

- The timeout is enforced in `useExecution()` (CS-07): after calling `worker.postMessage({ type: 'run', code })`, set a `setTimeout` for the configured duration. If it fires before `{ type: 'done' }` arrives, call `worker.terminate()` and emit the timeout message.
- The elapsed timer is a `setInterval` started on `run()` and cleared on any terminal state.
- Expose `elapsedMs: Ref<number | null>` from `useExecution()` — `null` when idle, a live number when running.
- The formatted display (`3.2s`) is computed in the component, not in the composable.
