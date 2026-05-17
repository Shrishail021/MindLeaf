import type { Book } from './Bookshelf';
import { BookOpen } from 'lucide-react';

interface Props {
  book: Book;
  onClick: () => void;
}

export default function BookCard({ book, onClick }: Props) {
  return (
    <div className="book-card" onClick={onClick} id={`book-${book.id}`}>
      <div className="book-cover" style={{ background: book.coverColor }}>
        <div className="book-cover-inner">
          <BookOpen size={32} strokeWidth={1} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
        {book.status === 'reading' && (
          <div className="book-progress-bar">
            <div className="book-progress-fill" style={{ width: `${book.progress}%` }} />
          </div>
        )}
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author text-muted">{book.author}</div>
        <div className="book-meta text-muted">
          {book.status === 'reading' ? `${book.progress}% · ${book.lastRead}` : book.lastRead}
        </div>
      </div>
    </div>
  );
}
