import React from 'react';

export default function NavBar({ currentView, setCurrentView }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around p-3">
        <button 
          className={`flex flex-col items-center ${currentView === 'dashboard' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${currentView === 'activity' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setCurrentView('activity')}
        >
          <i className="fas fa-plus-circle text-xl"></i>
          <span className="text-xs mt-1">Add</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${currentView === 'history' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setCurrentView('history')}
        >
          <i className="fas fa-history text-xl"></i>
          <span className="text-xs mt-1">History</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${currentView === 'nearby' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setCurrentView('nearby')}
        >
          <i className="fas fa-users text-xl"></i>
          <span className="text-xs mt-1">Nearby</span>
        </button>
        
        <button 
          className={`flex flex-col items-center ${currentView === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setCurrentView('profile')}
        >
          <i className="fas fa-user text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
}