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
        wasChair INTEGER DEFAULT 0,
        wasShare INTEGER DEFAULT 0,
        wasSpeaker INTEGER DEFAULT 0,
        meetingId INTEGER,
        callPerson TEXT DEFAULT '',
        isSponsorCall INTEGER DEFAULT 0,
        isSponseeCall INTEGER DEFAULT 0,
        isAAMemberCall INTEGER DEFAULT 0,
        callType TEXT DEFAULT '',
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
  
  // Migration code removed - all columns are now defined in the CREATE TABLE statement above
  console.log('[ sqliteLoader.js ] Activities table includes all required columns');
  
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
  // First disable foreign key constraints globally for safe table operations
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `PRAGMA foreign_keys = OFF;`
    });
    
    // Drop dependent tables first in correct order
    await sqlite.execute({
      database: DB_NAME,
      statements: `DROP TABLE IF EXISTS sponsor_contact_action_items;`
    });
    
    await sqlite.execute({
      database: DB_NAME,
      statements: `DROP TABLE IF EXISTS sponsor_contact_details;`
    });
    
    await sqlite.execute({
      database: DB_NAME,
      statements: `DROP TABLE IF EXISTS sponsor_contacts;`
    });
    
    console.log('[ sqliteLoader.js ] Dropped sponsor-related tables for schema update');
  } catch (error) {
    console.warn('[ sqliteLoader.js ] Could not drop sponsor tables:', error);
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
  
  // Create action_items table for tracking all action items
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS action_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        text TEXT,
        notes TEXT,
        dueDate TEXT,
        completed INTEGER DEFAULT 0,
        type TEXT DEFAULT 'todo',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Action items table created');
  
  // Create join table for linking action items to sponsor contacts
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contactId INTEGER NOT NULL,
        actionItemId INTEGER NOT NULL,
        detailId INTEGER,
        createdAt TEXT,
        FOREIGN KEY (contactId) REFERENCES sponsor_contacts (id),
        FOREIGN KEY (actionItemId) REFERENCES action_items (id),
        FOREIGN KEY (detailId) REFERENCES sponsor_contact_details (id)
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsor contact action items join table created');
  
  // Re-enable foreign key constraints after all table operations
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `PRAGMA foreign_keys = ON;`
    });
    console.log('[ sqliteLoader.js ] Foreign key constraints re-enabled');
  } catch (error) {
    console.warn('[ sqliteLoader.js ] Could not re-enable foreign keys:', error);
  }
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
        console.log('[ sqliteLoader.js ] Original item received for save:', JSON.stringify(item, null, 2));
        
        // Don't include ID field - let SQLite generate it with AUTOINCREMENT
        const { id, ...itemWithoutId } = item;
        
        console.log('[ sqliteLoader.js ] Item without ID:', JSON.stringify(itemWithoutId, null, 2));
        
        // Always include timestamps
        const now = new Date().toISOString();
        const itemWithTimestamps = {
          ...itemWithoutId,
          createdAt: now,
          updatedAt: now
        };
        
        console.log('[ sqliteLoader.js ] Final item for database:', JSON.stringify(itemWithTimestamps, null, 2));
        console.log('[ sqliteLoader.js ] Date field specifically:', itemWithTimestamps.date);
        console.log('[ sqliteLoader.js ] Date field type:', typeof itemWithTimestamps.date);
        
        // Build the SQL statement
        const keys = Object.keys(itemWithTimestamps);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(key => itemWithTimestamps[key]);
        
        console.log('[ sqliteLoader.js ] SQL keys:', keys);
        console.log('[ sqliteLoader.js ] SQL values:', values);
        
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
        
        console.log('[ sqliteLoader.js ] Last insert ID result:', result);
        
        // Return the complete item with ID - handle iOS format
        if (result.values && result.values.length > 0) {
          // iOS returns format: [{"ios_columns":["id"]},{"id":41}]
          // Standard format: [{"id": 41}]
          let insertedId;
          
          if (result.values.length > 1 && result.values[1] && result.values[1].id) {
            // iOS format - ID is in the second element
            insertedId = result.values[1].id;
          } else if (result.values[0] && result.values[0].id) {
            // Standard format - ID is in the first element
            insertedId = result.values[0].id;
          }
          
          console.log('[ sqliteLoader.js ] Extracted ID:', insertedId);
          
          if (insertedId) {
            return { ...itemWithTimestamps, id: insertedId };
          }
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
            // Debug: Log each activity being processed
            console.log('[ sqliteLoader.js ] Processing activity:', {
              id: activity.id,
              type: activity.type, 
              date: activity.date,
              hasDate: !!activity.date,
              hasType: !!activity.type
            });
            
            // Handle both date formats: "2025-05-26" and "2025-05-26T18:04:42.737Z"
            if (!activity.date || !activity.type) {
              console.log('[ sqliteLoader.js ] Activity has null date or type, skipping:', {date: activity.date, type: activity.type});
              return false;
            }
            
            // All dates should be full ISO format
            const activityDate = new Date(activity.date);
            
            console.log('[ sqliteLoader.js ] Parsed date:', {
              original: activity.date,
              parsed: activityDate,
              isValid: !isNaN(activityDate.getTime()),
              time: activityDate.getTime()
            });
            
            if (isNaN(activityDate.getTime())) {
              console.log('[ sqliteLoader.js ] Invalid date format, skipping:', activity.date);
              return false;
            }
            
            const inRange = activityDate >= thirtyDaysAgo && activityDate <= now;
            console.log('[ sqliteLoader.js ] Date range check:', {
              activityDate: activityDate.toISOString(),
              thirtyDaysAgo: thirtyDaysAgo.toISOString(),
              now: now.toISOString(),
              inRange: inRange
            });
            
            return inRange;
          });
        }
        
        console.log('[ sqliteLoader.js ] calculateSpiritualFitness - Recent activities count:', recentActivities ? recentActivities.length : 0);
        console.log('[ sqliteLoader.js ] Sample recent activities:', recentActivities ? recentActivities.slice(0, 3).map(a => ({type: a.type, date: a.date})) : []);
        
        if (!recentActivities || recentActivities.length === 0) {
          console.log('[ sqliteLoader.js ] No recent activities found, returning base score 5');
          return 5; // Default minimum score
        }
        
        // Weight different types of spiritual activities
        const typeWeights = {
          'prayer': 8,
          'meditation': 8,
          'literature': 6,
          'reading': 6,
          'meeting': 10,
          'service': 9,
          'stepwork': 10,
          'stepWork': 10,
          'call': 5,
          'callSponsor': 5,
          'callSponsee': 4,
          'sponsorship': 8,
          'other': 2
        };
        
        // Calculate score based on activity types and frequency
        let totalScore = 5; // Start with base score
        const typeCounts = {};
        
        // Count activities by type
        recentActivities.forEach(activity => {
          const type = activity.type || 'other';
          console.log(`[ sqliteLoader.js ] Activity type: ${type}`);
          typeCounts[type] = (typeCounts[type] || 0) + 1;
          totalScore += typeWeights[type] || 2;
          console.log(`[ sqliteLoader.js ] Added ${typeWeights[type] || 2} points for ${type}`);
        });
        
        // Bonus for consistency (multiple activities of same type)
        let consistencyBonus = 0;
        Object.entries(typeCounts).forEach(([type, count]) => {
          if (count >= 5) consistencyBonus += 10;
          else if (count >= 3) consistencyBonus += 5;
        });
        console.log(`[ sqliteLoader.js ] Consistency bonus: ${consistencyBonus}`);
        
        // Bonus for variety (different types of activities)
        const varietyBonus = Object.keys(typeCounts).length * 5;
        console.log(`[ sqliteLoader.js ] Variety bonus: ${varietyBonus}`);
        
        // Calculate final score (cap at 100)
        const finalScore = Math.min(100, totalScore + consistencyBonus + varietyBonus);
        console.log(`[ sqliteLoader.js ] Final spiritual fitness score: ${finalScore}`)
        
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
        console.log('[ sqliteLoader.js ] calculateSpiritualFitnessWithTimeframe called with timeframe:', timeframe);
        const activities = await this.getAll('activities');
        console.log('[ sqliteLoader.js ] Retrieved activities from database:', activities.length);
        
        // First, run cleanup to remove broken activities
        const cleanedCount = await cleanupBrokenActivities();
        console.log('[ sqliteLoader.js ] Cleaned up activities:', cleanedCount);
        
        // Re-fetch activities after cleanup
        const cleanActivities = await this.getAll('activities');
        console.log('[ sqliteLoader.js ] Activities after cleanup:', cleanActivities.length);
        
        if (!cleanActivities || cleanActivities.length === 0) {
          console.log('[ sqliteLoader.js ] No activities found, returning base score 5');
          return 5; // Default minimum score
        }
        
        // Log first few activities to see their structure
        console.log('[ sqliteLoader.js ] Sample activities:', activities.slice(0, 3).map(a => ({ type: a.type, date: a.date })));
        
        // Define custom time period
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - timeframe);
        console.log('[ sqliteLoader.js ] Date range:', { startDate: startDate.toISOString(), now: now.toISOString() });
        
        // Filter for activities in timeframe
        const filteredActivities = activities.filter(activity => {
          // Skip activities with null dates
          if (!activity.date || activity.date === null) {
            console.log('[ sqliteLoader.js ] Activity has null date, skipping:', { date: activity.date, type: activity.type });
            return false;
          }
          
          const activityDate = new Date(activity.date);
          if (isNaN(activityDate.getTime())) {
            console.log('[ sqliteLoader.js ] Activity has invalid date, skipping:', { date: activity.date, type: activity.type });
            return false;
          }
          
          const isInRange = activityDate >= startDate && activityDate <= now;
          if (!isInRange) {
            console.log('[ sqliteLoader.js ] Activity outside range:', { date: activity.date, type: activity.type });
          }
          return isInRange;
        });
        
        console.log('[ sqliteLoader.js ] Filtered activities in timeframe:', filteredActivities.length);
        
        if (filteredActivities.length === 0) {
          console.log('[ sqliteLoader.js ] No activities in timeframe, returning base score 5');
          return 5; // Default minimum score if no matching activities
        }
        
        // Use same scoring logic as default calculation
        const score = await this.calculateSpiritualFitness(filteredActivities);
        console.log('[ sqliteLoader.js ] Final calculated score:', score);
        return score;
      } catch (error) {
        console.error('[ sqliteLoader.js ] Error calculating spiritual fitness with timeframe:', error);
        return 5; // Default minimum score on error
      }
    },

    /**
     * Calculate sobriety days based on sobriety date
     * @param {string} sobrietyDate - Sobriety date in ISO format
     * @returns {number} - Number of days sober
     */
    calculateSobrietyDays: function(sobrietyDate) {
      if (!sobrietyDate) return 0;
      
      const startDate = new Date(sobrietyDate);
      const today = new Date();
      
      // Calculate difference in milliseconds
      const diffMs = today - startDate;
      
      // Convert to days
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    },

    /**
     * Calculate sobriety years with decimal precision
     * @param {string} sobrietyDate - Sobriety date in ISO format
     * @param {number} decimalPlaces - Number of decimal places
     * @returns {number} - Years of sobriety with decimal precision
     */
    calculateSobrietyYears: function(sobrietyDate, decimalPlaces = 2) {
      if (!sobrietyDate) return 0;
      
      const startDate = new Date(sobrietyDate);
      const today = new Date();
      
      // Calculate difference in milliseconds
      const diffMs = today - startDate;
      
      // Calculate years with decimal precision
      const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
      
      // Round to specified decimal places
      return parseFloat(years.toFixed(decimalPlaces));
    }
  };
}

/**
 * Clean up activities with null date or type values
 * This removes broken activities that can't be used in calculations
 */
async function cleanupBrokenActivities() {
  console.log('[ sqliteLoader.js ] Starting cleanup of broken activities...');
  
  try {
    const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
    if (!sqlitePlugin) {
      throw new Error('SQLite plugin not available');
    }

    // Count broken activities first
    const countResult = await sqlitePlugin.query({
      database: DB_NAME,
      statement: 'SELECT COUNT(*) as count FROM activities WHERE date IS NULL OR type IS NULL',
      values: []
    });
    
    const brokenCount = countResult.values[1]?.count || 0;
    console.log('[ sqliteLoader.js ] Found broken activities to clean:', brokenCount);

    if (brokenCount > 0) {
      // Delete broken activities using raw SQL
      const deleteResult = await sqlitePlugin.execute({
        database: DB_NAME,
        statements: 'DELETE FROM activities WHERE date IS NULL OR type IS NULL;'
      });
      
      console.log('[ sqliteLoader.js ] Cleanup complete. Deleted activities:', deleteResult.changes?.changes || 0);
      return deleteResult.changes?.changes || 0;
    } else {
      console.log('[ sqliteLoader.js ] No broken activities found to clean');
      return 0;
    }
    
  } catch (error) {
    console.error('[ sqliteLoader.js ] Error during cleanup:', error);
    return 0;
  }
}

// Export functions
export { cleanupBrokenActivities };
export default initSQLiteDatabase;