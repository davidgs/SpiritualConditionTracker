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

  // Calculate spiritual fitness score
  function calculateSpiritualFitness() {
    if (!activities.length) return;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get activities from the last 30 days
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo;
    });

    // Calculate score based on different activity types
    const totalScore = recentActivities.reduce((score, activity) => {
      switch (activity.type) {
        case 'prayer':
        case 'meditation':
          // 2 points per 30 minutes
          return score + (activity.duration / 30) * 2;
        case 'literature':
          // 2 points per 30 minutes
          return score + (activity.duration / 30) * 2;
        case 'sponsor':
          // 3 points per 30 minutes
          return score + (activity.duration / 30) * 3;
        case 'sponsee':
          // 4 points per 30 minutes (max 20)
          const sponseePoints = (activity.duration / 30) * 4;
          return score + Math.min(sponseePoints, 20);
        case 'meeting':
          // 5 points per meeting (extra points for sharing/speaking)
          let meetingPoints = 5;
          if (activity.didShare) meetingPoints += 1;
          if (activity.wasChair) meetingPoints += 3;
          return score + meetingPoints;
        case 'call':
          // 1 point per call (no limit)
          return score + 1;
        default:
          return score;
      }
    }, 0);

    // Calculate variety bonus (count unique activity types)
    const activityTypes = new Set(recentActivities.map(activity => activity.type));
    const varietyBonus = activityTypes.size >= 3 ? activityTypes.size * 2 : 0;
    
    // Calculate final score (cap at 100)
    const finalScore = Math.min(totalScore + varietyBonus, 100);
    
    // Round to 2 decimal places
    const fitness = parseFloat(finalScore.toFixed(2));
    setSpiritualFitness(fitness);
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
    
    // Set view back to dashboard after saving
    setCurrentView('dashboard');
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
        <div className="flex-grow overflow-auto">
          {renderCurrentView()}
        </div>
        <NavBar currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </ThemeProvider>
  );
}

export default App;