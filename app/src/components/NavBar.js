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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center py-3 flex-1 ${
              currentView === item.id 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;