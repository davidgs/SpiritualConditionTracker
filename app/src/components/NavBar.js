import React from 'react';

export default function NavBar({ currentView, setCurrentView }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex justify-around">
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
      className={`flex flex-col items-center py-2 px-4 ${
        isActive 
          ? 'text-blue-500 border-t-2 border-blue-500 -mt-px' 
          : 'text-gray-500'
      }`}
      onClick={onClick}
    >
      <i className={`fas ${icon} text-lg mb-1`}></i>
      <span className="text-xs">{label}</span>
    </button>
  );
}