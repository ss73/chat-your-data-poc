export interface SandboxResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

const WORKER_CODE = `
// Remove dangerous globals
self.fetch = undefined;
self.importScripts = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
self.EventSource = undefined;
self.indexedDB = undefined;
self.caches = undefined;
self.navigator = undefined;
self.location = undefined;

self.onmessage = function(e) {
  const { script, columns, rows } = e.data;

  try {
    // Create a function with limited scope
    const fn = new Function('columns', 'rows', script);
    const result = fn(columns, rows);
    self.postMessage({ success: true, result });
  } catch (err) {
    self.postMessage({ success: false, error: err.message || String(err) });
  }
};
`;

export function runInSandbox(
  script: string,
  columns: string[],
  rows: (string | number | null)[][],
  timeoutMs = 5000
): Promise<SandboxResult> {
  return new Promise((resolve) => {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ success: false, error: 'Script execution timed out' });
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent<SandboxResult>) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ success: false, error: e.message || 'Worker error' });
    };

    worker.postMessage({ script, columns, rows });
  });
}
