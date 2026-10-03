'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Cpu, Lightbulb, Code, Columns, LayoutList, GitCompare } from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';
import styles from './AIAssistantModal.module.css';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  explanation?: string;
  complexity?: string;
  suggestions?: string[];
  fixedCode?: string;
  originalCode?: string;
  language?: string;
  theme?: string;
  onApplyFix?: (code: string) => void;
}

function computeDiffStats(orig: string = '', mod: string = '') {
  const origLines = orig.split('\n');
  const modLines = mod.split('\n');

  let added = 0;
  let removed = 0;

  const origSet = new Set(origLines.map(l => l.trim()));
  const modSet = new Set(modLines.map(l => l.trim()));

  modLines.forEach(l => {
    if (l.trim() && !origSet.has(l.trim())) added++;
  });
  origLines.forEach(l => {
    if (l.trim() && !modSet.has(l.trim())) removed++;
  });

  return { added, removed };
}

function getLineByLineDiff(orig: string = '', mod: string = '') {
  const origLines = orig.split('\n');
  const modLines = mod.split('\n');
  
  const result: { line: string; type: 'added' | 'removed' | 'unchanged' }[] = [];

  let i = 0, j = 0;
  while (i < origLines.length || j < modLines.length) {
    if (i < origLines.length && j < modLines.length) {
      if (origLines[i] === modLines[j]) {
        result.push({ line: modLines[j], type: 'unchanged' });
        i++;
        j++;
      } else {
        if (!modLines.includes(origLines[i])) {
          result.push({ line: origLines[i], type: 'removed' });
          i++;
        } else if (!origLines.includes(modLines[j])) {
          result.push({ line: modLines[j], type: 'added' });
          j++;
        } else {
          result.push({ line: origLines[i], type: 'removed' });
          result.push({ line: modLines[j], type: 'added' });
          i++;
          j++;
        }
      }
    } else if (i < origLines.length) {
      result.push({ line: origLines[i], type: 'removed' });
      i++;
    } else if (j < modLines.length) {
      result.push({ line: modLines[j], type: 'added' });
      j++;
    }
  }

  return result;
}

export default function AIAssistantModal({
  isOpen,
  onClose,
  loading,
  explanation,
  complexity,
  suggestions = [],
  fixedCode,
  originalCode = '',
  language = 'javascript',
  theme = 'vs-dark',
  onApplyFix,
}: AIAssistantModalProps) {
  const [diffMode, setDiffMode] = useState<'split' | 'inline' | 'lines'>('split');

  if (!isOpen) return null;

  const { added, removed } = computeDiffStats(originalCode, fixedCode || '');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Sparkles size={22} className={styles.titleIcon} />
            <span>Azure AI Assistant & Code Debugger</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={36} className="animate-spin text-indigo-500" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Analyzing code & generating AI insights with Azure GPT-4o...</span>
            </div>
          ) : (
            <>
              {(complexity || fixedCode) && (
                <div className={styles.badgeRow}>
                  {complexity && (
                    <span className={styles.badge}>
                      <Cpu size={14} />
                      <span>Complexity: {complexity}</span>
                    </span>
                  )}
                  {fixedCode && (
                    <>
                      <span className={styles.badgeAdded}>+{added} added</span>
                      <span className={styles.badgeRemoved}>-{removed} removed</span>
                    </>
                  )}
                </div>
              )}

              {explanation && (
                <div className={styles.section}>
                  <span className={styles.sectionTitle}>
                    <Sparkles size={14} />
                    AI Analysis & Explanation
                  </span>
                  <div className={styles.textBlock}>{explanation}</div>
                </div>
              )}

              {fixedCode && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                      <GitCompare size={14} />
                      Code Changes Diff
                    </span>

                    <div className={styles.diffControls}>
                      <button
                        className={`${styles.diffTab} ${diffMode === 'split' ? styles.diffTabActive : ''}`}
                        onClick={() => setDiffMode('split')}
                        title="Side-by-Side Diff"
                      >
                        <Columns size={14} />
                        <span>Side-by-Side</span>
                      </button>
                      <button
                        className={`${styles.diffTab} ${diffMode === 'inline' ? styles.diffTabActive : ''}`}
                        onClick={() => setDiffMode('inline')}
                        title="Inline Diff"
                      >
                        <LayoutList size={14} />
                        <span>Inline</span>
                      </button>
                      <button
                        className={`${styles.diffTab} ${diffMode === 'lines' ? styles.diffTabActive : ''}`}
                        onClick={() => setDiffMode('lines')}
                        title="Line Changes View"
                      >
                        <Code size={14} />
                        <span>Line View</span>
                      </button>
                    </div>
                  </div>

                  {diffMode === 'split' || diffMode === 'inline' ? (
                    <div className={styles.diffEditorContainer}>
                      <DiffEditor
                        height="100%"
                        language={language}
                        original={originalCode}
                        modified={fixedCode}
                        theme={theme}
                        options={{
                          readOnly: true,
                          renderSideBySide: diffMode === 'split',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                          automaticLayout: true,
                          renderOverviewRuler: false,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.lineDiffContainer}>
                      {getLineByLineDiff(originalCode, fixedCode).map((item, idx) => (
                        <div
                          key={idx}
                          className={`${styles.diffLine} ${
                            item.type === 'added'
                              ? styles.diffLineAdded
                              : item.type === 'removed'
                              ? styles.diffLineRemoved
                              : styles.diffLineUnchanged
                          }`}
                        >
                          <span className={styles.diffSign}>
                            {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                          </span>
                          <span>{item.line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {suggestions.length > 0 && (
                <div className={styles.section}>
                  <span className={styles.sectionTitle}>
                    <Lightbulb size={14} />
                    Optimization Suggestions
                  </span>
                  <div className={styles.suggestionList}>
                    {suggestions.map((s, index) => (
                      <div key={index} className={styles.suggestionItem}>
                        <span className={styles.suggestionBullet}>•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loading && (
          <div className={styles.footer}>
            {fixedCode && onApplyFix && (
              <button
                className={styles.applyBtn}
                onClick={() => {
                  onApplyFix(fixedCode);
                  onClose();
                }}
              >
                <Check size={18} />
                <span>Apply Auto-Fix to Editor ({added > 0 ? `+${added}` : ''}{removed > 0 ? ` -${removed}` : ''})</span>
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

