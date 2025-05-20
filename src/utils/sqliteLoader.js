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
  // First, try to drop the preferences table if it exists
  // This is a safe migration approach since we're in development
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `DROP TABLE IF EXISTS preferences`
    });
    console.log('Dropped existing preferences table for fresh schema');
  } catch (error) {
    console.log('No preferences table to drop or error dropping:', error);
  }
  
  // Always re-create the activities table to fix potential schema issues
  console.log('Forcing activities table recreation to ensure schema consistency');
  
  try {
    // First, try to backup any existing activities if the table exists
    let existingActivities = [];
    try {
      const activitiesResult = await sqlite.query({
        database: DB_NAME,
        statement: `SELECT * FROM activities`,
        values: []
      });
      
      if (activitiesResult && activitiesResult.values) {
        existingActivities = activitiesResult.values;
        console.log(`Backing up ${existingActivities.length} existing activities before recreation`);
      }
    } catch (error) {
      // Table might not exist yet, which is fine
      console.log('No existing activities table to backup:', error);
    }
    
    // Always drop the activities table to ensure a clean schema
    await sqlite.execute({
      database: DB_NAME,
      statements: `DROP TABLE IF EXISTS activities`
    });
    console.log('Dropped activities table for fresh creation');
    
    // Store the backup in a more scoped way
    window.existingActivities = existingActivities;
  } catch (error) {
    console.log('Error during activities table recreation:', error);
    // Initialize an empty array if backup fails
    window.existingActivities = [];
  }
  
  // Create users table with expanded profile settings
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
        profileImageUri TEXT,
        language TEXT,
        dateFormat TEXT,
        timeFormat TEXT,
        distanceUnit TEXT,
        themePreference TEXT,
        notificationSettings TEXT,
        locationPermission INTEGER,
        contactPermission INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('Users table created with expanded fields');

  // Create activities table with a simplified schema to fix constraint issues
  try {
    const table_struct = `CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL DEFAULT 'prayer',
          duration INTEGER DEFAULT 0,
          date TEXT,
          notes TEXT DEFAULT '',
          createdAt TEXT,
          updatedAt TEXT
        )
      `;
    console.log('Creating activities table with schema:', table_struct);
    await sqlite.execute({
      database: DB_NAME,
      statements: table_struct
    });
    console.log('Successfully created simplified activities table');
  } catch (schemaError) {
    console.error('Failed to create activities table:', schemaError);
    
    // Try an even simpler schema as a last resort
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          type TEXT DEFAULT 'prayer',
          duration INTEGER,
          date TEXT,
          notes TEXT
        )
      `
    });
    console.log('Created fallback activities table with minimal schema');
  }
  console.log('Activities table created with expanded fields');
  
  // Restore activities if we had existing data before migration
  if (window.existingActivities && window.existingActivities.length > 0) {
    try {
      console.log(`Restoring ${window.existingActivities.length} activities from backup`);
      for (const activity of window.existingActivities) {
        // Convert to the new schema (simplified for our new table structure)
        const migratedActivity = {
          id: activity.id,
          type: activity.type || 'prayer',  // Ensure we have a default type
          duration: activity.duration || 0,
          date: activity.date || new Date().toISOString().split('T')[0],
          notes: activity.notes || '',
          createdAt: activity.createdAt || new Date().toISOString(),
          updatedAt: activity.updatedAt || new Date().toISOString()
        };
        
        // Build SQL statement
        const fields = Object.keys(migratedActivity);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => migratedActivity[field]);
        
        const sql = `INSERT INTO activities (${fields.join(', ')}) VALUES (${placeholders})`;
        
        await sqlite.execute({
          database: DB_NAME,
          statements: sql,
          values: values
        });
      }
      console.log(`Restored ${existingActivities.length} activities with new schema`);
    } catch (error) {
      console.error('Error restoring activities after migration:', error);
    }
  }

  // Create meetings table with comprehensive fields
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
        streetAddress TEXT,
        city TEXT,
        state TEXT,
        zipCode TEXT,
        country TEXT,
        online INTEGER,
        onlineUrl TEXT,
        phoneNumber TEXT,
        meetingCode TEXT,
        notes TEXT,
        latitude REAL,
        longitude REAL,
        types TEXT,
        format TEXT,
        accessibility TEXT,
        languages TEXT,
        isHomeGroup INTEGER,
        isTemporarilyClosed INTEGER,
        contactName TEXT,
        contactEmail TEXT,
        contactPhone TEXT,
        attendance TEXT,
        lastAttended TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('Meetings table created with comprehensive fields');

  // Create messages table with enhanced fields for communication
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT,
        sender_name TEXT,
        recipient TEXT,
        recipient_name TEXT,
        content TEXT,
        content_type TEXT,
        encrypted INTEGER,
        encryption_key TEXT,
        read INTEGER,
        delivered INTEGER,
        timestamp TEXT,
        sent_timestamp TEXT,
        received_timestamp TEXT, 
        thread_id TEXT,
        reply_to TEXT,
        attachments TEXT,
        metadata TEXT,
        deleted INTEGER,
        deleted_for_sender INTEGER,
        deleted_for_recipient INTEGER,
        priority INTEGER,
        status TEXT,
        tags TEXT
      )
    `
  });
  console.log('Messages table created with enhanced fields');

  // Create sobriety_milestones table to track recovery journey
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sobriety_milestones (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        milestone_type TEXT,
        days INTEGER,
        months INTEGER,
        years INTEGER,
        date_achieved TEXT,
        celebrated INTEGER,
        notes TEXT,
        shared INTEGER,
        congratulations_count INTEGER,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `
  });
  console.log('Sobriety milestones table created');

  // Create spiritual_fitness table to track spiritual health
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS spiritual_fitness (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        score REAL,
        prayer_score REAL,
        meditation_score REAL,
        reading_score REAL,
        meeting_score REAL,
        service_score REAL,
        timeframe INTEGER,
        calculated_at TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `
  });
  console.log('Spiritual fitness table created');

  // Create daily_inventory table for step 10 work
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS daily_inventory (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        date TEXT,
        grateful_for TEXT,
        amends_needed TEXT,
        character_defects TEXT,
        helped_others TEXT,
        spiritual_practice TEXT,
        overall_mood TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `
  });
  console.log('Daily inventory table created');

  // Create preferences table for app settings with proper column names
  // We've already dropped the old table if it existed
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS preferences (
        pref_id TEXT PRIMARY KEY,
        pref_value TEXT
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
    // Advanced database operations for expanded schemas
    
    // Store schema version for migration tracking
    schemaVersion: '2.0.0',
    
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
        // Create a deep copy of the item to avoid modifying the original
        const itemToSave = JSON.parse(JSON.stringify(item));
        
        // Ensure item has an ID
        if (!itemToSave.id) {
          itemToSave.id = `${collection}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Special handling for activities to ensure type is always set
        if (collection === 'activities') {
          // Double check that type field exists and is not empty
          if (!itemToSave.type || itemToSave.type === '') {
            console.warn('Activity missing type field, setting default type to meeting');
            itemToSave.type = 'meeting';
          }
          
          // Log the activity being saved for debugging
          console.log(`Saving activity with type: "${itemToSave.type}"`);
        }
        
        // Add timestamps
        if (!itemToSave.createdAt) {
          itemToSave.createdAt = new Date().toISOString();
        }
        itemToSave.updatedAt = new Date().toISOString();
        
        // Build query parts with strong validation
        const fields = Object.keys(itemToSave);
        const placeholders = fields.map(() => '?').join(', ');
        
        // Carefully prepare values ensuring no undefined/null for required fields
        const values = fields.map(field => {
          let value = itemToSave[field];
          
          // Special handling for activity type field which is NOT NULL
          if (collection === 'activities' && field === 'type' && (value === undefined || value === null || value === '')) {
            value = 'meeting'; // Enforce default value for NOT NULL constraint
          }
          
          // Convert objects to JSON strings
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          
          return value;
        });
        
        // Validate that we have values for all required fields before executing
        if (collection === 'activities') {
          const typeIndex = fields.indexOf('type');
          if (typeIndex !== -1 && (!values[typeIndex] || values[typeIndex] === '')) {
            console.error('Activity type is required but is empty or null');
            values[typeIndex] = 'meeting'; // Final safeguard
          }
        }
        
        // Debug output for activities
        if (collection === 'activities') {
          console.log('SQL fields:', fields);
          console.log('SQL values:', values);
        }
        
        // Execute insert
        const sql = `INSERT INTO ${collection} (${fields.join(', ')}) VALUES (${placeholders})`;
        await sqlite.execute({
          database: DB_NAME,
          statements: sql,
          values: values
        });
        
        // Return the saved item
        return itemToSave;
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
          statement: 'SELECT pref_value FROM preferences WHERE pref_id = ?',
          values: [key]
        });
        
        if (!result.values || result.values.length === 0) {
          return defaultValue;
        }
        
        const value = result.values[0].pref_value;
        
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
            statements: 'INSERT INTO preferences (pref_id, pref_value) VALUES (?, ?)',
            values: [key, storedValue]
          });
        } else {
          // Update existing preference
          await sqlite.execute({
            database: DB_NAME,
            statements: 'UPDATE preferences SET pref_value = ? WHERE pref_id = ?',
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