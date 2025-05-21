import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
// Removed NearbyMembers import as we won't be using Bluetooth
import Profile from './components/Profile';
import Meetings from './components/Meetings';
import Messages from './components/Messages';
import StepWork from './components/StepWork';
import SponsorSponsee from './components/SponsorSponsee';
import MuiThemeProvider, { useAppTheme } from './contexts/MuiThemeProvider';
import ThemeBackground from './components/ThemeBackground';
import { generateKeyPair } from './utils/encryption';
import { DEFAULT_SPIRITUAL_FITNESS_SCORE } from './utils/constants';
import { Box, Paper } from '@mui/material';

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [spiritualFitness, setSpiritualFitness] = useState(0);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbInitError, setDbInitError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    // Initialize database first, then load data
    initDatabaseAndLoadData();
  }, []);

  // Calculate spiritual fitness score when activities change AND database is initialized
  useEffect(() => {
    if (dbInitialized && activities.length > 0) {
      calculateSpiritualFitness();
    }
  }, [activities, dbInitialized]);
  
  // Initialize the database and load data
  async function initDatabaseAndLoadData() {
    setIsLoading(true);
    
    try {
      // Import the database operations - SQLite for native iOS/Android via Capacitor
      const initSQLiteDatabase = (await import('./utils/sqliteLoader')).default;
      
      console.log("[ App.js ] Initializing SQLite database for native app with Capacitor...");
      
      // Initialize the SQLite database with detailed error reporting
      try {
        // Only proceed with data loading after SQLite is fully initialized
        await initSQLiteDatabase();
        console.log("[ App.js ] SQLite database initialized successfully");
        
        // Mark database as initialized to prevent premature data access
        setDbInitialized(true);
        
        // Share initialization status globally so other components can check it
        window.dbInitialized = true;
        
        // Now load the data
        await loadData();
        
        // Calculate spiritual fitness after database is ready and data is loaded
        await calculateSpiritualFitness();
      } catch (error) {
        // Detailed error logging for iOS-specific diagnosis
        console.error("[ App.js ] SQLite initialization error:", error);
        
        // Check for common iOS-specific issues
        if (error.message && error.message.includes('plugin not available')) {
          console.error("[ App.js ] Capacitor SQLite plugin appears to be missing or not properly installed");
        }
        
        // Log error details to help with debugging
        console.error("[ App.js ] Error details:", JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          code: error.code
        }, null, 2));
        
        // Even if SQLite fails, we should still set up localStorage fallback
        console.warn("[ App.js ] Using localStorage fallback due to SQLite initialization failure");
        
        // Create a simple localStorage-based database API
        window.db = {
          getAll: async (collection) => {
            try {
              return JSON.parse(localStorage.getItem(collection) || '[]');
            } catch (e) {
              console.error(`Error getting ${collection} from localStorage:`, e);
              return [];
            }
          },
          add: async (collection, item) => {
            try {
              const items = JSON.parse(localStorage.getItem(collection) || '[]');
              if (!item.id) {
                item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              }
              items.push(item);
              localStorage.setItem(collection, JSON.stringify(items));
              return item;
            } catch (e) {
              console.error(`Error adding to ${collection} in localStorage:`, e);
              throw e;
            }
          },
          // Add minimal fallback methods to prevent blank screens
          calculateSpiritualFitness: () => DEFAULT_SPIRITUAL_FITNESS_SCORE,
          calculateSpiritualFitnessWithTimeframe: () => DEFAULT_SPIRITUAL_FITNESS_SCORE
        };
        
        // Set flag to allow app to continue with localStorage
        window.dbInitialized = true;
        setDbInitialized(true);
        
        // Load data from localStorage
        await loadData();
        setSpiritualFitness(DEFAULT_SPIRITUAL_FITNESS_SCORE);
      }
    } catch (error) {
      console.error("[ App.js ] Database initialization error:", error);
      setDbInitError("Database initialization failed. Using fallback mode.");
      
      // Set a default spiritual fitness score to prevent blank display
      setSpiritualFitness(DEFAULT_SPIRITUAL_FITNESS_SCORE);
    } finally {
      // Always clear loading state no matter what
      setIsLoading(false);
    }
  }

  // Load data from the database
  async function loadData() {
    // Only proceed if database is properly initialized
    if (!dbInitialized || !window.db) {
      console.error('[ App.js ] Database not initialized or not ready for data operations');
      return;
    }
    
    console.log('[ App.js ] Loading data from initialized database');

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
          name: 'John',
          lastName: 'Doe',
          sobrietyDate: '2024-01-01T00:00:00.000Z',
          homeGroup: 'My Home Group',
          homeGroups: ['My Home Group'],
          phone: '',
          email: 'doe@example.com',
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
    // Use global constant for default score if no calculation is possible
    console.log('[ App.js ] Starting calculateSpiritualFitness with default:', DEFAULT_SPIRITUAL_FITNESS_SCORE);
    
    // Check if database is properly initialized
    if (!dbInitialized || !window.db) {
      console.error('[ App.js ] Database not initialized or not ready for fitness calculation');
      setSpiritualFitness(DEFAULT_SPIRITUAL_FITNESS_SCORE);
      return DEFAULT_SPIRITUAL_FITNESS_SCORE;
    }
    
    console.log('[ App.js ] Calculating spiritual fitness with initialized database');
    
    // Log the activities we have
    console.log('Calculating spiritual fitness with activities:', activities);
    
    try {
      let score = DEFAULT_SPIRITUAL_FITNESS_SCORE;
      let calculationMethod = 'none';
      
      // Try different calculation methods in order of preference
      
      // 1. Try the original Database spiritualFitnessOperations method
      if (window.Database && 
          window.Database.spiritualFitnessOperations && 
          typeof window.Database.spiritualFitnessOperations.calculateSpiritualFitness === 'function') {
        
        try {
          calculationMethod = 'Database.spiritualFitnessOperations';
          console.log('Using', calculationMethod);
          
          // Get user ID (use '1' as default if not found)
          const users = window.Database.userOperations.getAll();
          const userId = (users && users.length > 0) ? users[0].id : '1';
          
          const result = window.Database.spiritualFitnessOperations.calculateSpiritualFitness(userId);
          if (result && typeof result.score === 'number') {
            score = result.score;
            console.log('Success with', calculationMethod, ':', score);
            setSpiritualFitness(score);
            return score;
          }
        } catch (methodError) {
          console.error('Error with', calculationMethod, ':', methodError);
          // Continue to next method
        }
      }
      
      // 2. Try the direct db calculateSpiritualFitness method
      if (typeof window.db.calculateSpiritualFitness === 'function') {
        try {
          calculationMethod = 'window.db.calculateSpiritualFitness';
          console.log('Using', calculationMethod);
          
          score = await window.db.calculateSpiritualFitness(activities);
          if (typeof score === 'number') {
            console.log('Success with', calculationMethod, ':', score);
            setSpiritualFitness(score);
            return score;
          }
        } catch (methodError) {
          console.error('Error with', calculationMethod, ':', methodError);
          // Continue to next method
        }
      }
      
      // 3. Try the timeframe method
      if (typeof window.db.calculateSpiritualFitnessWithTimeframe === 'function') {
        try {
          calculationMethod = 'window.db.calculateSpiritualFitnessWithTimeframe';
          console.log('Using', calculationMethod);
          
          score = await window.db.calculateSpiritualFitnessWithTimeframe(30);
          if (typeof score === 'number') {
            console.log('Success with', calculationMethod, ':', score);
            setSpiritualFitness(score);
            return score;
          }
        } catch (methodError) {
          console.error('Error with', calculationMethod, ':', methodError);
          // Continue to next method
        }
      }
      
      // 4. If all methods failed, use the built-in fallback
      console.warn('⚠️ All spiritual fitness calculation methods failed - using built-in fallback');
      score = calculateFallbackFitness();
      setSpiritualFitness(score);
      return score;
    } catch (error) {
      // Handle any unexpected errors in the main function
      console.error('Unexpected error in calculateSpiritualFitness:', error);
      const fallbackScore = calculateFallbackFitness();
      setSpiritualFitness(fallbackScore);
      return fallbackScore;
    }
  }
  
  // Built-in fallback calculation function
  function calculateFallbackFitness() {
    console.log('Using built-in fallback fitness calculation');
    
    // Start with a base score
    const baseScore = 5;
    let finalScore = baseScore;
    
    // Only proceed if we have activities
    if (activities && activities.length > 0) {
      // Define time period (30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      // Filter for recent activities
      const recentActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= thirtyDaysAgo && activityDate <= now;
      });
      
      console.log('Found', recentActivities.length, 'activities in the last 30 days');
      
      // Add points based on activity count (2 points per activity, max 40)
      const activityPoints = Math.min(40, recentActivities.length * 2);
      
      // Track unique days with activities for consistency calculation
      const activityDays = new Set();
      recentActivities.forEach(activity => {
        if (activity.date) {
          const dayKey = new Date(activity.date).toISOString().split('T')[0];
          activityDays.add(dayKey);
        }
      });
      
      const daysWithActivities = activityDays.size;
      console.log('Activities occurred on', daysWithActivities, 'different days');
      
      // Calculate consistency points (up to 40 points)
      const consistencyPercentage = daysWithActivities / 30;
      const consistencyPoints = Math.round(consistencyPercentage * 40);
      
      // Calculate final score (capped at 100)
      finalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
      
      console.log('Fallback calculation details:', {
        baseScore,
        activityPoints,
        consistencyPoints,
        finalScore
      });
    } else {
      console.log('No activities found, using base score:', baseScore);
    }
    
    return finalScore;
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
      // Process sobriety date to ensure consistent format
      if (updates.sobrietyDate) {
        // Store the sobriety date exactly as it is in YYYY-MM-DD format
        // This prevents timezone issues and ensures consistent display
        // We'll strip any time part if it exists
        if (updates.sobrietyDate.includes('T')) {
          updates.sobrietyDate = updates.sobrietyDate.split('T')[0];
        }
        // Validate that it's a proper date
        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(updates.sobrietyDate);
        if (!isValidDate) {
          console.error('Invalid sobriety date format:', updates.sobrietyDate);
          // Default to empty string if invalid
          updates.sobrietyDate = '';
        }
      }
      
      // Update user in database - using async version
      let updatedUser;
      
      try {
        if (!user || !user.id) {
          // If no user exists yet, create one
          console.log('Creating new user with profile data');
          updatedUser = await window.db.add('users', {
            ...updates,
            id: 'user_default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          // Update existing user
          updatedUser = await window.db.update('users', user.id, {
            ...updates,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (dbError) {
        console.error('Database error updating user:', dbError);
        // Fallback to using the current user data plus updates to avoid UI disruption
        updatedUser = { ...user, ...updates };
      }
      
      if (!updatedUser) {
        console.error('Failed to update user - using local update only');
        // Still provide an update to the UI by merging changes
        updatedUser = { ...user, ...updates };
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

  // Log the spiritual fitness value before rendering
  console.log('App.js - Before rendering, spiritualFitness value:', spiritualFitness);
  
  // Get dark mode state
  return (
    <MuiThemeProvider>
      <Box 
        className="app-container h-full flex flex-col transition-colors duration-200"
        sx={{ 
          width: '100%',
          height: '100%',
          bgcolor: 'background.default', // This directly uses the theme's background color
          color: 'text.primary'          // This directly uses the theme's text color
        }}
      >
        <NavBar currentView={currentView} setCurrentView={setCurrentView} />
        <Box 
          className="flex-grow" 
          sx={{ 
            bgcolor: 'background.default', // Ensure background color is applied here too
            minHeight: 'calc(100vh - 60px)', // 60px is the header height
            paddingBottom: '100px', // Significantly increased padding to ensure content is visible
            paddingTop: '10px', // Space after the header
            overflowY: 'visible' // Don't add scrollbar to this container
          }}
        >
          {renderCurrentView()}
        </Box>
      </Box>
    </MuiThemeProvider>
  );
}

export default App;