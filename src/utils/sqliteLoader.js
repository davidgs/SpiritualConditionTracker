/**
 * SQLite database loader optimized for Capacitor
 * Provides cross-platform SQLite access with special handling for iOS
 */

// Default database name for consistency
const DB_NAME = 'spiritualTracker.db';

/**
 * Initialize SQLite database
 * @returns {Promise<object>} Database connection object
 */
async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js ] Initializing SQLite database via Capacitor...');

  try {
    // First, check if Capacitor is available
    if (!window.Capacitor) {
      throw new Error('Capacitor is not available in this environment');
    }

    // Detect platform information for specialized handling
    const platform = window.Capacitor.getPlatform?.() || 'unknown';
    console.log('Capacitor platform detected:', platform);
    console.log('Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));
    
    // Special handling for iOS which has different plugin structure
    const isIOS = platform === 'ios';
    if (isIOS) {
      console.log('iOS environment detected - using iOS-specific database setup');
    }

    // Get the SQLite plugin
    const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
    if (!sqlitePlugin) {
      throw new Error('CapacitorSQLite plugin not available - ensure the plugin is properly installed');
    }

    console.log('Found CapacitorSQLite plugin:', !!sqlitePlugin);

    // Step 1: Create connection
    try {
      await sqlitePlugin.createConnection({
        database: DB_NAME,
        encrypted: false,
        mode: 'no-encryption'
      });
      console.log('Database connection created successfully');
    } catch (error) {
      console.error('Error creating database connection:', error);
      throw new Error(`Database connection failed: ${error.message || JSON.stringify(error)}`);
    }

    // Step 2: Open the database
    try {
      await sqlitePlugin.open({ database: DB_NAME });
      console.log('Database opened successfully');
    } catch (error) {
      console.error('Error opening database:', error);
      throw new Error(`Database open failed: ${error.message || JSON.stringify(error)}`);
    }

    // Step 3: Create tables
    try {
      await setupTables(sqlitePlugin);
      console.log('Database tables created/verified successfully');
    } catch (error) {
      console.error('Error setting up database tables:', error);
      throw new Error(`Table setup failed: ${error.message || JSON.stringify(error)}`);
    }

    // Step 4: Create global database interface
    setupGlobalDB(sqlitePlugin);
    console.log('Database setup complete, global db interface ready');

    return sqlitePlugin;
  } catch (error) {
    console.error('Error initializing Capacitor SQLite:', error);
    console.error('Detailed error info:', JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack
    }, null, 2));
    
    throw error;
  }
}

/**
 * Create database tables
 * @param {Object} sqlite - SQLite plugin instance
 */
async function setupTables(sqlite) {
  // Create users table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        lastName TEXT,
        phoneNumber TEXT,
        email TEXT,
        sobrietyDate TEXT,
        homeGroups TEXT,
        privacySettings TEXT,
        preferences TEXT,
        sponsor TEXT,
        sponsees TEXT,
        messagingKeys TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('Users table created');

  // Create activities table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        duration INTEGER,
        date TEXT,
        notes TEXT,
        meeting TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('Activities table created');

  // Create meetings table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        days TEXT,
        time TEXT,
        schedule TEXT,
        address TEXT,
        locationName TEXT,
        online TEXT,
        phoneNumber TEXT,
        notes TEXT,
        latitude REAL,
        longitude REAL,
        types TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('Meetings table created');

  // Create messages table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT,
        recipient TEXT,
        content TEXT,
        encrypted INTEGER,
        read INTEGER,
        timestamp TEXT,
        deleted INTEGER
      )
    `
  });
  console.log('Messages table created');

  // Create preferences table for app settings 
  // Note: 'key' is a reserved word in some SQLite implementations
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS preferences (
        pref_key TEXT PRIMARY KEY,
        value TEXT
      )
    `
  });
  console.log('Preferences table created');
}

/**
 * Set up global database object
 * @param {Object} sqlite - SQLite plugin instance 
 */
function setupGlobalDB(sqlite) {
  // Set the global initialization flag to indicate database is ready
  window.dbInitialized = true;
  
  window.db = {
    /**
     * Get all items from a collection
     * @param {string} collection - Collection name
     * @returns {Promise<Array>} Collection items
     */
    getAll: async function(collection) {
      try {
        // iOS has specific format requirements
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });
        
        const rows = result.values || [];
        
        // Parse JSON fields
        if (collection === 'users') {
          for (const row of rows) {
            if (row.privacySettings && typeof row.privacySettings === 'string') {
              try { row.privacySettings = JSON.parse(row.privacySettings); } catch (e) {}
            }
            if (row.preferences && typeof row.preferences === 'string') {
              try { row.preferences = JSON.parse(row.preferences); } catch (e) {}
            }
            if (row.homeGroups && typeof row.homeGroups === 'string') {
              try { row.homeGroups = JSON.parse(row.homeGroups); } catch (e) {}
            }
            if (row.sponsees && typeof row.sponsees === 'string') {
              try { row.sponsees = JSON.parse(row.sponsees); } catch (e) {}
            }
            if (row.messagingKeys && typeof row.messagingKeys === 'string') {
              try { row.messagingKeys = JSON.parse(row.messagingKeys); } catch (e) {}
            }
          }
        }
        
        return rows;
      } catch (error) {
        console.error(`Error getting items from ${collection}:`, error);
        return [];
      }
    },
    
    /**
     * Get item by ID
     * @param {string} collection - Collection name
     * @param {string} id - Item ID
     * @returns {Promise<Object|null>} Found item or null
     */
    getById: async function(collection, id) {
      try {
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection} WHERE id = ?`,
          values: [id]
        });
        
        if (!result.values || result.values.length === 0) {
          return null;
        }
        
        const item = result.values[0];
        
        // Parse JSON fields
        if (collection === 'users') {
          if (item.privacySettings && typeof item.privacySettings === 'string') {
            try { item.privacySettings = JSON.parse(item.privacySettings); } catch (e) {}
          }
          if (item.preferences && typeof item.preferences === 'string') {
            try { item.preferences = JSON.parse(item.preferences); } catch (e) {}
          }
          if (item.homeGroups && typeof item.homeGroups === 'string') {
            try { item.homeGroups = JSON.parse(item.homeGroups); } catch (e) {}
          }
          if (item.sponsees && typeof item.sponsees === 'string') {
            try { item.sponsees = JSON.parse(item.sponsees); } catch (e) {}
          }
          if (item.messagingKeys && typeof item.messagingKeys === 'string') {
            try { item.messagingKeys = JSON.parse(item.messagingKeys); } catch (e) {}
          }
        }
        
        return item;
      } catch (error) {
        console.error(`Error getting item from ${collection} by ID ${id}:`, error);
        return null;
      }
    },
    
    /**
     * Add item to collection
     * @param {string} collection - Collection name
     * @param {Object} item - Item to add
     * @returns {Promise<Object>} Added item
     */
    add: async function(collection, item) {
      try {
        // Ensure item has an ID
        if (!item.id) {
          item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Add timestamps
        if (!item.createdAt) {
          item.createdAt = new Date().toISOString();
        }
        item.updatedAt = new Date().toISOString();
        
        // Build query parts
        const fields = Object.keys(item);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => {
          const value = item[field];
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        });
        
        // Execute insert
        const sql = `INSERT INTO ${collection} (${fields.join(', ')}) VALUES (${placeholders})`;
        await sqlite.execute({
          database: DB_NAME,
          statements: sql,
          values: values
        });
        
        return item;
      } catch (error) {
        console.error(`Error adding item to ${collection}:`, error);
        throw error;
      }
    },
    
    /**
     * Update item in collection
     * @param {string} collection - Collection name
     * @param {string} id - Item ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated item or null
     */
    update: async function(collection, id, updates) {
      try {
        // Get current item
        const currentItem = await this.getById(collection, id);
        if (!currentItem) {
          console.error(`Cannot update non-existent item with ID ${id} in ${collection}`);
          return null;
        }
        
        // Add updated timestamp
        updates.updatedAt = new Date().toISOString();
        
        // Build updated item
        const updatedItem = { ...currentItem, ...updates };
        
        // Build query parts
        const setClause = Object.keys(updates)
          .map(field => `${field} = ?`)
          .join(', ');
        
        const values = Object.keys(updates).map(field => {
          const value = updates[field];
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        });
        
        // Add ID to values
        values.push(id);
        
        // Execute update
        const sql = `UPDATE ${collection} SET ${setClause} WHERE id = ?`;
        await sqlite.execute({
          database: DB_NAME,
          statements: sql,
          values: values
        });
        
        return updatedItem;
      } catch (error) {
        console.error(`Error updating item ${id} in ${collection}:`, error);
        throw error;
      }
    },
    
    /**
     * Remove item from collection
     * @param {string} collection - Collection name
     * @param {string} id - Item ID
     * @returns {Promise<boolean>} Success indicator
     */
    remove: async function(collection, id) {
      try {
        await sqlite.execute({
          database: DB_NAME,
          statements: `DELETE FROM ${collection} WHERE id = ?`,
          values: [id]
        });
        return true;
      } catch (error) {
        console.error(`Error removing item ${id} from ${collection}:`, error);
        return false;
      }
    },
    
    /**
     * Query collection with filters
     * @param {string} collection - Collection name
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Array>} Filtered items
     */
    query: async function(collection, filters) {
      try {
        const allItems = await this.getAll(collection);
        return allItems.filter(item => {
          for (const [key, value] of Object.entries(filters)) {
            if (item[key] !== value) {
              return false;
            }
          }
          return true;
        });
      } catch (error) {
        console.error(`Error querying ${collection}:`, error);
        return [];
      }
    },
    
    /**
     * Get preference value
     * @param {string} key - Preference key
     * @param {any} defaultValue - Default value if not found
     * @returns {Promise<any>} Preference value
     */
    getPreference: async function(key, defaultValue = null) {
      try {
        const result = await sqlite.query({
          database: DB_NAME,
          statement: 'SELECT value FROM preferences WHERE pref_key = ?',
          values: [key]
        });
        
        if (!result.values || result.values.length === 0) {
          return defaultValue;
        }
        
        const value = result.values[0].value;
        
        // Try to parse as JSON if it looks like JSON
        if (value && (value.startsWith('{') || value.startsWith('[') || 
            value === 'true' || value === 'false' || !isNaN(value))) {
          try {
            return JSON.parse(value);
          } catch (e) {
            // Not valid JSON, return as is
            return value;
          }
        }
        
        return value;
      } catch (error) {
        console.error(`Error getting preference ${key}:`, error);
        return defaultValue;
      }
    },
    
    /**
     * Set preference value
     * @param {string} key - Preference key
     * @param {any} value - Value to set
     * @returns {Promise<boolean>} Success indicator
     */
    setPreference: async function(key, value) {
      try {
        // Convert non-string values to JSON
        let storedValue = value;
        if (typeof value !== 'string' && value !== null) {
          storedValue = JSON.stringify(value);
        }
        
        // Check if preference exists
        const existing = await this.getPreference(key, undefined);
        
        if (existing === undefined) {
          // Insert new preference
          await sqlite.execute({
            database: DB_NAME,
            statements: 'INSERT INTO preferences (pref_key, value) VALUES (?, ?)',
            values: [key, storedValue]
          });
        } else {
          // Update existing preference
          await sqlite.execute({
            database: DB_NAME,
            statements: 'UPDATE preferences SET value = ? WHERE pref_key = ?',
            values: [storedValue, key]
          });
        }
        
        return true;
      } catch (error) {
        console.error(`Error setting preference ${key}:`, error);
        return false;
      }
    },
    
    /**
     * Calculate sobriety days based on sobriety date
     * @param {string} sobrietyDate - ISO date string
     * @returns {number} Days sober
     */
    calculateSobrietyDays: function(sobrietyDate) {
      if (!sobrietyDate) return 0;
      
      const now = new Date();
      const sobrietyDateObj = new Date(sobrietyDate);
      
      // Calculate difference in milliseconds
      const diffMs = now - sobrietyDateObj;
      
      // Convert to days and round down
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    },
    
    /**
     * Calculate sobriety years with decimal precision
     * @param {string} sobrietyDate - ISO date string
     * @param {number} decimalPlaces - Decimal places for result
     * @returns {number} Years sober
     */
    calculateSobrietyYears: function(sobrietyDate, decimalPlaces = 2) {
      if (!sobrietyDate) return 0;
      
      const days = this.calculateSobrietyDays(sobrietyDate);
      const years = days / 365.25; // Account for leap years
      
      return parseFloat(years.toFixed(decimalPlaces));
    },
    
    /**
     * Calculate spiritual fitness score based on recent activities
     * @param {Array} activities - Activity data
     * @returns {number} Fitness score (0-100)
     */
    calculateSpiritualFitness: function(activities) {
      if (!activities || activities.length === 0) {
        return 5; // Default minimum score
      }
      
      // Define time period (30 days by default)
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      // Filter for recent activities
      const recentActivities = activities.filter(activity => {
        if (!activity.date) return false;
        const activityDate = new Date(activity.date);
        return activityDate >= thirtyDaysAgo && activityDate <= now;
      });
      
      if (recentActivities.length === 0) {
        return 5; // Default minimum score if no recent activities
      }
      
      // Activity type weights
      const typeWeights = {
        'prayer': 5,
        'meditation': 5,
        'meeting': 10,
        'reading': 3,
        'call': 3,
        'service': 15,
        'stepwork': 12,
        'sponsorship': 10,
        'other': 2
      };
      
      // Calculate score based on activity types and frequency
      let totalScore = 5; // Start with base score
      const typeCounts = {};
      
      // Count activities by type
      recentActivities.forEach(activity => {
        const type = activity.type || 'other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        totalScore += typeWeights[type] || 2;
      });
      
      // Bonus for consistency (multiple activities of same type)
      let consistencyBonus = 0;
      Object.entries(typeCounts).forEach(([type, count]) => {
        if (count >= 5) consistencyBonus += 10;
        else if (count >= 3) consistencyBonus += 5;
      });
      
      // Bonus for variety (different types of activities)
      const varietyBonus = Object.keys(typeCounts).length * 5;
      
      // Calculate final score (cap at 100)
      const finalScore = Math.min(100, totalScore + consistencyBonus + varietyBonus);
      
      return finalScore;
    },
    
    /**
     * Calculate spiritual fitness with custom timeframe
     * @param {number} timeframe - Days to include
     * @returns {Promise<number>} Fitness score
     */
    calculateSpiritualFitnessWithTimeframe: async function(timeframe = 30) {
      try {
        const activities = await this.getAll('activities');
        if (!activities || activities.length === 0) {
          return 5; // Default minimum score
        }
        
        // Define custom time period
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - timeframe);
        
        // Filter for activities in timeframe
        const filteredActivities = activities.filter(activity => {
          if (!activity.date) return false;
          const activityDate = new Date(activity.date);
          return activityDate >= startDate && activityDate <= now;
        });
        
        if (filteredActivities.length === 0) {
          return 5; // Default minimum score if no matching activities
        }
        
        // Use same scoring logic as default calculation
        return this.calculateSpiritualFitness(filteredActivities);
      } catch (error) {
        console.error('Error calculating spiritual fitness with timeframe:', error);
        return 5; // Default minimum score on error
      }
    }
  };
}

// Export default function
export default initSQLiteDatabase;