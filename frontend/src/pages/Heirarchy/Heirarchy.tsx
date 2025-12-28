import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Heirarchy.css';

interface HeirarchyProps {
  onNavigateToLogin: () => void;
  onNavigateToContent: () => void;
}

const Heirarchy: React.FC<HeirarchyProps> = ({ onNavigateToLogin, onNavigateToContent }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigate = (path: string) => {
    switch (path) {
      case '/login':
        onNavigateToLogin();
        break;
      case '/content':
        onNavigateToContent();
        break;
      default:
        break;
    }
  };

  return (
    <div className="heirarchy-view">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />
      <Sidebar isCollapsed={sidebarCollapsed} />

      <div className={`heirarchy-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="heirarchy-header">
          <h1>Learning Hierarchy</h1>
          <p>Organized learning structure</p>
        </div>

        <div className="heirarchy-body">
          <div className="heirarchy-card">
            <h2>Hierarchy View Page</h2>
            <p>This is where your learning hierarchy/content structure would be displayed.</p>
            <div className="heirarchy-actions">
              <button onClick={onNavigateToContent}>Go to Content</button>
              <button onClick={onNavigateToLogin}>Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heirarchy;
