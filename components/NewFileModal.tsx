'use client';

import React, { useState, useEffect } from 'react';
import { X, FilePlus, FileCode } from 'lucide-react';
import styles from './NewFileModal.module.css';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExtension: string;
  onCreateFile: (fileName: string) => void;
}

export default function NewFileModal({
  isOpen,
  onClose,
  defaultExtension,
  onCreateFile,
}: NewFileModalProps) {
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFileName(`file_${Math.floor(Math.random() * 100)}.${defaultExtension}`);
    }
  }, [isOpen, defaultExtension]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let name = fileName.trim();
    if (!name) return;

    // Append extension if missing
    if (!name.includes('.')) {
      name = `${name}.${defaultExtension}`;
    }

    onCreateFile(name);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <div className={styles.title}>
              <FilePlus size={20} className="text-indigo-400" />
              <span>Create New File</span>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.body}>
            <label className={styles.label}>
              Enter File Name (e.g. <code>main.{defaultExtension}</code>, <code>helper.{defaultExtension}</code>):
            </label>
            <div className={styles.inputGroup}>
              <FileCode size={18} color="var(--text-muted)" />
              <input
                type="text"
                className={styles.input}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={`main.${defaultExtension}`}
                autoFocus
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create & Save File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
