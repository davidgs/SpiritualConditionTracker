import React, { createContext, useState, useEffect, useContext } from 'react';
import { userOperations } from '../utils/database';

// Create a context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user data on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userOperations.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Update user data in the database
  const updateUser = async (userData) => {
    try {
      // Merge with existing user data
      const updatedUser = { ...user, ...userData };
      
      // Save to database
      await userOperations.saveUser(updatedUser);
      
      // Update state
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };
  
  // Update user location
  const updateLocation = async (latitude, longitude) => {
    if (!user || !user.id) return false;
    
    try {
      await userOperations.updateUserLocation(user.id, latitude, longitude);
      setUser(prev => ({ ...prev, latitude, longitude }));
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  };
  
  // Update user discoverability
  const updateDiscoverability = async (discoverable) => {
    if (!user || !user.id) return false;
    
    try {
      await userOperations.updateDiscoverability(user.id, discoverable);
      setUser(prev => ({ ...prev, discoverable }));
      return true;
    } catch (error) {
      console.error('Error updating discoverability:', error);
      return false;
    }
  };
  
  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading,
        updateUser,
        updateLocation,
        updateDiscoverability
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};