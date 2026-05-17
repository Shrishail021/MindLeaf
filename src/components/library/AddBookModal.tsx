import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { useBookStore } from '../../store/bookStore';

interface Props {
  onClose: () => void;
  onBookAdded: (bookId: number) => void;
}

export default function AddBookModal({ onClose, onBookAdded }: Props) {
  const { addBook, books } = useBookStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handlePickFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (selected && typeof selected === 'string') {
        await importFile(selected);
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const importFile = async (filePath: string) => {
    setIsAdding(true);
    setError(null);
    try {
      // Extract filename as title
      const parts = filePath.replace(/\\/g, '/').split('/');
      const filename = parts[parts.length - 1];
      const title = filename.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');

      const book = await addBook(title, filePath, undefined, 0, 0);
      onBookAdded(book.id);
      onClose();
    } catch (e: any) {
      if (String(e).includes('UNIQUE constraint')) {
        setError('This PDF is already in your library.');
      } else {
        setError(String(e));
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.pdf')) {
      // In Tauri, dropped files have a path property
      const path = (file as any).path;
      if (path) importFile(path);
    }
  };

  const recentBooks = books.slice(0, 3);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel glass-elevated" onClick={e => e.stopPropagation()} id="add-book-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-headline-sm">Add to Library</h2>
            <p className="text-body-md text-muted" style={{ marginTop: 4 }}>Import a PDF file</p>
          </div>
          <button className="btn-icon" onClick={onClose} id="modal-close-btn">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          ref={dropRef}
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          id="drop-zone"
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handlePickFile}
        >
          {isAdding ? (
            <>
              <Loader size={32} strokeWidth={1.5} className="drop-zone-icon spinning" />
              <p className="text-body-lg" style={{ fontWeight: 500 }}>Adding to library…</p>
            </>
          ) : (
            <>
              <div className="drop-zone-icon">
                {isDragging ? <FileText size={32} strokeWidth={1.5} /> : <Upload size={32} strokeWidth={1.5} />}
              </div>
              <p className="text-body-lg" style={{ fontWeight: 500 }}>
                {isDragging ? 'Drop to add' : 'Drop your PDF here'}
              </p>
              <p className="text-body-md text-muted">or click to browse files</p>
              <button className="btn-primary" style={{ marginTop: 16 }}>Browse Files</button>
            </>
          )}
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {/* Recent */}
        {recentBooks.length > 0 && (
          <div className="modal-recent">
            <p className="text-label-md text-muted" style={{ marginBottom: 12 }}>RECENTLY ADDED</p>
            {recentBooks.map(b => (
              <div className="modal-recent-item" key={b.id}>
                <div className="modal-recent-cover" style={{ background: b.cover_color ?? '#2d2b55' }} />
                <div>
                  <div className="text-body-md">{b.title}</div>
                  {b.author && <div className="text-caption text-muted">{b.author}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
