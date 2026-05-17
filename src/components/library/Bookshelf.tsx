import { useEffect, useState } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import BookCard from './BookCard';
import { useBookStore } from '../../store/bookStore';
import type { Book } from '../../types';

interface Props {
  onOpenBook: (book: Book) => void;
  onAddBook: () => void;
}

export default function Bookshelf({ onOpenBook, onAddBook }: Props) {
  const { books, isLoading, loadBooks, deleteBook, toggleFavorite } = useBookStore();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const favorites = filtered.filter(b => b.is_favorite);

  const handleDelete = async (id: number) => {
    if (confirmDelete === id) {
      await deleteBook(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="bookshelf">
      {/* Header */}
      <div className="bookshelf-header">
        <div>
          <h1 className="text-headline-lg">My Library</h1>
          <p className="text-body-md text-muted" style={{ marginTop: 4 }}>
            {books.length} books · {books.filter(b => b.last_opened).length} opened
          </p>
        </div>
        <div className="bookshelf-header-actions">
          <div className="search-bar glass">
            <Search size={16} strokeWidth={1.5} className="search-icon" />
            <input
              id="library-search"
              placeholder="Search library..."
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" id="add-book-btn" onClick={onAddBook}>
            <Plus size={16} strokeWidth={2} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Add Book
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-60)' }}>
          Loading library…
        </div>
      )}

      {!isLoading && books.length === 0 && (
        <div className="bookshelf-empty">
          <p className="text-headline-sm" style={{ marginBottom: 8 }}>Your library is empty</p>
          <p className="text-body-md text-muted" style={{ marginBottom: 20 }}>Add a PDF to get started</p>
          <button className="btn-primary" onClick={onAddBook}>Add Your First Book</button>
        </div>
      )}

      {favorites.length > 0 && (
        <section className="bookshelf-section">
          <h2 className="bookshelf-section-title">
            <Star size={12} style={{ display: 'inline', marginRight: 6 }} />
            Favorites
          </h2>
          <div className="book-grid">
            {favorites.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onOpenBook(book)}
                onDelete={() => handleDelete(book.id)}
                onFavorite={() => toggleFavorite(book.id)}
                deleteConfirming={confirmDelete === book.id}
              />
            ))}
          </div>
        </section>
      )}

      {filtered.length > 0 && (
        <section className="bookshelf-section">
          <h2 className="bookshelf-section-title">All Books</h2>
          <div className="book-grid">
            {filtered.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onOpenBook(book)}
                onDelete={() => handleDelete(book.id)}
                onFavorite={() => toggleFavorite(book.id)}
                deleteConfirming={confirmDelete === book.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
