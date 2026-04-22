'use client';

export interface LocalExecuteResult {
  stdout: string;
  stderr: string;
  code: number;
}

let pyodide: any = null;

async function loadPyodide() {
  if (pyodide) return pyodide;
  
  if (typeof window !== 'undefined' && !(window as any).loadPyodide) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
  
  pyodide = await (window as any).loadPyodide();
  return pyodide;
}

export async function executeJavaScriptLocally(code: string): Promise<LocalExecuteResult> {
  let output = '';
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = (...args) => {
    output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
  };
  console.error = (...args) => {
    output += 'ERROR: ' + args.join(' ') + '\n';
  };

  try {
    // eslint-disable-next-line no-eval
    eval(code);
    return { stdout: output, stderr: '', code: 0 };
  } catch (err: any) {
    return { stdout: output, stderr: err.message, code: 1 };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

export async function executePythonLocally(code: string): Promise<LocalExecuteResult> {
  try {
    const py = await loadPyodide();
    let output = '';
    
    // Redirect python stdout to our variable
    py.setStdout({
      batched: (text: string) => {
        output += text + '\n';
      },
    });

    await py.runPythonAsync(code);
    return { stdout: output, stderr: '', code: 0 };
  } catch (err: any) {
    return { stdout: '', stderr: err.message, code: 1 };
  }
}
