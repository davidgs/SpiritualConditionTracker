import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import NavBar from './components/NavBar';
// Removed NearbyMembers import as we won't be using Bluetooth
import Profile from './components/Profile';
import History from './components/History';
import { ThemeProvider } from './contexts/ThemeContext';

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [spiritualFitness, setSpiritualFitness] = useState(0);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Calculate spiritual fitness score when activities change
  useEffect(() => {
    if (activities.length > 0) {
      calculateSpiritualFitness();
    }
  }, [activities]);

  // Load data from the database
  async function loadData() {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Get user data
    const userData = window.db.getAll('user');
    setUser(userData);

    // Get activities
    const activitiesData = window.db.getAll('activities');
    setActivities(activitiesData);

    // Get meetings
    const meetingsData = window.db.getAll('meetings');
    setMeetings(meetingsData);

    // Calculate spiritual fitness
    calculateSpiritualFitness();
  }

  // Calculate spiritual fitness score using the database function
  function calculateSpiritualFitness() {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }
    
    // Use the database function to calculate spiritual fitness
    const score = window.db.calculateSpiritualFitness();
    
    // Set the spiritual fitness score in state
    setSpiritualFitness(score);
  }

  // Handle saving a new activity
  function handleSaveActivity(newActivity) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Add activity to database
    const savedActivity = window.db.add('activities', newActivity);
    
    // Update activities state
    setActivities(prev => [...prev, savedActivity]);
    
    // Stay on activity screen to allow logging multiple activities
    // No longer redirecting to dashboard
  }

  // Handle saving a new meeting
  function handleSaveMeeting(newMeeting) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Add meeting to database
    const savedMeeting = window.db.add('meetings', newMeeting);
    
    // Update meetings state
    setMeetings(prev => [...prev, savedMeeting]);
    
    // Set view back to dashboard after saving
    setCurrentView('dashboard');
  }

  // Handle updating user profile
  function handleUpdateProfile(updates) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    // Update user in database
    const updatedUser = window.db.update('user', user.id, updates);
    
    // Update user state
    setUser(updatedUser);
    
    // Set view back to dashboard after updating
    setCurrentView('dashboard');
  }

  // Privacy settings function removed - was primarily used for Nearby features

  // Render current view based on navigation state
  function renderCurrentView() {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentView={setCurrentView}
            user={user}
            activities={activities}
            spiritualFitness={spiritualFitness}
          />
        );
      case 'activity':
        return (
          <ActivityLog 
            setCurrentView={setCurrentView}
            onSave={handleSaveActivity}
            activities={activities}
          />
        );
      case 'history':
        return (
          <History
            setCurrentView={setCurrentView}
            activities={activities}
          />
        );
      // Nearby feature removed as it requires Bluetooth which isn't available in web apps
      case 'profile':
        return (
          <Profile
            setCurrentView={setCurrentView}
            user={user}
            onUpdate={handleUpdateProfile}
          />
        );
      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Page Not Found</h2>
            <p>The requested page does not exist.</p>
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setCurrentView('dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  }

  return (
    <ThemeProvider>
      <div className="app-container h-full flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="flex-grow" style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
          {renderCurrentView()}
        </div>
        <NavBar currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </ThemeProvider>
  );
}

export default App;