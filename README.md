# 🚀 UniCompile - Universal Online Compiler

UniCompile is a premium, high-performance, and responsive multi-language online compiler. Built with **Next.js 16**, **Monaco Editor**, and **WebAssembly**, it provides a professional-grade development environment that works both online and offline.

![UniCompile Preview](https://fcruz.org/preview.png) *(Placeholder for your preview image)*

## ✨ Key Features

-   **🌐 Multi-Language Support**: Compile and run code in C, C++, Python, Java, C#, Go, Rust, PHP, JavaScript, and TypeScript.
-   **📶 Offline-First**: 
    -   Works as a **PWA** (Progressive Web App) - installable on iOS, Android, and Desktop.
    -   **Local Execution**: Uses **WebAssembly (Pyodide)** to run Python and JavaScript locally in the browser when offline.
-   **🐙 GitHub Integration**:
    -   **Sign in with GitHub**: Secure authentication via NextAuth.
    -   **Save to Gist**: Instantly export your code snippets to your GitHub Gists.
    -   **Share via URL**: Share your code with a unique, base64-encoded URL.
-   **🎨 Premium Aesthetic**:
    -   **Glassmorphic Design**: Modern dark mode with blurred surfaces and vibrant accents.
    -   **Fully Responsive**: Optimized for every screen size from 4-inch phones to large monitors.
-   **⚙️ Pro Editor Settings**:
    -   Customizable **Font Size** (12px - 24px).
    -   Multiple **Themes** (Pro Dark, High Contrast, Light Mode).
    -   **Minimap** toggle for better navigation.

## 🛠️ Technology Stack

-   **Framework**: Next.js 16 (App Router)
-   **Editor**: Monaco Editor (VS Code Engine)
-   **Execution Engine**: 
    -   **Online**: Wandbox API (High-performance cloud compilers)
    -   **Offline**: WebAssembly (Pyodide) & Browser Runtime
-   **Authentication**: NextAuth.js (GitHub OAuth)
-   **Styling**: CSS Modules with Glassmorphic design tokens
-   **Icons**: Lucide React

## 📂 Project Structure

```text
UniCompile/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth handlers
│   │   └── github/         # GitHub API routes (Gists, Repos)
│   ├── globals.css         # Global styles & glassmorphism tokens
│   ├── layout.tsx          # Root layout with Auth Providers
│   └── page.tsx            # Main Editor & Logic controller
├── components/
│   ├── Editor.tsx          # Monaco Editor integration
│   ├── Navbar.tsx          # Multi-functional navigation bar
│   ├── OutputPane.tsx      # Terminal-style result window
│   ├── Providers.tsx       # Auth & Context providers
│   └── SettingsModal.tsx   # Customization UI
├── lib/
│   ├── execution.ts        # Cloud compiler logic
│   └── localExecution.ts   # WASM-based offline execution
├── public/
│   └── manifest.json       # PWA manifest configuration
├── netlify.toml            # Automated deployment config
└── package.json            # Scripts & dependencies
```

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+ 
-   NPM or Yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/ajf013/UniCompile.git
    cd UniCompile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env.local`:
    ```env
    GITHUB_ID=your_id
    GITHUB_SECRET=your_secret
    NEXTAUTH_SECRET=your_random_secret
    NEXTAUTH_URL=http://localhost:3000
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 🌐 Deployment

The project is configured for **Netlify**. 
-   The `netlify.toml` handles the build settings automatically.
-   Make sure to set the Environment Variables in the Netlify Dashboard.
-   Custom Domain: Set your `NEXTAUTH_URL` to your production domain (e.g., `https://compile.fcruz.org`).

---
Built with ❤️ by [ajf013](https://github.com/ajf013)
