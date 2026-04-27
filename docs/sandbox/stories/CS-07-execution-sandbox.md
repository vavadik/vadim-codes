# CS-07 — Execution Sandbox (Web Worker)

**Type:** User Story  
**Phase:** 3 — Execution  
**Estimate:** L

## Story

> As a developer, I want my code to run in an isolated environment so a buggy or infinite-looping snippet cannot freeze the editor or the browser tab.

## Acceptance Criteria

- [ ] Clicking **Run** executes the current editor content inside a **Web Worker**.
- [ ] The main thread (editor, toolbar, output panel) remains fully interactive while code runs.
- [ ] `console.log`, `console.warn`, `console.error`, and `console.info` calls made inside the worker are captured and forwarded to the main thread via `postMessage`.
- [ ] Each console message is delivered as `{ level: 'log' | 'warn' | 'error' | 'info', args: unknown[], timestamp: number }`.
- [ ] Uncaught runtime exceptions are caught inside the worker and forwarded as `{ type: 'error', message: string, stack: string, lineNumber?: number, colNumber?: number }`.
- [ ] On normal completion the worker posts `{ type: 'done' }` and the UI returns to idle state.
- [ ] Only one execution may run at a time — the Run button is disabled while a worker is active.

## Worker Message Protocol

```ts
// Main → Worker
type RunMessage = { type: 'run'; code: string };

// Worker → Main
type WorkerMessage =
  | {
      type: 'console';
      level: 'log' | 'warn' | 'error' | 'info';
      args: unknown[];
      timestamp: number;
    }
  | { type: 'error'; message: string; stack: string; lineNumber?: number; colNumber?: number }
  | { type: 'done' };
```

## Technical Notes

- The worker is created fresh for each execution (`new Worker(...)`) and terminated after `done`, timeout, or cancellation — never reused.
- Inside the worker, patch `self.console` before `eval`-ing the user code to intercept all console calls.
- Wrap the `eval` in a `try/catch`; catch → post `{ type: 'error', ... }` then post `{ type: 'done' }`.
- Keep the worker source as a separate file (e.g. `sandbox.worker.ts`) bundled via Vite's `?worker` import.
- A `useExecution()` composable manages worker lifecycle and exposes `{ run, stop, isRunning, messages, errors }`.
