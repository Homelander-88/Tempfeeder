import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

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
  username = "User",
  email = "user@example.com",
  onModeChange
}) => {
  // Profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(() => localStorage.getItem('selectedSemester') || '1st Semester');
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const semesterDropdownRef = useRef<HTMLDivElement>(null);

  const semesters = [
    '1st Semester','2nd Semester','3rd Semester','4th Semester',
    '5th Semester','6th Semester','7th Semester','8th Semester'
  ];

  const handleSemesterChange = (semester: string) => {
    setCurrentSemester(semester);
    localStorage.setItem('selectedSemester', semester);
  };

  // Mode dropdown
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"deep" | "normal" | "rush">("normal");

  const modeLabel = {
    deep: "🟢 Deep",
    normal: "🟡 Normal",
    rush: "🔴 Rush"
  };

  const handleModeSelect = (mode: "deep" | "normal" | "rush") => {
    setCurrentMode(mode);
    if (onModeChange) onModeChange(mode);
    setModeDropdownOpen(false);
  };



  // Logout
  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (onLogout) onLogout();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
        setShowSemesterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* User Profile Dropdown */}
        <div className="user-profile" ref={profileDropdownRef}>
          <button 
            className="avatar"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            aria-label="User menu"
          >
            <span>{username.charAt(0).toUpperCase()}</span>
          </button>

          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-username">{username}</div>
                <div className="profile-email">{email}</div>
              </div>
              <div className="profile-divider"></div>
              <div className="semester-section" ref={semesterDropdownRef}>
                <button 
                  className="semester-btn"
                  onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
                >
                  <span>{currentSemester}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{
                      transform: showSemesterDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {showSemesterDropdown && (
                  <div className="semester-dropdown">
                    {semesters.map((sem) => (
                      <button
                        key={sem}
                        className={`semester-option ${currentSemester === sem ? 'active' : ''}`}
                        onClick={() => { handleSemesterChange(sem); setShowSemesterDropdown(false); }}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="profile-divider"></div>
              <button className="logout-btn" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
