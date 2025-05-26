import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
// Removed NearbyMembers import as we won't be using Bluetooth
import Profile from './components/Profile';
import Meetings from './components/Meetings';
import StepWork from './components/StepWork';
import Sponsor from './components/Sponsor';
import Sponsee from './components/Sponsee';
import MuiThemeProvider, { useAppTheme } from './contexts/MuiThemeProvider';
import ThemeBackground from './components/ThemeBackground';
import { DEFAULT_SPIRITUAL_FITNESS_SCORE } from './utils/constants';
import { Box, Paper } from '@mui/material';
// Import SQLite initialization function
import initSQLiteDatabase from './utils/sqliteLoader';
import { User, Activity, Meeting } from './types/database';

// Define valid view types
type ViewType = 'dashboard' | 'profile' | 'meetings' | 'stepwork' | 'sponsor' | 'sponsee';

// Main App Component
function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);
  const [dbInitError, setDbInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data when component mounts
  useEffect(() => {
    // Initialize database first, then load data
    initDatabaseAndLoadData();
  }, []);

  // Calculate spiritual fitness score when activities change AND database is initialized
  // useEffect(() => {
  //   if (dbInitialized && activities.length > 0) {
  //     calculateSpiritualFitness();
  //   }
  // }, [activities, dbInitialized]);
  
  // Initialize the database and load data
  async function initDatabaseAndLoadData() {
    setIsLoading(true);
    
    try {
      console.log("Initializing database for native app with Capacitor...");
      
      // Initialize the SQLite database with the imported function
      const sqliteDb = await initSQLiteDatabase();
      console.log("SQLite database initialized successfully");
      
      // Set both local state and global flag to indicate database is initialized
      setDbInitialized(true);
      window.dbInitialized = true;
      
      // Log successful initialization to help with debugging
      console.log('Database successfully initialized and ready for use');
      
      // Wait a moment to ensure database is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify database is accessible before loading data
      if (!window.db || !window.db.getAll) {
        throw new Error("Database interface not properly initialized");
      }
      
      // Now load the data
      await loadData();
      
      // Calculate spiritual fitness after database is ready and data is loaded
    } catch (error) {
      // Detailed error logging for diagnosis
      console.error("Database not initialized", error);
      
      // Check for common issues
      if (error.message && error.message.includes('plugin not available')) {
        console.error("[ App.js ] Capacitor SQLite plugin appears to be missing or not properly installed");
        console.log("Setting up localStorage fallback for data persistence");
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
      
      // Record the error
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
            shareLastName: true
          },
          preferences: {
            use24HourFormat: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Messaging functionality has been removed
        
        // Save the new user
        userData = await window.db.add('users', newUser);
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
  
  // Messaging-related functionality has been removed

  // Dashboard handles spiritual fitness calculation - keeping this for interface compatibility
  async function calculateSpiritualFitness() {
    return 0; // Dashboard calculates the actual value
  }

  // Handle saving a new activity
  async function handleSaveActivity(newActivity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity | null> {
    if (!window.db) {
      console.error('Database not initialized');
      return;
    }

    try {
      console.log('[ App.tsx ] Saving activity to database:', newActivity);
      
      // Add activity to database - using async version
      const savedActivity = await window.db.add('activities', newActivity);
      
      console.log('[ App.tsx ] Activity saved, returned from database:', savedActivity);
      console.log('[ App.tsx ] Saved activity ID:', savedActivity?.id);
      
      // Verify the activity has a valid ID before adding to state
      if (!savedActivity || savedActivity.id === undefined || savedActivity.id === null) {
        console.error('[ App.tsx ] Database returned activity without valid ID:', savedActivity);
        return null;
      }
      
      // Update activities state
      setActivities(prev => [...prev, savedActivity]);
      
      console.log('[ App.tsx ] Activity successfully added to state');
      
      // Dashboard will recalculate spiritual fitness when activities update
      
      return savedActivity;
    } catch (error) {
      console.error('Error saving activity:', error);
      return null;
    }
    
    // Stay on activity screen to allow logging multiple activities
    // No longer redirecting to dashboard
  }

  // Handle saving a new meeting
  async function handleSaveMeeting(newMeeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting | null> {
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
  async function handleUpdateProfile(updates: Partial<User>, options: { redirectToDashboard: boolean } = { redirectToDashboard: true }): Promise<User | null> {
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
      // Messages feature removed as requested
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
      case 'sponsor':
        return (
          <Sponsor
            user={user}
            onUpdate={handleUpdateProfile}
          />
        );
      case 'sponsee':
        return (
          <Sponsee
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
    <MuiThemeProvider>
      <ThemeBackground>
        <Box 
          className="app-container h-full flex flex-col transition-all duration-300"
          sx={{ 
            width: '100%',
            height: '100%',
            color: 'text.primary'
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
      </ThemeBackground>
    </MuiThemeProvider>
  );
}

export default App;