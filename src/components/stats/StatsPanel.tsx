import { Flame, BookOpen, Clock, TrendingUp } from 'lucide-react';

const DAYS = ['M','T','W','T','F','S','S'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Generate heatmap data
const heatmapData = Array.from({ length: 52 * 7 }, () =>
  Math.random() > 0.55 ? Math.floor(Math.random() * 4) + 1 : 0
);

const recentBooks = [
  { title: 'Meditations', author: 'Marcus Aurelius', progress: 100, status: 'Completed' },
  { title: 'Deep Work', author: 'Cal Newport', progress: 85, status: '85% Read' },
  { title: 'The Antidote', author: 'Oliver Burkeman', progress: 100, status: 'Completed' },
  { title: 'Stolen Focus', author: 'Johann Hari', progress: 42, status: '42% Read' },
  { title: 'Mindset', author: 'Carol Dweck', progress: 100, status: 'Completed' },
  { title: 'Homo Deus', author: 'Yuval Noah Harari', progress: 15, status: '15% Read' },
];

const heatColor = (v: number) => {
  if (v === 0) return 'var(--surface-high)';
  if (v === 1) return 'rgba(99,102,241,0.25)';
  if (v === 2) return 'rgba(99,102,241,0.5)';
  if (v === 3) return 'rgba(99,102,241,0.75)';
  return 'var(--accent)';
};

export default function StatsPanel() {
  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h1 className="text-headline-lg">Reading Stats</h1>
        <p className="text-body-md text-muted" style={{ marginTop: 4 }}>Your intellectual journey this quarter</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-cards">
        {[
          { Icon: Flame,     label: 'Current Streak', value: '12', unit: 'days',  color: '#ffb783' },
          { Icon: BookOpen,  label: 'Pages Read',     value: '1,284', unit: 'pages', color: 'var(--secondary)' },
          { Icon: Clock,     label: 'Time Spent',     value: '48h 20m', unit: 'total', color: 'var(--primary)' },
          { Icon: TrendingUp,label: 'Books This Year', value: '9', unit: 'books', color: 'var(--accent)' },
        ].map(({ Icon, label, value, unit, color }) => (
          <div key={label} className="stat-card glass">
            <div className="stat-card-icon" style={{ color }}>
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label text-muted">{label}</div>
            <div className="stat-card-unit text-muted">{unit}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="heatmap-section glass">
        <h2 className="text-headline-sm" style={{ marginBottom: 20 }}>Activity Heatmap</h2>
        <div className="heatmap-months">
          {MONTHS.map(m => <span key={m} className="heatmap-month">{m}</span>)}
        </div>
        <div className="heatmap-grid-wrap">
          <div className="heatmap-days">
            {DAYS.map((d, i) => <span key={i} className="heatmap-day">{d}</span>)}
          </div>
          <div className="heatmap-grid">
            {heatmapData.map((v, i) => (
              <div key={i} className="heatmap-cell" style={{ background: heatColor(v) }} title={`Activity: ${v}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Recently Finished */}
      <div className="recent-section glass">
        <h2 className="text-headline-sm" style={{ marginBottom: 16 }}>Recently Finished</h2>
        {recentBooks.map((b, i) => (
          <div key={i} className="recent-book-item">
            <div className="recent-book-cover" />
            <div className="recent-book-info">
              <div className="text-body-md" style={{ fontWeight: 500 }}>{b.title}</div>
              <div className="text-caption text-muted">{b.author}</div>
            </div>
            <div className="recent-book-status">
              <div className="recent-progress-bar">
                <div className="recent-progress-fill" style={{ width: `${b.progress}%` }} />
              </div>
              <span className="text-caption text-muted">{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
