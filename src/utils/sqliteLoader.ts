/**
 * SQLite database loader optimized for Capacitor
 * Provides cross-platform SQLite access with special handling for iOS
 */

// Default database name for consistency
const DB_NAME = 'spiritual_condition_tracker.db';

// Web-compatible database for development
async function createMockDatabase() {
  console.log('[ sqliteLoader.js ] Creating web-compatible database for development');
  
  // Use localStorage for persistence during development
  const STORAGE_KEY = 'spiritual_condition_tracker_db';
  
  // Load existing data from localStorage
  let storage = {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    storage = stored ? JSON.parse(stored) : {
      users: [],
      activities: [],
      meetings: [],
      sponsors: [],
      sponsor_contacts: [],
      sponsees: [],
      sponsee_contacts: [],
      action_items: []
    };
  } catch (error) {
    storage = {
      users: [],
      activities: [],
      meetings: [],
      sponsors: [],
      sponsor_contacts: [],
      sponsees: [],
      sponsee_contacts: [],
      action_items: []
    };
  }
  
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };
  
  return {
    async getAll(collection) {
      return storage[collection] || [];
    },
    
    async add(collection, item) {
      const newItem = {
        ...item,
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storage[collection] = storage[collection] || [];
      storage[collection].push(newItem);
      saveToStorage();
      return newItem;
    },
    
    async update(collection, id, updates) {
      const items = storage[collection] || [];
      const index = items.findIndex(item => item.id == id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
        saveToStorage();
        return items[index];
      }
      return null;
    },
    
    async delete(collection, id) {
      const items = storage[collection] || [];
      const index = items.findIndex(item => item.id == id);
      if (index !== -1) {
        items.splice(index, 1);
        saveToStorage();
        return true;
      }
      return false;
    },
    
    async getById(collection, id) {
      const items = storage[collection] || [];
      return items.find(item => item.id == id) || null;
    },
    
    async remove(collection, id) {
      return await this.delete(collection, id);
    },
    
    async resetDatabase() {
      Object.keys(storage).forEach(key => {
        storage[key] = [];
      });
      saveToStorage();
      console.log('[ sqliteLoader.js ] Database reset');
    },
    
    calculateSobrietyDays(sobrietyDate) {
      const today = new Date();
      const sobriety = new Date(sobrietyDate);
      const diffTime = Math.abs(today.getTime() - sobriety.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
      const days = this.calculateSobrietyDays(sobrietyDate);
      return parseFloat((days / 365.25).toFixed(decimalPlaces));
    },
    
    async calculateSpiritualFitness() {
      return 5;
    },
    
    async calculateSpiritualFitnessWithTimeframe(timeframe = 30) {
      return 5;
    },
    
    async getPreference(key) {
      return null;
    },
    
    async setPreference(key, value) {
      // Implementation for preferences
    }
  };
}



/**
 * Initialize SQLite database
 * @returns {Promise<object>} Database connection object
 */


export default async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js:14 ] Initializing SQLite database...');
  
  try {
    // Check if we're in a Capacitor environment
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform) {
      // Native Capacitor environment - use CapacitorSQLite
      const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
      const sqlite = CapacitorSQLite;
      
      return await initNativeSQLiteDatabase(sqlite);
    } else {
      // Web development environment - use LocalStorage-based database
      console.log('[ sqliteLoader.js ] Running in web development mode');
      return await createMockDatabase();
    }
  } catch (error) {
    console.error('[ sqliteLoader.js ] Failed to initialize database:', error);
    // Fallback to mock database if native initialization fails
    return await createMockDatabase();
  }
}

async function initNativeSQLiteDatabase(sqlite) {
  console.log('[ sqliteLoader.js ] Initializing native SQLite database');
  
  try {
    
    // Detect platform information for specialized handling
    const platform = window.Capacitor.getPlatform();
    console.log('[ sqliteLoader.js:20 ]  Capacitor platform detected:', platform);
    
    if (!sqlite) {
      throw new Error('CapacitorSQLite plugin not found - this app requires SQLite for iOS');
    }
    
    console.log('[ sqliteLoader.js:39 ]  Found CapacitorSQLite plugin:', !!sqlite);
    
    // Step 1: Create connection (check if already exists first)
    try {
      await sqlite.createConnection({
        database: DB_NAME,
        version: 1,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false
      });
      console.log('[ sqliteLoader.js:50 ]  Database connection created');
    } catch (connectionError) {
      console.log('[ sqliteLoader.js:52 ]  Connection may already exist:', connectionError.message);
    }

    // Step 2: Open the database
    await sqlite.open({ database: DB_NAME, readonly: false });
    console.log('[ sqliteLoader.js:56 ]  Database opened successfully');

    // Step 3: Create tables
    await createTables(sqlite);
    console.log('[ sqliteLoader.js:59 ]  Database initialization complete');

    // Return database interface
    return {
      async getAll(collection) {
       // console.log(`[ sqliteLoader.js:523 ] Getting all items from ${collection}`);
        
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });

        if (!result || !result.values) {
          console.log(`[ sqliteLoader.js:531 ] No data found for ${collection}`);
          return [];
        }

        //console.log(`[ sqliteLoader.js:535 ] Raw query result for ${collection}:`, result);

        // Handle different response formats
        let items = [];
        
        if (result.values.length > 1 && result.values[0].ios_columns) {
          // iOS format with separate columns and values arrays
          items = convertIOSFormatToStandard(result.values);
        } else {
          // Standard format
          items = result.values || [];
        }

        // Parse JSON fields back to objects/arrays
        const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
        items = items.map(item => {
          const parsedItem = { ...item };
          jsonFields.forEach(field => {
            if (parsedItem[field] && typeof parsedItem[field] === 'string') {
              try {
                parsedItem[field] = JSON.parse(parsedItem[field]);
              } catch (e) {
                console.warn(`[ sqliteLoader.js ] Failed to parse ${field} JSON for ${collection}:`, e);
                // Keep as string if parsing fails
              }
            }
          });
          return parsedItem;
        });

        console.log(`[ sqliteLoader.js:548 ] Processed ${items.length} items from ${collection}`);
        return items;
      },

      async add(collection, item) {
        try {
        //  console.log('[ sqliteLoader.js ] Original item received for save:', JSON.stringify(item, null, 2));

          // Don't include ID field - let SQLite generate it with AUTOINCREMENT
          const { id, ...itemWithoutId } = item;

        //  console.log('[ sqliteLoader.js ] Item without ID:', JSON.stringify(itemWithoutId, null, 2));

          // Always include timestamps
          const now = new Date().toISOString();
          let itemWithTimestamps = {
            ...itemWithoutId,
            createdAt: now,
            updatedAt: now
          };

          // Convert array and object fields to JSON strings for SQLite storage
          const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
          jsonFields.forEach(field => {
            if (itemWithTimestamps[field] !== undefined && itemWithTimestamps[field] !== null) {
              if (Array.isArray(itemWithTimestamps[field]) || typeof itemWithTimestamps[field] === 'object') {
                itemWithTimestamps[field] = JSON.stringify(itemWithTimestamps[field]);
              }
            }
          });

        //  console.log('[ sqliteLoader.js ] Final item for database:', JSON.stringify(itemWithTimestamps, null, 2));

          // Build the SQL statement with embedded values (Capacitor SQLite format)
          const keys = Object.keys(itemWithTimestamps);
          const values = keys.map(key => itemWithTimestamps[key]);

        //  console.log('[ sqliteLoader.js ] SQL keys:', keys);
        //  console.log('[ sqliteLoader.js ] SQL values:', values);

          // Format values for SQL - escape strings and handle nulls
          const formattedValues = values.map(value => {
            if (value === null || value === undefined) {
              return 'NULL';
            } else if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
            } else if (typeof value === 'number') {
              return value.toString();
            } else {
              return `'${String(value).replace(/'/g, "''")}'`;
            }
          }).join(', ');

          // Execute the SQL insert with embedded values
          const sqlStatement = `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${formattedValues});`;
          console.log(`[ sqliteLoader.js ] Executing SQL: ${sqlStatement}`);

          await sqlite.execute({
            database: DB_NAME,
            statements: sqlStatement
          });

        //  console.log('[ sqliteLoader.js ] Insert completed');

          // Get the last inserted ID
          const result = await sqlite.query({
            database: DB_NAME,
            statement: 'SELECT last_insert_rowid() as id',
            values: []
          });

          console.log('[ sqliteLoader.js ] Last insert ID result:', result);

          // Return the complete item with ID - handle iOS format
          if (result.values && result.values.length > 0) {
            let newId;
            
            if (result.values.length > 1 && result.values[0].ios_columns) {
              // iOS format: [{"ios_columns":["id"]}, {"id":1}]
              newId = result.values[1].id;
            } else {
              // Standard format
              newId = result.values[0].id;
            }

        //    console.log(`[ sqliteLoader.js ] Using ID: ${newId} for new ${collection} record`);
            
            return {
              ...itemWithTimestamps,
              id: newId
            };
          }

          throw new Error('Failed to get inserted ID');
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error adding to ${collection}:`, error);
          throw error;
        }
      },

      async update(collection, id, updates) {
        try {
        //  console.log(`[ sqliteLoader.js ] Updating ${collection} id ${id} with:`, updates);
          
          // Always include updatedAt timestamp
          const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date().toISOString()
          };

          // Convert objects and arrays to JSON strings - prevent double-stringification
          const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
          jsonFields.forEach(field => {
            if (updatesWithTimestamp[field] !== undefined && updatesWithTimestamp[field] !== null) {
              // Only stringify if it's not already a JSON string
              if (typeof updatesWithTimestamp[field] === 'object') {
                updatesWithTimestamp[field] = JSON.stringify(updatesWithTimestamp[field]);
              } else if (typeof updatesWithTimestamp[field] === 'string') {
                // Check if it's already valid JSON - if so, don't double-stringify
                try {
                  JSON.parse(updatesWithTimestamp[field]);
                  // It's already a valid JSON string, keep as-is
                } catch {
                  // Not JSON, but for certain fields we might want to convert to JSON
                  if (field === 'preferences' || field === 'homeGroups' || field === 'privacySettings') {
                    // These should be objects, not plain strings
                    console.warn(`[ sqliteLoader.js ] Warning: ${field} should be an object, not string:`, updatesWithTimestamp[field]);
                  }
                }
              }
            }
          });
          
          const setClause = Object.keys(updatesWithTimestamp).map(field => {
            const value = updatesWithTimestamp[field];
            if (value === null || value === undefined) {
              return `${field} = NULL`;
            } else if (typeof value === 'string') {
              return `${field} = '${value.replace(/'/g, "''")}'`;
            } else if (typeof value === 'number') {
              return `${field} = ${value}`;
            } else {
              return `${field} = '${String(value).replace(/'/g, "''")}'`;
            }
          }).join(', ');
          
          // Properly escape the ID value for SQL
          const escapedId = typeof id === 'string' ? `'${id.replace(/'/g, "''")}'` : id;
          const sql = `UPDATE ${collection} SET ${setClause} WHERE id = ${escapedId}`;
        //  console.log(`[ sqliteLoader.js ] Update SQL:`, sql);
          
          await sqlite.execute({
            database: DB_NAME,
            statements: sql
          });
          
        //  console.log(`[ sqliteLoader.js ] Update completed for ${collection} id ${id}`);
          
          return { ...updatesWithTimestamp, id };
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error updating ${collection}:`, error);
          throw error;
        }
      },

      async delete(collection, id) {
        try {
        //  console.log(`[ sqliteLoader.js ] Deleting from ${collection} id ${id}`);
          
          // Properly escape the ID value for SQL
          const escapedId = typeof id === 'string' ? `'${id.replace(/'/g, "''")}'` : id;
          const sql = `DELETE FROM ${collection} WHERE id = ${escapedId}`;
        //  console.log(`[ sqliteLoader.js ] Delete SQL:`, sql);
          
          await sqlite.execute({
            database: DB_NAME,
            statements: sql
          });
          
        //  console.log(`[ sqliteLoader.js ] Delete completed for ${collection} id ${id}`);
          return true;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error deleting from ${collection}:`, error);
          throw error;
        }
      },

      async getById(collection, id) {
        try {
          // Properly escape the ID value for SQL
          const escapedId = typeof id === 'string' ? `'${id.replace(/'/g, "''")}'` : id;
          
          const result = await sqlite.query({
            database: DB_NAME,
            statement: `SELECT * FROM ${collection} WHERE id = ${escapedId}`,
            values: []
          });

          if (!result || !result.values || result.values.length === 0) {
            return null;
          }

          // Handle different response formats
          let item;
          if (result.values.length > 1 && result.values[0].ios_columns) {
            const items = convertIOSFormatToStandard(result.values);
            item = items[0] || null;
          } else {
            item = result.values[0] || null;
          }
          
          // Parse JSON fields back to objects/arrays
          if (item) {
            const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
            jsonFields.forEach(field => {
              if (item[field] && typeof item[field] === 'string') {
                try {
                  item[field] = JSON.parse(item[field]);
                } catch (e) {
                  console.warn(`[ sqliteLoader.js ] Failed to parse ${field} JSON for ${collection} getById:`, e);
                  // Keep as string if parsing fails
                }
              }
            });
          }
          
          return item;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error getting ${collection} by id ${id}:`, error);
          throw error;
        }
      },

      async remove(collection, id) {
        try {
        //  console.log(`[ sqliteLoader.js ] Removing from ${collection} id:`, id);
          
          // Properly escape the ID value for SQL
          const escapedId = typeof id === 'string' ? `'${id.replace(/'/g, "''")}'` : id;
          
          const result = await sqlite.execute({
            database: DB_NAME,
            statements: `DELETE FROM ${collection} WHERE id = ${escapedId};`
          });
          
        //  console.log(`[ sqliteLoader.js ] Delete result for ${collection} id ${id}:`, result);
          
          return true;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error removing from ${collection}:`, error);
          throw error;
        }
      },

      // Emergency database reset
      async resetDatabase() {
        try {
          await resetDatabase(sqlite);
          return true;
        } catch (error) {
          console.error('[ sqliteLoader.js ] Error during database reset:', error);
          throw error;
        }
      },

      calculateSobrietyDays(sobrietyDate) {
        const today = new Date();
        const sobriety = new Date(sobrietyDate);
        const diffTime = Math.abs(today.getTime() - sobriety.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },

      calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
        const days = this.calculateSobrietyDays(sobrietyDate);
        return parseFloat((days / 365.25).toFixed(decimalPlaces));
      },

      async calculateSpiritualFitness() {
        return 5; // Default score
      },

      async calculateSpiritualFitnessWithTimeframe(timeframe = 30) {
        return 5; // Default score
      },

      async getPreference(key) {
        return null;
      },

      async setPreference(key, value) {
        // Implementation for preferences
      }
    };

  } catch (error) {
    console.error('[ sqliteLoader.js ] Database initialization failed:', error);
    throw error;
  }
}

// Helper function to convert iOS format to standard format
function convertIOSFormatToStandard(iosResult) {
  if (!iosResult || iosResult.length < 2) {
    return [];
  }

  const columnsInfo = iosResult[0];
  const valuesArrays = iosResult.slice(1);

  if (!columnsInfo.ios_columns || !Array.isArray(valuesArrays)) {
    return [];
  }

  const columns = columnsInfo.ios_columns;
  const items = [];

  valuesArrays.forEach(valueArray => {
    if (Array.isArray(valueArray.ios_values)) {
      // Handle complex iOS format with ios_values array
      const item = {};
      valueArray.ios_values.forEach((value, index) => {
        if (index < columns.length) {
          item[columns[index]] = value;
        }
      });
      items.push(item);
    } else if (typeof valueArray === 'object' && valueArray !== null) {
      // Handle simple iOS format where data is directly in the object
      items.push(valueArray);
    }
  });

  return items;
}

// Create all database tables
async function createTables(sqlite) {
  console.log('[ sqliteLoader.js ] Creating database tables...');

  // Users table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT '',
        lastName TEXT DEFAULT '',
        sobrietyDate TEXT DEFAULT '',
        homeGroups TEXT DEFAULT '[]',
        phoneNumber TEXT DEFAULT '',
        email TEXT DEFAULT '',
        privacySettings TEXT DEFAULT '{"allowMessages":true,"shareLastName":true}',
        preferences TEXT DEFAULT '{"use24HourFormat":false,"darkMode":false,"theme":"default"}',
        isDarkMode INTEGER DEFAULT 0,
        sponsees TEXT DEFAULT '[]',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Users table created');

  // Add isDarkMode column to existing users table (migration)
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE users ADD COLUMN isDarkMode INTEGER DEFAULT 0`
    });
  //  console.log('[ sqliteLoader.js ] Added isDarkMode column to users table');
  } catch (error) {
    // Column already exists, which is fine
  //  console.log('[ sqliteLoader.js ] isDarkMode column already exists or failed to add:', error.message);
  }

  // Add sponsees column to existing users table (migration)
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE users ADD COLUMN sponsees TEXT DEFAULT '[]'`
    });
  //  console.log('[ sqliteLoader.js ] Added sponsees column to users table');
  } catch (error) {
    // Column already exists, which is fine
  //  console.log('[ sqliteLoader.js ] sponsees column already exists or failed to add:', error.message);
  }

  // Activities table - unified activity log with references
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        type TEXT NOT NULL,
        date TEXT,
        notes TEXT,
        location TEXT,
        duration INTEGER,
        meetingName TEXT,
        meetingId INTEGER,
        wasChair INTEGER DEFAULT 0,
        wasShare INTEGER DEFAULT 0,
        wasSpeaker INTEGER DEFAULT 0,
        literatureTitle TEXT,
        isSponsorCall INTEGER DEFAULT 0,
        isSponseeCall INTEGER DEFAULT 0,
        isAAMemberCall INTEGER DEFAULT 0,
        callType TEXT,
        stepNumber INTEGER,
        personCalled TEXT,
        serviceType TEXT,
        completed INTEGER DEFAULT 0,
        actionItemId INTEGER,
        sponsorContactId INTEGER,
        sponseeContactId INTEGER,
        sponsorId INTEGER,
        sponseeId INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Activities table created');

  // Add missing columns to existing activities table (migrations)
  const activityMigrations = [
    { column: 'userId', type: 'TEXT DEFAULT "default_user"' },
    { column: 'meetingName', type: 'TEXT' },
    { column: 'meetingId', type: 'INTEGER' },
    { column: 'wasChair', type: 'INTEGER DEFAULT 0' },
    { column: 'wasShare', type: 'INTEGER DEFAULT 0' },
    { column: 'wasSpeaker', type: 'INTEGER DEFAULT 0' },
    { column: 'literatureTitle', type: 'TEXT' },
    { column: 'isSponsorCall', type: 'INTEGER DEFAULT 0' },
    { column: 'isSponseeCall', type: 'INTEGER DEFAULT 0' },
    { column: 'isAAMemberCall', type: 'INTEGER DEFAULT 0' },
    { column: 'callType', type: 'TEXT' },
    { column: 'stepNumber', type: 'INTEGER' },
    { column: 'personCalled', type: 'TEXT' },
    { column: 'serviceType', type: 'TEXT' },
    { column: 'completed', type: 'INTEGER DEFAULT 0' },
    { column: 'actionItemId', type: 'INTEGER' },
    { column: 'sponsorContactId', type: 'INTEGER' },
    { column: 'sponseeContactId', type: 'INTEGER' },
    { column: 'sponsorId', type: 'INTEGER' },
    { column: 'sponseeId', type: 'INTEGER' }
  ];

  for (const migration of activityMigrations) {
    try {
      await sqlite.execute({
        database: DB_NAME,
        statements: `ALTER TABLE activities ADD COLUMN ${migration.column} ${migration.type}`
      });
    //  console.log(`[ sqliteLoader.js ] Added ${migration.column} column to activities table`);
    } catch (error) {
      // Column already exists, which is fine
      console.error(`[ sqliteLoader.js ] ${migration.column} column already exists or failed to add:`, error.message);
    }
  }

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
        coordinates TEXT,
        phoneNumber TEXT,
        onlineUrl TEXT,
        isHomeGroup INTEGER DEFAULT 0,
        types TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Meetings table created');

  // Sponsors table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        name TEXT,
        lastName TEXT,
        phoneNumber TEXT,
        email TEXT,
        sobrietyDate TEXT,
        notes TEXT,
        sponsorType TEXT DEFAULT 'sponsor',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsors table created');

  // Sponsor contacts table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsor_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        sponsorId INTEGER,
        date TEXT,
        type TEXT DEFAULT 'general',
        note TEXT DEFAULT '',
        topic TEXT,
        duration INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsor contacts table created');

  // Action items table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS action_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contactId INTEGER,
        title TEXT,
        text TEXT,
        notes TEXT,
        dueDate TEXT,
        completed INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0,
        type TEXT DEFAULT 'todo',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Action items table created');

  // Add missing columns to existing action_items table (migrations)
  const actionItemMigrations = [
    { column: 'deleted', type: 'INTEGER DEFAULT 0' },
    { column: 'sponsorContactId', type: 'INTEGER' },
    { column: 'sponseeContactId', type: 'INTEGER' }
  ];

  for (const migration of actionItemMigrations) {
    try {
      await sqlite.execute({
        database: DB_NAME,
        statements: `ALTER TABLE action_items ADD COLUMN ${migration.column} ${migration.type}`
      });
      console.log(`[ sqliteLoader.js ] Added ${migration.column} column to action_items table`);
    } catch (error) {
      // Column already exists, which is fine
      console.log(`[ sqliteLoader.js ] ${migration.column} column already exists or failed to add:`, error.message);
    }
  }

  // Sponsees table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        name TEXT,
        lastName TEXT,
        phoneNumber TEXT,
        email TEXT,
        sobrietyDate TEXT,
        notes TEXT,
        sponseeType TEXT DEFAULT 'sponsee',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsees table created');

  // Sponsee contacts table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsee_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        sponseeId INTEGER,
        date TEXT,
        type TEXT DEFAULT 'general',
        note TEXT DEFAULT '',
        topic TEXT,
        duration INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Sponsee contacts table created');

  console.log('[ sqliteLoader.js ] All tables created successfully');
}

// Emergency database reset function
async function resetDatabase(sqlite) {
 // console.log('[ sqliteLoader.js ] Starting emergency database reset...');
  
  try {
    // Drop all tables
    const tables = ['users', 'activities', 'meetings', 'sponsors', 'sponsor_contacts', 'sponsees', 'sponsee_contacts', 'action_items'];
    
    for (const table of tables) {
      try {
        await sqlite.execute({
          database: DB_NAME,
          statements: `DROP TABLE IF EXISTS ${table};`
        });
    //    console.log(`[ sqliteLoader.js ] Dropped table: ${table}`);
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error dropping table ${table}:`, error);
      }
    }
    
    // Recreate all tables with new schema
    await createTables(sqlite);
    console.log('[ sqliteLoader.js ] Database reset complete');
    
  } catch (error) {
    console.error('[ sqliteLoader.js ] Error during database reset:', error);
    throw error;
  }
}