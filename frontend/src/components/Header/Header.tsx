import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  onMenuToggle?: () => void;
  onNavigate?: (path: string) => void;
  onModeChange?: (mode: "deep" | "normal" | "rush") => void; // new prop
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onNavigate, onModeChange }) => {
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"deep" | "normal" | "rush">("normal"); // initial mode

  const handleRegisterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onNavigate) onNavigate('/register');
    else window.location.href = '/register';
  };

  const handleModeSelect = (mode: "deep" | "normal" | "rush") => {
    setCurrentMode(mode);
    if (onModeChange) onModeChange(mode);
    setModeDropdownOpen(false);
  };

  const modeLabel = {
    deep: "🟢 Deep",
    normal: "🟡 Normal",
    rush: "🔴 Rush"
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="header-logo">
          <h1>SpoonFeeder</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Mode Dropdown */}
        <div className="mode-dropdown">
          <button
            className="mode-btn"
            onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
          >
            {modeLabel[currentMode]} ▼
          </button>
          {modeDropdownOpen && (
            <div className="mode-dropdown-menu">
              <div onClick={() => handleModeSelect("deep")}>
                <span className="mode-dot deep"></span> Deep
              </div>
              <div onClick={() => handleModeSelect("normal")}>
                <span className="mode-dot normal"></span> Normal
              </div>
              <div onClick={() => handleModeSelect("rush")}>
                <span className="mode-dot rush"></span> Rush
              </div>
            </div>
          )}
        </div>

        <a href="/register" className="register-link" onClick={handleRegisterClick}>
          Register
        </a>

        <div className="user-profile">
          <div className="avatar"><span>U</span></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
 