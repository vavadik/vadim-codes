import { ref } from 'vue';
import { clearMarkers } from './useEditor';

export type ConsoleMessage = {
  type: 'console';
  level: 'log' | 'warn' | 'error' | 'info' | 'system';
  args: string[];
  timestamp: number;
};

export type ErrorMessage = {
  type: 'error';
  message: string;
  stack: string;
  lineNumber?: number;
  colNumber?: number;
};

type WorkerMessage =
  | (Omit<ConsoleMessage, 'level'> & { level: 'log' | 'warn' | 'error' | 'info' })
  | ErrorMessage
  | { type: 'alert'; text: string }
  | { type: 'done' };

const TIMEOUT_MS = parseInt(import.meta.env['VITE_EXECUTION_TIMEOUT_MS'] ?? '10000', 10);

// Module-level state so all consumers share the same execution context.
const isRunning = ref(false);
const messages = ref<ConsoleMessage[]>([]);
const errors = ref<ErrorMessage[]>([]);
export const elapsedMs = ref<number | null>(null);

let activeWorker: Worker | null = null;
let startTime: number | null = null;
let elapsedInterval: ReturnType<typeof setInterval> | null = null;
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

function systemMsg(text: string): ConsoleMessage {
  return { type: 'console', level: 'system', args: [text], timestamp: Date.now() };
}

type CleanupReason = 'done' | 'stopped' | 'timeout';

function cleanup(reason: CleanupReason = 'done'): void {
  if (elapsedInterval !== null) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
  }
  if (timeoutTimer !== null) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
  if (startTime !== null) {
    elapsedMs.value = Date.now() - startTime;
    startTime = null;
  }
  activeWorker?.terminate();
  activeWorker = null;
  isRunning.value = false;

  if (reason === 'stopped') {
    messages.value.push(systemMsg('Execution stopped by user.'));
  } else if (reason === 'timeout') {
    messages.value.push(systemMsg(`Execution timed out after ${TIMEOUT_MS / 1000}s.`));
  }
}

export function useExecution() {
  function run(code: string): void {
    if (isRunning.value) {
      return;
    }

    messages.value = [];
    errors.value = [];
    clearMarkers();
    isRunning.value = true;

    startTime = Date.now();
    elapsedMs.value = 0;

    elapsedInterval = setInterval(() => {
      if (startTime !== null) {
        elapsedMs.value = Date.now() - startTime;
      }
    }, 100);

    timeoutTimer = setTimeout(() => {
      cleanup('timeout');
    }, TIMEOUT_MS);

    const worker = new Worker(new URL('../workers/sandbox.worker.ts', import.meta.url), {
      type: 'module',
    });
    activeWorker = worker;

    worker.onmessage = (e: MessageEvent<WorkerMessage>): void => {
      const msg = e.data;
      if (msg.type === 'console') {
        messages.value.push(msg as ConsoleMessage);
      } else if (msg.type === 'error') {
        errors.value.push(msg);
        // Echo to console so the error appears in timeline order.
        messages.value.push({
          type: 'console',
          level: 'error',
          args: [msg.message],
          timestamp: Date.now(),
        });
      } else if (msg.type === 'alert') {
        messages.value.push({
          type: 'console',
          level: 'log',
          args: [`[Alert] ${msg.text}`],
          timestamp: Date.now(),
        });
      } else if (msg.type === 'done') {
        cleanup('done');
      }
    };

    worker.onerror = (e: ErrorEvent): void => {
      errors.value.push({
        type: 'error',
        message: e.message,
        stack: '',
        lineNumber: e.lineno,
        colNumber: e.colno,
      });
      cleanup('done');
    };

    worker.postMessage({ type: 'run', code });
  }

  function stop(): void {
    cleanup('stopped');
  }

  return { run, stop, isRunning, messages, errors, elapsedMs };
}
