import React from 'react';
import './Sidebar.css';

export interface SidebarProps {
  isCollapsed: boolean;
  mode?: 'topics' | 'subtopics';
  items?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
  }>;
  onItemClick?: (item: any) => void;
  selectedItemId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  mode = 'default',
  items = [],
  onItemClick,
  selectedItemId
}) => {
  const getTopicIcon = (index: number) => {
    const icons = [
      <svg key="book" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>,
      <svg key="file" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>,
      <svg key="list" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ];
    return icons[index % icons.length];
  };

  const getSubtopicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );

  const currentItems = items;

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
    >
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {currentItems.map((item, index) => (
            <li key={item.id} className="nav-item">
              <button
                onClick={() => onItemClick?.(item)}
                className={`nav-link ${selectedItemId === item.id ? 'active' : ''} ${mode === 'topics' ? 'topic-item' : mode === 'subtopics' ? 'subtopic-item' : ''}`}
              >
                <span className="nav-icon">
                  {mode === 'topics' ? getTopicIcon(index) : mode === 'subtopics' ? getSubtopicIcon() : item.icon}
                </span>
                <span className="nav-label">{item.label}</span>
                {item.description && !isCollapsed && (
                  <span className="nav-description">{item.description}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;