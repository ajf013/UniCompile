'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  // Collaboration State
  const [roomName, setRoomName] = useState<string | null>(null);
  const [roomActive, setRoomActive] = useState(false);
  const [collaboratorsCount, setCollaboratorsCount] = useState(1);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const ydocRef = useRef<any>(null);

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomName(room);
      setRoomActive(true);
      return; // Skip setting default local code, Yjs will sync it
    }

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

  useEffect(() => {
    if (!roomName || !editorInstance) return;

    let provider: any = null;
    let binding: any = null;
    let ydoc: any = null;

    const initCollab = async () => {
      const Y = await import('yjs');
      const { WebrtcProvider } = await import('y-webrtc');
      const { MonacoBinding } = await import('y-monaco');

      ydoc = new Y.Doc();
      ydocRef.current = ydoc;
      const ytext = ydoc.getText('monaco');
      const ymeta = ydoc.getMap('meta');

      const uniqueRoomName = `unicompile-room-${roomName}`;
      provider = new WebrtcProvider(uniqueRoomName, ydoc, {
        signaling: [
          'wss://signaling.yjs.dev',
          'wss://y-webrtc-signaling-eu.herokuapp.com',
          'wss://y-webrtc-signaling-us.herokuapp.com'
        ]
      });

      provider.awareness.on('change', () => {
        const states = Array.from(provider.awareness.getStates().values());
        setCollaboratorsCount(states.length);
      });

      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      provider.awareness.setLocalStateField('user', {
        name: `User-${Math.floor(Math.random() * 1000)}`,
        color: randomColor
      });

      ymeta.observe(() => {
        const langId = ymeta.get('language') as string;
        if (langId) {
          const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
          if (lang) setSelectedLang(lang);
        }
      });

      binding = new MonacoBinding(
        ytext,
        editorInstance.getModel(),
        new Set([editorInstance]),
        provider.awareness
      );
    };

    initCollab();

    return () => {
      if (binding) binding.destroy();
      if (provider) provider.destroy();
      if (ydoc) ydoc.destroy();
      ydocRef.current = null;
    };
  }, [roomName, editorInstance]);

  const handleLanguageChange = (id: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === id);
    if (lang) setSelectedLang(lang);
    
    if (!roomActive) {
      setCode(INITIAL_CODE[id] || '');
    }

    if (roomActive && ydocRef.current) {
      const ymeta = ydocRef.current.getMap('meta');
      ymeta.set('language', id);
    }
  };

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
    showToast('Code formatted successfully!', 'success');
  };

  const handleShare = () => {
    const data = JSON.stringify({ code, lang: selectedLang.id });
    window.location.hash = btoa(data);
    navigator.clipboard.writeText(window.location.href);
    showToast('Snapshot share link copied to clipboard!', 'success');
  };

  const handleShareSession = () => {
    if (roomActive && roomName) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Collaboration session link copied to clipboard!', 'success');
      return;
    }

    const uniqueRoom = Math.random().toString(36).substring(2, 11);
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${uniqueRoom}`;
    
    navigator.clipboard.writeText(newUrl);
    window.history.pushState({}, '', newUrl);
    setRoomName(uniqueRoom);
    setRoomActive(true);
    showToast('Live collaboration session started! Link copied.', 'success');
  };

  return (
    <div className="main-layout">
      <Navbar 
        selectedLanguage={selectedLang.id} 
        onLanguageChange={handleLanguageChange} 
        onRun={handleRun}
        onShare={handleShare}
        onFormat={handleFormat}
        onSaveGist={() => showToast('Saved as GitHub Gist!', 'success')}
        onPushRepo={() => showToast('Pushed to GitHub repository!', 'success')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onShareSession={handleShareSession}
        roomActive={roomActive}
        collaboratorsCount={collaboratorsCount}
        isRunning={isRunning}
      />

      <main className="content-grid">
        <div className="editor-section">
          <Editor 
            language={selectedLang.monaco} 
            value={code} 
            onChange={(val) => setCode(val || '')} 
            onMount={(editor) => setEditorInstance(editor)}
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

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card ${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>×</button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .main-layout { display: flex; flex-direction: column; height: 100vh; height: 100dvh; width: 100vw; overflow: hidden; }
        .content-grid { flex: 1; display: grid; grid-template-columns: 1fr 30%; min-width: 0; min-height: 0; }
        .editor-section { min-height: 0; min-width: 0; border-right: 1px solid var(--surface-border); }
        .output-section { min-height: 0; min-width: 0; background: #000; }
        
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          pointer-events: none;
        }
        .toast-card {
          pointer-events: auto;
          min-width: 280px;
          max-width: 400px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(18, 18, 18, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.2s ease-out;
        }
        .toast-card.success {
          border-left: 4px solid #10b981;
        }
        .toast-card.error {
          border-left: 4px solid #ef4444;
        }
        .toast-card.info {
          border-left: 4px solid #3b82f6;
        }
        .toast-message {
          font-weight: 500;
        }
        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
        }
        .toast-close:hover {
          color: #fff;
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

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
