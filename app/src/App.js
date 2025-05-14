import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import SpiritualFitness from './components/SpiritualFitness';
import History from './components/History';
import NearbyMembers from './components/NearbyMembers';
import Profile from './components/Profile';
import NavBar from './components/NavBar';
import { initDatabase } from './utils/database';

function App() {
  // State variables
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [spiritualFitness, setSpiritualFitness] = useState({ score: 0 });
  const [loading, setLoading] = useState(true);
  
  // Load data on component mount
  useEffect(() => {
    console.log('App component mounted, loading data...');
    setupDatabase();
  }, []);
  
  // Initialize database and load data
  const setupDatabase = async () => {
    try {
      // Initialize database
      await initDatabase();
      
      // Load data
      loadData();
    } catch (error) {
      console.error('Error initializing app:', error);
      setLoading(false);
    }
  };
  
  // Load all user data
  const loadData = async () => {
    try {
      // Get user
      const users = window.Database?.userOperations?.getAll() || [];
      if (users && users.length > 0) {
        const currentUser = users[0];
        setUser(currentUser);
        
        // Get activities
        const userActivities = window.Database?.activityOperations?.getAll({ 
          userId: currentUser.id 
        }) || [];
        setActivities(userActivities);
        
        // Calculate fitness
        const fitness = window.Database?.spiritualFitnessOperations?.calculateAndSave(
          currentUser.id, 
          userActivities
        ) || { score: 0 };
        setSpiritualFitness(fitness);
      } else {
        console.log('No user found, creating default user');
        // Create a default user if none exists
        const defaultUser = {
          name: 'Test User',
          sobrietyDate: '2020-01-01',
          homeGroup: 'Thursday Night Group',
          phone: '555-123-4567',
          email: 'test@example.com',
          privacySettings: {
            shareLocation: false,
            shareActivities: true
          }
        };
        
        const newUser = window.Database?.userOperations?.create(defaultUser);
        setUser(newUser || defaultUser);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for saving new activities
  const handleSaveActivity = (newActivity) => {
    try {
      // Add to database
      const savedActivity = window.Database?.activityOperations?.create({
        ...newActivity,
        userId: user.id
      }) || newActivity;
      
      // Update state
      setActivities(prev => [...prev, savedActivity]);
      
      // Recalculate spiritual fitness
      const updatedFitness = window.Database?.spiritualFitnessOperations?.calculateAndSave(
        user.id, 
        [...activities, savedActivity]
      ) || { score: 0 };
      setSpiritualFitness(updatedFitness);
      
      // Navigate back to dashboard
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };
  
  // Handler for updating user profile
  const handleUpdateProfile = (updates) => {
    try {
      // Update in database
      window.Database?.userOperations?.update(user.id, updates);
      
      // Update state
      setUser(prev => ({ ...prev, ...updates }));
      
      // Navigate back to dashboard
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  // Handler for updating privacy settings
  const handleUpdatePrivacy = (changes) => {
    try {
      const updatedSettings = {
        ...user.privacySettings,
        ...changes
      };
      
      // Update in database
      window.Database?.userOperations?.update(user.id, {
        privacySettings: updatedSettings
      });
      
      // Update state
      setUser(prev => ({
        ...prev,
        privacySettings: updatedSettings
      }));
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };
  
  // Loading screen
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }
  
  // Render the main view
  return (
    <div className="app-container">
      {/* Main Content Area */}
      <div className="pb-16">
        {currentView === 'dashboard' && (
          <Dashboard 
            setCurrentView={setCurrentView} 
            user={user}
            activities={activities}
            spiritualFitness={spiritualFitness}
          />
        )}
        
        {currentView === 'activity' && (
          <ActivityLog
            setCurrentView={setCurrentView}
            onSave={handleSaveActivity}
          />
        )}
        
        {currentView === 'fitness' && (
          <SpiritualFitness
            setCurrentView={setCurrentView}
            spiritualFitness={spiritualFitness}
          />
        )}
        
        {currentView === 'history' && (
          <History
            setCurrentView={setCurrentView}
            activities={activities}
          />
        )}
        
        {currentView === 'nearby' && (
          <NearbyMembers
            setCurrentView={setCurrentView}
            user={user}
            onUpdatePrivacy={handleUpdatePrivacy}
          />
        )}
        
        {currentView === 'profile' && (
          <Profile
            setCurrentView={setCurrentView}
            user={user}
            onUpdate={handleUpdateProfile}
          />
        )}
      </div>
      
      {/* Bottom Navigation */}
      <NavBar currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default App;