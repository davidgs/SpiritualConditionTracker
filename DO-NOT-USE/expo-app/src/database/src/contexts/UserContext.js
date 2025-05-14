import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

import { 
  initDatabase, 
  userOperations, 
  activityOperations,
  spiritualFitnessOperations
} from '../utils/database';

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [spiritualFitness, setSpiritualFitness] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Initialize database and load user data
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize the database
        await initDatabase();

        // Check if there's a user in the database already
        const users = await userOperations.getAll();
        
        if (users && users.length > 0) {
          // Use the first user (for simplicity, we'll assume single-user app for now)
          setUser(users[0]);
          
          // Load spiritual fitness data
          await loadSpiritualFitness(users[0].id);
          
          // Load recent activities
          await loadRecentActivities(users[0].id);
        } else {
          // Create a default user if none exists
          const defaultUser = {
            name: 'AA Member',
            email: '',
            phone: '',
            sobrietyDate: new Date().toISOString().split('T')[0],
            homeGroup: '',
            profileSettings: {
              privacyEnabled: true,
              notificationsEnabled: true,
              reminderTime: 30 // minutes before meeting
            }
          };
          
          const newUser = await userOperations.create(defaultUser);
          setUser(newUser);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        Alert.alert('Error', 'Failed to initialize the app. Please restart the app and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  /**
   * Load spiritual fitness data for a user
   */
  const loadSpiritualFitness = async (userId) => {
    try {
      const fitness = await spiritualFitnessOperations.getForUser(userId);
      setSpiritualFitness(fitness || { score: 0, breakdown: {} });
    } catch (error) {
      console.error('Error loading spiritual fitness:', error);
    }
  };

  /**
   * Load recent activities for a user
   */
  const loadRecentActivities = async (userId) => {
    try {
      const activities = await activityOperations.getAll({ 
        userId, 
        limit: 50 
      });
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates) => {
    try {
      if (!user) return null;
      
      const updatedUser = await userOperations.update(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      return null;
    }
  };

  /**
   * Log a new activity
   */
  const logActivity = async (activity) => {
    try {
      if (!user) return null;
      
      // Add user ID to activity
      const activityWithUser = {
        ...activity,
        userId: user.id
      };
      
      // Save to database
      const newActivity = await activityOperations.create(activityWithUser);
      
      // Refresh activities list
      await loadRecentActivities(user.id);
      
      // Recalculate spiritual fitness
      await recalculateSpiritualFitness();
      
      return newActivity;
    } catch (error) {
      console.error('Error logging activity:', error);
      Alert.alert('Error', 'Failed to log activity. Please try again.');
      return null;
    }
  };

  /**
   * Delete an activity
   */
  const deleteActivity = async (activityId) => {
    try {
      const success = await activityOperations.delete(activityId);
      
      if (success) {
        // Refresh activities list
        await loadRecentActivities(user.id);
        
        // Recalculate spiritual fitness
        await recalculateSpiritualFitness();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert('Error', 'Failed to delete activity. Please try again.');
      return false;
    }
  };

  /**
   * Recalculate spiritual fitness
   */
  const recalculateSpiritualFitness = async () => {
    try {
      if (!user) return null;
      
      // Get all activities for calculation
      const allActivities = await activityOperations.getAll({ userId: user.id });
      
      // Calculate and save spiritual fitness
      const fitness = await spiritualFitnessOperations.calculateAndSave(user.id, allActivities);
      
      // Update state
      setSpiritualFitness(fitness);
      
      return fitness;
    } catch (error) {
      console.error('Error recalculating spiritual fitness:', error);
      return null;
    }
  };

  // Context value
  const contextValue = {
    user,
    isLoading,
    spiritualFitness,
    recentActivities,
    updateUserProfile,
    logActivity,
    deleteActivity,
    recalculateSpiritualFitness,
    loadRecentActivities
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;