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
    console.log('[ sqliteLoader.js ] Capacitor platform detected:', platform);
    console.log('[ sqliteLoader.js ] Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));
    
    // Special handling for iOS which has different plugin structure
    const isIOS = platform === 'ios';
    if (isIOS) {
      console.log('[ sqliteLoader.js ] iOS environment detected - using iOS-specific database setup');
    }

    // Get the SQLite plugin
    const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
    if (!sqlitePlugin) {
      throw new Error('CapacitorSQLite plugin not available - ensure the plugin is properly installed');
    }

    console.log('[ sqliteLoader.js ] Found CapacitorSQLite plugin:', !!sqlitePlugin);

    // Step 1: Create connection
    try {
      await sqlitePlugin.createConnection({
        database: DB_NAME,
        encrypted: false,
        mode: 'no-encryption'
      });
      console.log('[ sqliteLoader.js ] Database connection created successfully');
    } catch (error) {
      console.error('[ sqliteLoader.js ] Error creating database connection:', error);
      throw new Error(`Database connection failed: ${error.message || JSON.stringify(error)}`);
    }

    // Step 2: Open the database
    try {
      await sqlitePlugin.open({ database: DB_NAME });
      console.log('[ sqliteLoader.js ] Database opened successfully');
    } catch (error) {
      console.error('[ sqliteLoader.js ] Error opening database:', error);
      throw new Error(`Database open failed: ${error.message || JSON.stringify(error)}`);
    }

    // Step 3: Create tables
    try {
      await setupTables(sqlitePlugin);
      console.log('[ sqliteLoader.js ] Database tables created/verified successfully');
    } catch (error) {
      console.error('[ sqliteLoader.js ] Error setting up database tables:', error);
      throw new Error(`Table setup failed: ${error.message || JSON.stringify(error)}`);
    }

    // Step 4: Create global database interface
    setupGlobalDB(sqlitePlugin);
    console.log('[ sqliteLoader.js ] Database setup complete, global db interface ready');

    return sqlitePlugin;
  } catch (error) {
    console.error('[ sqliteLoader.js ] Error initializing Capacitor SQLite:', error);
    console.error('[ sqliteLoader.js ] Detailed error info:', JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack
    }, null, 2));
    
    throw error;
  }
}

/**
 * Create database tables if they don't exist
 * @param {Object} sqlite - SQLite plugin instance
 */
async function setupTables(sqlite) {
  console.log('[ sqliteLoader.js ] Setting up database tables if they don\'t exist');
  
  // Create users table with all required fields - better structured
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        lastName TEXT,
        phoneNumber TEXT,
        email TEXT,
        sobrietyDate TEXT,
        homeGroups TEXT,
        privacySettings TEXT,
        preferences TEXT,
        
        /* Sponsor info properly structured */
        sponsor_name TEXT,
        sponsor_lastName TEXT,
        sponsor_phone TEXT,
        sponsor_email TEXT,
        sponsor_sobrietyDate TEXT,
        sponsor_notes TEXT,
        
        /* Removed redundant fields */
        /* removed: sponsor TEXT - unclear purpose */
        /* removed: sponsees TEXT - use sponsor_contacts table instead */
        
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
  console.log('[ sqliteLoader.js ] Users table created successfully');

  // Create activities table with all required fields
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'prayer',
        duration INTEGER DEFAULT 0,
        date TEXT,
        notes TEXT DEFAULT '',
        literatureTitle TEXT DEFAULT '',
        literatureType TEXT DEFAULT '',
        meetingName TEXT DEFAULT '',
        callPerson TEXT DEFAULT '',
        servicePerson TEXT DEFAULT '',
        location TEXT DEFAULT '',
        mood TEXT DEFAULT '',
        gratitude TEXT DEFAULT '',
        steps TEXT DEFAULT '',
        sponsor TEXT DEFAULT '',
        attendees TEXT DEFAULT '',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Activities table created successfully');
  
  // Create meetings table with all required fields
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'Unnamed Meeting',
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
        updatedAt TEXT,
        coordinates TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Meetings table created successfully');

  // Create sponsor_contacts table with INTEGER ID - without NOT NULL constraints
  // First drop the existing table to recreate it with correct constraints
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `DROP TABLE IF EXISTS sponsor_contacts;`
    });
    console.log('[ sqliteLoader.js ] Dropped sponsor_contacts table for schema update');
  } catch (error) {
    console.warn('[ sqliteLoader.js ] Could not drop sponsor_contacts table:', error);
  }
  
  // Recreate with explicit NULL allowed for date field
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsor_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        date TEXT DEFAULT NULL,
        type TEXT DEFAULT 'general',
        note TEXT DEFAULT '',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsor contacts table created with flexible constraints');

  // Create sponsor_contact_details table with INTEGER ID - without NOT NULL constraints
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsor_contact_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contactId INTEGER,
        actionItem TEXT,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        dueDate TEXT,
        type TEXT,
        text TEXT,
        createdAt TEXT,
        FOREIGN KEY (contactId) REFERENCES sponsor_contacts (id)
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsor contact details table created with flexible constraints');
}

/**
 * Set up global database object
 * @param {Object} sqlite - SQLite plugin instance 
 */
function setupGlobalDB(sqlite) {
  // Set the global initialization flag to indicate database is ready
  window.dbInitialized = true;
  
  window.db = {
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
        
        return result.values || [];
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error getting items from ${collection}:`, error);
        return [];
      }
    },
    
    /**
     * Get item by ID
     * @param {string} collection - Collection name
     * @param {integer} id - Item ID
     * @returns {Promise<Object|null>} Found item or null
     */
    getById: async function(collection, id) {
      try {
        // Convert string ID to number if needed (for compatibility with AUTOINCREMENT)
        let numericId = id;
        if (typeof id === 'string') {
          // If the ID starts with a prefix like 'user_', extract the numeric part
          if (id.includes('_')) {
            const parts = id.split('_');
            const potentialNumeric = parts[parts.length - 1];
            if (!isNaN(potentialNumeric)) {
              numericId = parseInt(potentialNumeric, 10);
            }
          } else if (!isNaN(id)) {
            // If it's just a numeric string, convert directly
            numericId = parseInt(id, 10);
          }
        }
        
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection} WHERE id = ?`,
          values: [numericId]
        });
        
        if (!result.values || result.values.length === 0) {
          return null;
        }
        
        return result.values[0];
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error getting item by ID from ${collection}:`, error);
        return null;
      }
    },
    
    /**
     * Add an item to a collection
     * @param {string} collection - Collection name
     * @param {Object} item - Item to add
     * @returns {Promise<Object>} Added item with ID
     */
    add: async function(collection, item) {
      try {
        // Don't include ID field - let SQLite generate it with AUTOINCREMENT
        const { id, ...itemWithoutId } = item;
        
        // Always include timestamps
        const now = new Date().toISOString();
        const itemWithTimestamps = {
          ...itemWithoutId,
          createdAt: now,
          updatedAt: now
        };
        
        // Build the SQL statement
        const keys = Object.keys(itemWithTimestamps);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(key => itemWithTimestamps[key]);
        
        // Execute the SQL insert
        await sqlite.execute({
          database: DB_NAME,
          statements: `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders})`,
          values: values
        });
        
        // Get the last inserted ID
        const result = await sqlite.query({
          database: DB_NAME,
          statement: 'SELECT last_insert_rowid() as id',
          values: []
        });
        
        // Return the complete item with ID
        if (result.values && result.values.length > 0) {
          return { ...itemWithTimestamps, id: result.values[0].id };
        }
        
        return itemWithTimestamps;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error adding item to ${collection}:`, error);
        throw error;
      }
    },
    
    /**
     * Update an item in a collection
     * @param {string} collection - Collection name
     * @param {string|number} id - Item ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated item
     */
    update: async function(collection, id, updates) {
      try {
        // Ensure ID is in numeric format
        let numericId = id;
        if (typeof id === 'string' && !isNaN(id)) {
          numericId = parseInt(id, 10);
        }
        
        // Always update timestamp
        const updatesWithTimestamp = {
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // Build SET clause
        const setClause = Object.keys(updatesWithTimestamp)
          .map(key => `${key} = ?`)
          .join(', ');
        
        // Prepare values array (all update values + ID for WHERE clause)
        const values = [
          ...Object.values(updatesWithTimestamp),
          numericId
        ];
        
        // Execute update
        await sqlite.execute({
          database: DB_NAME,
          statements: `UPDATE ${collection} SET ${setClause} WHERE id = ?`,
          values: values
        });
        
        // Return updated item
        return this.getById(collection, numericId);
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error updating item in ${collection}:`, error);
        return null;
      }
    },
    
    /**
     * Remove an item from a collection
     * @param {string} collection - Collection name
     * @param {string|number} id - Item ID
     * @returns {Promise<boolean>} Success indicator
     */
    remove: async function(collection, id) {
      try {
        // Ensure ID is in numeric format
        let numericId = id;
        if (typeof id === 'string' && !isNaN(id)) {
          numericId = parseInt(id, 10);
        }
        
        await sqlite.execute({
          database: DB_NAME,
          statements: `DELETE FROM ${collection} WHERE id = ?`,
          values: [numericId]
        });
        
        return true;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error removing item from ${collection}:`, error);
        return false;
      }
    },
    
    /**
     * Query items in a collection
     * @param {string} collection - Collection name
     * @param {Object} criteria - Query criteria
     * @returns {Promise<Array>} Matching items
     */
    query: async function(collection, criteria = {}) {
      try {
        // Build WHERE clause
        const whereConditions = Object.keys(criteria).map(key => `${key} = ?`);
        const whereClause = whereConditions.length > 0 
          ? `WHERE ${whereConditions.join(' AND ')}` 
          : '';
        
        // Prepare values
        const values = Object.values(criteria);
        
        // Execute query
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection} ${whereClause}`,
          values: values
        });
        
        return result.values || [];
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error querying ${collection}:`, error);
        return [];
      }
    },
    
    /**
     * Calculate spiritual fitness score
     * @param {Array} [activities] - Optional activities array (if not provided, will fetch from DB)
     * @returns {number} Fitness score (0-100)
     */
    calculateSpiritualFitness: async function(activities) {
      try {
        // If activities not provided, fetch from database
        let recentActivities = activities;
        if (!recentActivities) {
          const allActivities = await this.getAll('activities');
          
          // Define time period (last 30 days)
          const now = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          
          // Filter for activities in the last 30 days
          recentActivities = allActivities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= thirtyDaysAgo && activityDate <= now;
          });
        }
        
        if (!recentActivities || recentActivities.length === 0) {
          return 5; // Default minimum score
        }
        
        // Weight different types of spiritual activities
        const typeWeights = {
          'prayer': 10,
          'meditation': 10,
          'reading': 8,
          'meeting': 15,
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
      } catch (error) {
        console.error('[ sqliteLoader.js ] Error calculating spiritual fitness:', error);
        return 5; // Default minimum score on error
      }
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
          const activityDate = new Date(activity.date);
          return activityDate >= startDate && activityDate <= now;
        });
        
        if (filteredActivities.length === 0) {
          return 5; // Default minimum score if no matching activities
        }
        
        // Use same scoring logic as default calculation
        return this.calculateSpiritualFitness(filteredActivities);
      } catch (error) {
        console.error('[ sqliteLoader.js ] Error calculating spiritual fitness with timeframe:', error);
        return 5; // Default minimum score on error
      }
    }
  };
}

// Export default function
export default initSQLiteDatabase;