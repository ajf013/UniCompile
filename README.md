# 🚀 UniCompile - Universal Online Compiler (v0.2.0)

UniCompile is a premium, high-performance, and responsive multi-language online compiler & IDE. Built with **Next.js 16**, **Monaco Editor**, and **WebAssembly**, it provides a professional-grade development environment that works both online and offline across Windows, macOS, iOS (iPhone/iPad), and Android devices.

---

## ✨ Key Features (v0.2.0 Update)

-   **🌐 Multi-Language Support**: Compile and run code in C, C++, Python, Java, C#, Go, Rust, PHP, JavaScript, and TypeScript.
-   **🌓 Seamless Dark & Light Themes**:
    -   Quick-toggle theme button with smooth transitions.
    -   Supports **Pro Dark**, **Light Mode**, and **High Contrast Black** with Monaco editor synchronization.
-   **📥 Interactive STDIN & Execution Stats**:
    -   Provide standard input stream data directly into programs via the **STDIN Input** tab.
    -   Real-time **Execution Stats** showing runtime duration in milliseconds, memory details, and exit codes (`Exit 0` / `Exit 1`).
-   **📚 Code Templates & Algorithm Library**:
    -   Curated catalog of starters, competitive programming templates, data structures (BST, Graphs, Knapsack DP), and sorting algorithms.
-   **📑 Multi-File Editor Tabs**:
    -   Manage multiple file drafts simultaneously with tabbed navigation (`main.py`, `helper.cpp`, `test.js`).
-   **💾 Code Export & File Downloader**:
    -   One-click file downloader saving your code with proper extensions (`.py`, `.cpp`, `.cs`, `.java`, `.rs`, `.go`, `.php`, etc.).
-   **⌨️ Global Keyboard Shortcuts**:
    -   <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd>: Compile & Run Code
    -   <kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>: Format Code
    -   <kbd>⌘/Ctrl</kbd> + <kbd>S</kbd>: Download File
    -   <kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>: Templates Library
    -   <kbd>⌘/Ctrl</kbd> + <kbd>/</kbd>: Shortcuts Help Sheet
-   **📶 Offline-First & Auto-Cache Update**:
    -   **PWA** with immediate Service Worker activation (`skipWaiting: true`) and cache-invalidation headers ensuring instant updates across all Windows, iOS (iPhone), and MacBook devices.
    -   **Local Execution**: Uses **WebAssembly (Pyodide)** to run Python and JavaScript locally in the browser when offline.
-   **👥 Real-Time WebRTC Collaboration**:
    -   Live multi-user peer-to-peer coding sessions using Yjs and WebRTC.
-   **🐙 GitHub Integration**:
    -   Sign in with GitHub (NextAuth OAuth), Save to Gist, and Snapshot URL Sharing.

---

## 🛠️ Technology Stack

UniCompile is built on a modern, high-performance web development stack:

| Technology | Badge & Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | [![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/) | React Framework (App Router) |
| **React** | [![React](https://img.shields.io/badge/React-19.2.4-20232a?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev/) | UI library (React 19) |
| **TypeScript** | [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Strict static typing and code reliability |
| **Monaco Editor** | [![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-4.7.0-007acc?style=flat-square&logo=visual-studio-code&logoColor=white)](https://github.com/suren-atoyan/monaco-react) | In-browser code editor |
| **Yjs & WebRTC** | [![Yjs](https://img.shields.io/badge/Yjs-13.6.31-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://yjs.dev/) | Real-time CRDT collaboration |
| **NextAuth.js** | [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.14-111?style=flat-square&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/) | User authentication (GitHub OAuth) |
| **Lucide React** | [![Lucide React](https://img.shields.io/badge/Lucide_React-0.454.0-ff79c6?style=flat-square&logo=lucide&logoColor=white)](https://lucide.dev/) | Iconography system |

---

## 📂 Project Structure

```text
UniCompile/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts     # GitHub OAuth NextAuth handlers
│   │   └── github/gist/route.ts            # GitHub Gist export API endpoint
│   ├── favicon.ico                         # Application icon
│   ├── globals.css                         # Dark, Light, & High Contrast design tokens
│   ├── layout.tsx                          # HTML frame, PWA cache invalidation headers
│   └── page.tsx                            # Primary application page & router state
├── components/
│   ├── Editor.tsx                          # Monaco Editor wrapper component
│   ├── EditorTabs.tsx                      # Multi-file tab navigation bar
│   ├── EditorTabs.module.css               # Multi-file tab styles
│   ├── Navbar.tsx                          # Top header with Run, Templates, Download, Theme, Collab
│   ├── OutputPane.tsx                      # Terminal output, STDIN input, & Execution stats
│   ├── OutputPane.module.css               # Terminal & STDIN layout styling
│   ├── ShortcutsModal.tsx                  # Keyboard shortcuts cheat sheet modal
│   ├── SnippetsModal.tsx                   # Templates & algorithm library drawer
│   └── SettingsModal.tsx                   # Editor custom settings panel
├── lib/
│   ├── execution.ts                        # Wandbox API execution engine & stdin support
│   ├── localExecution.ts                   # Pyodide (WASM) & JS offline runner
│   └── snippets.ts                         # Pre-loaded algorithm and starter snippets
├── public/
│   ├── logo.svg                            # Application vector logo
│   ├── manifest.json                       # PWA manifest
│   └── sw.js                               # Service Worker with immediate cache activation
├── next.config.ts                          # Next-PWA setup with skipWaiting: true
└── package.json                            # v0.2.0 application manifest
```

---

## 🔄 Flow Diagrams

### Code Execution & STDIN Flow
```mermaid
graph TD
    A[User types Code & STDIN Input] --> B{Is language offline supported?}
    B -->|Yes (JS / TS / Python)| C{Is device offline?}
    C -->|Yes| D[Execute inside browser sandbox via WASM]
    C -->|No| D
    B -->|No (C, C++, Rust, Go, etc.)| E{Is device online?}
    E -->|Yes| F[Send Code + STDIN payload to Wandbox API]
    E -->|No| G[Display offline warning toast notification]
    D --> H[Display stdout/stderr & Execution Stats in OutputPane]
    F --> H
```

---

## 🚀 Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ajf013/UniCompile.git
   cd UniCompile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---
Built with ❤️ by [ajf013](https://github.com/ajf013)
