import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import SpiritualFitness from './components/SpiritualFitness';
import History from './components/History';
import Profile from './components/Profile';
import NearbyMembers from './components/NearbyMembers';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in
  useEffect(() => {
    // In a real app, this would check session/token validity
    const loggedInUser = localStorage.getItem('user');
    
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      // For this MVP, we'll create a simple anonymous user
      const newUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        anonymous: true,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
    
    setIsLoading(false);
  }, []);
  
  const renderCurrentView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    }
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;
      case 'activity':
        return <ActivityLog setCurrentView={setCurrentView} />;
      case 'fitness':
        return <SpiritualFitness setCurrentView={setCurrentView} />;
      case 'history':
        return <History setCurrentView={setCurrentView} />;
      case 'profile':
        return <Profile user={user} setUser={setUser} setCurrentView={setCurrentView} />;
      case 'nearby':
        return <NearbyMembers userId={user?.id} setCurrentView={setCurrentView} />;
      default:
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="container-custom pt-4 pb-16">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;
