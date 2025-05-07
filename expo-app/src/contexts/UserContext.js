/**
 * UserContext.js - Context for user data management
 * 
 * This context provides access to user data, sobriety information,
 * spiritual fitness calculations, and other user-related functionality.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { 
  initializeTables, 
  executeSql, 
  getSobrietyInfo,
  calculateSpiritualFitness
} from '../database/database';

// Create context
const UserContext = createContext();

// UserProvider component
export const UserProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [sobrietyInfo, setSobrietyInfo] = useState({ days: 0, years: 0 });
  const [spiritualFitness, setSpiritualFitness] = useState({ score: 0, activities: {} });
  const [error, setError] = useState(null);

  // Initialize the database and load user data
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        
        // Initialize database tables
        const initialized = await initializeTables();
        if (!initialized) {
          throw new Error('Failed to initialize database tables');
        }
        
        setIsInitialized(true);
        
        // Load user data
        await loadUserData();
        
        // Load sobriety information
        await loadSobrietyInfo();
        
        // Load spiritual fitness
        await loadSpiritualFitness();
        
        setError(null);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err.message);
        
        // Show error to user
        Alert.alert(
          'Database Error',
          'There was an error initializing the database. Some features may not work correctly.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Load user data from database
  const loadUserData = async () => {
    try {
      const result = await executeSql('SELECT * FROM user_settings WHERE id = 1');
      
      if (result.rows.length > 0) {
        setUserData(result.rows.item(0));
      } else {
        // This shouldn't happen, but just in case
        console.warn('No user data found, initializing with defaults');
        await executeSql(
          'INSERT INTO user_settings (id, sobriety_date, reminder_minutes, dark_mode) VALUES (1, ?, 30, 0)',
          [new Date().toISOString().split('T')[0]]
        );
        
        const newResult = await executeSql('SELECT * FROM user_settings WHERE id = 1');
        setUserData(newResult.rows.item(0));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Error loading user data: ' + err.message);
    }
  };

  // Load sobriety information
  const loadSobrietyInfo = async () => {
    try {
      const info = await getSobrietyInfo();
      setSobrietyInfo(info);
    } catch (err) {
      console.error('Error loading sobriety info:', err);
      setError('Error loading sobriety info: ' + err.message);
    }
  };

  // Load spiritual fitness score
  const loadSpiritualFitness = async (daysToConsider = 30) => {
    try {
      const fitness = await calculateSpiritualFitness(daysToConsider);
      setSpiritualFitness(fitness);
    } catch (err) {
      console.error('Error calculating spiritual fitness:', err);
      setError('Error calculating spiritual fitness: ' + err.message);
    }
  };

  // Update user data
  const updateUserData = async (updates) => {
    try {
      // Build SQL update statement
      const updateFields = Object.keys(updates)
        .map(field => `${field} = ?`)
        .join(', ');
      
      const updateValues = Object.values(updates);
      
      // Execute update
      await executeSql(
        `UPDATE user_settings SET ${updateFields} WHERE id = 1`,
        updateValues
      );
      
      // Reload data
      await loadUserData();
      
      // If sobriety date was updated, reload sobriety info
      if ('sobriety_date' in updates) {
        await loadSobrietyInfo();
      }
      
      return true;
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Error updating user data: ' + err.message);
      return false;
    }
  };

  // Set sobriety date
  const setSobrietyDate = async (date) => {
    try {
      // Format the date as YYYY-MM-DD
      const formattedDate = typeof date === 'string' 
        ? date 
        : date.toISOString().split('T')[0];
      
      // Update the sobriety date
      const success = await updateUserData({ sobriety_date: formattedDate });
      
      if (success) {
        // Reload sobriety info
        await loadSobrietyInfo();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error setting sobriety date:', err);
      setError('Error setting sobriety date: ' + err.message);
      return false;
    }
  };

  // Log a new activity
  const logActivity = async (activityType, date, duration, notes = null, meetingId = null) => {
    try {
      // Format the date as YYYY-MM-DD
      const formattedDate = typeof date === 'string' 
        ? date 
        : date.toISOString().split('T')[0];
      
      // Insert the new activity
      await executeSql(
        `INSERT INTO activity_log (activity_type, date, duration, notes, meeting_id)
         VALUES (?, ?, ?, ?, ?)`,
        [activityType, formattedDate, duration, notes, meetingId]
      );
      
      // Recalculate spiritual fitness
      await loadSpiritualFitness();
      
      return true;
    } catch (err) {
      console.error('Error logging activity:', err);
      setError('Error logging activity: ' + err.message);
      return false;
    }
  };

  // Get recent activities
  const getRecentActivities = async (limit = 10) => {
    try {
      const result = await executeSql(
        `SELECT * FROM activity_log 
         ORDER BY date DESC, id DESC 
         LIMIT ?`,
        [limit]
      );
      
      // Convert result to array for easier use
      const activities = [];
      for (let i = 0; i < result.rows.length; i++) {
        activities.push(result.rows.item(i));
      }
      
      return activities;
    } catch (err) {
      console.error('Error getting recent activities:', err);
      setError('Error getting recent activities: ' + err.message);
      return [];
    }
  };

  // Context value
  const contextValue = {
    isInitialized,
    isLoading,
    userData,
    sobrietyInfo,
    spiritualFitness,
    error,
    loadUserData,
    loadSobrietyInfo,
    loadSpiritualFitness,
    updateUserData,
    setSobrietyDate,
    logActivity,
    getRecentActivities
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;