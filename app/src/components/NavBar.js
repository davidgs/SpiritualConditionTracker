import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function NavBar({ currentView, setCurrentView }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  // In dark mode, use a slightly lighter background than the main dark background
  // In light mode, use a slightly darker background than the main light background
  const navBackgroundColor = darkMode ? '#1f2937' : '#f3f4f6';
  
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-house' },
    { id: 'activity', name: 'Log Activity', icon: 'fa-solid fa-plus' },
    { id: 'history', name: 'History', icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'profile', name: 'Profile', icon: 'fa-solid fa-user' }
  ];
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: navBackgroundColor,
      borderTop: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      paddingBottom: '5px' // Add some bottom padding for devices with home indicators
    }}>
      {navItems.map((item) => (
        <button 
          key={item.id}
          onClick={() => setCurrentView(item.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 0',
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: currentView === item.id ? '#3b82f6' : (darkMode ? '#9ca3af' : '#6b7280'),
            cursor: 'pointer'
          }}
        >
          <i className={`${item.icon}`} style={{ fontSize: '1.25rem' }}></i>
          <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

export default NavBar;