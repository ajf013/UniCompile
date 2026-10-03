'use client';

import React, { useState } from 'react';
import { Terminal, Trash2, AlertCircle, Sliders, Activity, Zap, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
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
  onRun?: () => void;
  onAiFix?: () => void;
  isAiLoading?: boolean;
}

const isPromptDetected = (text: string) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes(':') ||
    lower.includes('?') ||
    lower.includes('enter') ||
    lower.includes('input') ||
    lower.includes('how many') ||
    lower.includes('number of') ||
    lower.includes('set of numbers')
  );
};

export default function OutputPane({
  output,
  stderr,
  isError,
  timeMs,
  compilerInfo,
  stdin,
  onStdinChange,
  onClear,
  onRun,
  onAiFix,
  isAiLoading,
}: OutputPaneProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'stdin' | 'stats'>('output');

  const hasExecuted = output !== '' || stderr !== '';
  const promptFound = hasExecuted && isPromptDetected(output);

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
            {stdin.trim() ? (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>
            ) : promptFound ? (
              <span className={styles.tabPulseBadge} title="Input Expected!"></span>
            ) : null}
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
              <div>
                <pre className={isError ? styles.error : styles.stdout}>
                  {output}
                  {stderr && <div className={styles.stderr}>{stderr}</div>}
                </pre>

                {promptFound && (
                  <div className={styles.stdinBanner}>
                    <div className={styles.stdinBannerHeader}>
                      <HelpCircle size={16} />
                      <span>Input Values Required (STDIN)</span>
                    </div>
                    <p className={styles.stdinBannerText}>
                      Your program asked for input (e.g. <code>scanf</code> / <code>input()</code>). Since execution runs in a non-interactive server environment, enter all input values below (each prompt on a new line or separated by spaces) and click <strong>Run Code with Input</strong>:
                    </p>
                    <div className={styles.stdinQuickBox}>
                      <textarea
                        className={styles.stdinQuickTextarea}
                        rows={3}
                        value={stdin}
                        onChange={(e) => onStdinChange(e.target.value)}
                        placeholder={`Example input values:\n5\n10 20 30 40 50`}
                      />
                      {onRun && (
                        <button className={styles.stdinRunBtn} onClick={onRun}>
                          <Zap size={14} />
                          <span>Run Code with STDIN Input</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
              placeholder={`Type your input values here (e.g. numbers or text for scanf / input):\n\nExample:\n5\n10 20 30 40 50`}
            />
            {onRun && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                <button className={styles.stdinRunBtn} onClick={onRun}>
                  <Zap size={14} />
                  <span>Run Code with STDIN Input</span>
                </button>
              </div>
            )}
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

