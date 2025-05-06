import React, { createContext, useState, useContext, useEffect } from 'react';
import { calculateSpiritualFitness } from '../utils/calculations';
import { useActivities } from './ActivitiesContext';
import { getUserData, updateUserData, getUserSpiritualFitness, updateUserSpiritualFitness } from '../database/database';
import { saveUserToLocalStorage, loadUserFromLocalStorage } from '../utils/webStorage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [spiritualFitness, setSpiritualFitness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activities, addActivity, deleteActivity, loadActivities } = useActivities();

  // Load user from database on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to load from database
      let userData = await getUserData();
      
      // For web platform, also check localStorage for more recent data
      const webStorageUser = loadUserFromLocalStorage('1');
      if (webStorageUser) {
        console.log('Found user data in web storage, using that instead');
        userData = webStorageUser;
      }
      
      if (userData) {
        setUser(userData);
        // Load activities for this user
        loadActivities(userData.id);
        // Load spiritual fitness data
        await loadSpiritualFitness();
      } else {
        // Create a default user if none exists
        const defaultUser = {
          id: '1',
          firstName: 'Anonymous',
          lastName: '',
          sobrietyDate: new Date().toISOString(),
          homeGroup: '',
          sponsorName: '',
          sponsorPhone: '',
          privacySettings: {
            shareLocation: false,
            shareFullName: false,
            shareSobrietyDate: true,
            allowBluetoothDiscovery: false,
          },
          notificationSettings: {
            meetingReminders: true,
            dailyReflection: false,
            sobrietyMilestones: true,
            reminderTime: 30,
          },
          recentActivities: [],
        };
        
        await updateUserData(defaultUser);
        saveUserToLocalStorage(defaultUser); // Also save to web storage
        setUser(defaultUser);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load user data');
      setLoading(false);
      console.error('Error loading user data:', err);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update the user object by merging with new data
      const updatedUser = { ...user, ...userData };
      
      // Update in database
      await updateUserData(updatedUser);
      
      // Also save to localStorage for web persistence
      saveUserToLocalStorage(updatedUser);
      
      // Update state
      setUser(updatedUser);
      setLoading(false);
      return updatedUser;
    } catch (err) {
      setError('Failed to update user data');
      setLoading(false);
      console.error('Error updating user data:', err);
      return null;
    }
  };

  /**
   * Load spiritual fitness data for the user
   */
  const loadSpiritualFitness = async () => {
    try {
      // First check if we have stored spiritual fitness data
      const storedFitness = await getUserSpiritualFitness();
      
      if (storedFitness) {
        setSpiritualFitness(storedFitness);
        return storedFitness;
      }
      
      // If no stored data or recalculating, compute from activities
      if (activities.length > 0) {
        const fitnessScore = calculateSpiritualFitness(activities);
        await updateUserSpiritualFitness(fitnessScore);
        setSpiritualFitness(fitnessScore);
        return fitnessScore;
      }
      
      // Default spiritual fitness if no activities
      const defaultFitness = {
        overall: 0.0,
        prayer: 0.0,
        meetings: 0.0,
        literature: 0.0,
        service: 0.0,
        sponsorship: 0.0,
        timestamp: new Date().toISOString(),
      };
      
      setSpiritualFitness(defaultFitness);
      await updateUserSpiritualFitness(defaultFitness);
      return defaultFitness;
    } catch (err) {
      console.error('Error loading spiritual fitness:', err);
      return null;
    }
  };

  /**
   * Log a new activity
   */
  const logActivity = async (activity) => {
    try {
      // Add activity to the activities list
      const newActivity = await addActivity(activity);
      
      if (newActivity) {
        // Update user's recent activities
        const updatedRecentActivities = [
          newActivity,
          ...(user.recentActivities || []).slice(0, 4), // Keep only recent 5
        ];
        
        await updateUser({
          ...user,
          recentActivities: updatedRecentActivities,
        });
        
        // Recalculate spiritual fitness
        await recalculateSpiritualFitness();
      }
      
      return newActivity;
    } catch (err) {
      console.error('Error logging activity:', err);
      return null;
    }
  };

  /**
   * Delete an activity
   */
  const removeActivity = async (activityId) => {
    try {
      // Delete activity from activities list
      const success = await deleteActivity(activityId);
      
      if (success) {
        // Update user's recent activities
        const updatedRecentActivities = (user.recentActivities || [])
          .filter(activity => activity.id !== activityId);
        
        await updateUser({
          ...user,
          recentActivities: updatedRecentActivities,
        });
        
        // Recalculate spiritual fitness
        await recalculateSpiritualFitness();
      }
      
      return success;
    } catch (err) {
      console.error('Error removing activity:', err);
      return false;
    }
  };

  /**
   * Recalculate spiritual fitness
   */
  const recalculateSpiritualFitness = async () => {
    try {
      const fitnessScore = calculateSpiritualFitness(activities);
      await updateUserSpiritualFitness(fitnessScore);
      setSpiritualFitness(fitnessScore);
      return fitnessScore;
    } catch (err) {
      console.error('Error recalculating spiritual fitness:', err);
      return null;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        spiritualFitness,
        loading,
        error,
        updateUser,
        loadSpiritualFitness,
        logActivity,
        removeActivity,
        recalculateSpiritualFitness,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);