import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import { useAuth } from '../../context/AuthContext';
import SettingsDropdown from '../SettingsDropdown/SettingsDropdown';

interface HeaderProps {
  onMenuToggle?: () => void;
  onLogout?: () => void;
  username?: string;
  email?: string;
  onNavigate?: (path: string) => void;
  onModeChange?: (mode: "deep" | "normal" | "rush") => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onLogout,
  username: usernameProp,
  email: emailProp,
  onModeChange
}) => {
  const { user, logout: authLogout } = useAuth();
  
  // Use actual user data from AuthContext, fallback to props if provided
  const email = user?.email || emailProp || "user@example.com";
  const username = usernameProp || (email ? email.split('@')[0] : "User");
  
  const handleLogout = () => {
    setShowProfileDropdown(false);
    authLogout();
    if (onLogout) onLogout();
  };
  // Profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showShortcutTooltip, setShowShortcutTooltip] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const tooltipTimerRef = useRef<number | null>(null);


  // Mode dropdown
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"deep" | "normal" | "rush">("normal");

  const modeLabel = {
    deep: "Deep Focus",
    normal: "Normal",
    rush: "Quick Review"
  };

  const handleModeSelect = (mode: "deep" | "normal" | "rush") => {
    setCurrentMode(mode);
    if (onModeChange) onModeChange(mode);
    setModeDropdownOpen(false);
  };




  // Handle menu toggle tooltip
  const handleMenuToggleHover = () => {
    tooltipTimerRef.current = setTimeout(() => {
      setShowShortcutTooltip(true);
    }, 1000); // Show after 1 second
  };

  const handleMenuToggleLeave = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    setShowShortcutTooltip(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="menu-toggle-container">
          <button
            className="menu-toggle-btn"
            onClick={onMenuToggle}
            onMouseEnter={handleMenuToggleHover}
            onMouseLeave={handleMenuToggleLeave}
            aria-label="Toggle sidebar (Ctrl+Z)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {showShortcutTooltip && (
            <div className="shortcut-tooltip">
              <span>Ctrl+Z</span>
            </div>
          )}
        </div>
        <div className="header-logo">
          <h1>SpoonFeeder</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Mode Dropdown */}
        <div className="mode-dropdown">
          <button
            className="mode-btn"
            onClick={() => {
              setModeDropdownOpen(!modeDropdownOpen);
              if (!modeDropdownOpen) {
                setShowProfileDropdown(false);
              }
            }}
          >
            {modeLabel[currentMode]}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mode-arrow"
              style={{
                transform: modeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {modeDropdownOpen && (
            <div className="mode-dropdown-menu">
              <div onClick={() => handleModeSelect("deep")}>
                Deep Focus
              </div>
              <div onClick={() => handleModeSelect("normal")}>
                Normal
              </div>
              <div onClick={() => handleModeSelect("rush")}>
                Quick Review
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="user-profile" ref={profileDropdownRef}>
          <button
            className="avatar"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              if (!showProfileDropdown) {
                setModeDropdownOpen(false);
              }
            }}
            aria-label="User menu"
          >
            <span>{(username || email).charAt(0).toUpperCase()}</span>
          </button>

          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-username">{username}</div>
                <div className="profile-email">{email}</div>
              </div>
              <div className="profile-divider"></div>
              {/* Settings Button + Dropdown */}
              <div className="settings-container">
                <button
                  className="settings-btn"
                  onClick={() => setSettingsOpen(prev => !prev)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>

                {/* SettingsDropdown panel */}
                {settingsOpen && (
                  <SettingsDropdown />
                )}
              </div>
              <div className="profile-divider"></div>
              <button className="logout-btn" onClick={handleLogout}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
