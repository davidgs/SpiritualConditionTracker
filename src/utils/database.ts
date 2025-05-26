/**
 * Database utility functions for Spiritual Condition Tracker
 * This file provides an interface to interact with the global Database object
 */

// Initialize database
export const initDatabase = async () => {
  console.log('[ database.js ] Initializing database from utils/database.js');
  
  // Check if the database module is loaded
  if (!window.Database) {
    console.error('[ database.js ] Database module not loaded');
    throw new Error('Database module not loaded');
  }
  
  try {
    // Initialize the database
    await window.Database.initDatabase();
    
    // Check if we have any users
    const users = window.Database.userOperations.getAll();
    
    if (!users || users.length === 0) {
      console.log('[ database.js ] Creating default user...');
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
    
    console.log('[ database.js ] Database initialization complete');
    return true;
  } catch (error) {
    console.error('[ database.js ] Error initializing database:', error);
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

// Connections operations
export const connectionOperations = {
  getAll: (filters = {}) => {
    return window.Database?.connectionOperations?.getAll(filters) || 
           window.db?.getAll('connections') || [];
  },
  
  getById: (id) => {
    return window.Database?.connectionOperations?.getById(id) || 
           window.db?.getById('connections', id);
  },

  getByUserId: (userId) => {
    const connections = window.Database?.connectionOperations?.getAll() || 
                        window.db?.getAll('connections') || [];
    return connections.filter(c => c.userId === userId || c.contactId === userId);
  },
  
  create: (connectionData) => {
    return window.Database?.connectionOperations?.create(connectionData) || 
           window.db?.add('connections', connectionData);
  },
  
  update: (id, updates) => {
    return window.Database?.connectionOperations?.update(id, updates) || 
           window.db?.update('connections', id, updates);
  },
  
  delete: (id) => {
    return window.Database?.connectionOperations?.delete(id) || 
           window.db?.remove('connections', id);
  }
};

// Messages operations
export const messageOperations = {
  getAll: (filters = {}) => {
    return window.Database?.messageOperations?.getAll(filters) || 
           window.db?.getAll('messages') || [];
  },
  
  getById: (id) => {
    return window.Database?.messageOperations?.getById(id) || 
           window.db?.getById('messages', id);
  },
  
  // Get messages for a specific conversation
  getByConversationId: (conversationId) => {
    const messages = window.Database?.messageOperations?.getAll() || 
                     window.db?.getAll('messages') || [];
    return messages.filter(m => m.conversationId === conversationId)
                   .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
  
  create: (messageData) => {
    return window.Database?.messageOperations?.create(messageData) || 
           window.db?.add('messages', messageData);
  },
  
  update: (id, updates) => {
    return window.Database?.messageOperations?.update(id, updates) || 
           window.db?.update('messages', id, updates);
  },
  
  delete: (id) => {
    return window.Database?.messageOperations?.delete(id) || 
           window.db?.remove('messages', id);
  }
};

// Export the full database interface
export default {
  initDatabase,
  userOperations,
  activityOperations,
  spiritualFitnessOperations,
  meetingOperations,
  connectionOperations,
  messageOperations
};