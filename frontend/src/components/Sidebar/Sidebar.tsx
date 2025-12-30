import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
  onDeleteItem?: (item: any) => void;
  onAddItem?: (mode: string) => void;
  showAddForm?: { mode: string; visible: boolean };
  addFormData?: { name: string; courseId: string; topicId: string };
  onAddFormChange?: (data: { name: string; courseId: string; topicId: string }) => void;
  onAddSubmit?: () => void;
  onCancelAdd?: () => void;
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
  onDeleteItem,
  onAddItem,
  showAddForm,
  addFormData,
  onAddFormChange,
  onAddSubmit,
  onCancelAdd,
  topicName,
  courseName,
  isLoading = false
}) => {
  const { isAdmin } = useAuth();
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
            {items.length === 0 && isAdmin && (
              <li className="nav-item">
                <div className="nav-empty-state">
                  <span className="nav-empty-text">
                    No {mode?.slice(0, -1)}s yet
                  </span>
                </div>
              </li>
            )}
            {items.map((item) => (
              <li
                key={item.id}
                className="nav-item"
              >
                <div className="nav-item-container">
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
                  {isAdmin && onDeleteItem && (
                    <button
                      className="nav-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item);
                      }}
                      title="Delete item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}

            {/* Add new item button for admin users */}
            {isAdmin && (
              <li className="nav-item">
                {!showAddForm?.visible || showAddForm?.mode !== mode ? (
                  <button
                    className="nav-add-btn"
                    onClick={() => onAddItem?.(mode)}
                    title={`Add new ${mode?.slice(0, -1)}`}
                  >
                    <div className="nav-content">
                      <div className="nav-add-content">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        <span className="nav-add-text">
                          Add {mode === 'courses' ? 'Course' : mode === 'topics' ? 'Topic' : 'Subtopic'}
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="nav-add-form">
                    <div className="nav-content">
                      <div className="add-form-content">
                        <input
                          type="text"
                          placeholder={`${mode === 'courses' ? 'Course' : mode === 'topics' ? 'Topic' : 'Subtopic'} name`}
                          value={addFormData?.name || ''}
                          onChange={(e) => onAddFormChange?.({
                            ...addFormData!,
                            name: e.target.value
                          })}
                          className="add-form-input"
                          autoFocus
                        />
                        <div className="add-form-buttons">
                          <button
                            className="add-form-submit"
                            onClick={onAddSubmit}
                            disabled={!addFormData?.name.trim()}
                          >
                            Add
                          </button>
                          <button
                            className="add-form-cancel"
                            onClick={onCancelAdd}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
