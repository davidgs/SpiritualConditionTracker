/**
 * Fixed SQLite implementation for Capacitor
 * Designed to work properly with iOS and Android
 */

// Constants
const DB_NAME = 'spiritualTracker.db';

// Module state
let isInitialized = false;
let sqlite = null;

/**
 * Initialize the database
 */
async function initDatabase() {
  try {
    console.log('Initializing fixed SQLite module...');
    
    // Check for Capacitor
    if (!window.Capacitor?.Plugins?.CapacitorSQLite) {
      console.error('CapacitorSQLite plugin not available');
      return false;
    }
    
    sqlite = window.Capacitor.Plugins.CapacitorSQLite;
    
    // Create database connection
    await sqlite.createConnection({
      database: DB_NAME,
      encrypted: false,
      mode: 'no-encryption'
    });
    
    // Open database
    await sqlite.open({ database: DB_NAME });
    
    // Create tables
    await createTables();
    
    // Setup db interface for global access
    window.db = createDBInterface();
    window.dbInitialized = true;
    isInitialized = true;
    
    console.log('Fixed SQLite module initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing fixed SQLite:', error);
    return false;
  }
}

/**
 * Create database tables
 */
async function createTables() {
  // Create users table
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      sobrietyDate TEXT,
      homeGroups TEXT,
      sponsor_name TEXT,
      sponsor_lastName TEXT,
      sponsor_phone TEXT,
      sponsor_email TEXT,
      sponsor_sobrietyDate TEXT,
      sponsor_notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
  
  // Create activities table
  await execute(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT,
      duration INTEGER,
      date TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
  
  // Create meetings table
  await execute(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      name TEXT,
      days TEXT,
      time TEXT,
      address TEXT,
      notes TEXT,
      latitude REAL,
      longitude REAL,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
  
  // Create sponsor_contacts table - without NOT NULL constraints
  await execute(`
    CREATE TABLE IF NOT EXISTS sponsor_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      date TEXT,
      type TEXT,
      note TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
  
  // Create sponsor_contact_details table - without NOT NULL constraints
  await execute(`
    CREATE TABLE IF NOT EXISTS sponsor_contact_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contactId INTEGER,
      actionItem TEXT,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      dueDate TEXT,
      type TEXT,
      createdAt TEXT
    )
  `);
}

/**
 * Execute a SQL statement
 */
async function execute(statement, values = []) {
  if (!sqlite) {
    throw new Error('SQLite not initialized');
  }
  
  console.log('Executing SQL:', statement);
  if (values.length > 0) {
    console.log('With values:', values);
  }
  
  try {
    return await sqlite.execute({
      database: DB_NAME,
      statements: statement,
      values: values
    });
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

/**
 * Run a query
 */
async function query(statement, values = []) {
  if (!sqlite) {
    throw new Error('SQLite not initialized');
  }
  
  console.log('Running query:', statement);
  if (values.length > 0) {
    console.log('With values:', values);
  }
  
  try {
    const result = await sqlite.query({
      database: DB_NAME,
      statement: statement,
      values: values
    });
    
    return result.values || [];
  } catch (error) {
    console.error('Error running query:', error);
    return [];
  }
}

/**
 * Create database interface
 */
function createDBInterface() {
  return {
    // Get all items from a collection
    getAll: async (collection) => {
      return await query(`SELECT * FROM ${collection}`);
    },
    
    // Get item by ID
    getById: async (collection, id) => {
      const result = await query(
        `SELECT * FROM ${collection} WHERE id = ?`,
        [id]
      );
      return result.length > 0 ? result[0] : null;
    },
    
    // Add item to collection
    add: async (collection, item) => {
      // Generate ID if not provided
      if (!item.id) {
        item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add timestamps
      if (!item.createdAt) {
        item.createdAt = new Date().toISOString();
      }
      if (!item.updatedAt) {
        item.updatedAt = new Date().toISOString();
      }
      
      // Prepare statement
      const keys = Object.keys(item);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(key => item[key]);
      
      // Execute insert
      await execute(
        `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      return item;
    },
    
    // Update item in collection
    update: async (collection, id, updates) => {
      // Add updated timestamp
      updates.updatedAt = new Date().toISOString();
      
      // Prepare statement
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = [
        ...Object.keys(updates).map(key => updates[key]),
        id
      ];
      
      // Execute update
      await execute(
        `UPDATE ${collection} SET ${setClause} WHERE id = ?`,
        values
      );
      
      return { id, ...updates };
    },
    
    // Remove item from collection
    remove: async (collection, id) => {
      await execute(
        `DELETE FROM ${collection} WHERE id = ?`,
        [id]
      );
      return true;
    },
    
    // Query for contacts (specific implementation for sponsor contacts)
    findContacts: async (userId) => {
      return await query(
        'SELECT * FROM sponsor_contacts WHERE userId = ? ORDER BY date DESC',
        [userId]
      );
    },
    
    // Query for contact details
    findContactDetails: async (contactId) => {
      return await query(
        'SELECT * FROM sponsor_contact_details WHERE contactId = ?',
        [contactId]
      );
    },
    
    // Execute arbitrary SQL
    execute: execute,
    
    // Run arbitrary query
    query: query,
    
    // Calculate spiritual fitness score
    calculateSpiritualFitness: async () => {
      try {
        const activities = await query('SELECT * FROM activities');
        
        // Default score
        let score = 5;
        
        if (activities.length > 0) {
          // Define time period (30 days)
          const now = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          
          // Filter for recent activities
          const recentActivities = activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= thirtyDaysAgo && activityDate <= now;
          });
          
          // Add points based on activity count (2 points per activity, max 40)
          const activityPoints = Math.min(40, recentActivities.length * 2);
          
          // Track unique days with activities for consistency calculation
          const activityDays = new Set();
          recentActivities.forEach(activity => {
            if (activity.date) {
              const dayKey = new Date(activity.date).toISOString().split('T')[0];
              activityDays.add(dayKey);
            }
          });
          
          const daysWithActivities = activityDays.size;
          
          // Calculate consistency points (up to 40 points)
          const consistencyPercentage = daysWithActivities / 30;
          const consistencyPoints = Math.round(consistencyPercentage * 40);
          
          // Calculate final score (capped at 100)
          score = Math.min(100, score + activityPoints + consistencyPoints);
        }
        
        return score;
      } catch (error) {
        console.error('Error calculating spiritual fitness:', error);
        return 5; // Default score on error
      }
    },
    
    // Calculate spiritual fitness with timeframe
    calculateSpiritualFitnessWithTimeframe: async (days = 30) => {
      // This could have a more sophisticated implementation in the future
      return await calculateSpiritualFitness();
    }
  };
}

// Export the module
export default {
  initDatabase,
  execute,
  query
};