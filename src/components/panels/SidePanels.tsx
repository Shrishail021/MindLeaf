import { useEffect } from 'react';
import { Bookmark, ArrowRight, Lightbulb } from 'lucide-react';
import { useAnnotationStore } from '../../store/annotationStore';
import { useReaderStore } from '../../store/readerStore';

// ─── Insights Panel ───────────────────────────────────────────
export function InsightsPanel({ bookId }: { bookId: number }) {
  const { annotations, loadAnnotations } = useAnnotationStore();

  useEffect(() => {
    loadAnnotations(bookId);
  }, [bookId]);

  const highlights = annotations.filter(a =>
    a.annotation_type === 'highlight' || a.annotation_type === 'underline'
  );

  return (
    <div className="panel glass">
      <div className="panel-header">
        <div className="panel-header-icon"><Lightbulb size={16} strokeWidth={1.5} /></div>
        <div>
          <div className="text-headline-sm">Insights</div>
          <div className="text-caption text-muted">{highlights.length} highlight{highlights.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="panel-items">
        {highlights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-60)' }}>
            <Lightbulb size={24} strokeWidth={1} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p className="text-body-md">No highlights yet</p>
            <p className="text-caption text-muted" style={{ marginTop: 4 }}>
              Select text in the reader to highlight
            </p>
          </div>
        )}
        {highlights.map(h => (
          <div
            key={h.id}
            className="highlight-item"
            style={{ borderLeftColor: h.color ?? '#fde68a' }}
          >
            <div className="highlight-text text-body-md">"{h.selected_text}"</div>
            {h.note_content && (
              <div className="highlight-note">
                <div className="highlight-note-label text-label-md text-muted">MY NOTE</div>
                <div className="highlight-note-text text-body-md text-muted">{h.note_content}</div>
              </div>
            )}
            <div className="highlight-book text-caption text-muted">
              <ArrowRight size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
              Page {h.page_number}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bookmarks Panel ─────────────────────────────────────────
interface BookmarksPanelProps {
  bookId: number;
  onGoToPage?: (page: number) => void;
}

export function BookmarksPanel({ bookId, onGoToPage }: BookmarksPanelProps) {
  const { bookmarks, loadBookmarks } = useReaderStore();

  useEffect(() => {
    loadBookmarks(bookId);
  }, [bookId]);

  return (
    <div className="panel glass">
      <div className="panel-header">
        <div className="panel-header-icon"><Bookmark size={16} strokeWidth={1.5} /></div>
        <div>
          <div className="text-headline-sm">Bookmarks</div>
          <div className="text-caption text-muted">{bookmarks.length} page{bookmarks.length !== 1 ? 's' : ''} saved</div>
        </div>
      </div>

      <div className="panel-items">
        {bookmarks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-60)' }}>
            <Bookmark size={24} strokeWidth={1} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p className="text-body-md">No bookmarks yet</p>
            <p className="text-caption text-muted" style={{ marginTop: 4 }}>
              Press Ctrl+B to bookmark a page
            </p>
          </div>
        )}
        {bookmarks.map(bm => (
          <div
            key={bm.id}
            className="bookmark-item"
            onClick={() => onGoToPage?.(bm.page_number)}
          >
            <div className="bookmark-page text-label-md">Page {bm.page_number}</div>
            <div className="bookmark-excerpt text-body-md text-muted">
              {bm.label ?? 'Bookmarked page'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
