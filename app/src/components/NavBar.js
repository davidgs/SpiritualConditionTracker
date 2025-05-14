// Navigation component for the Spiritual Condition Tracker
import React from 'react';

export default function NavBar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-house' },
    { id: 'activity', name: 'Log Activity', icon: 'fa-solid fa-plus' },
    { id: 'fitness', name: 'Spiritual Fitness', icon: 'fa-solid fa-heart' },
    { id: 'history', name: 'History', icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'nearby', name: 'Nearby', icon: 'fa-solid fa-users' },
    { id: 'profile', name: 'Profile', icon: 'fa-solid fa-user' }
  ];
  
  return (
    <header className="navbar">
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-blue-600">Recovery Tracker</h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button 
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentView === item.id 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Mobile Navigation - Fixed at Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-3 flex-1 ${
                currentView === item.id 
                  ? 'text-blue-600' 
                  : 'text-gray-500'
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};
