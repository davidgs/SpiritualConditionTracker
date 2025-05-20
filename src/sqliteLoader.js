/**
 * SQLite Database Loader
 * This initializes SQLite via Capacitor for native mobile platforms (iOS/Android)
 */

// Initialize SQLite database
function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js ] Initializing SQLite database via Capacitor...');
  return initCapacitorSQLite();
}

// Initialize SQLite with Capacitor
async function initCapacitorSQLite() {
  try {
    // For native iOS, we need to ensure proper plugin detection
    if (!window.Capacitor) {
      throw new Error('Capacitor is not available in this environment');
    }
    
    // Detailed environment logging to diagnose iOS issues
    const platform = window.Capacitor.getPlatform?.() || 'unknown';
    console.log('Capacitor platform detected:', platform);
    console.log('Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));
    
    // Check if we're on iOS - iOS requires special handling
    const isIOS = platform === 'ios';
    if (isIOS) {
      console.log('iOS environment detected - using iOS-specific initialization');
    }
    
    // On iOS, plugins might be in a different location or need explicit initialization
    // Try multiple access patterns to find the plugin
    let CapacitorSQLite = null;
    let SQLiteConnection = null;
    
    // Approach 1: Standard plugin access
    if (window.Capacitor?.Plugins?.CapacitorSQLite) {
      console.log('Found SQLite plugin via standard access');
      CapacitorSQLite = window.Capacitor.Plugins.CapacitorSQLite;
      SQLiteConnection = window.Capacitor.Plugins.SQLiteConnection;
    } 
    // Approach 2: iOS-specific access (sometimes plugins are accessed differently)
    else if (isIOS && window.CapacitorSQLite) {
      console.log('Found SQLite plugin via iOS-specific global access');
      CapacitorSQLite = window.CapacitorSQLite;
      SQLiteConnection = window.SQLiteConnection;
    }
    // Approach 3: Try direct access without Plugins namespace
    else if (window.Capacitor?.CapacitorSQLite) {
      console.log('Found SQLite plugin via direct Capacitor access');
      CapacitorSQLite = window.Capacitor.CapacitorSQLite;
      SQLiteConnection = window.Capacitor.SQLiteConnection;
    }
    
    console.log('SQLite plugin detection result:', {
      CapacitorSQLite: !!CapacitorSQLite,
      SQLiteConnection: !!SQLiteConnection,
      platform
    });
    
    if (!CapacitorSQLite) {
      throw new Error('CapacitorSQLite plugin not available on this device - please ensure the plugin is properly installed');
    }
    
    // Create connection and initialize default database - improved for iOS compatibility
    let sqlite = null;
    
    try {
      sqlite = new SQLiteConnection(CapacitorSQLite);
      console.log('Successfully created SQLiteConnection instance');
    } catch (connectionError) {
      console.error('Error creating SQLiteConnection:', connectionError);
      throw new Error(`Failed to create SQLiteConnection: ${connectionError.message}`);
    }

    // Use consistent database name with clear options for iOS
    const defaultDB = { 
      database: 'spiritualTracker.db',
      encrypted: false,
      mode: 'no-encryption'
    };
    
    console.log('Creating database connection with:', defaultDB);
    
    try {
      await sqlite.createConnection(defaultDB);
      console.log('Database connection created successfully');
    } catch (connectionError) {
      console.error('Error creating database connection:', connectionError);
      throw new Error(`Failed to create database connection: ${connectionError.message}`);
    }
    
    try {
      await sqlite.open({ database: defaultDB.database });
      console.log('Database opened successfully');
    } catch (openError) {
      console.error('Error opening database:', openError);
      throw new Error(`Failed to open database: ${openError.message}`);
    }
    
    // Set up database schema
    try {
      await setupTables(sqlite, defaultDB.database);
      console.log('Database tables created/verified successfully');
    } catch (tableError) {
      console.error('Error setting up database tables:', tableError);
      throw new Error(`Failed to set up database tables: ${tableError.message}`);
    }
    
    // Create a global database object for convenient access
    try {
      setupGlobalDB(sqlite);
      console.log('Global database reference created successfully');
    } catch (globalDBError) {
      console.error('Error setting up global database reference:', globalDBError);
      throw new Error(`Failed to set up global database reference: ${globalDBError.message}`);
    }
    
    console.log('Capacitor SQLite setup complete');
    return sqlite;
  } catch (error) {
    console.error('Error initializing Capacitor SQLite:', error);
    // Include detailed error info for better iOS debugging
    console.error('Error details:', JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack
    }, null, 2));
    throw new Error('Failed to initialize SQLite database: ' + error.message);
  }
}

// Set up tables for SQLite
async function setupTables(sqlite, dbName = 'spiritualTracker.db') {
  try {
    // Create users table
    console.log('Creating users table in database:', dbName);
    await sqlite.execute({
      database: dbName,
      statement: `CREATE TABLE IF NOT EXISTS users (
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
      )`
    });
    
    // Create activities table
    console.log('Creating activities table...');
    await sqlite.execute({
      database: dbName,
      statement: `CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        type TEXT,
        date TEXT,
        notes TEXT,
        duration INTEGER,
        userId TEXT,
        metadata TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )`
    });
    
    // Create meetings table
    console.log('Creating meetings table...');
    await sqlite.execute({
      database: dbName,
      statement: `CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        name TEXT,
        day INTEGER,
        time TEXT,
        format TEXT,
        notes TEXT,
        address TEXT,
        isHomeGroup INTEGER,
        latitude REAL,
        longitude REAL,
        userId TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )`
    });
    
    // Create messages table
    console.log('Creating messages table...');
    await sqlite.execute({
      database: dbName,
      statement: `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderId TEXT,
        recipientId TEXT,
        content TEXT,
        timestamp TEXT,
        isRead INTEGER,
        createdAt TEXT
      )`
    });
    
    // Create preferences table
    console.log('Creating preferences table...');
    await sqlite.execute({
      database: dbName,
      statement: `CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT
      )`
    });
    
    console.log('All tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Set up global DB object with convenient methods
function setupGlobalDB(sqlite) {
  window.db = {
    // Database initialization
    initDatabase: async function() {
      return true;
    },
    
    // Get all items from a collection
    getAll: async function(collection) {
      try {
        const queryResult = await sqlite.query({
          database: dbName,
          statement: `SELECT * FROM ${collection}`
        });
        
        const rows = queryResult.values || [];
        
        // Parse JSON fields as needed
        if (collection === 'users') {
          for (const row of rows) {
            if (row.privacySettings) row.privacySettings = JSON.parse(row.privacySettings);
            if (row.preferences) row.preferences = JSON.parse(row.preferences);
            if (row.homeGroups) row.homeGroups = JSON.parse(row.homeGroups);
            if (row.sponsees) row.sponsees = JSON.parse(row.sponsees);
          }
        }
        
        return rows;
      } catch (error) {
        console.error(`Error getting items from ${collection}:`, error);
        return [];
      }
    },
    
    // Get an item by ID
    getById: async function(collection, id) {
      try {
        const queryResult = await sqlite.query({
          database: dbName,
          statement: `SELECT * FROM ${collection} WHERE id = ?`,
          values: [id]
        });
        
        if (queryResult.values && queryResult.values.length > 0) {
          const item = queryResult.values[0];
          
          // Parse JSON fields as needed
          if (collection === 'users') {
            if (item.privacySettings) item.privacySettings = JSON.parse(item.privacySettings);
            if (item.preferences) item.preferences = JSON.parse(item.preferences);
            if (item.homeGroups) item.homeGroups = JSON.parse(item.homeGroups);
            if (item.sponsees) item.sponsees = JSON.parse(item.sponsees);
          }
          
          return item;
        }
        
        return null;
      } catch (error) {
        console.error(`Error getting item from ${collection}:`, error);
        return null;
      }
    },
    
    // Add an item to a collection
    add: async function(collection, item) {
      try {
        // Ensure item has an ID
        if (!item.id) {
          item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Add timestamps
        item.createdAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        
        // Prepare for SQLite - convert objects to JSON strings
        const itemToSave = { ...item };
        if (collection === 'users') {
          if (itemToSave.privacySettings) itemToSave.privacySettings = JSON.stringify(itemToSave.privacySettings);
          if (itemToSave.preferences) itemToSave.preferences = JSON.stringify(itemToSave.preferences);
          if (itemToSave.homeGroups) itemToSave.homeGroups = JSON.stringify(itemToSave.homeGroups);
          if (itemToSave.sponsees) itemToSave.sponsees = JSON.stringify(itemToSave.sponsees);
        }
        
        // Build SQL
        const columns = Object.keys(itemToSave);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(key => itemToSave[key]);
        
        await sqlite.run({
          database: dbName,
          statement: `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${placeholders})`,
          values: values
        });
        
        return item;
      } catch (error) {
        console.error(`Error adding item to ${collection}:`, error);
        throw error;
      }
    },
    
    // Update an item in a collection
    update: async function(collection, id, updates) {
      try {
        // First get the current item
        const currentItem = await this.getById(collection, id);
        if (!currentItem) {
          throw new Error(`Item with ID ${id} not found in ${collection}`);
        }
        
        // Add updated timestamp
        updates.updatedAt = new Date().toISOString();
        
        // Merge with current item
        const updatedItem = { ...currentItem, ...updates };
        
        // Prepare for SQLite - convert objects to JSON strings
        const itemToSave = { ...updatedItem };
        if (collection === 'users') {
          if (itemToSave.privacySettings) itemToSave.privacySettings = JSON.stringify(itemToSave.privacySettings);
          if (itemToSave.preferences) itemToSave.preferences = JSON.stringify(itemToSave.preferences);
          if (itemToSave.homeGroups) itemToSave.homeGroups = JSON.stringify(itemToSave.homeGroups);
          if (itemToSave.sponsees) itemToSave.sponsees = JSON.stringify(itemToSave.sponsees);
        }
        
        // Build SQL
        const columns = Object.keys(itemToSave);
        const setClause = columns.map(key => `${key} = ?`).join(', ');
        const values = columns.map(key => itemToSave[key]);
        
        // Add ID for WHERE clause
        values.push(id);
        
        await sqlite.run({
          database: dbName,
          statement: `UPDATE ${collection} SET ${setClause} WHERE id = ?`,
          values: values
        });
        
        return updatedItem;
      } catch (error) {
        console.error(`Error updating item in ${collection}:`, error);
        throw error;
      }
    },
    
    // Remove an item from a collection
    remove: async function(collection, id) {
      try {
        await sqlite.run({
          database: dbName,
          statement: `DELETE FROM ${collection} WHERE id = ?`,
          values: [id]
        });
        
        return true;
      } catch (error) {
        console.error(`Error removing item from ${collection}:`, error);
        throw error;
      }
    },
    
    // Query items in a collection
    query: async function(collection, predicate) {
      try {
        const items = await this.getAll(collection);
        
        if (typeof predicate === 'function') {
          return items.filter(predicate);
        }
        
        return items;
      } catch (error) {
        console.error(`Error querying items from ${collection}:`, error);
        throw error;
      }
    },
    
    // Calculate distance between points
    calculateDistance: function(lat1, lon1, lat2, lon2) {
      const R = 3958.8; // Radius of the Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
    
    // Get preference
    getPreference: async function(key) {
      try {
        const queryResult = await sqlite.query({
          database: dbName,
          statement: 'SELECT value FROM preferences WHERE key = ?',
          values: [key]
        });
        
        if (queryResult.values && queryResult.values.length > 0) {
          return queryResult.values[0].value;
        }
        
        return null;
      } catch (error) {
        console.error(`Error getting preference ${key}:`, error);
        return null;
      }
    },
    
    // Set preference
    setPreference: async function(key, value) {
      try {
        // Check if preference exists
        const existingPref = await this.getPreference(key);
        
        if (existingPref !== null) {
          // Update existing preference
          await sqlite.run({
            database: dbName,
            statement: 'UPDATE preferences SET value = ? WHERE key = ?',
            values: [value, key]
          });
        } else {
          // Add new preference
          await sqlite.run({
            database: dbName,
            statement: 'INSERT INTO preferences (key, value) VALUES (?, ?)',
            values: [key, value]
          });
        }
        
        return { key, value };
      } catch (error) {
        console.error(`Error setting preference ${key}:`, error);
        throw error;
      }
    }
  };
}

// Make the initialization function available globally for reinitialization
window.initSQLiteDatabase = initSQLiteDatabase;

// Export initialization function
export default initSQLiteDatabase;