import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sun, Bookmark, RotateCcw } from 'lucide-react';
import { InsightsPanel, BookmarksPanel } from '../panels/SidePanels';

const DEMO_TEXT = `Chapter 3: How to Build Better Habits in 4 Simple Steps

The process of building a habit can be divided into four simple steps: cue, craving, response, and reward. Breaking it down into these fundamental parts can help us understand what a habit is, how it works, and how to improve it.

All habits proceed through four stages in the same order: cue, craving, response, and reward.

This four-step pattern is the backbone of every habit, and your brain runs through these steps in the same order each time. First, there is the cue. The cue triggers your brain to initiate a behavior. It is a bit of information that predicts a reward.

Your mind is continuously analyzing your internal and external environment for hints of where rewards are located.

Consider the following hypothesis: that consciousness is not an emergent property of biological matter, but rather the primary substrate of reality itself, through which matter is filtered and observed. This ontological shift demands a rigorous re-examination of how we quantify subjective states.

Modern analytical frameworks often fail to account for the "internal horizon" of the observer. When we study the brain, we are looking at the mechanism of the projector, rather than the film being shown. This distinction is crucial for any reader of post-phenomenological texts.`;

interface Props {
  bookTitle?: string;
  rightPanel?: 'insights' | 'bookmarks' | null;
  onTogglePanel?: (panel: 'insights' | 'bookmarks') => void;
}

export default function PDFReader({ bookTitle = 'Atomic Habits', rightPanel = 'insights', onTogglePanel }: Props) {
  return (
    <div className="reader-shell">
      {/* Top Bar */}
      <div className="reader-topbar glass">
        <div className="reader-topbar-left">
          <span className="text-body-md text-muted">MindLeaf</span>
          <span className="text-body-md text-muted" style={{ opacity: 0.4 }}>·</span>
          <span className="text-body-md">{bookTitle}</span>
        </div>
        <div className="reader-topbar-center">
          <button className="btn-icon" id="prev-page-btn"><ChevronLeft size={18} strokeWidth={1.5} /></button>
          <div className="page-indicator glass">
            <span className="text-body-md">Page 47</span>
            <span className="text-muted text-body-md">/ 320</span>
          </div>
          <button className="btn-icon" id="next-page-btn"><ChevronRight size={18} strokeWidth={1.5} /></button>
        </div>
        <div className="reader-topbar-right">
          <button className="btn-icon" id="zoom-out-btn"><ZoomOut size={16} strokeWidth={1.5} /></button>
          <span className="text-caption text-muted" style={{ minWidth: 36, textAlign: 'center' }}>100%</span>
          <button className="btn-icon" id="zoom-in-btn"><ZoomIn size={16} strokeWidth={1.5} /></button>
          <div className="topbar-divider" />
          <button className="btn-icon" title="Reset zoom"><RotateCcw size={16} strokeWidth={1.5} /></button>
          <button className="btn-icon" title="Theme"><Sun size={16} strokeWidth={1.5} /></button>
          <button
            className={`btn-icon ${rightPanel === 'bookmarks' ? 'active' : ''}`}
            title="Bookmarks"
            id="bookmarks-panel-btn"
            onClick={() => onTogglePanel?.('bookmarks')}
          >
            <Bookmark size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="reader-content">
        {/* PDF Viewport */}
        <div className="pdf-viewport">
          <div className="pdf-page glass">
            <div className="pdf-content">
              {DEMO_TEXT.split('\n\n').map((para, i) => (
                para.startsWith('Chapter') ? (
                  <h2 key={i} className="pdf-chapter-title">{para}</h2>
                ) : (
                  <p key={i} className="pdf-paragraph">{para}</p>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {rightPanel && (
          rightPanel === 'insights'
            ? <InsightsPanel />
            : <BookmarksPanel bookTitle={bookTitle} />
        )}
      </div>
    </div>
  );
}
