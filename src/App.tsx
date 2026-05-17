import { useState } from 'react';
import LeftSidebar, { type NavView } from './components/layout/LeftSidebar';
import Bookshelf from './components/library/Bookshelf';
import AddBookModal from './components/library/AddBookModal';
import PDFReader from './components/reader/PDFReader';
import StatsPanel from './components/stats/StatsPanel';
import { InsightsPanel, BookmarksPanel } from './components/panels/SidePanels';
import type { Book } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('bookshelf');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openBook, setOpenBook] = useState<Book | null>(null);
  const [readerPanel, setReaderPanel] = useState<'insights' | 'bookmarks'>('bookmarks');

  const handleOpenBook = (book: Book) => {
    setOpenBook(book);
    setActiveView('reader');
  };

  const handleBookAdded = (_bookId: number) => {
    // Optionally auto-open the book that was just added
    // For now just stay on bookshelf
  };

  const toggleReaderPanel = (panel: 'insights' | 'bookmarks') => {
    setReaderPanel(p => p === panel ? 'bookmarks' : panel);
  };

  const renderMain = () => {
    switch (activeView) {
      case 'bookshelf':
        return (
          <Bookshelf
            onOpenBook={handleOpenBook}
            onAddBook={() => setShowAddModal(true)}
          />
        );
      case 'reader':
        if (!openBook) {
          return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p className="text-headline-sm" style={{ marginBottom: 8 }}>No book open</p>
                <p className="text-body-md text-muted" style={{ marginBottom: 20 }}>Select a book from your library</p>
                <button className="btn-primary" onClick={() => setActiveView('bookshelf')}>Open Library</button>
              </div>
            </div>
          );
        }
        return (
          <PDFReader
            book={openBook}
            rightPanel={readerPanel}
            onTogglePanel={toggleReaderPanel}
          />
        );
      case 'insights':
        return (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: 40 }}>
              <h1 className="text-headline-lg" style={{ marginBottom: 8 }}>My Insights</h1>
              <p className="text-body-md text-muted">All your highlights across all books</p>
            </div>
            {openBook
              ? <InsightsPanel bookId={openBook.id} />
              : (
                <div className="panel glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-body-md text-muted">Open a book to see highlights</p>
                </div>
              )
            }
          </div>
        );
      case 'bookmarks':
        return (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: 40 }}>
              <h1 className="text-headline-lg" style={{ marginBottom: 8 }}>Bookmarks</h1>
              <p className="text-body-md text-muted">All your saved pages</p>
            </div>
            {openBook
              ? <BookmarksPanel bookId={openBook.id} />
              : (
                <div className="panel glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-body-md text-muted">Open a book to see bookmarks</p>
                </div>
              )
            }
          </div>
        );
      case 'stats':
        return <StatsPanel />;
      case 'settings':
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 className="text-headline-lg" style={{ marginBottom: 8 }}>Settings</h1>
              <p className="text-body-md text-muted">Coming in Phase 2</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <LeftSidebar activeView={activeView} onNavigate={v => setActiveView(v)} />
      {renderMain()}
      {showAddModal && (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onBookAdded={handleBookAdded}
        />
      )}
    </div>
  );
}
