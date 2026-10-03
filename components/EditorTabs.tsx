'use client';

import React, { useState } from 'react';
import { Plus, X, FileCode, Edit2, Check } from 'lucide-react';
import styles from './EditorTabs.module.css';

export interface TabItem {
  id: string;
  name: string;
  code: string;
  langId: string;
}

interface EditorTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onRenameTab: (id: string, newName: string) => void;
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onRenameTab,
}: EditorTabsProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (tab: TabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingName(tab.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      onRenameTab(id, editingName.trim());
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (id: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isEditing = tab.id === editingTabId;

        return (
          <div
            key={tab.id}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onSelectTab(tab.id)}
            onDoubleClick={(e) => handleStartEdit(tab, e)}
            title={tab.name}
          >
            <FileCode size={14} />

            {isEditing ? (
              <input
                className={styles.renameInput}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleSaveEdit(tab.id)}
                onKeyDown={(e) => handleKeyDown(tab.id, e)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={styles.tabName}>{tab.name}</span>
            )}

            {!isEditing && (
              <button
                className={styles.editIconBtn}
                onClick={(e) => handleStartEdit(tab, e)}
                title="Rename File"
              >
                <Edit2 size={11} />
              </button>
            )}

            {tabs.length > 1 && !isEditing && (
              <button
                className={styles.closeBtn}
                onClick={(e) => onCloseTab(tab.id, e)}
                title="Close Tab"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      <button className={styles.addBtn} onClick={onAddTab} title="Create New File">
        <Plus size={16} />
      </button>
    </div>
  );
}
