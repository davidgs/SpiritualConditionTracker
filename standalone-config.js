/**
 * Configuration for a standalone React Native app with no backend dependencies
 * This file configures the app to use local SQLite storage instead of relying on a server
 */

// App configuration for standalone mode
export const APP_CONFIG = {
  // Set to true for standalone mode with no server dependencies
  standaloneMode: true,
  
  // Local SQLite database configuration
  database: {
    name: 'aarecovery.db',
    location: 'default',
    version: 1
  },
  
  // Default settings
  defaults: {
    syncFrequency: 0, // 0 = no sync (offline only)
    notificationLeadTime: 30, // minutes
    sobrietyDateTracking: true,
    privacyMode: true
  },
  
  // Feature flags for controlling functionality
  features: {
    // Core features
    sobrietyTracking: true,
    spiritualFitness: true,
    meetingManagement: true,
    
    // Optional/advanced features
    proximityDiscovery: true,
    bluetoothDiscovery: true,
    calendarIntegration: true,
    sponsorSponseeLinking: true
  }
};

// Database schema for SQLite
export const DB_SCHEMA = {
  // Users table for storing user profile information
  users: {
    name: 'users',
    columns: {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT',
      email: 'TEXT',
      phone: 'TEXT',
      sobrietyDate: 'TEXT',
      homeGroup: 'TEXT',
      profileSettings: 'TEXT',
      createdAt: 'TEXT',
      updatedAt: 'TEXT'
    }
  },
  
  // Activities table for storing user activities (meetings, prayer, etc.)
  activities: {
    name: 'activities',
    columns: {
      id: 'TEXT PRIMARY KEY',
      userId: 'TEXT',
      type: 'TEXT',
      date: 'TEXT',
      duration: 'INTEGER',
      notes: 'TEXT',
      createdAt: 'TEXT',
      FOREIGN_KEY: '(userId) REFERENCES users (id)'
    }
  },
  
  // Meetings table for storing user-defined meetings
  meetings: {
    name: 'meetings',
    columns: {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT',
      location: 'TEXT',
      address: 'TEXT',
      latitude: 'REAL',
      longitude: 'REAL',
      day: 'TEXT',
      time: 'TEXT',
      type: 'TEXT',
      notes: 'TEXT',
      isShared: 'INTEGER',
      createdBy: 'TEXT',
      createdAt: 'TEXT',
      updatedAt: 'TEXT'
    }
  },
  
  // Meeting attendance for tracking which meetings the user attended
  meetingAttendance: {
    name: 'meetingAttendance',
    columns: {
      id: 'TEXT PRIMARY KEY',
      userId: 'TEXT',
      meetingId: 'TEXT',
      date: 'TEXT',
      notes: 'TEXT',
      FOREIGN_KEY1: '(userId) REFERENCES users (id)',
      FOREIGN_KEY2: '(meetingId) REFERENCES meetings (id)'
    }
  },
  
  // Spiritual fitness tracking
  spiritualFitness: {
    name: 'spiritualFitness',
    columns: {
      id: 'TEXT PRIMARY KEY',
      userId: 'TEXT',
      date: 'TEXT',
      score: 'REAL',
      breakdown: 'TEXT',
      FOREIGN_KEY: '(userId) REFERENCES users (id)'
    }
  },
  
  // Calendar reminders for meetings
  calendarReminders: {
    name: 'calendarReminders',
    columns: {
      id: 'TEXT PRIMARY KEY',
      meetingId: 'TEXT',
      calendarEventId: 'TEXT',
      reminderTime: 'INTEGER',
      isActive: 'INTEGER',
      FOREIGN_KEY: '(meetingId) REFERENCES meetings (id)'
    }
  },
  
  // Nearby members discovered
  discoveredMembers: {
    name: 'discoveredMembers',
    columns: {
      id: 'TEXT PRIMARY KEY',
      deviceId: 'TEXT',
      name: 'TEXT',
      discoveryMethod: 'TEXT',
      firstDiscovered: 'TEXT',
      lastSeen: 'TEXT',
      meetCount: 'INTEGER'
    }
  }
};

// Helper function to generate SQL for creating tables
export const generateCreateTableSQL = (table) => {
  const columnsSQL = Object.entries(table.columns)
    .filter(([key]) => !key.startsWith('FOREIGN_KEY'))
    .map(([key, type]) => `${key} ${type}`)
    .join(', ');
    
  const foreignKeysSQL = Object.entries(table.columns)
    .filter(([key]) => key.startsWith('FOREIGN_KEY'))
    .map(([_, constraint]) => `FOREIGN KEY ${constraint}`)
    .join(', ');
    
  const finalSQL = foreignKeysSQL 
    ? `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsSQL}, ${foreignKeysSQL});`
    : `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsSQL});`;
    
  return finalSQL;
};