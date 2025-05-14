/**
 * Database utility functions for Spiritual Condition Tracker
 * This file provides an interface to interact with the global Database object
 */

// Initialize database
export const initDatabase = async () => {
  console.log('Initializing database from utils/database.js');
  
  // Check if the database module is loaded
  if (!window.Database) {
    console.error('Database module not loaded');
    throw new Error('Database module not loaded');
  }
  
  try {
    // Initialize the database
    await window.Database.initDatabase();
    
    // Check if we have any users
    const users = window.Database.userOperations.getAll();
    
    if (!users || users.length === 0) {
      console.log('Creating default user...');
      // Create a default user
      window.Database.userOperations.create({
        name: 'Test User',
        sobrietyDate: '2020-01-01',
        homeGroup: 'Thursday Night Group',
        phone: '555-123-4567',
        email: 'test@example.com',
        privacySettings: {
          shareLocation: false,
          shareActivities: true
        }
      });
    }
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// User operations
export const userOperations = {
  getAll: () => {
    return window.Database?.userOperations?.getAll() || [];
  },
  
  getById: (id) => {
    return window.Database?.userOperations?.getById(id);
  },
  
  create: (userData) => {
    return window.Database?.userOperations?.create(userData);
  },
  
  update: (id, updates) => {
    return window.Database?.userOperations?.update(id, updates);
  }
};

// Activity operations
export const activityOperations = {
  getAll: (filters = {}) => {
    return window.Database?.activityOperations?.getAll(filters) || [];
  },
  
  getById: (id) => {
    return window.Database?.activityOperations?.getById(id);
  },
  
  getByUserId: (userId) => {
    return window.Database?.activityOperations?.getAll({ userId }) || [];
  },
  
  create: (activityData) => {
    return window.Database?.activityOperations?.create(activityData);
  },
  
  update: (id, updates) => {
    return window.Database?.activityOperations?.update(id, updates);
  },
  
  delete: (id) => {
    return window.Database?.activityOperations?.delete(id);
  }
};

// Spiritual fitness calculations
export const spiritualFitnessOperations = {
  calculate: (activities) => {
    return window.Database?.spiritualFitnessOperations?.calculate(activities) || { score: 0 };
  },
  
  calculateAndSave: (userId, activities) => {
    return window.Database?.spiritualFitnessOperations?.calculateAndSave(userId, activities) || { score: 0 };
  }
};

// Meeting operations
export const meetingOperations = {
  getAll: (filters = {}) => {
    return window.Database?.meetingOperations?.getAll(filters) || 
           window.db?.getAll('meetings') || [];
  },
  
  getById: (id) => {
    return window.Database?.meetingOperations?.getById(id) || 
           window.db?.getById('meetings', id);
  },
  
  create: (meetingData) => {
    return window.Database?.meetingOperations?.create(meetingData) || 
           window.db?.add('meetings', meetingData);
  },
  
  update: (id, updates) => {
    return window.Database?.meetingOperations?.update(id, updates) || 
           window.db?.update('meetings', id, updates);
  },
  
  delete: (id) => {
    return window.Database?.meetingOperations?.delete(id) || 
           window.db?.remove('meetings', id);
  }
};

// Export the full database interface
export default {
  initDatabase,
  userOperations,
  activityOperations,
  spiritualFitnessOperations,
  meetingOperations
};