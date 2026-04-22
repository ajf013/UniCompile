'use client';

import React from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

interface EditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  settings?: {
    fontSize: number;
    theme: string;
    minimap: boolean;
  };
}

export default function Editor({ 
  language, 
  value, 
  onChange, 
  settings = { fontSize: 14, theme: 'vs-dark', minimap: true } 
}: EditorProps) {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MonacoEditor
        height="100%"
        theme={settings.theme}
        language={language}
        value={value}
        onChange={onChange}
        options={{
          fontSize: settings.fontSize,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: settings.minimap },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          roundedSelection: true,
          cursorStyle: 'line',
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          }
        }}
      />
    </div>
  );
}
