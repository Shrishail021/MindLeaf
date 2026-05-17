import { Bookmark, ArrowRight } from 'lucide-react';
import { Lightbulb } from 'lucide-react';

// ─── Insights Panel ───────────────────────────────────────────
const HIGHLIGHTS = [
  { text: 'The happiness of your life depends upon the quality of your thoughts: therefore, guard accordingly.', note: 'A reminder to practice negative visualization when feeling overwhelmed by external expectations.', color: '#fde68a', book: 'Meditations' },
  { text: 'Who you are, what you think, feel, and do, what you love—is the sum of what you focus on.', note: null, color: '#86efac', book: 'Deep Work' },
  { text: 'The brain is a dynamic system, constantly reconfiguring its own circuitry to match the demands of the environment.', note: 'Connect this with neuroplasticity section in the upcoming essay on habit formation.', color: '#93c5fd', book: 'Atomic Habits' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', note: null, color: '#f9a8d4', book: 'Atomic Habits' },
];

export function InsightsPanel() {
  return (
    <div className="panel glass">
      <div className="panel-header">
        <div className="panel-header-icon"><Lightbulb size={16} strokeWidth={1.5} /></div>
        <div>
          <div className="text-headline-sm">My Insights</div>
          <div className="text-caption text-muted">147 highlights across 12 books</div>
        </div>
      </div>

      <div className="panel-items">
        {HIGHLIGHTS.map((h, i) => (
          <div key={i} className="highlight-item" style={{ borderLeftColor: h.color }}>
            <div className="highlight-text text-body-md">"{h.text}"</div>
            {h.note && (
              <div className="highlight-note">
                <div className="highlight-note-label text-label-md text-muted">MY NOTE</div>
                <div className="highlight-note-text text-body-md text-muted">{h.note}</div>
              </div>
            )}
            <div className="highlight-book text-caption text-muted">
              <ArrowRight size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
              {h.book}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bookmarks Panel ─────────────────────────────────────────
const BOOKMARKS = [
  { page: 47,  excerpt: 'Key insight on identity-based habits and why they outlast motivation-based habits.' },
  { page: 112, excerpt: 'The Plateau of Latent Potential diagram.' },
  { page: 158, excerpt: 'Notes on environment design strategy.' },
  { page: 203, excerpt: 'Goldilocks Rule for motivation.' },
];

export function BookmarksPanel({ bookTitle = 'Atomic Habits' }: { bookTitle?: string }) {
  return (
    <div className="panel glass">
      <div className="panel-header">
        <div className="panel-header-icon"><Bookmark size={16} strokeWidth={1.5} /></div>
        <div>
          <div className="text-headline-sm">Bookmarks</div>
          <div className="text-caption text-muted">{bookTitle}</div>
        </div>
      </div>

      <div className="panel-items">
        {BOOKMARKS.map((bm, i) => (
          <div key={i} className="bookmark-item">
            <div className="bookmark-page text-label-md">Page {bm.page}</div>
            <div className="bookmark-excerpt text-body-md text-muted">{bm.excerpt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
