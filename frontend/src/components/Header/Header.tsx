import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  onMenuToggle?: () => void;
  onLogout?: () => void;
  username?: string;
  email?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  onLogout,
  username = "User",
  email = "user@example.com"
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showModesDropdown, setShowModesDropdown] = useState(false);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(() => {
    return localStorage.getItem('selectedSemester') || '1st Semester';
  });
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const modesDropdownRef = useRef<HTMLDivElement>(null);
  const semesterDropdownRef = useRef<HTMLDivElement>(null);

  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester',
  ];

  const handleSemesterChange = (semester: string) => {
    setCurrentSemester(semester);
    localStorage.setItem('selectedSemester', semester);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
        setShowSemesterDropdown(false);
      }

      if (
        modesDropdownRef.current &&
        !modesDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModesDropdown(false);
      }
    };

    if (showProfileDropdown || showModesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showModesDropdown]);

  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
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
        <div className="modes" ref={modesDropdownRef}>
          <button 
            className="modes-btn"
            onClick={() => setShowModesDropdown(!showModesDropdown)}
            aria-label="Modes menu"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m8.66-13L16.5 9M7.5 15l-4.16 2.4M20.66 17l-4.16-2.4M7.5 9L3.34 6.6" />
            </svg>
            <span>Modes</span>
          </button>

          {showModesDropdown && (
            <div className="modes-dropdown">
              <div className="modes-option">
                <div className="modes-title">Default mode</div>
                <div className="modes-desc">For daily study</div>
              </div>
              <div className="modes-option">
                <div className="modes-title">Deep mode</div>
                <div className="modes-desc">For strong mastery</div>
              </div>
              <div className="modes-option">
                <div className="modes-title">Rush mode</div>
                <div className="modes-desc">For quick revision</div>
              </div>
            </div>
          )}
        </div>

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
                        onClick={() => {
                          handleSemesterChange(sem);
                          setShowSemesterDropdown(false);
                        }}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
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
                >
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