'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Editor from '@/components/Editor';
import EditorTabs, { TabItem } from '@/components/EditorTabs';
import OutputPane from '@/components/OutputPane';
import SettingsModal from '@/components/SettingsModal';
import SnippetsModal from '@/components/SnippetsModal';
import ShortcutsModal from '@/components/ShortcutsModal';
import AIAssistantModal from '@/components/AIAssistantModal';
import NewFileModal from '@/components/NewFileModal';
import { executeCode, SUPPORTED_LANGUAGES, getFileExtension } from '@/lib/execution';
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
  
  // Tabs State (initial tab matched to default C language)
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: '1', name: 'main.c', code: INITIAL_CODE['c'], langId: 'c' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  // Output & Execution State
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [stdin, setStdin] = useState('');
  const [timeMs, setTimeMs] = useState<number | undefined>(undefined);
  const [compilerInfo, setCompilerInfo] = useState<string | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);

  // AI Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | undefined>(undefined);
  const [aiComplexity, setAiComplexity] = useState<string | undefined>(undefined);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiFixedCode, setAiFixedCode] = useState<string | undefined>(undefined);

  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    fontSize: 14,
    theme: 'vs-dark',
    minimap: true
  });

  // Active tab helper
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const code = activeTab ? activeTab.code : '';

  // Sync active tab language with selected language when active tab changes
  useEffect(() => {
    if (activeTab) {
      const matched = SUPPORTED_LANGUAGES.find(l => l.id === activeTab.langId);
      if (matched && matched.id !== selectedLang.id) {
        setSelectedLang(matched);
      }
    }
  }, [activeTabId, activeTab]);

  // Sync theme with document element attribute and localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unicompile_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const themeAttr = settings.theme === 'light' ? 'light' : (settings.theme === 'hc-black' ? 'hc-black' : 'dark');
    document.documentElement.setAttribute('data-theme', themeAttr);
    try {
      localStorage.setItem('unicompile_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  const handleToggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'vs-dark' : 'light'
    }));
  };

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
        if (data.code && activeTabId) {
          updateActiveTabCode(data.code);
        }
        if (data.lang) {
          const lang = SUPPORTED_LANGUAGES.find(l => l.id === data.lang);
          if (lang) setSelectedLang(lang);
        }
      } catch (e) {
        updateActiveTabCode(INITIAL_CODE[selectedLang.id]);
      }
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

  // Tab management helpers
  const updateActiveTabCode = (newCode: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, code: newCode } : t));
  };

  const handleCreateNewFile = (fileName: string) => {
    const ext = fileName.lastIndexOf('.') > 0 ? fileName.substring(fileName.lastIndexOf('.') + 1) : getFileExtension(selectedLang.id);
    const matchedLang = SUPPORTED_LANGUAGES.find(l => l.ext.toLowerCase() === ext.toLowerCase()) || selectedLang;
    
    const newId = Math.random().toString(36).substring(2, 9);
    const newTab: TabItem = {
      id: newId,
      name: fileName,
      code: INITIAL_CODE[matchedLang.id] || '',
      langId: matchedLang.id
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setSelectedLang(matchedLang);
    showToast(`Created new file ${fileName}!`, 'success');
  };

  const handleRenameTab = (id: string, newName: string) => {
    const ext = newName.lastIndexOf('.') > 0 ? newName.substring(newName.lastIndexOf('.') + 1) : '';
    let matchedLang = SUPPORTED_LANGUAGES.find(l => l.ext.toLowerCase() === ext.toLowerCase());

    setTabs(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          name: newName,
          langId: matchedLang ? matchedLang.id : t.langId
        };
      }
      return t;
    }));

    if (matchedLang && id === activeTabId) {
      setSelectedLang(matchedLang);
    }

    showToast(`Renamed file to ${newName}`, 'success');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const nextTabs = tabs.filter(t => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  const handleLanguageChange = (id: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === id);
    if (lang) setSelectedLang(lang);
    
    // Update active tab extension and language
    const ext = getFileExtension(id);
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const lastDot = t.name.lastIndexOf('.');
        const baseName = lastDot > 0 ? t.name.substring(0, lastDot) : t.name;
        return {
          ...t,
          langId: id,
          name: `${baseName}.${ext}`,
          code: !roomActive ? (INITIAL_CODE[id] || '') : t.code
        };
      }
      return t;
    }));

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
    setTimeMs(undefined);
    setCompilerInfo(undefined);

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
          setTimeMs(result.timeMs);
          setCompilerInfo(`${selectedLang.name} Client Runtime`);
          setIsRunning(false);
          return;
        }
      }
      if (isOffline) throw new Error('You are offline and this language requires internet.');
      const result = await executeCode(selectedLang.compiler, code, stdin);
      setOutput(result.run.output);
      setStderr(result.run.stderr);
      setIsError(result.run.code !== 0);
      setTimeMs(result.run.timeMs);
      setCompilerInfo(result.run.compilerInfo || selectedLang.compiler);
    } catch (error: any) {
      setIsError(true);
      setOutput(error.message || 'Failed to execute code.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFormat = () => {
    updateActiveTabCode(code.trim());
    showToast('Code formatted successfully!', 'success');
  };

  const handleDownload = () => {
    const ext = getFileExtension(selectedLang.id);
    const fileName = activeTab ? activeTab.name : `code.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${fileName}!`, 'success');
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

  const handleSelectSnippet = (snippetCode: string, snippetLangId: string) => {
    handleLanguageChange(snippetLangId);
    updateActiveTabCode(snippetCode);
    showToast(`Template loaded into editor!`, 'success');
  };

  // AI Handlers
  const handleAiFix = async () => {
    setIsAiLoading(true);
    setIsAiModalOpen(true);
    setAiExplanation(undefined);
    setAiComplexity(undefined);
    setAiSuggestions([]);
    setAiFixedCode(undefined);

    try {
      const res = await fetch('/api/ai/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedLang.name,
          error: stderr || output || 'Execution failed',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiFixedCode(data.fixedCode);
      setAiExplanation(data.explanation);
      showToast('AI analysis complete!', 'success');
    } catch (err: any) {
      setAiExplanation(`Failed to run AI Auto-Fix: ${err.message}`);
      showToast('AI Auto-Fix failed.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiExplain = async () => {
    setIsAiLoading(true);
    setIsAiModalOpen(true);
    setAiExplanation(undefined);
    setAiComplexity(undefined);
    setAiSuggestions([]);
    setAiFixedCode(undefined);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedLang.name,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiExplanation(data.explanation);
      setAiComplexity(data.complexity);
      setAiSuggestions(data.suggestions || []);
      showToast('AI code analysis complete!', 'success');
    } catch (err: any) {
      setAiExplanation(`Failed to analyze code with AI: ${err.message}`);
      showToast('AI Analysis failed.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiFix = (newFixedCode: string) => {
    updateActiveTabCode(newFixedCode);
    showToast('Applied AI fix code to editor!', 'success');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      // Cmd/Ctrl + Enter -> Run Code
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      // Cmd/Ctrl + Shift + F -> Format
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        handleFormat();
      }
      // Cmd/Ctrl + S -> Download File
      else if (isCmdOrCtrl && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleDownload();
      }
      // Cmd/Ctrl + Shift + L -> Snippets Library
      else if (isCmdOrCtrl && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setIsSnippetsOpen(true);
      }
      // Cmd/Ctrl + / -> Shortcuts Help
      else if (isCmdOrCtrl && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, selectedLang, stdin]);

  return (
    <div className="main-layout">
      <Navbar 
        selectedLanguage={selectedLang.id} 
        onLanguageChange={handleLanguageChange} 
        onRun={handleRun}
        onShare={handleShare}
        onFormat={handleFormat}
        onOpenSnippets={() => setIsSnippetsOpen(true)}
        onOpenAiAssistant={handleAiExplain}
        onDownload={handleDownload}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onSaveGist={() => showToast('Saved as GitHub Gist!', 'success')}
        onPushRepo={() => showToast('Pushed to GitHub repository!', 'success')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onShareSession={handleShareSession}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        roomActive={roomActive}
        collaboratorsCount={collaboratorsCount}
        isRunning={isRunning}
      />

      <main className="content-grid">
        <div className="editor-section">
          <EditorTabs 
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={(id) => setActiveTabId(id)}
            onAddTab={() => setIsNewFileModalOpen(true)}
            onCloseTab={handleCloseTab}
            onRenameTab={handleRenameTab}
          />
          <div className="editor-wrapper">
            <Editor 
              language={selectedLang.monaco} 
              value={code} 
              onChange={(val) => updateActiveTabCode(val || '')} 
              onMount={(editor) => setEditorInstance(editor)}
              settings={settings}
            />
          </div>
        </div>
        
        <div className="output-section">
          <OutputPane 
            output={output} 
            stderr={stderr}
            isError={isError}
            timeMs={timeMs}
            compilerInfo={compilerInfo}
            stdin={stdin}
            onStdinChange={(val) => setStdin(val)}
            onClear={() => { setOutput(''); setStderr(''); setIsError(false); setTimeMs(undefined); }} 
            onAiFix={handleAiFix}
            isAiLoading={isAiLoading}
          />
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={(newSettings) => setSettings({ ...settings, ...newSettings })}
      />

      <SnippetsModal 
        isOpen={isSnippetsOpen}
        onClose={() => setIsSnippetsOpen(false)}
        onSelectSnippet={handleSelectSnippet}
        currentLangId={selectedLang.id}
      />

      <ShortcutsModal 
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        defaultExtension={getFileExtension(selectedLang.id)}
        onCreateFile={handleCreateNewFile}
      />

      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        loading={isAiLoading}
        explanation={aiExplanation}
        complexity={aiComplexity}
        suggestions={aiSuggestions}
        fixedCode={aiFixedCode}
        onApplyFix={handleApplyAiFix}
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
        .main-layout { display: flex; flex-direction: column; height: 100vh; height: 100dvh; width: 100vw; overflow: hidden; background: var(--background); }
        .content-grid { flex: 1; display: grid; grid-template-columns: 1fr 30%; min-width: 0; min-height: 0; }
        .editor-section { display: flex; flex-direction: column; min-height: 0; min-width: 0; border-right: 1px solid var(--surface-border); }
        .editor-wrapper { flex: 1; min-height: 0; min-width: 0; }
        .output-section { min-height: 0; min-width: 0; background: var(--console-bg); }
        
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
          background: var(--toast-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--dropdown-shadow);
          color: var(--toast-color);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.2s ease-out;
        }
        .toast-card.success {
          border-left: 4px solid var(--success);
        }
        .toast-card.error {
          border-left: 4px solid var(--error);
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
          color: var(--foreground);
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
