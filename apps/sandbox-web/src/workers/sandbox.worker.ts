// Runs inside a DedicatedWorkerGlobalScope — no DOM APIs available.

type RunMessage = { type: 'run'; code: string };

type WorkerMessage =
  | {
      type: 'console';
      level: 'log' | 'warn' | 'error' | 'info';
      args: string[];
      timestamp: number;
    }
  | { type: 'error'; message: string; stack: string; lineNumber?: number; colNumber?: number }
  | { type: 'alert'; text: string }
  | { type: 'done' };

function send(msg: WorkerMessage): void {
  self.postMessage(msg);
}

// Number of lines the IIFE preamble adds before user code begins.
// Must match the literal line count in wrapCode() below.
const IIFE_HEADER_LINES = 5;

// Wraps user code in an IIFE that shadows console, alert, confirm, prompt with
// safe replacements. Local shadowing beats mutating self.console because it
// leaves the global scope intact and automatically unwinds on exit.
// Non-primitive args are serialized here so the main thread receives plain strings,
// avoiding structured-clone edge cases with complex objects.
function wrapCode(code: string): string {
  return `(function () {
  function _s(a){if(a===null)return'null';if(a===undefined)return'undefined';if(typeof a==='string')return a;if(typeof a==='number'||typeof a==='boolean')return String(a);try{return JSON.stringify(a,null,2)}catch{return String(a)}}
  const console={log:(...a)=>postMessage({type:'console',level:'log',args:a.map(_s),timestamp:Date.now()}),warn:(...a)=>postMessage({type:'console',level:'warn',args:a.map(_s),timestamp:Date.now()}),error:(...a)=>postMessage({type:'console',level:'error',args:a.map(_s),timestamp:Date.now()}),info:(...a)=>postMessage({type:'console',level:'info',args:a.map(_s),timestamp:Date.now()})};
  const alert=(t)=>postMessage({type:'alert',text:_s(t)}),confirm=()=>false,prompt=()=>null;

${code}
})();`;
}

// Parses the first <anonymous>:LINE:COL frame from an eval stack and converts
// the raw line back to a user-code line by subtracting the IIFE preamble offset.
function extractLocation(stack: string): { lineNumber: number; colNumber: number } | undefined {
  const match = stack.match(/<anonymous>:(\d+):(\d+)/);
  if (!match || !match[1] || !match[2]) {
    return undefined;
  }
  const rawLine = parseInt(match[1], 10);
  const col = parseInt(match[2], 10);
  const userLine = rawLine - IIFE_HEADER_LINES;
  if (userLine < 1) {
    return undefined;
  }
  return { lineNumber: userLine, colNumber: col };
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
    const location = extractLocation(error.stack ?? '');
    send({
      type: 'error',
      message: error.message,
      stack: error.stack ?? '',
      lineNumber: location?.lineNumber,
      colNumber: location?.colNumber,
    });
  }

  send({ type: 'done' });
};
