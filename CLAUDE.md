# CLAUDE.md — MindLeaf Reader (Offline PDF Reading App)

> This file is the **single source of truth** for the AI assistant.
> Read this file in full at the start of EVERY session before writing any code.
> Never forget the goal. Never add external dependencies without checking constraints first.

---

## 🎯 What Are We Building?

**MindLeaf Reader** — A free, offline, Windows-only desktop PDF reading app built for deep readers.

Think: Kindle's calm reading feel + Notion's note capture + VLC's simplicity.

**One-line pitch:**
> "Read deeply. Think clearly. Own your knowledge."

---

## 🧱 Tech Stack (DO NOT DEVIATE)

| Layer | Technology | Why |
|---|---|---|
| Desktop Framework | **Tauri v2** (Rust backend) | Tiny size, native, no Electron bloat |
| Frontend | **React 18 + TypeScript** | Component-driven, type-safe |
| Styling | **Tailwind CSS** | Utility-first, fast iteration |
| PDF Rendering | **PDF.js (Mozilla)** | Open source, no license, battle-tested |
| Local Database | **SQLite via `rusqlite`** | Embedded, zero config, local-only |
| State Management | **Zustand** | Lightweight, no Redux complexity |
| Build Tool | **Vite** | Fast HMR, works perfectly with Tauri |

### ❌ Never Use
- Electron
- Any cloud/API service
- Firebase, Supabase, or any BaaS
- Paid libraries or fonts
- Node.js servers or Express
- `localStorage` for persistent data (use SQLite only)

---

## 🖥️ Platform Target

- **Windows only** (Windows 10 and above)
- No macOS, no Linux for now
- Must run fully offline — zero network calls at runtime
- App size goal: under 15MB installed

---

## 📁 Project File Structure

```
folio/
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── main.rs             # Tauri entry point
│   │   ├── commands/           # All Tauri commands (IPC)
│   │   │   ├── books.rs        # add_book, get_books, delete_book
│   │   │   ├── annotations.rs  # save_highlight, get_highlights, delete_annotation
│   │   │   ├── notes.rs        # save_note, get_notes
│   │   │   ├── progress.rs     # update_progress, get_progress
│   │   │   └── stats.rs        # get_stats, get_streak
│   │   ├── db/
│   │   │   ├── mod.rs          # DB connection pool
│   │   │   └── migrations.rs   # SQL migrations runner
│   │   └── models/             # Rust structs matching DB schema
│   ├── tauri.conf.json
│   └── Cargo.toml
│
├── src/                        # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LeftSidebar.tsx       # Library, Notes, Highlights nav
│   │   │   ├── RightSidebar.tsx      # Annotation details, insights
│   │   │   └── TopBar.tsx            # Title, theme toggle, zoom
│   │   ├── reader/
│   │   │   ├── PDFReader.tsx         # PDF.js wrapper
│   │   │   ├── AnnotationLayer.tsx   # Highlights, underlines, drawings
│   │   │   ├── StickyNote.tsx        # Floating sticky notes
│   │   │   └── PageCanvas.tsx        # Freehand ink layer (canvas)
│   │   ├── library/
│   │   │   ├── Bookshelf.tsx         # Grid of book covers
│   │   │   ├── BookCard.tsx          # Individual book tile
│   │   │   └── AddBookModal.tsx      # Drag/drop or file picker
│   │   ├── insights/
│   │   │   ├── InsightsPanel.tsx     # "My Insights" — all highlights
│   │   │   ├── HighlightItem.tsx     # Single highlight row
│   │   │   └── ExportModal.tsx       # Export highlights to .txt/.md
│   │   ├── stats/
│   │   │   ├── StatsPanel.tsx        # Reading streak, pages, time
│   │   │   └── ReadingHeatmap.tsx    # Visual heatmap per book
│   │   └── ui/
│   │       ├── ThemeToggle.tsx       # Dark / Light / Sepia switch
│   │       ├── ColorPicker.tsx       # Highlight color selector
│   │       └── Tooltip.tsx
│   ├── hooks/
│   │   ├── usePDF.ts               # PDF.js load/render logic
│   │   ├── useAnnotations.ts       # CRUD for highlights/notes
│   │   ├── useReadingSession.ts    # Track time, pages, streak
│   │   └── useTheme.ts             # Theme state + persistence
│   ├── store/
│   │   ├── bookStore.ts            # Zustand: library state
│   │   ├── readerStore.ts          # Zustand: current book, page, zoom
│   │   └── annotationStore.ts      # Zustand: active annotations
│   ├── styles/
│   │   ├── themes/
│   │   │   ├── dark.css
│   │   │   ├── light.css
│   │   │   └── sepia.css
│   │   └── global.css
│   └── utils/
│       ├── pdfHelpers.ts           # PDF.js utilities
│       ├── colorUtils.ts           # Highlight RGBA helpers
│       └── dateUtils.ts            # Streak calculation helpers
│
├── db/
│   └── schema.sql                  # Source of truth for DB schema
├── CLAUDE.md                       # ← THIS FILE
├── master-prompt.md                # AI session starter
├── README.md
└── package.json
```

---

## 🗄️ Database (SQLite)

All data lives in a single SQLite file at:
```
%APPDATA%\Folio\folio.db       (Windows)
```

See `db/schema.sql` for full schema. Tables:
- `books` — library entries
- `annotations` — highlights, underlines, sticky notes, drawings
- `reading_progress` — current page + scroll per book
- `reading_sessions` — time tracking per session
- `bookmarks` — per-page bookmarks
- `tags` — user-defined tags
- `annotation_tags` — many-to-many join

---

## 🎨 UI Rules (NON-NEGOTIABLE)

1. **No clutter.** Every element must earn its place.
2. **VLC-like simplicity** — controls appear, then disappear. UI gets out of the way.
3. Three themes: `dark` (default), `light`, `sepia`. Toggled from top bar.
4. Font: **Inter** (bundled, no CDN).
5. Sidebar widths: Left = 240px, Right = 280px. Both collapsible.
6. Reading area: always centered, max-width 900px, padded.
7. No modals for reading actions — use inline popovers.
8. Transitions: 150ms ease. Nothing flashy.
9. Icons: **Lucide React** only (already a dependency, no extra installs).

### Color Tokens
```css
/* Dark Theme */
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-surface: #242424;
--text-primary: #e8e8e8;
--text-muted: #888888;
--accent: #6366f1;          /* Indigo */
--accent-hover: #818cf8;

/* Sepia Theme */
--bg-primary: #f4ede4;
--bg-secondary: #ede3d8;
--text-primary: #3b2e1e;
--accent: #8b5e3c;

/* Light Theme */
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--text-primary: #1a1a1a;
--accent: #6366f1;
```

---

## ✨ Features — Complete List

### Phase 1 (MVP — Build This First)
- [ ] PDF loading from local file system (drag & drop + file picker)
- [ ] Smooth PDF rendering via PDF.js
- [ ] Page navigation (arrow keys, click, jump to page)
- [ ] Zoom in/out (Ctrl+scroll, buttons)
- [ ] Dark / Light / Sepia theme toggle
- [ ] Remember last page position per book
- [ ] Bookshelf UI (grid of books with cover thumbnails)
- [ ] Highlighting (select text → color picker → save)
  - Colors: Yellow, Green, Blue, Pink, Orange
- [ ] Underline & Strikethrough annotations
- [ ] Sticky notes (click on page → popup → type note → pin)
- [ ] Freehand ink drawing layer (canvas overlay, toggleable)
- [ ] Bookmarks (per page, show in sidebar)
- [ ] Right sidebar: Insights panel (all highlights from current book)
- [ ] Export highlights to `.txt` and `.md`

### Phase 2
- [ ] Full-text search across current PDF
- [ ] Tags on annotations
- [ ] Reading stats: streak, pages read, time spent
- [ ] Reading heatmap per book
- [ ] Cross-book highlights in Insights panel

### Phase 3
- [ ] Knowledge graph (highlights linked visually across books)
- [ ] Smart review system (spaced repetition reminders)
- [ ] Plugin/theme system

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Next page | `→` or `Space` |
| Previous page | `←` |
| Jump to page | `Ctrl+G` |
| Zoom in | `Ctrl+=` |
| Zoom out | `Ctrl+-` |
| Reset zoom | `Ctrl+0` |
| Toggle dark/light | `Ctrl+T` |
| Highlight mode | `H` |
| Ink draw mode | `D` |
| Add bookmark | `Ctrl+B` |
| Open insights | `Ctrl+I` |
| Toggle left sidebar | `Ctrl+[` |
| Toggle right sidebar | `Ctrl+]` |
| Search in PDF | `Ctrl+F` |

---

## 🚫 Constraints Checklist (Check Before Every Feature)

Before implementing anything, verify:
- [ ] Does it require internet? → **REJECT**
- [ ] Does it add a new npm package? → Only if zero alternatives exist
- [ ] Does it write data outside SQLite or AppData? → **REJECT**
- [ ] Does it use cloud storage? → **REJECT**
- [ ] Does it use `localStorage`? → **REJECT** (use SQLite via Tauri commands)
- [ ] Does it break Windows compatibility? → **REJECT**

---

## 🔌 Tauri IPC Pattern (Always Follow This)

**Frontend calls Tauri backend like this:**
```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Save a highlight
const result = await invoke<Annotation>('save_annotation', {
  bookId: 1,
  pageNumber: 42,
  annotationType: 'highlight',
  selectedText: 'The obstacle is the way',
  color: '#fde68a',
  positionData: JSON.stringify({ x: 120, y: 340, w: 200, h: 20 }),
});
```

**Rust command signature:**
```rust
#[tauri::command]
async fn save_annotation(
    book_id: i64,
    page_number: i32,
    annotation_type: String,
    selected_text: Option<String>,
    color: Option<String>,
    position_data: String,
    state: tauri::State<'_, AppState>,
) -> Result<Annotation, String> { ... }
```

---

## 📊 Reading Stats Logic

- **Session**: starts when user opens a book, ends when they close it or switch tabs
- **Streak**: consecutive days with at least 1 reading session ≥ 5 minutes
- **Pages read**: counted when user navigates away from a page (= page was "read")
- **Time spent**: wall-clock time while the reader window is focused

---

## 🧠 AI Assistant Rules (For Antigravity / Claude)

1. **Always read this file first** before any code generation
2. **Never suggest Electron** — we use Tauri
3. **Never suggest cloud services** — 100% local
4. **Always use TypeScript** — no plain JS files in `src/`
5. **Always use Zustand** for state, not Redux or Context API for global state
6. **Always follow the file structure above** — don't invent new folders
7. **When adding a Tauri command**: add it to the correct `commands/*.rs` file AND export from `main.rs`
8. **When adding a DB table**: update `db/schema.sql` AND `models/` structs
9. **PDF.js integration**: always use the worker from the bundled copy, never CDN
10. **If context is lost**: re-read `CLAUDE.md` → `master-prompt.md` → `db/schema.sql` in that order

---

## 🏷️ App Identity

- **App name:** Folio
- **Tagline:** Read deeply. Think clearly. Own your knowledge.
- **License:** MIT (open source)
- **Window title format:** `Folio — {Book Title}`
- **Icon:** Minimalist open book, indigo accent color
