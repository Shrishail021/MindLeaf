// Shared TypeScript types matching Rust models

export interface Book {
  id: number;
  title: string;
  file_path: string;
  author?: string;
  total_pages: number;
  file_size_bytes: number;
  cover_color?: string;
  date_added: string;
  last_opened?: string;
  is_favorite: boolean;
}

export interface ReadingProgress {
  id: number;
  book_id: number;
  current_page: number;
  scroll_offset: number;
  zoom_level: number;
  last_updated: string;
}

export interface Annotation {
  id: number;
  book_id: number;
  page_number: number;
  annotation_type: 'highlight' | 'underline' | 'strikethrough' | 'sticky_note' | 'ink';
  selected_text?: string;
  color?: string;
  note_content?: string;
  is_note_open: boolean;
  ink_path_data?: string;
  position_data: string; // JSON string: { x, y, w, h } as 0–1 fractions
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: number;
  book_id: number;
  page_number: number;
  label?: string;
  created_at: string;
}

export interface ReadingStats {
  streak_days: number;
  total_pages_read: number;
  total_time_seconds: number;
  total_books: number;
  books_completed: number;
}

export interface AppSetting {
  key: string;
  value: string;
}

// Highlight colors available in the annotation popover
export const HIGHLIGHT_COLORS = [
  { name: 'Yellow', hex: '#fde68a' },
  { name: 'Green',  hex: '#86efac' },
  { name: 'Blue',   hex: '#93c5fd' },
  { name: 'Pink',   hex: '#f9a8d4' },
  { name: 'Orange', hex: '#fdba74' },
] as const;

// Cover colors for book cards (auto-assigned on import)
export const COVER_COLORS = [
  '#2d2b55', '#1a3a2a', '#3a1a1a', '#1a2a3a',
  '#2a2a1a', '#2a1a3a', '#1a2a2a', '#3a2a1a',
];

export function pickCoverColor(index: number): string {
  return COVER_COLORS[index % COVER_COLORS.length];
}
