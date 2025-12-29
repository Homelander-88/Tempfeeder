import React from 'react';
import './Sidebar.css';

export interface SidebarProps {
  isCollapsed: boolean;
  mode?: 'courses' | 'topics' | 'subtopics';
  items?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
  }>;
  onItemClick?: (item: any) => void;
  selectedItemId?: string;
  onBackClick?: () => void;
  topicName?: string;
  courseName?: string;
  isLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  mode = 'default',
  items = [],
  onItemClick,
  selectedItemId,
  onBackClick,
  topicName,
  courseName,
  isLoading = false
}) => {
  const [sidebarWidth, setSidebarWidth] = React.useState(280);
  const [isResizing, setIsResizing] = React.useState(false);
  const sidebarRef = React.useRef<HTMLElement>(null);

  // Icon for collapsed state based on mode
  const getModeIcon = () => {
    if (mode === 'courses') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      );
    } else if (mode === 'topics') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    } else if (mode === 'subtopics') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    }
    return null;
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.min(Math.max(200, e.clientX), 500);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  React.useEffect(() => {
    const contentMain = document.querySelector('.content-main');
    if (!contentMain) return;

    if (isCollapsed) {
      // When collapsed, use fixed 64px sidebar width
      if (sidebarRef.current) {
        sidebarRef.current.style.width = '64px';
      }
      (contentMain as HTMLElement).style.marginLeft = '104px'; // 64px + 40px gap
      (contentMain as HTMLElement).style.width = 'calc(100vw - 104px)';
    } else {
      // When expanded, use dynamic sidebar width
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${sidebarWidth}px`;
      }
      (contentMain as HTMLElement).style.marginLeft = `${sidebarWidth + 40}px`;
      (contentMain as HTMLElement).style.width = `calc(100vw - ${sidebarWidth + 40}px)`;
    }
  }, [sidebarWidth, isCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={!isCollapsed ? { width: `${sidebarWidth}px` } : undefined}
    >
      {!isCollapsed && (
        <div
          className={`sidebar-resize-handle ${isResizing ? 'resizing' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
      )}
      {!isCollapsed && (mode === 'topics' || mode === 'subtopics') && (
        <div className="sidebar-header">
          <button
            className="sidebar-back-icon"
            onClick={onBackClick}
            title={mode === 'topics' ? 'Back to Courses' : 'Back to Topics'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="sidebar-header-title">
            {mode === 'topics' ? courseName : topicName}
          </div>
        </div>
      )}
      <nav className="sidebar-nav">
        {isLoading ? (
          <div className="sidebar-loading">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading...</span>
          </div>
        ) : isCollapsed ? (
          <div className="sidebar-collapsed-icon">
            {getModeIcon()}
          </div>
        ) : (
          <ul className="nav-list">
            {items.map((item) => (
              <li 
                key={item.id} 
                className="nav-item"
              >
                <button
                  onClick={() => onItemClick?.(item)}
                  className={`nav-link ${selectedItemId === item.id ? 'active' : ''}`}
                >
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    {item.description && !isCollapsed && (
                      <span className="nav-description">{item.description}</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
