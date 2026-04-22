'use client';

import React from 'react';
import { X, Type, Layout, Palette, Check } from 'lucide-react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    fontSize: number;
    theme: string;
    minimap: boolean;
  };
  onUpdate: (newSettings: any) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onUpdate }: SettingsModalProps) {
  if (!isOpen) return null;

  const themes = [
    { id: 'vs-dark', name: 'Pro Dark', color: '#1e1e1e' },
    { id: 'hc-black', name: 'High Contrast', color: '#000000' },
    { id: 'light', name: 'Light Mode', color: '#ffffff' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass`} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Layout size={20} />
            <span>Editor Settings</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Font Size */}
          <div className={styles.section}>
            <label className={styles.label}>
              <Type size={16} />
              <span>Font Size ({settings.fontSize}px)</span>
            </label>
            <input 
              type="range" 
              min="12" 
              max="24" 
              value={settings.fontSize} 
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className={styles.range}
            />
          </div>

          {/* Theme Selector */}
          <div className={styles.section}>
            <label className={styles.label}>
              <Palette size={16} />
              <span>Color Theme</span>
            </label>
            <div className={styles.themeGrid}>
              {themes.map(t => (
                <button 
                  key={t.id}
                  className={`${styles.themeOption} ${settings.theme === t.id ? styles.active : ''}`}
                  onClick={() => onUpdate({ theme: t.id })}
                >
                  <div className={styles.colorPreview} style={{ background: t.color }}>
                    {settings.theme === t.id && <Check size={14} color={t.id === 'light' ? '#000' : '#fff'} />}
                  </div>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Minimap Toggle */}
          <div className={styles.section}>
            <div className={styles.toggleRow}>
              <div className={styles.label}>
                <Layout size={16} />
                <span>Show Minimap</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={settings.minimap} 
                  onChange={(e) => onUpdate({ minimap: e.target.checked })}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
