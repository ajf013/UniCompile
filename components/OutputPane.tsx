'use client';

import React from 'react';
import { Terminal, Trash2, AlertCircle } from 'lucide-react';
import styles from './OutputPane.module.css';

interface OutputPaneProps {
  output: string;
  stderr?: string;
  isError: boolean;
  onClear: () => void;
}

export default function OutputPane({ output, stderr, isError, onClear }: OutputPaneProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Terminal size={16} />
          <span>Console</span>
        </div>
        <button className={styles.clearBtn} onClick={onClear} title="Clear Output">
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className={styles.content}>
        {!output && !stderr ? (
          <div className={styles.placeholder}>
            Click "Run Code" to see the output here.
          </div>
        ) : (
          <pre className={isError ? styles.error : styles.stdout}>
            {output}
            {stderr && <div className={styles.stderr}>{stderr}</div>}
          </pre>
        )}
      </div>

      {isError && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} />
          Execution finished with errors.
        </div>
      )}
    </div>
  );
}
