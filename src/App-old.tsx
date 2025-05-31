import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
// Removed NearbyMembers import as we won't be using Bluetooth
import Profile from './components/Profile';
import Meetings from './components/Meetings';
import StepWork from './components/StepWork';
import Sponsor from './components/Sponsor';
import Sponsee from './components/Sponsee';
import SponsorSponsee from './components/SponsorSponsee';
import MuiThemeProvider, { useAppTheme } from './contexts/MuiThemeProvider';
import ThemeBackground from './components/ThemeBackground';
import { DEFAULT_SPIRITUAL_FITNESS_SCORE } from './utils/constants';
import { Box, Paper, Typography, Button } from '@mui/material';
// Import SQLite initialization function
import initSQLiteDatabase, { cleanupBrokenActivities } from './utils/sqliteLoader';
import { User, Activity, Meeting } from './types/database';

// Define valid view types
type ViewType = 'dashboard' | 'profile' | 'meetings' | 'stepwork' | 'sponsorship' | 'sponsor' | 'sponsee';

// Main App Component
function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);
  const [dbInitError, setDbInitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTimeframe, setCurrentTimeframe] = useState<number>(30); // Default 30 days
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Filter activities by timeframe
  function filterActivitiesByTimeframe(allActivities: Activity[], timeframeDays: number): Activity[] {
    const now = new Date();
    const timeframeStart = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
    
    return allActivities.filter(activity => {
      if (!activity.date) return false;
      const activityDate = new Date(activity.date);
      return activityDate >= timeframeStart;
    });
  }

  // Function to reload activities when timeframe changes
  async function handleTimeframeChange(newTimeframe: number) {
    console.log(`[ App.tsx:43 handleTimeframeChange ] Changing timeframe from ${currentTimeframe} to ${newTimeframe} days`);
    setCurrentTimeframe(newTimeframe);
    
    // Reload activities for new timeframe
    if (dbInitialized && window.db) {
      try {
        const allActivitiesData = await window.db.getAll('activities');
        if (allActivitiesData && allActivitiesData.length > 0) {
          const filteredActivities = filterActivitiesByTimeframe(allActivitiesData, newTimeframe);
          console.log(`[ App.tsx:51 handleTimeframeChange ] Loaded ${filteredActivities.length} activities within ${newTimeframe} days`);
          setActivities(filteredActivities);
        }
      } catch (error) {
        console.error('[ App.tsx:55 handleTimeframeChange ] Error reloading activities:', error);
      }
    }
  }

  // Load data when component mounts
  useEffect(() => {
    // Initialize database first, then load data
    initDatabaseAndLoadData();
  }, []);

  // Removed old calculateSpiritualFitness - now handled by Dashboard using activities from state
  
  // Initialize the database and load data
  async function initDatabaseAndLoadData() {
    setIsLoading(true);
    
    try {
      console.log("Initializing database for native app with Capacitor...");
      
      // Initialize the SQLite database with the imported function
      const sqliteDb = await initSQLiteDatabase();
      console.log("SQLite database initialized successfully");
      
      // Log successful initialization to help with debugging
      console.log('Database successfully initialized and ready for use');
      
      // Verify database is accessible before setting ready flags
      if (!window.db || !window.db.getAll) {
        throw new Error("Database interface not properly initialized");
      }
      
      // Clean up broken activities before loading data
      console.log('[ App.tsx ] Running database cleanup...');
      await cleanupBrokenActivities();
      
      // Set database as ready ONLY after everything is verified and cleaned up
      setDbInitialized(true);
      window.dbInitialized = true;
      console.log('[ App.tsx ] Database state flags set - ready for data operations');
      
      // Load data immediately after initialization (bypass state check)
      await loadDataDirect();
      
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

  // Load data directly during initialization (bypasses state check)
  async function loadDataDirect() {
    console.log('[ App.js ] Loading data directly from initialized database');
    
    try {
      // Get user data - using async version
      let usersData = await window.db.getAll('users');
      let userData = null;
      
      console.log('[ App.tsx ] All users found:', usersData?.length || 0);
      
      // Check if we have any users and log details
      if (usersData && usersData.length > 0) {
        // Log all user records to debug the issue
        usersData.forEach((user, index) => {
          console.log(`[ App.tsx ] User ${index + 1} (ID: ${user.id}):`, {
            name: user.name || '[empty]',
            lastName: user.lastName || '[empty]',
            phoneNumber: user.phoneNumber || '[empty]',
            email: user.email || '[empty]',
            sobrietyDate: user.sobrietyDate || '[empty]'
          });
        });
        
        // Find the user with the most data (not empty)
        let bestUser = usersData[0];
        for (const user of usersData) {
          const hasData = (user.name && user.name.trim()) || 
                         (user.phoneNumber && user.phoneNumber.trim()) || 
                         (user.email && user.email.trim()) ||
                         (user.sobrietyDate && user.sobrietyDate.trim());
          
          if (hasData) {
            bestUser = user;
            console.log('[ App.tsx ] Found user with data, using ID:', user.id);
            break;
          }
        }
        
        userData = bestUser;
        console.log('[ App.tsx ] Selected user ID:', userData.id);
      }
      
      // If no user found, create default user
      if (!userData) {
        console.log("No user found, creating default user...");
        // Create default user (let SQLite auto-generate the ID)
        const newUser = {
          name: '',
          lastName: '',
          sobrietyDate: '',
          homeGroup: '',
          homeGroups: [],
          phoneNumber: '',
          email: '',
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
        
        // Save the new user
        userData = await window.db.add('users', newUser);
      }
      
      // Set the user data and current user ID
      setUser(userData);
      console.log('[ App.tsx ] Raw user data from database:', userData);
      console.log('[ App.tsx ] User data fields:', {
        name: userData?.name,
        lastName: userData?.lastName,
        phoneNumber: userData?.phoneNumber,
        email: userData?.email,
        sobrietyDate: userData?.sobrietyDate
      });
      
      if (userData && userData.id) {
        setCurrentUserId(userData.id);
        console.log('[ App.tsx ] Current user ID set to:', userData.id);
      } else {
        console.log('[ App.tsx ] Warning: User data loaded but no ID found');
        console.log('[ App.tsx ] User data keys:', userData ? Object.keys(userData) : 'userData is null');
      }

      // Get activities within current timeframe - using async version
      const allActivitiesData = await window.db.getAll('activities');
      if (allActivitiesData && allActivitiesData.length > 0) {
        const filteredActivities = filterActivitiesByTimeframe(allActivitiesData, currentTimeframe);
        console.log(`[ App.tsx:218 loadDataDirect ] Loaded ${filteredActivities.length} activities within ${currentTimeframe} days (from ${allActivitiesData.length} total)`);
        setActivities(filteredActivities);
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
      const activitiesArray = Array.isArray(allActivitiesData) ? allActivitiesData : [];
      const score = calculateSpiritualFitnessScore(activitiesArray, currentTimeframe);
      setSpiritualFitness(score);
    } catch (error) {
      console.error("Error loading data directly:", error);
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
      
      console.log('[ App.tsx ] All users found:', usersData?.length || 0);
      
      // Check if we have any users and log details
      if (usersData && usersData.length > 0) {
        // Log all user records to debug the issue
        usersData.forEach((user, index) => {
          console.log(`[ App.tsx ] User ${index + 1} (ID: ${user.id}):`, {
            name: user.name || '[empty]',
            lastName: user.lastName || '[empty]',
            phoneNumber: user.phoneNumber || '[empty]',
            email: user.email || '[empty]',
            sobrietyDate: user.sobrietyDate || '[empty]'
          });
        });
        
        // Find the user with the most data (not empty)
        let bestUser = usersData[0];
        for (const user of usersData) {
          const hasData = (user.name && user.name.trim()) || 
                         (user.phoneNumber && user.phoneNumber.trim()) || 
                         (user.email && user.email.trim()) ||
                         (user.sobrietyDate && user.sobrietyDate.trim());
          
          if (hasData) {
            bestUser = user;
            console.log('[ App.tsx ] Found user with data, using ID:', user.id);
            break;
          }
        }
        
        userData = bestUser;
        console.log('[ App.tsx ] Selected user ID:', userData.id);
      }
      
      // If no user found, create default user
      if (!userData) {
        console.log("No user found, creating default user...");
        // Create default user (let SQLite auto-generate the ID)
        const newUser = {
          name: '',
          lastName: '',
          sobrietyDate: '',
          homeGroup: '',
          homeGroups: [],
          phoneNumber: '',
          email: '',
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
      
      // Set the user data and current user ID
      setUser(userData);
      console.log('[ App.tsx ] Raw user data from database:', userData);
      console.log('[ App.tsx ] User data fields:', {
        name: userData?.name,
        lastName: userData?.lastName,
        phoneNumber: userData?.phoneNumber,
        email: userData?.email,
        sobrietyDate: userData?.sobrietyDate
      });
      
      if (userData && userData.id) {
        setCurrentUserId(userData.id);
        console.log('[ App.tsx ] Current user ID set to:', userData.id);
      } else {
        console.log('[ App.tsx ] Warning: User data loaded but no ID found');
        console.log('[ App.tsx ] User data keys:', userData ? Object.keys(userData) : 'userData is null');
      }

      // Get activities within current timeframe - using async version
      const allActivitiesData = await window.db.getAll('activities');
      if (allActivitiesData && allActivitiesData.length > 0) {
        const filteredActivities = filterActivitiesByTimeframe(allActivitiesData, currentTimeframe);
        console.log(`[ App.tsx:218 loadData ] Loaded ${filteredActivities.length} activities within ${currentTimeframe} days (from ${allActivitiesData.length} total)`);
        setActivities(filteredActivities);
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
  // Spiritual fitness calculation now handled entirely by Dashboard component using activities from state

  // Handle saving a new activity or updating an existing one
  async function handleSaveActivity(activityData: any): Promise<Activity | null> {
    if (!window.db) {
      console.error('Database not initialized');
      return null;
    }

    try {
      console.log('[ App.tsx:241 handleSaveActivity ] Processing activity:', activityData);
      
      let savedActivity;
      
      // Check if this is an update (has existing ID) or a new activity
      if (activityData.id) {
        console.log('[ App.tsx ] Updating existing activity with ID:', activityData.id);
        // Update existing activity
        savedActivity = await window.db.update('activities', activityData.id, {
          ...activityData,
          updatedAt: new Date().toISOString()
        });
        
        if (savedActivity) {
          // Update the activity in state
          setActivities(prev => prev.map(activity => 
            activity.id === activityData.id ? savedActivity : activity
          ));
          console.log('[ App.tsx ] Activity successfully updated in state');
        }
      } else {
        console.log('[ App.tsx ] Creating new activity');
        // Create new activity
        const newActivity = {
          ...activityData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        savedActivity = await window.db.add('activities', newActivity);
        
        if (savedActivity && savedActivity.id !== undefined && savedActivity.id !== null) {
          // Add new activity to state
          setActivities(prev => [...prev, savedActivity]);
          console.log('[ App.tsx ] Activity successfully added to state');
        }
      }
      
      console.log('[ App.tsx ] Activity operation completed:', savedActivity);
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
      console.error('[ App.tsx: 345 ] Database not initialized');
      return;
    }

    try {
      console.log('[ App.tsx: 350 ] Updating user profile with:', updates);
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
          console.error('[ App.tsx: 362 ] Invalid sobriety date format:', updates.sobrietyDate);
          // Default to empty string if invalid
          updates.sobrietyDate = '';
        }
      }
      
      // Update user in database - using async version
      let updatedUser;
      
      try {
        let userIdToUpdate = currentUserId;
        
        // If no current user ID, get the first user from database
        if (!userIdToUpdate) {
          console.log('[ App.tsx ] No current user ID, getting first user from database');
          const allUsers = await window.db.getAll('users');
          if (allUsers && allUsers.length > 0) {
            userIdToUpdate = allUsers[0].id;
            setCurrentUserId(userIdToUpdate); // Set it for future use
            console.log('[ App.tsx ] Found user ID from database:', userIdToUpdate);
          } else {
            console.error('[ App.tsx ] No users found in database');
            return null;
          }
        }
        
        console.log('[ App.tsx ] Updating user with ID:', userIdToUpdate);
        updatedUser = await window.db.update('users', userIdToUpdate, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        console.log('[ App.tsx ] User updated:', updatedUser);
      } catch (dbError) {
        console.error('[ App.tsx: 392 ] Database error updating user:', dbError);
        // Fallback to using the current user data plus updates to avoid UI disruption
        updatedUser = { ...user, ...updates };
      }
      
      if (!updatedUser) {
        console.error('[ App.tsx: 395 ] Failed to update user - using local update only');
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

  // Handle resetting all data - clears profile data but keeps user ID
  async function handleResetAllData() {
    console.log('[ App.tsx ] Resetting all data while preserving user ID');
    
    if (!dbInitialized || !window.db || !currentUserId) {
      console.error('[ App.tsx ] Cannot reset data - database not initialized or no user ID');
      return;
    }

    try {
      // Reset user profile to empty values but keep the ID
      const today = new Date().toISOString().split('T')[0];
      const resetUserData = {
        name: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        sobrietyDate: today, // Reset to today's date
        homeGroups: JSON.stringify([]),
        privacySettings: JSON.stringify({
          allowMessages: true,
          shareLastName: true
        }),
        preferences: JSON.stringify({
          use24HourFormat: false
        }),
        updatedAt: new Date().toISOString()
      };

      // Update the user in database with reset values
      const updatedUser = await window.db.update('users', currentUserId, resetUserData);
      console.log('[ App.tsx ] User profile reset to default values');

      // Clear activities and meetings from database
      const allActivities = await window.db.getAll('activities');
      for (const activity of allActivities) {
        if (activity.id) {
          await window.db.remove('activities', activity.id);
        }
      }

      const allMeetings = await window.db.getAll('meetings');
      for (const meeting of allMeetings) {
        if (meeting.id) {
          await window.db.remove('meetings', meeting.id);
        }
      }

      // Reset React state to match database
      setUser(updatedUser);
      setActivities([]);
      setMeetings([]);
      setCurrentTimeframe(30);
      
      console.log('[ App.tsx ] All data reset successfully, user ID preserved:', currentUserId);
    } catch (error) {
      console.error('[ App.tsx ] Error resetting data:', error);
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
            onTimeframeChange={handleTimeframeChange}
            currentTimeframe={currentTimeframe}
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
            meetings={meetings}
            currentUserId={currentUserId}
            onSaveMeeting={handleSaveMeeting}
            onResetAllData={handleResetAllData}
          />
        );
      case 'stepwork':
        return (
          <StepWork
            setCurrentView={setCurrentView}
          />
        );
      case 'sponsorship':
      case 'sponsor':
      case 'sponsee':
        return (
          <SponsorSponsee
            user={user}
            onUpdate={handleUpdateProfile}
            onSaveActivity={handleSaveActivity}
            activities={activities}
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
            paddingTop: '5rem', // Space after the fixed header (matches header height)
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