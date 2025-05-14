import React from 'react';

export default function NavBar({ currentView, setCurrentView }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around p-2">
        <NavButton 
          icon="fa-home" 
          label="Home" 
          isActive={currentView === 'dashboard'} 
          onClick={() => setCurrentView('dashboard')}
        />
        
        <NavButton 
          icon="fa-plus-circle" 
          label="Add" 
          isActive={currentView === 'activity'} 
          onClick={() => setCurrentView('activity')}
        />
        
        <NavButton 
          icon="fa-history" 
          label="History" 
          isActive={currentView === 'history'} 
          onClick={() => setCurrentView('history')}
        />
        
        <NavButton 
          icon="fa-users" 
          label="Nearby" 
          isActive={currentView === 'nearby'} 
          onClick={() => setCurrentView('nearby')}
        />
        
        <NavButton 
          icon="fa-user" 
          label="Profile" 
          isActive={currentView === 'profile'} 
          onClick={() => setCurrentView('profile')}
        />
      </div>
    </nav>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button 
      className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
        isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <i className={`fas ${icon} ${isActive ? 'text-xl mb-1' : 'text-lg mb-1'}`}></i>
      <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
      {isActive && <div className="h-1 w-4 bg-blue-500 rounded-full mt-1"></div>}
    </button>
  );
}