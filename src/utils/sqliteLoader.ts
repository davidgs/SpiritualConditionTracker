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
  console.log('[ sqliteLoader.js:14 ] Initializing SQLite database via Capacitor...');

  try {
    // First, check if Capacitor is available
    if (!window.Capacitor) {
      throw new Error('Capacitor is not available in this environment');
    }

    // Detect platform information for specialized handling
    const platform = window.Capacitor.getPlatform?.() || 'unknown';
    console.log('[ sqliteLoader.js:24 ]  Capacitor platform detected:', platform);
    console.log('[ sqliteLoader.js:25 ]  Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));

    // Special handling for iOS which has different plugin structure
    const isIOS = platform === 'ios';
    if (isIOS) {
      console.log('[ sqliteLoader.js:30 ]  iOS environment detected - using iOS-specific database setup');
    }

    // Get the SQLite plugin
    const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
    if (!sqlitePlugin) {
      throw new Error('CapacitorSQLite plugin not available - ensure the plugin is properly installed');
    }

    console.log('[ sqliteLoader.js:39 ]  Found CapacitorSQLite plugin:', !!sqlitePlugin);

    // Step 1: Create connection (check if already exists first)
    try {
      // Check if connection already exists
      try {
        const existingConnections = await sqlitePlugin.getConnectionList();
        const connectionExists = existingConnections.some(conn => conn.database === DB_NAME);

        if (!connectionExists) {
          await sqlitePlugin.createConnection({
            database: DB_NAME,
            version: 1,
            encrypted: false,
            mode: 'no-encryption',
            readonly: false
          });
          console.log('[ sqliteLoader.js:54 ]  Database connection created');
        } else {
          console.log('[ sqliteLoader.js:56 ]  Using existing database connection');
        }
      } catch (connectionCheckError) {
        console.log('[ sqliteLoader.js:60 ]  Could not check existing connections, attempting to create new connection');
        await sqlitePlugin.createConnection({
          database: DB_NAME,
          version: 1,
          encrypted: false,
          mode: 'no-encryption',
          readonly: false
        });
      }
    } catch (createError) {
      console.log('[ sqliteLoader.js:71 ]  Connection might already exist, continuing...');
    }

    // Step 2: Open the database
    await sqlitePlugin.open({ database: DB_NAME, readonly: false });
    console.log('[ sqliteLoader.js:76 ]  Database opened successfully');

    // Step 3: Setup database schema
    await setupDatabaseSchema(sqlitePlugin);

    // Step 4: Return database interface
    return createDatabaseInterface(sqlitePlugin);
  } catch (error) {
    console.error('[ sqliteLoader.js ] Error initializing Capacitor SQLite:', error);
    console.error('[ sqliteLoader.js ] Detailed error info:', JSON.stringify(error, null, 2));
    throw new Error(`CapacitorSQLite plugin not available - ensure the plugin is properly installed`);
  }
}

/**
 * Setup database schema (create tables if they don't exist)
 */
async function setupDatabaseSchema(sqlite) {
  console.log('[ sqliteLoader.js:261 ]  Verifying database schema (preserving existing data)');

  try {
    // Users table with expanded fields
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
          sponsor_name TEXT,
          sponsor_lastName TEXT,
          sponsor_phone TEXT,
          sponsor_email TEXT,
          sponsor_sobrietyDate TEXT,
          sponsor_notes TEXT,
          messagingKeys TEXT,
          profileImageUri TEXT,
          language TEXT,
          dateFormat TEXT,
          timeFormat TEXT,
          distanceUnit TEXT,
          themePreference TEXT,
          notificationSettings TEXT,
          locationPermission TEXT,
          contactPermission TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:305 ]  Users table created successfully');

    // Activities table - core spiritual activities tracking
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          duration INTEGER,
          date TEXT NOT NULL,
          notes TEXT,
          literatureTitle TEXT,
          literatureType TEXT,
          meetingName TEXT,
          wasChair INTEGER DEFAULT 0,
          wasShare INTEGER DEFAULT 0,
          wasSpeaker INTEGER DEFAULT 0,
          meetingId INTEGER,
          callPerson TEXT,
          isSponsorCall INTEGER DEFAULT 0,
          isSponseeCall INTEGER DEFAULT 0,
          isAAMemberCall INTEGER DEFAULT 0,
          callType TEXT,
          servicePerson TEXT,
          location TEXT,
          mood TEXT,
          gratitude TEXT,
          steps TEXT,
          sponsor TEXT,
          attendees TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:341 ]  Activities table created successfully');
    console.log('[ sqliteLoader.js:344 ]  Activities table includes all required columns');

    // Meetings table
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS meetings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
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
          online TEXT,
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
          isHomeGroup TEXT,
          isTemporarilyClosed TEXT,
          contactName TEXT,
          contactEmail TEXT,
          contactPhone TEXT,
          attendance INTEGER,
          lastAttended TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          coordinates TEXT,
          locationType TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:387 ]  Meetings table created successfully');

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
      
      console.log('[ sqliteLoader.js:413 ]  Dropped sponsor-related tables for schema update');
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
    console.log('[ sqliteLoader.js:433 ]  Sponsor contacts table created with flexible constraints');

    // Create sponsor_contact_details table for additional info like action items
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS sponsor_contact_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contactId INTEGER,
          detailType TEXT DEFAULT 'note',
          actionItem TEXT DEFAULT '',
          completed INTEGER DEFAULT 0,
          notes TEXT DEFAULT '',
          createdAt TEXT,
          updatedAt TEXT,
          FOREIGN KEY (contactId) REFERENCES sponsor_contacts (id)
        )
      `
    });
    console.log('[ sqliteLoader.js:453 ]  Sponsor contact details table created with flexible constraints');

    // Create action_items table for proper action item management
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS action_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
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
    console.log('[ sqliteLoader.js:472 ]  Action items table created');

    // Create join table for sponsor_contact_action_items relationships
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contactId INTEGER,
          actionItemId INTEGER,
          detailId INTEGER,
          createdAt TEXT,
          FOREIGN KEY (contactId) REFERENCES sponsor_contacts (id),
          FOREIGN KEY (actionItemId) REFERENCES action_items (id),
          FOREIGN KEY (detailId) REFERENCES sponsor_contact_details (id)
        )
      `
    });
    console.log('[ sqliteLoader.js:490 ]  Sponsor contact action items join table created');
    
    // Re-enable foreign key constraints after all table operations
    try {
      await sqlite.execute({
        database: DB_NAME,
        statements: `PRAGMA foreign_keys = ON;`
      });
      console.log('[ sqliteLoader.js:498 ]  Foreign key constraints re-enabled');
    } catch (error) {
      console.warn('[ sqliteLoader.js ] Could not re-enable foreign keys:', error);
    }

  } catch (error) {
    console.error('[ sqliteLoader.js ] Error setting up database schema:', error);
    throw error;
  }
}

/**
 * Create database interface with common operations
 */
function createDatabaseInterface(sqlite) {
  return {
    // Generic operations
    async getAll(collection) {
      try {
        console.log(`[ sqliteLoader.js:523 ] Getting all items from ${collection}`);
        
        // Check if SQLite is available, otherwise use localStorage
        let result;
        try {
          // Add ORDER BY clause for sponsor_contacts to sort newest first
          let statement = `SELECT * FROM ${collection}`;
          if (collection === 'sponsor_contacts') {
            statement = `SELECT * FROM ${collection} ORDER BY createdAt DESC`;
          }

          result = await sqlite.query({
            database: DB_NAME,
            statement: statement,
            values: []
          });
        } catch (error) {
          // SQLite failed, use localStorage fallback
          console.log(`[ sqliteLoader.js:541 ] SQLite failed, using localStorage for ${collection}`);
          const localData = JSON.parse(localStorage.getItem(collection) || '[]');
          return localData;
        }

        if (!result || !result.values) {
          console.log(`[ sqliteLoader.js:547 ] No data found for ${collection}`);
          return [];
        }

        // Convert iOS format to standard format
        const converted = convertIOSFormatToStandard(result.values);
        console.log(`[ sqliteLoader.js:592 ] Converted ${converted.length} iOS format items to standard format`);
        
        if (converted.length > 0) {
          console.log('[ sqliteLoader.js ] Sample converted item:', JSON.stringify(converted[0], null, 2));
        }

        return converted;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error getting all from ${collection}:`, error);
        return [];
      }
    },

    async getById(collection, id) {
      try {
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection} WHERE id = ?`,
          values: [id]
        });

        if (!result || !result.values || result.values.length === 0) {
          return null;
        }

        const converted = convertIOSFormatToStandard(result.values);
        return converted[0] || null;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error getting ${collection} by id ${id}:`, error);
        return null;
      }
    },

    async add(collection, item) {
      try {
        console.log(`[ sqliteLoader.js ] Adding item to ${collection}:`, item);

        // Prepare the item with timestamps
        const timestamp = new Date().toISOString();
        const itemWithTimestamp = {
          ...item,
          createdAt: item.createdAt || timestamp,
          updatedAt: item.updatedAt || timestamp
        };

        // Generate columns and values
        const columns = Object.keys(itemWithTimestamp);
        const values = Object.values(itemWithTimestamp);
        const placeholders = columns.map(() => '?').join(', ');

        const insertSQL = `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${placeholders})`;
        console.log(`[ sqliteLoader.js ] Insert SQL: ${insertSQL}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: insertSQL,
          values: values
        });

        console.log(`[ sqliteLoader.js ] Insert result:`, result);

        // Return the created item with generated ID
        if (result && result.changes && result.changes.lastId) {
          return {
            ...itemWithTimestamp,
            id: result.changes.lastId
          };
        }

        // Fallback: try to find the item by its unique properties
        const allItems = await this.getAll(collection);
        const createdItem = allItems.find(existing => 
          existing.createdAt === itemWithTimestamp.createdAt ||
          (existing.email && existing.email === itemWithTimestamp.email) ||
          (existing.name && existing.name === itemWithTimestamp.name)
        );

        return createdItem || { ...itemWithTimestamp, id: Date.now() };
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error adding to ${collection}:`, error);
        throw error;
      }
    },

    async update(collection, id, updates) {
      try {
        console.log(`[ sqliteLoader.js ] Updating ${collection} id ${id} with:`, updates);

        const timestamp = new Date().toISOString();
        const updatesWithTimestamp = {
          ...updates,
          updatedAt: timestamp
        };

        const columns = Object.keys(updatesWithTimestamp);
        const values = Object.values(updatesWithTimestamp);
        const setClause = columns.map(col => `${col} = ?`).join(', ');

        const updateSQL = `UPDATE ${collection} SET ${setClause} WHERE id = ?`;
        values.push(id);

        console.log(`[ sqliteLoader.js ] Update SQL: ${updateSQL}`);
        console.log(`[ sqliteLoader.js ] Update values:`, values);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: updateSQL,
          values: values
        });

        console.log(`[ sqliteLoader.js ] Update result:`, result);

        // Return the updated item
        return await this.getById(collection, id);
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error updating ${collection} id ${id}:`, error);
        throw error;
      }
    },

    async remove(collection, id) {
      try {
        console.log(`[ sqliteLoader.js ] Removing ${collection} id ${id}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: `DELETE FROM ${collection} WHERE id = ?`,
          values: [id]
        });

        console.log(`[ sqliteLoader.js ] Delete result:`, result);
        return result && result.changes && result.changes.changes > 0;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error removing ${collection} id ${id}:`, error);
        return false;
      }
    },

    // Close connection (cleanup)
    async close() {
      try {
        await sqlite.close({ database: DB_NAME });
        console.log('[ sqliteLoader.js ] Database connection closed');
      } catch (error) {
        console.error('[ sqliteLoader.js ] Error closing database:', error);
      }
    }
  };
}

/**
 * Convert iOS SQLite result format to standard format
 */
function convertIOSFormatToStandard(values) {
  if (!values || values.length === 0) {
    return [];
  }

  // Check if this is iOS format (first item has ios_columns)
  const firstItem = values[0];
  if (!firstItem || !firstItem.ios_columns) {
    // Already in standard format
    return values;
  }

  const columns = firstItem.ios_columns;
  const rows = values.slice(1); // Skip the columns definition

  return rows.map(row => {
    const item = {};
    columns.forEach((column, index) => {
      item[column] = row[column];
    });
    return item;
  });
}

// Export the main initialization function
export default initSQLiteDatabase;