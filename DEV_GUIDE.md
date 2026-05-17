# MindLeaf — Developer Guide
> Read deeply. Think clearly. Own your knowledge.

This guide covers everything from first clone to shipping a Windows `.exe` installer.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Starting the Dev Server](#starting-the-dev-server)
4. [How the App is Wired Together](#how-the-app-is-wired-together)
5. [SQLite / Rust Backend Setup](#sqlite--rust-backend-setup)
6. [Building the Windows .exe](#building-the-windows-exe)
7. [Code Signing (Optional)](#code-signing-optional)
8. [Phase Roadmap](#phase-roadmap)
9. [AI Workflow (Antigravity Sessions)](#ai-workflow-antigravity-sessions)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install these once before you do anything else.

### 1. Node.js (v18 or later)
```
https://nodejs.org/en/download
```
Verify: `node --version` → should print `v18.x.x` or higher.

### 2. Rust (stable toolchain)
```
https://rustup.rs
```
Run the installer, then open a **new terminal** and verify:
```powershell
rustc --version   # e.g. rustc 1.78.0
cargo --version   # e.g. cargo 1.78.0
```

### 3. Tauri Prerequisites for Windows
Tauri needs the **WebView2** runtime (ships with Windows 11, optional install for Win 10):
```
https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```
Also install the **Visual Studio C++ Build Tools** (required for Rust on Windows):
```
https://visualstudio.microsoft.com/visual-cpp-build-tools/
```
Select workload: **"Desktop development with C++"**

### 4. Git
```
https://git-scm.com/downloads
```

---

## Project Structure

```
c:\Mindleaf\mindleaf\
├── src\                        ← React + TypeScript frontend
│   ├── main.tsx                ← Entry point (imports all CSS here)
│   ├── App.tsx                 ← Root component, view routing
│   ├── components\
│   │   ├── layout\LeftSidebar.tsx
│   │   ├── library\Bookshelf.tsx / BookCard.tsx / AddBookModal.tsx
│   │   ├── reader\PDFReader.tsx
│   │   ├── panels\SidePanels.tsx (InsightsPanel + BookmarksPanel)
│   │   └── stats\StatsPanel.tsx
│   ├── styles\                 ← All CSS (imported centrally in main.tsx)
│   │   ├── global.css          ← Design tokens, ambient glows, utilities
│   │   ├── sidebar.css / bookshelf.css / reader.css
│   │   ├── panels.css / modal.css / stats.css
│   └── store\                  ← Zustand state (Phase 1)
│
├── src-tauri\                  ← Rust backend (Tauri)
│   ├── src\main.rs             ← Entry → calls lib.rs::run()
│   ├── src\lib.rs              ← Tauri builder, registers commands
│   ├── Cargo.toml              ← Rust dependencies
│   └── tauri.conf.json         ← App config (title, identifier, icons)
│
├── db\schema.sql               ← SQLite schema (source of truth)
├── CLAUDE.md                   ← AI context — READ FIRST every session
├── DESIGN_REFERENCE.md         ← Stitch design tokens (Liquid Glass)
├── DEV_GUIDE.md                ← This file
└── master-prompt.md            ← Paste into AI chat to restore context
```

---

## Starting the Dev Server

### Option A — Frontend only (fastest, no Rust needed)
```powershell
cd c:\Mindleaf\mindleaf
npm run dev
```
Opens at **http://localhost:1420/** — full hot-reload, instant.

> Use when working on UI, CSS, or components. No Rust compile needed.

### Option B — Full Tauri app (native window)
> ⚠️ Requires Rust + WebView2 installed first.

```powershell
cd c:\Mindleaf\mindleaf
npm run tauri dev
```
1. Starts Vite dev server on port 1420
2. Compiles the Rust backend
3. Opens a **native Windows window**

First run takes ~3–5 min (Rust compile). Subsequent runs are ~30 seconds.

---

## How the App is Wired Together

```
React UI → invoke('command', { args })
         → Tauri IPC Bridge
         → Rust #[tauri::command] fn
         → SQLite via rusqlite
         → Result<T> returned to TypeScript
```

### TypeScript call example
```typescript
import { invoke } from '@tauri-apps/api/core';

const books = await invoke<Book[]>('get_books');
```

### Rust command example
```rust
#[tauri::command]
async fn get_books(state: tauri::State<'_, AppState>) -> Result<Vec<Book>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // query SQLite and return
    Ok(books)
}
```

---

## SQLite / Rust Backend Setup

> The Phase 0 UI is complete. This connects it to a real database.

### Step 1 — Add rusqlite to `Cargo.toml`
```toml
[dependencies]
rusqlite = { version = "0.31", features = ["bundled"] }
```
`bundled` compiles SQLite into the binary — no separate install required.

### Step 2 — App state in `lib.rs`
```rust
use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Connection>,
}

pub fn run() {
    let conn = Connection::open("mindleaf.db").expect("DB open failed");
    conn.execute_batch(include_str!("../../db/schema.sql")).unwrap();

    tauri::Builder::default()
        .manage(AppState { db: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![get_books, add_book])
        .run(tauri::generate_context!())
        .expect("error while running tauri");
}
```

### Step 3 — Command file structure
```
src-tauri/src/commands/
├── books.rs        → add_book, get_books, delete_book
├── annotations.rs  → save_annotation, get_annotations, delete_annotation
├── progress.rs     → update_progress, get_progress
└── stats.rs        → get_stats, get_streak
```

Add `mod commands;` to `lib.rs` and register each in `generate_handler![]`.

---

## Building the Windows .exe

> ⚠️ Requires Rust + all prerequisites installed.

### Step 1 — Build
```powershell
cd c:\Mindleaf\mindleaf
npm run tauri build
```

### Step 2 — Output location
```
src-tauri\target\release\bundle\
├── msi\
│   └── MindLeaf_0.1.0_x64_en-US.msi     ← Windows Installer (MSI)
└── nsis\
    └── MindLeaf_0.1.0_x64-setup.exe      ← Standalone installer
```

**Share the `nsis\*.exe`** — it's self-contained and installs with a GUI wizard.

The installed app will be **~5–15MB** (uses Windows system WebView2, not bundled Chromium like Electron).

### Build targets in `tauri.conf.json`
```json
"bundle": {
  "active": true,
  "targets": ["msi", "nsis"],
  "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.ico"]
}
```

### Auto-generate icons from a single image
```powershell
npm run tauri icon path\to\icon-1024x1024.png
```
This creates all required icon sizes automatically.

---

## Code Signing (Optional)

Unsigned `.exe` triggers Windows SmartScreen ("Unknown publisher" warning).

### Option A — Self-signed cert (dev/testing only)
```powershell
# Run as Administrator in PowerShell
New-SelfSignedCertificate -Type CodeSigning -Subject "CN=MindLeaf" `
  -KeyUsage DigitalSignature -FriendlyName "MindLeaf Dev" `
  -CertStoreLocation "Cert:\CurrentUser\My"
```

### Option B — EV Certificate (production — removes SmartScreen)
Purchase from DigiCert, Sectigo, or GlobalSign (~$300–500/year).

Add to `tauri.conf.json`:
```json
"windows": {
  "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
  "digestAlgorithm": "sha256",
  "timestampUrl": "http://timestamp.digicert.com"
}
```

---

## Phase Roadmap

### ✅ Phase 0 — Foundation (COMPLETE)
- [x] Tauri v2 + React 18 + TypeScript + Tailwind CSS
- [x] Liquid Glass dark design from Stitch MCP (all 7 screens)
- [x] Left sidebar nav (Bookshelf, Reader, Insights, Stats, Bookmarks)
- [x] Bookshelf grid with book cards + progress bars
- [x] PDF Reader layout (top bar, page navigation UI, inspector panel)
- [x] Add Book Modal with drag-drop zone
- [x] Insights Panel + Bookmarks Panel (right inspector)
- [x] Reading Stats with activity heatmap (52×7 grid)
- [x] Git repository: https://github.com/Shrishail021/MindLeaf

---

### 🔨 Phase 1 — Core Functionality (NEXT)

Connect UI to real Rust + SQLite backend.

**Rust / Backend**
- [ ] `rusqlite` added to Cargo.toml
- [ ] DB init + migrations in `lib.rs`
- [ ] `commands/books.rs` — add_book, get_books, delete_book
- [ ] `commands/progress.rs` — update_progress, get_progress
- [ ] `commands/annotations.rs` — save/get/delete highlights
- [ ] `commands/stats.rs` — streak, pages_read, time_spent

**Frontend**
- [ ] `bookStore.ts` (Zustand) — loads books from `invoke('get_books')`
- [ ] `readerStore.ts` — current book, page, zoom level
- [ ] `annotationStore.ts` — active highlights per page
- [ ] Real PDF.js rendering in `PDFReader.tsx`
- [ ] Page navigation with ← → Space keys
- [ ] Progress auto-save on page change
- [ ] Text selection → annotation popover → color picker → `invoke('save_annotation')`
- [ ] Bookmark toggle with Ctrl+B
- [ ] Tauri file open dialog (`@tauri-apps/plugin-dialog`)
- [ ] PDF copied to AppData on import (`@tauri-apps/plugin-fs`)
- [ ] Export highlights to `.md` / `.txt`

---

### 📅 Phase 2 — Power Features

- [ ] Full-text PDF search (PDF.js text layer + Ctrl+F)
- [ ] Tags on annotations (tag chips in popover)
- [ ] Streak logic in Rust (sessions → consecutive days)
- [ ] Reading heatmap per book (real session data)
- [ ] Cross-book Insights (all highlights, date-sorted)
- [ ] Sticky notes (click-to-place, draggable, textarea)
- [ ] Freehand ink drawing (canvas overlay, SVG paths)
- [ ] Underline + Strikethrough text decorations

---

### 🔮 Phase 3 — Advanced

- [ ] Knowledge graph (D3.js — highlights linked by concept across books)
- [ ] Spaced repetition review (Anki-style, 100% offline)
- [ ] Light + Sepia themes (CSS variable swap, `useTheme.ts`)
- [ ] System tray icon + reading timer notification
- [ ] Plugin/theme API
- [ ] Windows auto-updater (Tauri updater plugin)

---

## AI Workflow (Antigravity Sessions)

### Starting a session
1. Paste `master-prompt.md` contents into chat
2. AI reads `CLAUDE.md` → confirms context → ask it to build something

### If AI loses context
- Say: *"Read CLAUDE.md and DESIGN_REFERENCE.md then continue"*
- Or paste `CLAUDE.md` directly into chat

### Push to Git
Just say **"push to git"** — AI will commit + push to:
```
https://github.com/Shrishail021/MindLeaf.git
```

### Hard rules (always enforced)
| Rule | Why |
|---|---|
| No Electron | Tauri only — smaller, native |
| No internet calls | 100% offline app |
| No localStorage | SQLite via invoke() only |
| No cloud services | No Firebase, Supabase, etc. |
| TypeScript everywhere | No plain .js files in src/ |
| Zustand for state | Not Redux, not Context API |
| CSS in src/styles/ | Imported in main.tsx only |

---

## Troubleshooting

### Port 1420 already in use
```powershell
netstat -ano | findstr :1420
taskkill /PID <PID> /F
```

### Rust compile error on `tauri dev`
```powershell
rustup update stable
rustup target add x86_64-pc-windows-msvc
```

### WebView2 not found (Windows 10)
Download: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Vite CSS import error ("does the file exist?")
All CSS imports must be in **`src/main.tsx`** only.
Never import CSS inside component files.

### Where is the SQLite database?
```
%APPDATA%\com.shris.mindleaf\
```
Open with: https://sqlitebrowser.org/

### Build fails — icon files missing
```powershell
npm run tauri icon path\to\icon-1024.png
```

---

## Version History

| Version | Date | Notes |
|---|---|---|
| 0.1.0 | 2026-05-17 | Phase 0 UI — Liquid Glass design, all 7 Stitch screens |
| 0.2.0 | TBD | Phase 1 — real PDF + SQLite backend |
| 0.3.0 | TBD | Phase 2 — annotations, highlights, stats |
| 1.0.0 | TBD | Production .exe release |

---
*MindLeaf — MIT License · Built with Tauri + React + TypeScript + Rust*
