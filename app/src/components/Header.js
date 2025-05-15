import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function Header({ title, menuOpen, setMenuOpen, isMobile }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  // Header background color
  const headerBackgroundColor = darkMode ? '#1f2937' : '#f3f4f6';
  // Header text color
  const headerTextColor = darkMode ? '#f9fafb' : '#1f2937';
  
  return (
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: headerBackgroundColor,
        borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* App Logo and Title */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <i className="fa-solid fa-seedling text-green-500" style={{ fontSize: '1.5rem', marginRight: '10px' }}></i>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          color: headerTextColor
        }}>
          Spiritual Condition Tracker
        </h1>
      </div>
      
      {/* Mobile Hamburger Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
        </button>
      )}
    </header>
  );
}

export default Header;