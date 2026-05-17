import { Plus, Search } from 'lucide-react';
import BookCard from './BookCard';

export interface Book {
  id: number;
  title: string;
  author: string;
  coverColor: string;
  progress: number; // 0–100
  lastRead?: string;
  status: 'reading' | 'finished' | 'unread';
}

const DEMO_BOOKS: Book[] = [
  { id: 1, title: 'Meditations', author: 'Marcus Aurelius', coverColor: '#2d2b55', progress: 72, lastRead: 'Reading now', status: 'reading' },
  { id: 2, title: 'Deep Work', author: 'Cal Newport', coverColor: '#1a3a2a', progress: 85, lastRead: 'Reading now', status: 'reading' },
  { id: 3, title: 'The Alchemist', author: 'Paulo Coelho', coverColor: '#3a1a1a', progress: 100, lastRead: 'Oct 12, 2023', status: 'finished' },
  { id: 4, title: 'Atomic Habits', author: 'James Clear', coverColor: '#1a2a3a', progress: 100, lastRead: 'Sep 28, 2023', status: 'finished' },
  { id: 5, title: 'The Daily Stoic', author: 'Ryan Holiday', coverColor: '#2a2a1a', progress: 100, lastRead: 'Aug 15, 2023', status: 'finished' },
  { id: 6, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', coverColor: '#2a1a3a', progress: 45, lastRead: 'Jul 30, 2023', status: 'reading' },
];

interface Props {
  onOpenBook: (book: Book) => void;
  onAddBook: () => void;
}

export default function Bookshelf({ onOpenBook, onAddBook }: Props) {
  const reading = DEMO_BOOKS.filter(b => b.status === 'reading');
  const finished = DEMO_BOOKS.filter(b => b.status === 'finished');

  return (
    <div className="bookshelf">
      {/* Header */}
      <div className="bookshelf-header">
        <div>
          <h1 className="text-headline-lg">My Library</h1>
          <p className="text-body-md text-muted" style={{ marginTop: 4 }}>
            {DEMO_BOOKS.length} books · {reading.length} in progress
          </p>
        </div>
        <div className="bookshelf-header-actions">
          <div className="search-bar glass">
            <Search size={16} strokeWidth={1.5} className="search-icon" />
            <input placeholder="Search library..." className="search-input" />
          </div>
          <button className="btn-primary" id="add-book-btn" onClick={onAddBook}>
            <Plus size={16} strokeWidth={2} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Add Book
          </button>
        </div>
      </div>

      {/* Currently Reading */}
      <section className="bookshelf-section">
        <h2 className="bookshelf-section-title">Currently Reading</h2>
        <div className="book-grid">
          {reading.map(book => (
            <BookCard key={book.id} book={book} onClick={() => onOpenBook(book)} />
          ))}
        </div>
      </section>

      {/* Finished */}
      <section className="bookshelf-section">
        <h2 className="bookshelf-section-title">Finished</h2>
        <div className="book-grid">
          {finished.map(book => (
            <BookCard key={book.id} book={book} onClick={() => onOpenBook(book)} />
          ))}
        </div>
      </section>
    </div>
  );
}
