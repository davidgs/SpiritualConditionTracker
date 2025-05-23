/**
 * Database initialization module
 * Provides a centralized way to initialize the database for the application
 */

import sqliteHelper from './capacitor-sqlite-helper';

// Default user record
const DEFAULT_USER = {
  id: 'user_default',
  name: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  sobrietyDate: new Date().toISOString(),
  homeGroups: JSON.stringify([]),
  privacySettings: JSON.stringify({
    shareLocation: false,
    shareProfile: false,
    allowNotifications: true
  }),
  preferences: JSON.stringify({
    darkMode: false,
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    distanceUnit: 'miles'
  }),
  sponsor_name: '',
  sponsor_lastName: '',
  sponsor_phone: '',
  sponsor_email: '',
  sponsor_sobrietyDate: '',
  sponsor_notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Initialize the database
 * This will ensure the database is created and populated with initial data if needed
 */
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Initialize SQLite
    const initialized = await sqliteHelper.initialize();
    if (!initialized) {
      console.error('Failed to initialize SQLite database');
      return false;
    }
    
    // Check if user exists, create default if not
    const users = await sqliteHelper.query('SELECT * FROM users LIMIT 1');
    if (!users || users.length === 0) {
      console.log('Creating default user...');
      await sqliteHelper.insert('users', DEFAULT_USER);
    }
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

/**
 * Get current user
 * Returns the default user (currently only supporting single-user mode)
 */
export async function getCurrentUser() {
  try {
    const users = await sqliteHelper.query('SELECT * FROM users LIMIT 1');
    if (users && users.length > 0) {
      return users[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Export the SQLite helper for direct use
export { sqliteHelper };

// Export a default object with all the functions
export default {
  initDatabase,
  getCurrentUser,
  sqliteHelper
};