// Runs inside a DedicatedWorkerGlobalScope — no DOM APIs available.

type RunMessage = { type: 'run'; code: string };

type WorkerMessage =
  | {
      type: 'console';
      level: 'log' | 'warn' | 'error' | 'info';
      args: unknown[];
      timestamp: number;
    }
  | { type: 'error'; message: string; stack: string; lineNumber?: number; colNumber?: number }
  | { type: 'done' };

function send(msg: WorkerMessage): void {
  self.postMessage(msg);
}

// Wraps user code in an IIFE that shadows console, alert, confirm, prompt with
// safe replacements. Local shadowing beats mutating self.console because it
// leaves the global scope intact and automatically unwinds on exit.
function wrapCode(code: string): string {
  return `(function () {
  const console = {
    log:   (...args) => postMessage({ type: 'console', level: 'log',   args, timestamp: Date.now() }),
    warn:  (...args) => postMessage({ type: 'console', level: 'warn',  args, timestamp: Date.now() }),
    error: (...args) => postMessage({ type: 'console', level: 'error', args, timestamp: Date.now() }),
    info:  (...args) => postMessage({ type: 'console', level: 'info',  args, timestamp: Date.now() }),
  };
  const alert   = (text) => postMessage({ type: 'alert', text });
  const confirm = () => false;
  const prompt  = () => null;

${code}
})();`;
}

self.onmessage = (e: MessageEvent<RunMessage>): void => {
  if (e.data.type !== 'run') {
    return;
  }

  try {
    // User code runs here, isolated from the main thread and DOM.
    // eslint-disable-next-line no-eval
    eval(wrapCode(e.data.code));
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    send({ type: 'error', message: error.message, stack: error.stack ?? '' });
  }

  send({ type: 'done' });
};
