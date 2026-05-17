# 📖 Folio — Offline PDF Reader for Deep Readers

> Read deeply. Think clearly. Own your knowledge.

Folio is a free, open-source, Windows desktop app for reading PDFs the way they deserve to be read — calmly, distraction-free, with your thoughts captured alongside the text.

No cloud. No subscriptions. No tracking. Your books stay on your machine.

---

## ✨ Features

| Feature | Status |
|---|---|
| PDF reading (smooth, fast) | 🔨 Phase 1 |
| Highlighting (5 colors) | 🔨 Phase 1 |
| Underline & Strikethrough | 🔨 Phase 1 |
| Sticky notes | 🔨 Phase 1 |
| Freehand ink drawing | 🔨 Phase 1 |
| Per-page bookmarks | 🔨 Phase 1 |
| Dark / Light / Sepia themes | 🔨 Phase 1 |
| Remember reading position | 🔨 Phase 1 |
| Bookshelf library UI | 🔨 Phase 1 |
| Insights panel (all highlights) | 🔨 Phase 1 |
| Export highlights to .md / .txt | 🔨 Phase 1 |
| Reading streak & stats | 🔨 Phase 1 |
| Full-text search | 📅 Phase 2 |
| Annotation tags | 📅 Phase 2 |
| Reading heatmap | 📅 Phase 2 |
| Knowledge graph | 📅 Phase 3 |
| Smart review (spaced repetition) | 📅 Phase 3 |

---

## 🛠️ Tech Stack

- **[Tauri v2](https://tauri.app)** — Rust-powered desktop framework (tiny, native, fast)
- **React 18 + TypeScript** — UI layer
- **Tailwind CSS** — Styling
- **PDF.js** — PDF rendering (Mozilla, open source)
- **SQLite (rusqlite)** — Local database
- **Zustand** — State management

**Why Tauri over Electron?**
Tauri apps are ~5–10x smaller and use native OS webview instead of bundling Chromium. Folio targets <15MB installed size.

---

## 🚀 Getting Started (Development)

### Prerequisites
- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

```bash
# Install dependencies
npm install

# Run in development
npm run tauri dev

# Build for Windows
npm run tauri build
```

The built `.exe` will be in `src-tauri/target/release/bundle/`.

---

## 📁 Project Structure

```
folio/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── commands/   # Tauri IPC commands
│   │   ├── db/         # SQLite setup & migrations
│   │   └── models/     # Rust data structs
│   └── tauri.conf.json
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand stores
│   └── styles/         # Themes (dark/light/sepia)
├── db/
│   └── schema.sql      # Database schema (source of truth)
├── CLAUDE.md           # AI context file (read this first!)
└── master-prompt.md    # Paste at start of AI sessions
```

---

## 🗄️ Database

All data is stored locally in:
```
%APPDATA%\Folio\folio.db
```

Schema is in `db/schema.sql`. Tables:
- `books` — your library
- `annotations` — highlights, notes, ink, underlines
- `reading_progress` — current page per book
- `reading_sessions` — time and pages for stats
- `bookmarks` — per-page bookmarks
- `tags` — annotation tags
- `app_settings` — user preferences

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Next page | `→` or `Space` |
| Previous page | `←` |
| Jump to page | `Ctrl+G` |
| Zoom in / out | `Ctrl+=` / `Ctrl+-` |
| Toggle theme | `Ctrl+T` |
| Highlight mode | `H` |
| Ink draw mode | `D` |
| Add bookmark | `Ctrl+B` |
| Open insights | `Ctrl+I` |
| Toggle sidebars | `Ctrl+[` / `Ctrl+]` |
| Search | `Ctrl+F` |

---

## 🤖 For AI-Assisted Development (Antigravity / Claude)

This project uses AI-assisted vibe coding. To maintain context across sessions:

1. **Start every session** by pasting the contents of `master-prompt.md`
2. The AI will then read `CLAUDE.md` for full project context
3. If the AI seems lost, paste `CLAUDE.md` directly into chat
4. Never let the AI deviate from the tech stack in `CLAUDE.md`

Key rules the AI must follow:
- ❌ No Electron, no cloud, no internet at runtime
- ✅ Tauri + SQLite + Zustand always
- ✅ TypeScript everywhere in `src/`

---

## 📜 License

MIT — free forever, open source, yours to fork.

---

## 🙏 Built With Love For

- Self-help readers who want to own their insights
- Students who annotate heavily
- Deep readers who hate distraction
- Anyone who wants a calm, local, private reading space
