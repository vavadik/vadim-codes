# CS-09 — Cancel Execution

**Type:** User Story  
**Phase:** 3 — Execution  
**Estimate:** XS

## Story

> As a developer, I want to manually stop a running snippet so I can quickly interrupt a long-running or misbehaving script without waiting for the timeout.

## Acceptance Criteria

- [ ] A **Stop** button is shown in the toolbar while a snippet is executing.
- [ ] The Stop button is hidden (or disabled) when no execution is in progress.
- [ ] Clicking Stop immediately terminates the worker.
- [ ] Any console output produced up to the moment of cancellation is preserved in the Console tab.
- [ ] After stopping, a brief message appears in the Console tab: `Execution stopped by user.`
- [ ] The elapsed timer freezes at the time of cancellation and displays the final duration.
- [ ] The Run button becomes active again immediately after Stop.

## Technical Notes

- `useExecution().stop()` calls `worker.terminate()`, clears the timeout timer and the interval timer, and emits the cancellation message.
- The Stop button binds to `useExecution().isRunning` for its visibility and calls `stop()` on click — no additional state needed.
