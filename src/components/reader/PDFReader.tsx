import { useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Bookmark, RotateCcw, BookOpen
} from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import { useBookStore } from '../../store/bookStore';
import { InsightsPanel, BookmarksPanel } from '../panels/SidePanels';
import { usePDF } from '../../hooks/usePDF';
import type { Book } from '../../types';

interface Props {
  book: Book;
  rightPanel?: 'insights' | 'bookmarks' | null;
  onTogglePanel?: (_panel: 'insights' | 'bookmarks') => void;
}

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;

export default function PDFReader({ book, rightPanel = 'bookmarks', onTogglePanel: _onTogglePanel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    currentPage, totalPages, zoomLevel,
    setPage, setTotalPages, setZoom,
    loadProgress, saveProgress,
    loadBookmarks, toggleBookmark, isPageBookmarked,
    startSession, endSession,
  } = useReaderStore();

  const { markOpened } = useBookStore();

  // Load progress + bookmarks on mount, start session
  useEffect(() => {
    loadProgress(book.id);
    loadBookmarks(book.id);
    markOpened(book.id);
    startSession(book.id);
    return () => {
      endSession(book.id);
      saveProgress();
    };
  }, [book.id]);

  // PDF.js rendering
  usePDF({
    filePath: book.file_path,
    canvasRef,
    page: currentPage,
    zoom: zoomLevel,
    onPageCount: setTotalPages,
  });

  // Debounced progress save
  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveProgress(), 1500);
  }, [saveProgress]);

  // Page navigation
  const goTo = useCallback((p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages || 9999));
    setPage(clamped);
    debouncedSave();
  }, [totalPages, setPage, debouncedSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(currentPage + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentPage - 1); }
      if (e.ctrlKey && e.key === '=') { e.preventDefault(); setZoom(Math.min(zoomLevel + ZOOM_STEP, ZOOM_MAX)); }
      if (e.ctrlKey && e.key === '-') { e.preventDefault(); setZoom(Math.max(zoomLevel - ZOOM_STEP, ZOOM_MIN)); }
      if (e.ctrlKey && e.key === '0') { e.preventDefault(); setZoom(1.0); }
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleBookmark(book.id, currentPage); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, zoomLevel, book.id, goTo, setZoom, toggleBookmark]);

  const bookmarked = isPageBookmarked(currentPage);

  return (
    <div className="reader-shell">
      {/* Top Bar */}
      <div className="reader-topbar glass">
        <div className="reader-topbar-left">
          <BookOpen size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <span className="text-body-md text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {book.title}
          </span>
        </div>

        <div className="reader-topbar-center">
          <button className="btn-icon" id="prev-page-btn" onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="page-indicator glass">
            <input
              id="page-input"
              type="number"
              value={currentPage}
              onChange={e => goTo(Number(e.target.value))}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--on-surface)', textAlign: 'center',
                width: 48, fontFamily: 'inherit', fontSize: 14,
              }}
              min={1}
              max={totalPages || undefined}
            />
            <span className="text-muted text-body-md">/ {totalPages || '—'}</span>
          </div>
          <button className="btn-icon" id="next-page-btn" onClick={() => goTo(currentPage + 1)} disabled={totalPages > 0 && currentPage >= totalPages}>
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="reader-topbar-right">
          <button className="btn-icon" id="zoom-out-btn" onClick={() => setZoom(Math.max(zoomLevel - ZOOM_STEP, ZOOM_MIN))}><ZoomOut size={16} strokeWidth={1.5} /></button>
          <span className="text-caption text-muted" style={{ minWidth: 40, textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</span>
          <button className="btn-icon" id="zoom-in-btn" onClick={() => setZoom(Math.min(zoomLevel + ZOOM_STEP, ZOOM_MAX))}><ZoomIn size={16} strokeWidth={1.5} /></button>
          <button className="btn-icon" title="Reset zoom (Ctrl+0)" onClick={() => setZoom(1.0)}><RotateCcw size={16} strokeWidth={1.5} /></button>
          <div className="topbar-divider" />
          <button
            className={`btn-icon ${bookmarked ? 'active' : ''}`}
            title={bookmarked ? 'Remove bookmark (Ctrl+B)' : 'Bookmark page (Ctrl+B)'}
            id="bookmark-btn"
            onClick={() => toggleBookmark(book.id, currentPage)}
          >
            <Bookmark size={16} strokeWidth={1.5} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="reader-content">
        {/* PDF Viewport */}
        <div className="pdf-viewport">
          <div className="pdf-page-wrapper">
            <canvas ref={canvasRef} className="pdf-canvas" />
          </div>
        </div>

        {/* Right Panel */}
        {rightPanel === 'insights' && <InsightsPanel bookId={book.id} />}
        {rightPanel === 'bookmarks' && <BookmarksPanel bookId={book.id} onGoToPage={goTo} />}
      </div>
    </div>
  );
}
