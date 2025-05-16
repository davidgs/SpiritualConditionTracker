import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
// Removed NearbyMembers import as we won't be using Bluetooth
import Profile from './components/Profile';
import Meetings from './components/Meetings';
import Messages from './components/Messages';
import StepWork from './components/StepWork';
import SponsorSponsee from './components/SponsorSponsee';
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
    // Initialize database first, then load data
    initDatabaseAndLoadData();
  }, []);

  // Calculate spiritual fitness score when activities change
  useEffect(() => {
    if (activities.length > 0) {
      calculateSpiritualFitness();
    }
  }, [activities]);
  
  // Initialize the database and load data
  async function initDatabaseAndLoadData() {
    try {
      // Import the database operations
      const { initDatabase, setupGlobalDbObject } = await import('./utils/sqliteDatabase');
      const { hasLocalStorageData, migrateFromLocalStorage } = await import('./utils/databaseMigration');
      
      // Initialize the database
      const success = await initDatabase();
      
      if (success) {
        console.log("SQLite database initialized successfully");
        
        // Setup global db object for compatibility
        const dbObj = setupGlobalDbObject();
        
        // Check if we need to migrate data from localStorage
        if (hasLocalStorageData()) {
          console.log("Found existing data in localStorage, migrating to SQLite...");
          await migrateFromLocalStorage(dbObj);
        }
      } else {
        console.warn("Using localStorage fallback for data storage");
      }
      
      // Now load the data
      await loadData();
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  // Load data from the database
  async function loadData() {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    try {
      // Get user data - using async version
      let usersData = await window.db.getAll('users');
      let userData = null;
      
      // Check if we have any users
      if (usersData && usersData.length > 0) {
        userData = usersData[0]; // Use the first user
      }
      
      // If no user found, create default user
      if (!userData) {
        console.log("No user found, creating default user...");
        // Create default user
        const newUser = {
          id: 'user_' + Date.now(),
          name: 'David',
          lastName: '',
          sobrietyDate: '1986-05-15T00:00:00.000Z',
          homeGroup: 'Arch to Freedom',
          homeGroups: ['Arch to Freedom'],
          phone: '',
          email: 'davidgs@me.com',
          privacySettings: {
            shareLocation: false,
            shareActivities: false,
            allowMessages: true,
            shareLastName: true
          },
          preferences: {
            use24HourFormat: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Generate messaging keys for the new user
        try {
          console.log('Generating messaging keys for new user...');
          const keyPair = await generateKeyPair();
          const fingerprint = await getKeyFingerprint(keyPair.publicKey);
          
          // Add messaging keys to the user
          newUser.messagingKeys = {
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            fingerprint
          };
        } catch (error) {
          console.error('Error generating messaging keys for new user:', error);
          newUser.messagingKeys = {};
        }
        
        // Save the new user
        userData = await window.db.add('users', newUser);
      } 
      // Initialize messaging keys if they don't exist for existing user
      else if (!userData.messagingKeys || !userData.messagingKeys.publicKey) {
        try {
          console.log('Generating messaging keys for secure communications...');
          // Generate key pair for secure messaging
          const keyPair = await generateKeyPair();
          
          // Create fingerprint (simple hash of public key for identification)
          const fingerprint = await getKeyFingerprint(keyPair.publicKey);
          
          // Update user with new keys
          userData = await window.db.update('users', userData.id, {
            messagingKeys: {
              publicKey: keyPair.publicKey,
              privateKey: keyPair.privateKey,
              fingerprint
            }
          });
        } catch (err) {
          console.error('Failed to generate messaging keys:', err);
        }
      }
      
      // Set the user data
      setUser(userData);

      // Get activities - using async version
      const activitiesData = await window.db.getAll('activities');
      if (activitiesData && activitiesData.length > 0) {
        setActivities(activitiesData);
      } else {
        console.log("No activities found in database");
        setActivities([]);
      }

      // Get meetings - using async version
      const meetingsData = await window.db.getAll('meetings');
      if (meetingsData && meetingsData.length > 0) {
        setMeetings(meetingsData);
      } else {
        console.log("No meetings found in database");
        setMeetings([]);
      }

      // Calculate spiritual fitness
      calculateSpiritualFitness();
    } catch (error) {
      console.error("Error loading data:", error);
    }
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
  async function calculateSpiritualFitness() {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }
    
    try {
      // Get the spiritual fitness preferences to determine timeframe
      const timeframePreference = await window.db.getPreference('fitnessTimeframe') || 30;
      
      // Calculate score based on activities in the specified timeframe
      const timeframe = parseInt(timeframePreference, 10);
      
      // Start with a base score
      const baseScore = 20;
      let score = baseScore;
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);
      
      // Filter activities to those within the timeframe
      const recentActivities = activities.filter(activity => 
        new Date(activity.date) >= cutoffDate && new Date(activity.date) <= now
      );
      
      if (recentActivities.length === 0) {
        setSpiritualFitness(baseScore); // Base score only if no activities
        return baseScore;
      }
      
      // Calculate points based on activities
      const activityPoints = Math.min(40, recentActivities.length * 2); // Cap at 40 points
      
      // Calculate consistency points
      // Group activities by day to check daily activity
      const activityDayMap = {};
      recentActivities.forEach(activity => {
        const day = new Date(activity.date).toISOString().split('T')[0];
        if (!activityDayMap[day]) {
          activityDayMap[day] = [];
        }
        activityDayMap[day].push(activity);
      });
      
      // Count days with activities
      const daysWithActivities = Object.keys(activityDayMap).length;
      
      // Calculate consistency as a percentage of the timeframe days
      const consistencyPercentage = daysWithActivities / timeframe;
      const consistencyPoints = Math.round(consistencyPercentage * 40); // Up to 40 points for consistency
      
      // Total score
      score = baseScore + activityPoints + consistencyPoints;
      
      // Ensure score doesn't exceed 100
      score = Math.min(100, score);
      
      // Round to 2 decimal places
      score = Math.round(score * 100) / 100;
      
      // Set the spiritual fitness score in state
      setSpiritualFitness(score);
      
      return score;
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      setSpiritualFitness(20); // Default base score on error
      return 20;
    }
  }

  // Handle saving a new activity
  async function handleSaveActivity(newActivity) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    try {
      // Add activity to database - using async version
      const savedActivity = await window.db.add('activities', newActivity);
      
      // Update activities state
      setActivities(prev => [...prev, savedActivity]);
      
      // Calculate spiritual fitness after adding activity
      calculateSpiritualFitness();
      
      return savedActivity;
    } catch (error) {
      console.error('Error saving activity:', error);
      return null;
    }
    
    // Stay on activity screen to allow logging multiple activities
    // No longer redirecting to dashboard
  }

  // Handle saving a new meeting
  async function handleSaveMeeting(newMeeting) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    try {
      let savedMeeting;
      
      // If the meeting has an ID and exists in our meetings array, update it
      if (newMeeting.id && meetings.some(m => m.id === newMeeting.id)) {
        // This is an update to an existing meeting
        savedMeeting = await window.db.update('meetings', newMeeting.id, newMeeting);
        
        if (!savedMeeting) {
          console.error('Failed to update meeting - meeting not found');
          return null;
        }
        
        // Update the meetings state
        setMeetings(prev => prev.map(m => m.id === savedMeeting.id ? savedMeeting : m));
      } else {
        // This is a new meeting
        savedMeeting = await window.db.add('meetings', newMeeting);
        
        // Update meetings state
        setMeetings(prev => [...prev, savedMeeting]);
      }
      
      console.log("Meeting saved:", savedMeeting);
      
      // Return the saved meeting for the callback chain
      return savedMeeting;
    } catch (error) {
      console.error('Error saving meeting:', error);
      return null;
    }
  }

  // Handle updating user profile
  async function handleUpdateProfile(updates, options = { redirectToDashboard: true }) {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    try {
      // Update user in database - using async version
      const updatedUser = await window.db.update('users', user.id, updates);
      
      if (!updatedUser) {
        console.error('Failed to update user - user not found');
        return null;
      }
      
      // Update user state
      setUser(updatedUser);
      
      // Set view back to dashboard only if specified (default true)
      if (options.redirectToDashboard) {
        setCurrentView('dashboard');
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
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
            meetings={meetings}
            onSave={handleSaveActivity}
            onSaveMeeting={handleSaveMeeting}
            spiritualFitness={spiritualFitness}
          />
        );
      case 'meetings':
        return (
          <Meetings
            setCurrentView={setCurrentView}
            meetings={meetings}
            onSave={handleSaveMeeting}
            user={user}
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
      case 'stepwork':
        return (
          <StepWork
            setCurrentView={setCurrentView}
          />
        );
      case 'sponsorsponsee':
        return (
          <SponsorSponsee
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
        <NavBar currentView={currentView} setCurrentView={setCurrentView} />
        <div 
          className="flex-grow" 
          style={{ 
            minHeight: 'calc(100vh - 60px)', // 60px is the header height
            paddingBottom: '100px', // Significantly increased padding to ensure content is visible
            paddingTop: '10px', // Space after the header
            overflowY: 'visible' // Don't add scrollbar to this container
          }}
        >
          {renderCurrentView()}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;