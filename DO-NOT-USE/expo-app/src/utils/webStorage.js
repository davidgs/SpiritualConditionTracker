/**
 * Helper utilities for web localStorage persistence
 */
import { Platform } from 'react-native';

const STORAGE_KEY = 'spiritualConditionTrackerData';

/**
 * Save the user profile to localStorage
 */
export const saveUserToLocalStorage = (user) => {
  if (Platform.OS !== 'web') return;
  
  try {
    // Get current data
    const storedData = localStorage.getItem(STORAGE_KEY);
    const data = storedData ? JSON.parse(storedData) : { users: [] };
    
    // Find user index
    const userIndex = data.users.findIndex(u => u.id === user.id);
    
    // Update or add user
    if (userIndex >= 0) {
      data.users[userIndex] = user;
    } else {
      data.users.push(user);
    }
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('User data saved to localStorage:', user.firstName);
    return true;
  } catch (e) {
    console.error('Failed to save user data to localStorage:', e);
    return false;
  }
};

/**
 * Load user profile from localStorage
 */
export const loadUserFromLocalStorage = (userId = '1') => {
  if (Platform.OS !== 'web') return null;
  
  try {
    // Get data from localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    
    const data = JSON.parse(storedData);
    
    // Find user by ID
    const user = data.users.find(u => u.id === userId);
    if (user) {
      console.log('User loaded from localStorage:', user.firstName);
    }
    return user;
  } catch (e) {
    console.error('Failed to load user data from localStorage:', e);
    return null;
  }
};

/**
 * Save activities to localStorage
 */
export const saveActivitiesToLocalStorage = (activities) => {
  if (Platform.OS !== 'web') return;
  
  try {
    // Get current data
    const storedData = localStorage.getItem(STORAGE_KEY);
    const data = storedData ? JSON.parse(storedData) : { activities: [] };
    
    // Save activities
    data.activities = activities;
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Activities saved to localStorage:', activities.length);
    return true;
  } catch (e) {
    console.error('Failed to save activities to localStorage:', e);
    return false;
  }
};

/**
 * Load activities from localStorage
 */
export const loadActivitiesFromLocalStorage = () => {
  if (Platform.OS !== 'web') return [];
  
  try {
    // Get data from localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    const data = JSON.parse(storedData);
    console.log('Activities loaded from localStorage:', (data.activities || []).length);
    return data.activities || [];
  } catch (e) {
    console.error('Failed to load activities from localStorage:', e);
    return [];
  }
};

/**
 * Clear all data from localStorage (for testing)
 */
export const clearLocalStorage = () => {
  if (Platform.OS !== 'web') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('localStorage cleared');
    return true;
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
    return false;
  }
};