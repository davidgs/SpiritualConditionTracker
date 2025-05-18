import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import SafeAreaHeader from './SafeAreaHeader';

function Header({ title, menuOpen, setMenuOpen, isMobile }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  // Header background color
  const headerBackgroundColor = darkMode ? '#1f2937' : '#f3f4f6';
  // Header text color
  const headerTextColor = darkMode ? '#f9fafb' : '#1f2937';
  
  return (
    <SafeAreaHeader
      sx={{
        position: 'relative', // Not sticky anymore
        zIndex: 20,
        backgroundColor: headerBackgroundColor,
        borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        padding: isMobile ? '0.5rem' : '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? 'space-between' : 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        flexDirection: isMobile ? 'row' : 'column'
      }}
    >
      {/* Logo - Left aligned on mobile, centered on desktop */}
      {isMobile ? (
        // Mobile layout: Logo on left, text in center, hamburger on right
        <>
          <div style={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            <img 
              src="./logo.jpg"
              alt="App Logo" 
              style={{ 
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </div>
          
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
          }}>
            <h1 style={{ 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              color: darkMode ? '#f3f4f6' : '#1f2937',
              margin: 0,
              lineHeight: '1.1'
            }}>
              Spiritual Condition Tracker
            </h1>
          </div>
        </>
      ) : (
        // Desktop layout: Logo and text centered vertically
        <div style={{ 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img 
            src="./logo.jpg"
            alt="App Logo" 
            style={{ 
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              borderRadius: '12px',
              marginBottom: '0.5rem'
            }}
          />
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: darkMode ? '#f3f4f6' : '#1f2937',
            marginBottom: '0.25rem',
            lineHeight: '1.1'
          }}>
            Spiritual Condition Tracker
          </h1>
          <p style={{ 
            fontSize: '0.75rem', 
            color: darkMode ? '#9ca3af' : '#6b7280',
            lineHeight: '1.1',
            margin: 0
          }}>
            Track your spiritual journey
          </p>
        </div>
      )}
      
      {/* Mobile Hamburger Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: '1px',
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: '1.75rem',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      )}
    </SafeAreaHeader>
  );
}

export default Header;