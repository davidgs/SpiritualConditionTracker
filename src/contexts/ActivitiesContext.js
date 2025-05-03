import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

import { activityOperations } from '../utils/database';
import { useUser } from './UserContext';

// Create the context
const ActivitiesContext = createContext();

// Activity types with their labels and descriptions
export const ACTIVITY_TYPES = {
  meeting: {
    label: 'AA Meeting',
    description: 'Attendance at an AA meeting',
    icon: 'users'
  },
  prayer: {
    label: 'Prayer',
    description: 'Time spent in prayer',
    icon: 'hands'
  },
  meditation: {
    label: 'Meditation',
    description: 'Time spent in meditation',
    icon: 'spa'
  },
  reading: {
    label: 'Reading',
    description: 'Reading AA literature',
    icon: 'book-open'
  },
  callSponsor: {
    label: 'Call Sponsor',
    description: 'Called your sponsor',
    icon: 'phone'
  },
  callSponsee: {
    label: 'Call Sponsee',
    description: 'Called your sponsee',
    icon: 'phone-forwarded'
  },
  service: {
    label: 'Service',
    description: 'Service work',
    icon: 'heart'
  },
  stepWork: {
    label: 'Step Work',
    description: 'Working on the 12 steps',
    icon: 'clipboard'
  }
};

// Provider component
export const ActivitiesProvider = ({ children }) => {
  const { user, recalculateSpiritualFitness } = useUser();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityStats, setActivityStats] = useState({});

  // Load activities when user changes
  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  // Load all activities for the current user
  const loadActivities = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userActivities = await activityOperations.getAll({ userId: user.id });
      setActivities(userActivities);
      calculateStats(userActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate activity statistics
  const calculateStats = (activitiesList) => {
    if (!activitiesList || activitiesList.length === 0) {
      setActivityStats({});
      return;
    }

    // Get activities from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = activitiesList.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo;
    });

    // Count by type
    const byType = {};
    Object.keys(ACTIVITY_TYPES).forEach(type => {
      byType[type] = recentActivities.filter(a => a.type === type).length;
    });

    // Total activities
    const totalCount = recentActivities.length;

    // Total time spent (in minutes)
    const totalMinutes = recentActivities.reduce((sum, activity) => {
      return sum + (activity.duration || 0);
    }, 0);

    // Most common activity type
    let mostCommonType = null;
    let mostCommonCount = 0;
    
    Object.entries(byType).forEach(([type, count]) => {
      if (count > mostCommonCount) {
        mostCommonType = type;
        mostCommonCount = count;
      }
    });

    // Average activities per day
    const daysInPeriod = 30;
    const avgPerDay = totalCount / daysInPeriod;

    // Update stats
    setActivityStats({
      totalCount,
      totalMinutes,
      byType,
      mostCommonType,
      mostCommonCount,
      avgPerDay
    });
  };

  // Add a new activity
  const addActivity = async (activityData) => {
    if (!user) return null;

    try {
      // Make sure the activity has the required fields
      const activity = {
        userId: user.id,
        type: activityData.type || 'meeting',
        date: activityData.date || new Date().toISOString(),
        duration: activityData.duration || 0,
        notes: activityData.notes || ''
      };

      // Save to database
      const newActivity = await activityOperations.create(activity);
      
      // Refresh the activities list
      await loadActivities();
      
      // Recalculate spiritual fitness
      recalculateSpiritualFitness();
      
      return newActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to add activity. Please try again.');
      return null;
    }
  };

  // Update an activity
  const updateActivity = async (id, updates) => {
    try {
      const updatedActivity = await activityOperations.update(id, updates);
      
      if (updatedActivity) {
        // Refresh the activities list
        await loadActivities();
        
        // Recalculate spiritual fitness
        recalculateSpiritualFitness();
      }
      
      return updatedActivity;
    } catch (error) {
      console.error('Error updating activity:', error);
      Alert.alert('Error', 'Failed to update activity. Please try again.');
      return null;
    }
  };

  // Delete an activity
  const deleteActivity = async (id) => {
    try {
      const success = await activityOperations.delete(id);
      
      if (success) {
        // Refresh the activities list
        await loadActivities();
        
        // Recalculate spiritual fitness
        recalculateSpiritualFitness();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert('Error', 'Failed to delete activity. Please try again.');
      return false;
    }
  };

  // Filter activities by type, date range, etc.
  const filterActivities = (filters = {}) => {
    if (!filters || Object.keys(filters).length === 0) {
      return activities;
    }

    return activities.filter(activity => {
      // Filter by type
      if (filters.type && activity.type !== filters.type) {
        return false;
      }

      // Filter by date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const activityDate = new Date(activity.date);
        if (activityDate < startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        const activityDate = new Date(activity.date);
        if (activityDate > endDate) {
          return false;
        }
      }

      // All filters passed
      return true;
    });
  };

  // Get activities by date
  const getActivitiesByDate = (date) => {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    return activities.filter(activity => {
      const activityDateStr = activity.date.split('T')[0];
      return activityDateStr === dateStr;
    });
  };

  // Context value
  const contextValue = {
    activities,
    isLoading,
    activityStats,
    activityTypes: ACTIVITY_TYPES,
    loadActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    filterActivities,
    getActivitiesByDate
  };

  return (
    <ActivitiesContext.Provider value={contextValue}>
      {children}
    </ActivitiesContext.Provider>
  );
};

// Custom hook to use the activities context
export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivitiesProvider');
  }
  return context;
};

export default ActivitiesContext;