import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Book } from '../types';
import { pickCoverColor } from '../types';

interface BookStore {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  loadBooks: () => Promise<void>;
  addBook: (title: string, filePath: string, author?: string, totalPages?: number, fileSizeBytes?: number) => Promise<Book>;
  deleteBook: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  markOpened: (id: number) => Promise<void>;
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  isLoading: false,
  error: null,

  loadBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await invoke<Book[]>('get_books');
      set({ books, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addBook: async (title, filePath, author, totalPages = 0, fileSizeBytes = 0) => {
    const coverColor = pickCoverColor(get().books.length);
    const book = await invoke<Book>('add_book', {
      title,
      filePath,
      author: author ?? null,
      totalPages,
      fileSizeBytes,
      coverColor,
    });
    set(s => ({ books: [book, ...s.books] }));
    return book;
  },

  deleteBook: async (id) => {
    await invoke('delete_book', { id });
    set(s => ({ books: s.books.filter(b => b.id !== id) }));
  },

  toggleFavorite: async (id) => {
    await invoke<boolean>('toggle_favorite', { id });
    set(s => ({
      books: s.books.map(b => b.id === id ? { ...b, is_favorite: !b.is_favorite } : b),
    }));
  },

  markOpened: async (id) => {
    await invoke('update_book_last_opened', { id });
    set(s => ({
      books: s.books.map(b =>
        b.id === id ? { ...b, last_opened: new Date().toISOString() } : b
      ),
    }));
  },
}));
