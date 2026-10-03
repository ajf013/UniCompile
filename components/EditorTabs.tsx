'use client';

import React from 'react';
import { Plus, X, FileCode } from 'lucide-react';
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
}

export default function EditorTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
}: EditorTabsProps) {
  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onSelectTab(tab.id)}
            title={tab.name}
          >
            <FileCode size={14} />
            <span className={styles.tabName}>{tab.name}</span>
            {tabs.length > 1 && (
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
      <button className={styles.addBtn} onClick={onAddTab} title="New File Tab">
        <Plus size={16} />
      </button>
    </div>
  );
}
