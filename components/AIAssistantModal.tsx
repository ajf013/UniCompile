'use client';

import React from 'react';
import { X, Sparkles, Check, Cpu, Lightbulb, Code } from 'lucide-react';
import styles from './AIAssistantModal.module.css';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  explanation?: string;
  complexity?: string;
  suggestions?: string[];
  fixedCode?: string;
  onApplyFix?: (code: string) => void;
}

export default function AIAssistantModal({
  isOpen,
  onClose,
  loading,
  explanation,
  complexity,
  suggestions = [],
  fixedCode,
  onApplyFix,
}: AIAssistantModalProps) {
  if (!isOpen) return null;

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
              {complexity && (
                <div className={styles.badgeRow}>
                  <span className={styles.badge}>
                    <Cpu size={14} />
                    <span>Complexity: {complexity}</span>
                  </span>
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
                  <span className={styles.sectionTitle}>
                    <Code size={14} />
                    Suggested AI Fix Code
                  </span>
                  <pre className={styles.codePreview}>
                    <code>{fixedCode}</code>
                  </pre>
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
                <span>Apply Auto-Fix to Editor</span>
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
