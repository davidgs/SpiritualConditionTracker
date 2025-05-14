import React from 'react';

function NavBar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-house' },
    { id: 'activity', name: 'Log Activity', icon: 'fa-solid fa-plus' },
    { id: 'history', name: 'History', icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'nearby', name: 'Nearby', icon: 'fa-solid fa-users' },
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
      backgroundColor: 'transparent'
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
            color: currentView === item.id ? '#3b82f6' : '#6b7280',
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