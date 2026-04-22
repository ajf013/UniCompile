'use client';

import React, { useState } from 'react';
import { Play, Share2, Settings, Terminal, Github, User, Wand2, LogOut, FileCode, PlusCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/execution';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './Navbar.module.css';

interface NavbarProps {
  selectedLanguage: string;
  onLanguageChange: (langId: string) => void;
  onRun: () => void;
  onShare: () => void;
  onFormat: () => void;
  onSaveGist: () => void;
  onPushRepo: () => void;
  onOpenSettings: () => void;
  isRunning: boolean;
}

export default function Navbar({ 
  selectedLanguage, 
  onLanguageChange, 
  onRun, 
  onShare,
  onFormat,
  onSaveGist,
  onPushRepo,
  onOpenSettings,
  isRunning
}: NavbarProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.logo}>
        <Terminal size={24} className={styles.logoIcon} />
        <span className={styles.logoText}>UniCompile</span>
      </div>

      <div className={styles.controls}>
        <select 
          className={styles.select}
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>

        <button className="btn btn-secondary" onClick={onFormat} title="Format Code">
          <Wand2 size={18} />
          <span>Format</span>
        </button>

        <button className="btn btn-primary" onClick={onRun} disabled={isRunning}>
          {isRunning ? <span className={styles.loading}></span> : <Play size={18} fill="currentColor" />}
          {isRunning ? 'Compiling...' : 'Run Code'}
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={onShare} title="Copy Share Link">
          <Share2 size={20} />
        </button>
        
        {session ? (
          <div className={styles.userSection}>
            <div className={styles.saveActions}>
              <button className={styles.iconBtn} onClick={onSaveGist} title="Save to GitHub Gist">
                <FileCode size={20} />
              </button>
              <button className={styles.iconBtn} onClick={onPushRepo} title="Push to GitHub Repo">
                <PlusCircle size={20} />
              </button>
            </div>
            
            <div className={styles.profileWrapper}>
              <img 
                src={session.user?.image || ''} 
                alt="User" 
                className={styles.avatar} 
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
              {showUserMenu && (
                <div className={`${styles.dropdown} glass`}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.userName}>{session.user?.name}</p>
                    <p className={styles.userEmail}>{session.user?.email}</p>
                  </div>
                  <button className={styles.dropdownItem} onClick={() => signOut()}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className={styles.iconBtn} onClick={() => signIn('github')} title="Login with GitHub">
            <Github size={20} />
          </button>
        )}

        <button className={styles.iconBtn} onClick={onOpenSettings} title="Settings">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
