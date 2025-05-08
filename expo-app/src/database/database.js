/**
 * Database implementation for Spiritual Condition Tracker
 * 
 * This file uses platform-specific implementations based on the current platform:
 * - iOS: Uses expo-sqlite with platform-specific optimizations
 * - Android: Uses expo-sqlite with platform-specific optimizations
 * - Web: Uses IndexedDB with a SQL-like interface
 */
import { Platform } from 'react-native';

// Import platform-specific implementations
let dbImplementation;

// We use require instead of import for dynamic platform-specific imports
if (Platform.OS === 'ios') {
  dbImplementation = require('./platforms/database.ios');
} else if (Platform.OS === 'android') {
  dbImplementation = require('./platforms/database.android');
} else {
  // Fallback to web implementation
  dbImplementation = require('./platforms/database.web');
}

// Export the platform-specific functions
export const initializeDatabase = dbImplementation.initializeDatabase;
export const executeQuery = dbImplementation.executeQuery;
export const closeDatabase = dbImplementation.closeDatabase;
export const deleteDatabase = dbImplementation.deleteDatabase;

// Helper function to execute SQL with proper error handling
export const executeSql = async (sql, params = []) => {
  try {
    console.log(`Executing SQL: ${sql}`, params);
    const result = await executeQuery(sql, params);
    return result;
  } catch (error) {
    console.error(`SQL Error: ${sql}`, error);
    throw error;
  }
};

// Initialize the database tables
export const initializeTables = async () => {
  try {
    await initializeDatabase();
    
    // Create user settings table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY,
        sobriety_date TEXT,
        name TEXT,
        home_group TEXT,
        sponsor_id INTEGER,
        dark_mode INTEGER DEFAULT 0,
        reminder_minutes INTEGER DEFAULT 30,
        last_backup TEXT
      )
    `);
    
    // Create meetings table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        day_of_week INTEGER,
        time TEXT,
        type TEXT,
        notes TEXT,
        last_attended TEXT
      )
    `);
    
    // Create activity log table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_type TEXT NOT NULL,
        date TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        meeting_id INTEGER,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id)
      )
    `);
    
    // Create contacts table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        relationship TEXT,
        last_contact TEXT,
        notes TEXT
      )
    `);
    
    // Create messages table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        is_outgoing INTEGER DEFAULT 0,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (contact_id) REFERENCES contacts(id)
      )
    `);
    
    // Ensure we have at least one user settings row
    const userSettings = await executeSql('SELECT * FROM user_settings WHERE id = 1');
    if (userSettings.rows.length === 0) {
      await executeSql(`
        INSERT INTO user_settings (id, sobriety_date, reminder_minutes, dark_mode)
        VALUES (1, ?, 30, 0)
      `, [new Date().toISOString().split('T')[0]]);
    }
    
    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    return false;
  }
};

// Import the web-specific implementation for spiritual fitness calculation
import { calculateWebSpiritualFitness } from './platforms/webCalculation';
import { Platform } from 'react-native';

// Calculate spiritual fitness score based on activities
export const calculateSpiritualFitness = async (daysToConsider = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToConsider);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    // Special case for web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.indexedDB) {
      try {
        // Use the web-specific implementation that doesn't rely on GROUP BY
        console.log('Using web-specific spiritual fitness calculation');
        return await calculateWebSpiritualFitness(cutoffDateStr, window.indexedDB);
      } catch (webError) {
        console.error('Error in web-specific calculation:', webError);
        console.log('Falling back to standard implementation');
        // Continue with standard implementation as fallback
      }
    }
    
    // Standard implementation for native platforms
    try {
      // Query all activities in the time period
      const result = await executeSql(`
        SELECT activity_type, COUNT(*) as count, SUM(duration) as total_duration
        FROM activity_log
        WHERE date >= ?
        GROUP BY activity_type
      `, [cutoffDateStr]);
      
      // Point values for different activities
      const pointValues = {
        'meeting': 1.0,      // Attending a meeting: 1 point
        'step_work': 1.5,    // Step work: 1.5 points per hour
        'service': 2.0,      // Service work: 2 points per hour
        'reading': 1.0,      // Reading literature: 1 point per hour
        'meditation': 1.5,   // Meditation: 1.5 points per hour
        'prayer': 1.0,       // Prayer: 1 point per hour
        'sponsor_call': 1.0, // Call with sponsor: 1 point
        'sponsee_call': 1.5, // Call with sponsee: 1.5 points
        'gratitude': 0.5     // Gratitude list: 0.5 points
      };
      
      let totalPoints = 0;
      const activityPoints = {};
      
      // Calculate points for each activity type
      for (let i = 0; i < result.rows.length; i++) {
        const activity = result.rows.item(i);
        const { activity_type, count, total_duration } = activity;
        
        if (pointValues[activity_type]) {
          let points = 0;
          
          // Some activities are scored per occurrence, others by duration
          if (['meeting', 'sponsor_call', 'sponsee_call', 'gratitude'].includes(activity_type)) {
            points = count * pointValues[activity_type];
          } else {
            // Convert duration from minutes to hours and calculate points
            const hours = (total_duration || 0) / 60;
            points = hours * pointValues[activity_type];
          }
          
          activityPoints[activity_type] = points;
          totalPoints += points;
        }
      }
      
      // Normalize to a 0-100 scale with max being about 75 for very active
      // This means somebody doing everything daily would be around 100
      const normalizedScore = Math.min(100, totalPoints * (100 / 75));
      
      // Return score with 2 decimal precision
      return {
        score: parseFloat(normalizedScore.toFixed(2)),
        activities: activityPoints,
        pointValues: pointValues,
        daysConsidered: daysToConsider
      };
    } catch (sqlError) {
      console.error('Error executing SQL for spiritual fitness:', sqlError);
      
      // For web platform, provide a fallback with default values
      if (Platform.OS === 'web') {
        console.log('Using fallback values for spiritual fitness');
        return {
          score: 0,
          activities: {},
          pointValues: {},
          daysConsidered: daysToConsider,
          error: 'Unable to calculate (SQL error)'
        };
      }
      throw sqlError;
    }
  } catch (error) {
    console.error('Error calculating spiritual fitness:', error);
    return { 
      score: 0, 
      activities: {}, 
      pointValues: {},
      daysConsidered: daysToConsider,
      error: error.message 
    };
  }
};

// Get user's sobriety info
export const getSobrietyInfo = async () => {
  try {
    const result = await executeSql('SELECT sobriety_date FROM user_settings WHERE id = 1');
    if (result.rows.length === 0) {
      return { 
        days: 0, 
        years: 0.00,
        sobrietyDate: new Date().toISOString().split('T')[0]
      };
    }
    
    const sobrietyDate = new Date(result.rows.item(0).sobriety_date);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(today - sobrietyDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate years with 2 decimal places
    const years = diffDays / 365.25;
    
    return {
      days: diffDays,
      years: parseFloat(years.toFixed(2)),
      sobrietyDate: result.rows.item(0).sobriety_date
    };
  } catch (error) {
    console.error('Error calculating sobriety:', error);
    return { days: 0, years: 0.00, error: error.message };
  }
};