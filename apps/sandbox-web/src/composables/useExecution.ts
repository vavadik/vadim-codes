import { ref } from 'vue';

export type ConsoleMessage = {
  type: 'console';
  level: 'log' | 'warn' | 'error' | 'info';
  args: unknown[];
  timestamp: number;
};

export type ErrorMessage = {
  type: 'error';
  message: string;
  stack: string;
  lineNumber?: number;
  colNumber?: number;
};

type WorkerMessage = ConsoleMessage | ErrorMessage | { type: 'done' };

// Module-level state so all consumers share the same execution context.
const isRunning = ref(false);
const messages = ref<ConsoleMessage[]>([]);
const errors = ref<ErrorMessage[]>([]);

let activeWorker: Worker | null = null;

function cleanup(): void {
  activeWorker?.terminate();
  activeWorker = null;
  isRunning.value = false;
}

export function useExecution() {
  function run(code: string): void {
    if (isRunning.value) {
      return;
    }

    messages.value = [];
    errors.value = [];
    isRunning.value = true;

    const worker = new Worker(new URL('../workers/sandbox.worker.ts', import.meta.url), {
      type: 'module',
    });
    activeWorker = worker;

    worker.onmessage = (e: MessageEvent<WorkerMessage>): void => {
      const msg = e.data;
      console.log('msg', msg);
      if (msg.type === 'console') {
        messages.value.push(msg);
      } else if (msg.type === 'error') {
        errors.value.push(msg);
      } else if (msg.type === 'done') {
        cleanup();
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
      cleanup();
    };

    worker.postMessage({ type: 'run', code });
  }

  function stop(): void {
    cleanup();
  }

  return { run, stop, isRunning, messages, errors };
}
