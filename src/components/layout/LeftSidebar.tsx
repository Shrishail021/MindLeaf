import { Library, BookOpen, Lightbulb, BarChart2, Bookmark, Settings, HelpCircle, Leaf } from 'lucide-react';

export type NavView = 'bookshelf' | 'reader' | 'insights' | 'stats' | 'bookmarks' | 'settings';

interface Props {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
}

const navItems: { id: NavView; label: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'bookshelf', label: 'Bookshelf', Icon: Library },
  { id: 'reader',    label: 'Reader',    Icon: BookOpen },
  { id: 'insights',  label: 'Insights',  Icon: Lightbulb },
  { id: 'stats',     label: 'Statistics', Icon: BarChart2 },
  { id: 'bookmarks', label: 'Bookmarks', Icon: Bookmark },
];

const bottomItems: { id: NavView; label: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function LeftSidebar({ activeView, onNavigate }: Props) {
  return (
    <aside className="sidebar glass">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={20} strokeWidth={1.5} />
        </div>
        <div>
          <div className="sidebar-logo-name">MindLeaf</div>
          <div className="sidebar-logo-tagline">Digital Sanctuary</div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sidebar-nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="sidebar-bottom">
        {bottomItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sidebar-nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </button>
        ))}
        <button className="sidebar-nav-item">
          <HelpCircle size={20} strokeWidth={1.5} />
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}
