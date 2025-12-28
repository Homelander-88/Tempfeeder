import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import './ContentView.css';

interface ContentViewProps {
  onNavigateToLogin: () => void;
  onNavigateToHeirarchy: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({ onNavigateToLogin, onNavigateToHeirarchy }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigate = (path: string) => {
    switch (path) {
      case '/login':
        onNavigateToLogin();
        break;
      case '/heirarchy':
        onNavigateToHeirarchy();
        break;
      default:
        break;
    }
  };

  return (
    <div className="content-view">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} />
      <Sidebar isCollapsed={sidebarCollapsed} />

      <div className={`content-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-header">
          <h1>Welcome to Spoonfeeder</h1>
          <p>Structured learning, Zero Distraction</p>
        </div>

        <div className="content-body">
          <div className="content-card">
            <h2>Content View Page</h2>
            <p>This is where your main application content would go after login.</p>
            <div className="content-actions">
              <button onClick={onNavigateToHeirarchy}>Go to Hierarchy</button>
              <button onClick={onNavigateToLogin}>Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentView;
