-- ============================================================
-- Folio Reader — SQLite Database Schema
-- File: db/schema.sql
-- Engine: SQLite 3.x (via rusqlite in Tauri backend)
-- Location at runtime: %APPDATA%\Folio\folio.db (Windows)
-- ============================================================
-- This file is the SOURCE OF TRUTH for the database.
-- When adding a table or column:
--   1. Add it here
--   2. Update src-tauri/src/models/ structs
--   3. Add a migration in src-tauri/src/db/migrations.rs
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- ============================================================
-- BOOKS
-- One row per PDF file added to the library.
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    file_path       TEXT    NOT NULL UNIQUE,   -- Absolute path on disk
    cover_image     BLOB,                       -- Extracted first-page thumbnail (PNG bytes)
    total_pages     INTEGER NOT NULL DEFAULT 0,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    author          TEXT,                       -- Extracted from PDF metadata
    cover_color     TEXT    NOT NULL DEFAULT '#2d2b55', -- Hex color for card UI
    date_added      TEXT    NOT NULL DEFAULT (datetime('now')),
    last_opened     TEXT,
    is_favorite     INTEGER NOT NULL DEFAULT 0  -- 0 = no, 1 = yes
);

-- ============================================================
-- READING PROGRESS
-- Stores where the user left off in each book.
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_progress (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER NOT NULL UNIQUE REFERENCES books(id) ON DELETE CASCADE,
    current_page    INTEGER NOT NULL DEFAULT 1,
    scroll_offset   REAL    NOT NULL DEFAULT 0.0,  -- 0.0 to 1.0 within page
    zoom_level      REAL    NOT NULL DEFAULT 1.0,
    last_updated    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- READING SESSIONS
-- Each time user opens a book = one session.
-- Used for streak, total time, pages-read stats.
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_sessions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id         INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    started_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    ended_at        TEXT,                           -- NULL if session still active
    duration_seconds INTEGER NOT NULL DEFAULT 0,   -- Updated on session end
    pages_read      INTEGER NOT NULL DEFAULT 0,    -- Pages navigated during session
    start_page      INTEGER NOT NULL DEFAULT 1,
    end_page        INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- BOOKMARKS
-- Per-page bookmarks with optional label.
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    label       TEXT,                               -- Optional user label
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(book_id, page_number)                    -- One bookmark per page
);

-- ============================================================
-- ANNOTATIONS
-- Stores all annotation types in one table.
-- annotation_type: 'highlight' | 'underline' | 'strikethrough' | 'sticky_note' | 'ink'
-- ============================================================
CREATE TABLE IF NOT EXISTS annotations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id         INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    page_number     INTEGER NOT NULL,
    annotation_type TEXT    NOT NULL CHECK(
                        annotation_type IN ('highlight','underline','strikethrough','sticky_note','ink')
                    ),

    -- For text-based annotations (highlight, underline, strikethrough)
    selected_text   TEXT,                           -- The text that was selected
    color           TEXT,                           -- Hex color e.g. '#fde68a'

    -- For sticky notes
    note_content    TEXT,                           -- The note body text
    is_note_open    INTEGER NOT NULL DEFAULT 0,     -- 1 = note popup open on load

    -- For ink drawings
    ink_path_data   TEXT,                           -- JSON array of SVG path strings

    -- Position on page (stored as JSON for flexibility)
    -- Format: {"x": 0.12, "y": 0.45, "w": 0.35, "h": 0.02}
    -- Values are 0.0–1.0 as fraction of page width/height
    position_data   TEXT    NOT NULL DEFAULT '{}',

    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TAGS
-- User-defined tags for annotations.
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL UNIQUE,
    color   TEXT    NOT NULL DEFAULT '#6366f1'  -- Hex color for tag chip
);

-- ============================================================
-- ANNOTATION TAGS (Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS annotation_tags (
    annotation_id   INTEGER NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (annotation_id, tag_id)
);

-- ============================================================
-- APP SETTINGS
-- Key-value store for user preferences.
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
    key     TEXT PRIMARY KEY,
    value   TEXT NOT NULL
);

-- Default settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES
    ('theme', 'dark'),                  -- 'dark' | 'light' | 'sepia'
    ('default_zoom', '1.0'),
    ('sidebar_left_open', '1'),
    ('sidebar_right_open', '1'),
    ('highlight_opacity', '0.4'),       -- 0.0 to 1.0
    ('ink_color', '#6366f1'),
    ('ink_size', '3'),                  -- px
    ('reading_goal_minutes', '30'),     -- Daily reading goal
    ('streak_grace_hours', '26');       -- Hours before streak breaks

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_annotations_book_page
    ON annotations(book_id, page_number);

CREATE INDEX IF NOT EXISTS idx_sessions_book
    ON reading_sessions(book_id);

CREATE INDEX IF NOT EXISTS idx_sessions_started
    ON reading_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_bookmarks_book
    ON bookmarks(book_id);

-- ============================================================
-- VIEWS (convenience queries used by the app)
-- ============================================================

-- All highlights across all books (for cross-book Insights panel)
CREATE VIEW IF NOT EXISTS v_all_highlights AS
SELECT
    a.id,
    a.book_id,
    b.title         AS book_title,
    a.page_number,
    a.annotation_type,
    a.selected_text,
    a.color,
    a.note_content,
    a.created_at
FROM annotations a
JOIN books b ON b.id = a.book_id
WHERE a.annotation_type IN ('highlight', 'underline', 'strikethrough')
ORDER BY a.created_at DESC;

-- Reading stats summary per book
CREATE VIEW IF NOT EXISTS v_book_stats AS
SELECT
    b.id            AS book_id,
    b.title,
    b.total_pages,
    COALESCE(SUM(s.duration_seconds), 0)    AS total_seconds,
    COALESCE(SUM(s.pages_read), 0)          AS total_pages_read,
    COUNT(s.id)                             AS total_sessions,
    MAX(s.started_at)                       AS last_session,
    COUNT(a.id)                             AS total_annotations
FROM books b
LEFT JOIN reading_sessions s ON s.book_id = b.id
LEFT JOIN annotations a ON a.book_id = b.id
GROUP BY b.id;

-- Daily reading minutes (for streak calculation)
CREATE VIEW IF NOT EXISTS v_daily_reading AS
SELECT
    date(started_at)            AS read_date,
    SUM(duration_seconds) / 60  AS minutes_read,
    COUNT(DISTINCT book_id)     AS books_read
FROM reading_sessions
WHERE ended_at IS NOT NULL
GROUP BY date(started_at)
ORDER BY read_date DESC;

-- ============================================================
-- SCHEMA VERSION
-- Bump this whenever you make a migration.
-- ============================================================
CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER PRIMARY KEY,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO schema_version (version) VALUES (1);
