import { X, Upload } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function AddBookModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel glass-elevated" onClick={e => e.stopPropagation()} id="add-book-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-headline-sm">Add to Library</h2>
            <p className="text-body-md text-muted" style={{ marginTop: 4 }}>Your Collection</p>
          </div>
          <button className="btn-icon" onClick={onClose} id="modal-close-btn">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Drop Zone */}
        <div className="drop-zone" id="drop-zone">
          <div className="drop-zone-icon">
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <p className="text-body-lg" style={{ fontWeight: 500 }}>Drop your PDF here</p>
          <p className="text-body-md text-muted">or click to browse files</p>
          <button className="btn-primary" style={{ marginTop: 16 }}>Browse Files</button>
        </div>

        {/* Recent */}
        <div className="modal-recent">
          <p className="text-label-md text-muted" style={{ marginBottom: 12 }}>RECENTLY ADDED</p>
          {['Quantum Physics — L. S. Bernstein', 'The Architecture of Thought — Dr. Elena Rossi'].map((title, i) => (
            <div className="modal-recent-item" key={i}>
              <div className="modal-recent-cover" />
              <span className="text-body-md">{title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
