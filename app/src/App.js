import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import NavBar from './components/NavBar';
// Removed NearbyMembers import as we won't be using Bluetooth
import Profile from './components/Profile';
import History from './components/History';
import Meetings from './components/Meetings';
import Messages from './components/Messages';
import { ThemeProvider } from './contexts/ThemeContext';
import { generateKeyPair } from './utils/encryption';

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
    
    // Initialize messaging keys if they don't exist
    if (userData && (!userData.messagingKeys || !userData.messagingKeys.publicKey)) {
      try {
        console.log('Generating messaging keys for secure communications...');
        // Generate key pair for secure messaging
        const keyPair = await generateKeyPair();
        
        // Create fingerprint (simple hash of public key for identification)
        const fingerprint = await getKeyFingerprint(keyPair.publicKey);
        
        // Update user with new keys
        const updatedUser = window.db.update('user', userData.id, {
          messagingKeys: {
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            fingerprint
          }
        });
        
        setUser(updatedUser);
      } catch (err) {
        console.error('Failed to generate messaging keys:', err);
        setUser(userData);
      }
    } else {
      setUser(userData);
    }

    // Get activities
    const activitiesData = window.db.getAll('activities');
    setActivities(activitiesData);

    // Get meetings
    const meetingsData = window.db.getAll('meetings');
    setMeetings(meetingsData);

    // Calculate spiritual fitness
    calculateSpiritualFitness();
  }
  
  // Generate a simple fingerprint from the public key
  async function getKeyFingerprint(publicKey) {
    try {
      // Create a hash of the public key
      const msgBuffer = new TextEncoder().encode(publicKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      
      // Take the first 8 bytes and format as hex with colons
      return hashArray
        .slice(0, 8)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(':');
    } catch (err) {
      console.error('Error generating key fingerprint:', err);
      return 'unknown-fingerprint';
    }
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

    // Check if this is an update or new meeting
    let savedMeeting;
    
    // If the meeting has an ID and exists in our meetings array, update it
    if (newMeeting.id && meetings.some(m => m.id === newMeeting.id)) {
      // This is an update to an existing meeting
      savedMeeting = window.db.update('meetings', newMeeting.id, newMeeting);
      
      // Update the meetings state
      setMeetings(prev => prev.map(m => m.id === savedMeeting.id ? savedMeeting : m));
    } else {
      // This is a new meeting
      savedMeeting = window.db.add('meetings', newMeeting);
      
      // Update meetings state
      setMeetings(prev => [...prev, savedMeeting]);
    }
    
    console.log("Meeting saved:", savedMeeting);
    
    // Return the saved meeting for the callback chain
    return savedMeeting;
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
            onSaveMeeting={handleSaveMeeting}
            activities={activities}
            meetings={meetings}
          />
        );
      case 'meetings':
        return (
          <Meetings
            setCurrentView={setCurrentView}
            meetings={meetings}
            onSave={handleSaveMeeting}
          />
        );
      case 'history':
        return (
          <History
            setCurrentView={setCurrentView}
            activities={activities}
          />
        );
      case 'messages':
        return (
          <Messages
            setCurrentView={setCurrentView}
            user={user}
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