'use client';

import React, { useState } from 'react';
import { Terminal, Trash2, AlertCircle, Sliders, Activity, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import styles from './OutputPane.module.css';

interface OutputPaneProps {
  output: string;
  stderr?: string;
  isError: boolean;
  timeMs?: number;
  compilerInfo?: string;
  stdin: string;
  onStdinChange: (val: string) => void;
  onClear: () => void;
  onAiFix?: () => void;
  isAiLoading?: boolean;
}

export default function OutputPane({
  output,
  stderr,
  isError,
  timeMs,
  compilerInfo,
  stdin,
  onStdinChange,
  onClear,
  onAiFix,
  isAiLoading,
}: OutputPaneProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'stdin' | 'stats'>('output');

  const hasExecuted = output !== '' || stderr !== '';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'output' ? styles.active : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <Terminal size={14} />
            <span>Output</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'stdin' ? styles.active : ''}`}
            onClick={() => setActiveTab('stdin')}
          >
            <Sliders size={14} />
            <span>STDIN Input</span>
            {stdin.trim() && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <Activity size={14} />
            <span>Execution Stats</span>
          </button>
        </div>

        <div className={styles.headerRight}>
          {hasExecuted && timeMs !== undefined && (
            <span className={`${styles.badge} ${styles.badgeTime}`}>
              <Zap size={12} />
              {timeMs}ms
            </span>
          )}

          {hasExecuted && (
            <span className={`${styles.badge} ${isError ? styles.badgeError : styles.badgeSuccess}`}>
              {isError ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
              {isError ? 'Exit 1' : 'Exit 0'}
            </span>
          )}

          <button className={styles.clearBtn} onClick={onClear} title="Clear Console">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'output' && (
          <>
            {!output && !stderr ? (
              <div className={styles.placeholder}>
                <Terminal size={24} style={{ opacity: 0.4 }} />
                <span>Click "Run Code" or press <kbd style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--surface-border)' }}>⌘+Enter</kbd> to compile & execute.</span>
              </div>
            ) : (
              <pre className={isError ? styles.error : styles.stdout}>
                {output}
                {stderr && <div className={styles.stderr}>{stderr}</div>}
              </pre>
            )}
          </>
        )}

        {activeTab === 'stdin' && (
          <div className={styles.stdinContainer}>
            <span className={styles.stdinLabel}>
              Provide standard input (STDIN) to feed into your program:
            </span>
            <textarea
              className={styles.stdinTextarea}
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Type your input values here (e.g. numbers, strings, multiline inputs)..."
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statTitle}>Status</span>
              <span className={styles.statValue} style={{ color: isError ? 'var(--error)' : 'var(--success)' }}>
                {hasExecuted ? (isError ? 'Failed (Error Code 1)' : 'Success (Exit Code 0)') : 'Not Executed'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statTitle}>Execution Time</span>
              <span className={styles.statValue}>
                {timeMs !== undefined ? `${timeMs} ms` : '—'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statTitle}>Compiler / Engine</span>
              <span className={styles.statValue}>
                {compilerInfo || 'Auto Engine'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statTitle}>Input Length</span>
              <span className={styles.statValue}>
                {stdin.length} chars
              </span>
            </div>
          </div>
        )}
      </div>

      {isError && activeTab === 'output' && (
        <div className={styles.errorBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={14} />
            <span>Execution finished with errors.</span>
          </div>
          {onAiFix && (
            <button className={styles.aiFixBtn} onClick={onAiFix} disabled={isAiLoading}>
              <Sparkles size={14} />
              <span>{isAiLoading ? 'AI Analyzing...' : '✨ Auto-Fix & Explain with AI'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
