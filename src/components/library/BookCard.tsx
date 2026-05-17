import { BookOpen, Star, Trash2 } from 'lucide-react';
import type { Book } from '../../types';

interface Props {
  book: Book;
  onClick: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  deleteConfirming?: boolean;
}

export default function BookCard({ book, onClick, onDelete, onFavorite, deleteConfirming }: Props) {
  const coverColor = book.cover_color ?? '#2d2b55';

  return (
    <div className="book-card" id={`book-${book.id}`}>
      <div className="book-cover" style={{ background: coverColor }} onClick={onClick}>
        <div className="book-cover-inner">
          <BookOpen size={32} strokeWidth={1} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
        {/* Progress bar placeholder */}
        <div className="book-progress-bar">
          <div className="book-progress-fill" style={{ width: '0%' }} />
        </div>
        {/* Action overlay */}
        <div className="book-card-actions">
          <button
            className={`book-action-btn ${book.is_favorite ? 'active' : ''}`}
            title="Favorite"
            onClick={e => { e.stopPropagation(); onFavorite(); }}
          >
            <Star size={14} strokeWidth={1.5} fill={book.is_favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`book-action-btn danger ${deleteConfirming ? 'confirming' : ''}`}
            title={deleteConfirming ? 'Click again to confirm' : 'Delete'}
            onClick={e => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="book-info" onClick={onClick}>
        <div className="book-title">{book.title}</div>
        <div className="book-author text-muted">{book.author ?? 'Unknown Author'}</div>
        <div className="book-meta text-muted">
          {book.last_opened
            ? new Date(book.last_opened).toLocaleDateString()
            : 'Never opened'}
        </div>
      </div>
    </div>
  );
}
