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
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      {/* App Logo and Title */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          color: darkMode ? '#f3f4f6' : '#1f2937',
          margin: 0
        }}>
          {title || 'Spiritual Condition Tracker'}
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