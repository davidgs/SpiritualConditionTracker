import React, { createContext, useState, useEffect, useContext } from 'react';
import { activityOperations } from '../utils/database';
import { useUser } from './UserContext';

// Create a context
const ActivitiesContext = createContext();

// Create a provider component
export const ActivitiesProvider = ({ children }) => {
  const { user } = useUser();
  const [activities, setActivities] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load activities when user changes
  useEffect(() => {
    if (!user || !user.id) {
      setActivities([]);
      setRecentActivities([]);
      setLoading(false);
      return;
    }
    
    const loadActivities = async () => {
      try {
        setLoading(true);
        
        // Load all activities for the user
        const allActivities = await activityOperations.getUserActivities(user.id);
        setActivities(allActivities);
        
        // Load recent activities
        const recent = await activityOperations.getRecentActivities(user.id, 5);
        setRecentActivities(recent);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [user]);
  
  // Add a new activity
  const addActivity = async (activity) => {
    if (!user || !user.id) return null;
    
    try {
      // Ensure userId is set
      const activityData = {
        ...activity,
        userId: user.id,
        date: activity.date || new Date().toISOString()
      };
      
      // Save to database
      const savedActivity = await activityOperations.saveActivity(activityData);
      
      // Update state
      setActivities(prev => [savedActivity, ...prev]);
      
      // Update recent activities
      const newRecent = [savedActivity, ...recentActivities].slice(0, 5);
      setRecentActivities(newRecent);
      
      return savedActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  };
  
  // Delete an activity
  const deleteActivity = async (activityId) => {
    try {
      const success = await activityOperations.deleteActivity(activityId);
      
      if (success) {
        // Update state
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        setRecentActivities(prev => prev.filter(activity => activity.id !== activityId));
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  };
  
  // Refresh activities data
  const refreshActivities = async () => {
    if (!user || !user.id) return;
    
    try {
      setLoading(true);
      
      // Reload activities
      const allActivities = await activityOperations.getUserActivities(user.id);
      setActivities(allActivities);
      
      // Reload recent activities
      const recent = await activityOperations.getRecentActivities(user.id, 5);
      setRecentActivities(recent);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        recentActivities,
        loading,
        addActivity,
        deleteActivity,
        refreshActivities
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

// Custom hook for using the activities context
export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};