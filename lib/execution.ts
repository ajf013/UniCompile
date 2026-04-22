export interface ExecuteResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    output: string;
  };
}

export interface Language {
  name: string;
  id: string;
  compiler: string;
  monaco: string;
  offline?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { name: 'C', id: 'c', compiler: 'gcc-head', monaco: 'c' },
  { name: 'C++', id: 'cpp', compiler: 'gcc-head', monaco: 'cpp' },
  { name: 'Python', id: 'python', compiler: 'cpython-3.12.7', monaco: 'python', offline: true },
  { name: 'C#', id: 'csharp', compiler: 'dotnetcore-8.0.402', monaco: 'csharp' },
  { name: 'JavaScript', id: 'javascript', compiler: 'nodejs-20.17.0', monaco: 'javascript', offline: true },
  { name: 'TypeScript', id: 'typescript', compiler: 'typescript-5.6.2', monaco: 'typescript', offline: true },
  { name: 'Java', id: 'java', compiler: 'openjdk-jdk-22+36', monaco: 'java' },
  { name: 'Go', id: 'go', compiler: 'go-1.23.2', monaco: 'go' },
  { name: 'Rust', id: 'rust', compiler: 'rust-1.82.0', monaco: 'rust' },
  { name: 'PHP', id: 'php', compiler: 'php-8.3.12', monaco: 'php' },
];

export async function executeCode(compilerId: string, content: string): Promise<ExecuteResult> {
  const response = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      compiler: compilerId,
      code: content,
      save: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute code');
  }

  const data = await response.json();
  
  return {
    run: {
      stdout: data.program_output || '',
      stderr: data.program_error || data.compiler_error || '',
      code: data.status === '0' ? 0 : 1,
      output: (data.program_output || '') + (data.program_error || '') + (data.compiler_message || '') + (data.program_message || ''),
    }
  };
}
