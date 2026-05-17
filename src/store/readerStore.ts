import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Book, ReadingProgress, Bookmark } from '../types';

interface ReaderStore {
  // Current book
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;

  // Page state
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  setPage: (page: number) => void;
  setTotalPages: (n: number) => void;
  setZoom: (z: number) => void;

  // Progress (auto-saved)
  progress: ReadingProgress | null;
  loadProgress: (bookId: number) => Promise<void>;
  saveProgress: () => Promise<void>;

  // Bookmarks
  bookmarks: Bookmark[];
  loadBookmarks: (bookId: number) => Promise<void>;
  toggleBookmark: (bookId: number, pageNumber: number, label?: string) => Promise<void>;
  isPageBookmarked: (pageNumber: number) => boolean;

  // Session tracking
  sessionId: number | null;
  sessionStartPage: number;
  sessionStartTime: number | null;
  startSession: (bookId: number) => Promise<void>;
  endSession: (bookId: number) => Promise<void>;
}

export const useReaderStore = create<ReaderStore>((set, get) => ({
  currentBook: null,
  currentPage: 1,
  totalPages: 0,
  zoomLevel: 1.0,
  progress: null,
  bookmarks: [],
  sessionId: null,
  sessionStartPage: 1,
  sessionStartTime: null,

  setCurrentBook: (book) => set({ currentBook: book }),

  setPage: (page) => {
    set({ currentPage: page });
    // Auto-save progress after page change (debounced by caller)
  },

  setTotalPages: (n) => set({ totalPages: n }),
  setZoom: (z) => set({ zoomLevel: z }),

  loadProgress: async (bookId) => {
    try {
      const progress = await invoke<ReadingProgress>('get_progress', { bookId });
      set({
        progress,
        currentPage: progress.current_page,
        zoomLevel: progress.zoom_level,
      });
    } catch {
      // No progress yet — start fresh
      set({ currentPage: 1, zoomLevel: 1.0 });
    }
  },

  saveProgress: async () => {
    const { currentBook, currentPage, zoomLevel } = get();
    if (!currentBook) return;
    try {
      await invoke('update_progress', {
        bookId: currentBook.id,
        currentPage,
        scrollOffset: 0.0,
        zoomLevel,
      });
    } catch {
      // Silently fail — progress save is non-critical
    }
  },

  loadBookmarks: async (bookId) => {
    const bookmarks = await invoke<Bookmark[]>('get_bookmarks', { bookId });
    set({ bookmarks });
  },

  toggleBookmark: async (bookId, pageNumber, label) => {
    const isAdded = await invoke<boolean>('toggle_bookmark', {
      bookId,
      pageNumber,
      label: label ?? null,
    });
    const { bookmarks } = get();
    if (isAdded) {
      const newBm: Bookmark = {
        id: Date.now(), // temp ID until refresh
        book_id: bookId,
        page_number: pageNumber,
        label,
        created_at: new Date().toISOString(),
      };
      set({ bookmarks: [...bookmarks, newBm].sort((a, b) => a.page_number - b.page_number) });
    } else {
      set({ bookmarks: bookmarks.filter(b => b.page_number !== pageNumber) });
    }
  },

  isPageBookmarked: (pageNumber) => {
    return get().bookmarks.some(b => b.page_number === pageNumber);
  },

  startSession: async (bookId) => {
    const { currentPage } = get();
    const sessionId = await invoke<number>('start_session', {
      bookId,
      startPage: currentPage,
    });
    set({ sessionId, sessionStartPage: currentPage, sessionStartTime: Date.now() });
  },

  endSession: async (_bookId) => {
    const { sessionId, sessionStartPage, sessionStartTime, currentPage } = get();
    if (!sessionId || !sessionStartTime) return;
    const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const pagesRead = Math.abs(currentPage - sessionStartPage);
    await invoke('end_session', {
      sessionId,
      endPage: currentPage,
      pagesRead,
      durationSeconds,
    });
    set({ sessionId: null, sessionStartTime: null });
  },
}));
