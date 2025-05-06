import React, { createContext, useState, useContext } from 'react';
import { getUserActivities, addUserActivity, deleteUserActivity } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

// Define activity types with descriptions
export const ACTIVITY_TYPES = {
  MEETING: {
    label: 'Meeting',
    description: 'Attendance at an AA meeting, whether in-person or virtual',
    weight: 1.0,
  },
  PRAYER: {
    label: 'Prayer & Meditation',
    description: 'Time spent in prayer, meditation, or mindfulness practice',
    weight: 1.0,
  },
  LITERATURE: {
    label: 'AA Literature',
    description: 'Reading AA literature, Big Book, 12&12, or daily reflections',
    weight: 0.8,
  },
  SPONSOR: {
    label: 'Sponsor Contact',
    description: 'Time spent with your sponsor or discussing recovery',
    weight: 0.9,
  },
  SPONSEE: {
    label: 'Sponsee Contact',
    description: 'Time spent working with someone you sponsor',
    weight: 1.1,
  },
  SERVICE: {
    label: 'Service Work',
    description: 'Service to others or AA service commitments',
    weight: 1.2,
  },
  STEP_WORK: {
    label: 'Step Work',
    description: 'Formal work on any of the 12 steps',
    weight: 1.0,
  },
};

const ActivitiesContext = createContext();

export const ActivitiesProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadActivities = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch activities from database
      const userActivities = await getUserActivities(userId);
      
      // If no activities found and this is first run, let's add some default ones for demo purposes
      if (userActivities.length === 0) {
        const defaultActivities = [
          {
            id: uuidv4(),
            userId: userId,
            type: 'MEETING',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 60,
            notes: 'Serenity Group discussion meeting',
          },
          {
            id: uuidv4(),
            userId: userId,
            type: 'PRAYER',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 15,
            notes: 'Morning meditation',
          },
          {
            id: uuidv4(),
            userId: userId,
            type: 'LITERATURE',
            date: new Date().toISOString(),
            duration: 30,
            notes: 'Big Book chapter 5',
          },
        ];
        
        // Add default activities to database
        for (const activity of defaultActivities) {
          await addUserActivity(activity);
        }
        
        setActivities(defaultActivities);
      } else {
        setActivities(userActivities);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load activities');
      setLoading(false);
      console.error('Error loading activities:', err);
    }
  };

  const addActivity = async (activity) => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare new activity with UUID
      const newActivity = {
        id: uuidv4(),
        ...activity,
      };
      
      // Save to database
      await addUserActivity(newActivity);
      
      // Update state
      setActivities([...activities, newActivity]);
      setLoading(false);
      return newActivity;
    } catch (err) {
      setError('Failed to add activity');
      setLoading(false);
      console.error('Error adding activity:', err);
      return null;
    }
  };

  const updateActivity = async (activityId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would update in a database
      const updatedActivities = activities.map(activity => 
        activity.id === activityId ? { ...activity, ...updates } : activity
      );
      
      setActivities(updatedActivities);
      setLoading(false);
      return updatedActivities.find(a => a.id === activityId);
    } catch (err) {
      setError('Failed to update activity');
      setLoading(false);
      console.error('Error updating activity:', err);
      return null;
    }
  };

  const deleteActivity = async (activityId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete from database
      const success = await deleteUserActivity(activityId);
      
      if (success) {
        // Update local state
        const updatedActivities = activities.filter(activity => activity.id !== activityId);
        setActivities(updatedActivities);
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      setError('Failed to delete activity');
      setLoading(false);
      console.error('Error deleting activity:', err);
      return false;
    }
  };

  const getRecentActivities = (limit = 5) => {
    return [...activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  const getActivitiesByType = (type) => {
    return activities.filter(activity => activity.type === type);
  };

  const getActivitiesByDateRange = (startDate, endDate) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        loading,
        error,
        loadActivities,
        addActivity,
        updateActivity,
        deleteActivity,
        getRecentActivities,
        getActivitiesByType,
        getActivitiesByDateRange,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => useContext(ActivitiesContext);