'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import styles from './ShortcutsModal.module.css';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { label: 'Run / Compile Code', keys: [modKey, 'Enter'] },
    { label: 'Format Code', keys: [modKey, 'Shift', 'F'] },
    { label: 'Download Source File', keys: [modKey, 'S'] },
    { label: 'Open Snippets Library', keys: [modKey, 'Shift', 'L'] },
    { label: 'Toggle Shortcuts Help', keys: [modKey, '/'] },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Keyboard size={20} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {shortcuts.map((s, index) => (
            <div key={index} className={styles.shortcutRow}>
              <span className={styles.label}>{s.label}</span>
              <div className={styles.keys}>
                {s.keys.map((k, i) => (
                  <kbd key={i} className={styles.kbd}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
