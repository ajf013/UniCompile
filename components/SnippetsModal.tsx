'use client';

import React, { useState } from 'react';
import { X, BookOpen, Search, ArrowRight, Code } from 'lucide-react';
import { SNIPPETS, Snippet } from '@/lib/snippets';
import styles from './SnippetsModal.module.css';

interface SnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet: (code: string, langId: string) => void;
  currentLangId: string;
}

export default function SnippetsModal({
  isOpen,
  onClose,
  onSelectSnippet,
  currentLangId,
}: SnippetsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Starter', 'Data Structures', 'Algorithms', 'Competitive'];

  const filtered = SNIPPETS.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.langId.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <BookOpen size={20} className="text-indigo-400" />
            <span>Code Templates & Algorithm Library</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.searchBar}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search templates (e.g. Binary Search, BST, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterTabs}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterChip} ${selectedCategory === cat ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filtered.map((snippet) => (
              <div key={snippet.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{snippet.title}</span>
                    <span className={styles.badge}>{snippet.langId.toUpperCase()}</span>
                  </div>
                  <p className={styles.cardDesc}>{snippet.description}</p>
                </div>
                <button
                  className={styles.loadBtn}
                  onClick={() => {
                    onSelectSnippet(snippet.code, snippet.langId);
                    onClose();
                  }}
                >
                  <span>Load into Editor</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No code templates matched your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
