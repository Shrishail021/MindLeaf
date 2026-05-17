import { useState } from 'react';
import LeftSidebar, { type NavView } from './components/layout/LeftSidebar';
import Bookshelf, { type Book } from './components/library/Bookshelf';
import AddBookModal from './components/library/AddBookModal';
import PDFReader from './components/reader/PDFReader';
import StatsPanel from './components/stats/StatsPanel';
import { InsightsPanel, BookmarksPanel } from './components/panels/SidePanels';

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('bookshelf');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openBook, setOpenBook] = useState<Book | null>(null);
  const [readerPanel, setReaderPanel] = useState<'insights' | 'bookmarks'>('insights');

  const handleOpenBook = (book: Book) => {
    setOpenBook(book);
    setActiveView('reader');
  };

  const toggleReaderPanel = (panel: 'insights' | 'bookmarks') => {
    setReaderPanel(prev => prev === panel ? 'insights' : panel);
  };

  const renderMain = () => {
    switch (activeView) {
      case 'bookshelf':
        return <Bookshelf onOpenBook={handleOpenBook} onAddBook={() => setShowAddModal(true)} />;
      case 'reader':
        return (
          <PDFReader
            bookTitle={openBook?.title ?? 'Atomic Habits'}
            rightPanel={readerPanel}
            onTogglePanel={toggleReaderPanel}
          />
        );
      case 'insights':
        return (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: 40 }}>
              <h1 className="text-headline-lg" style={{ marginBottom: 24 }}>My Insights</h1>
              <p className="text-body-md text-muted">147 highlights across 12 books</p>
            </div>
            <InsightsPanel />
          </div>
        );
      case 'bookmarks':
        return (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: 40 }}>
              <h1 className="text-headline-lg" style={{ marginBottom: 24 }}>Bookmarks</h1>
              <p className="text-body-md text-muted">All your saved pages across books</p>
            </div>
            <BookmarksPanel />
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
      <LeftSidebar activeView={activeView} onNavigate={v => { setActiveView(v); }} />
      {renderMain()}
      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
