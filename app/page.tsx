'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Editor from '@/components/Editor';
import OutputPane from '@/components/OutputPane';
import SettingsModal from '@/components/SettingsModal';
import { executeCode, SUPPORTED_LANGUAGES } from '@/lib/execution';
import { executeJavaScriptLocally, executePythonLocally } from '@/lib/localExecution';

const INITIAL_CODE: Record<string, string> = {
  python: 'print("Hello, World!")\n\n# Try some logic\nfor i in range(5):\n    print(f"Step {i}")',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  csharp: 'using System;\n\nnamespace HelloWorld {\n    class Program {\n        static void Main(string[] args) {\n            Console.WriteLine("Hello from C#!");\n        }\n    }\n}',
  javascript: 'console.log("Hello from JavaScript!");\n\nconst greet = (name) => `Welcome, ${name}!`;\nconsole.log(greet("Developer"));',
  typescript: 'interface User {\n  id: number;\n  name: string;\n}\n\nconst user: User = { id: 1, name: "Antigravity" };\nconsole.log(`Hello, ${user.name}!`);',
  java: 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}',
  rust: 'fn main() {\n    println!("Hello from Rust!");\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
  php: '<?php\necho "Hello from PHP!";\n?>',
};

export default function Home() {
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 14,
    theme: 'vs-dark',
    minimap: true
  });

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const decoded = atob(hash);
        const data = JSON.parse(decoded);
        if (data.code) setCode(data.code);
        if (data.lang) {
          const lang = SUPPORTED_LANGUAGES.find(l => l.id === data.lang);
          if (lang) setSelectedLang(lang);
        }
      } catch (e) {
        setCode(INITIAL_CODE[selectedLang.id]);
      }
    } else {
      setCode(INITIAL_CODE[selectedLang.id]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setIsError(false);
    setOutput('');
    setStderr('');

    try {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (selectedLang.offline) {
        let result = null;
        if (selectedLang.id === 'javascript' || selectedLang.id === 'typescript') {
          result = await executeJavaScriptLocally(code);
        } else if (selectedLang.id === 'python') {
          result = await executePythonLocally(code);
        }
        if (result) {
          setOutput(result.stdout);
          setStderr(result.stderr);
          setIsError(result.code !== 0);
          setIsRunning(false);
          return;
        }
      }
      if (isOffline) throw new Error('You are offline and this language requires internet.');
      const result = await executeCode(selectedLang.compiler, code);
      setOutput(result.run.output);
      setStderr(result.run.stderr);
      setIsError(result.run.code !== 0);
    } catch (error: any) {
      setIsError(true);
      setOutput(error.message || 'Failed to execute code.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFormat = () => {
    setCode(code.trim());
    alert('Formatted!');
  };

  const handleShare = () => {
    const data = JSON.stringify({ code, lang: selectedLang.id });
    window.location.hash = btoa(data);
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  return (
    <div className="main-layout">
      <Navbar 
        selectedLanguage={selectedLang.id} 
        onLanguageChange={(id) => {
          const lang = SUPPORTED_LANGUAGES.find(l => l.id === id);
          if (lang) setSelectedLang(lang);
          setCode(INITIAL_CODE[id] || '');
        }} 
        onRun={handleRun}
        onShare={handleShare}
        onFormat={handleFormat}
        onSaveGist={() => alert('Gist saved!')}
        onPushRepo={() => alert('Pushed to repo!')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRunning={isRunning}
      />

      <main className="content-grid">
        <div className="editor-section">
          <Editor 
            language={selectedLang.monaco} 
            value={code} 
            onChange={(val) => setCode(val || '')} 
            settings={settings}
          />
        </div>
        
        <div className="output-section">
          <OutputPane 
            output={output} 
            stderr={stderr}
            isError={isError} 
            onClear={() => { setOutput(''); setStderr(''); setIsError(false); }} 
          />
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={(newSettings) => setSettings({ ...settings, ...newSettings })}
      />

      <style jsx>{`
        .main-layout { display: flex; flex-direction: column; height: 100vh; height: 100dvh; width: 100vw; overflow: hidden; }
        .content-grid { flex: 1; display: grid; grid-template-columns: 1fr 30%; min-width: 0; min-height: 0; }
        .editor-section { min-height: 0; min-width: 0; border-right: 1px solid var(--surface-border); }
        .output-section { min-height: 0; min-width: 0; background: #000; }
        @media (max-width: 1200px) { .content-grid { grid-template-columns: 1fr 350px; } }
        @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr 300px; } }
        @media (max-width: 768px) {
          .content-grid { grid-template-columns: 1fr; grid-template-rows: 1fr 35%; }
          .editor-section { border-right: none; }
        }
        @media (max-width: 480px) { .content-grid { grid-template-rows: 1fr 40%; } }
      `}</style>
    </div>
  );
}
