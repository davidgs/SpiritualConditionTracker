/**
 * SQLite database loader for iOS Capacitor
 * iOS-only implementation using CapacitorSQLite
 */

// Default database name for consistency
const DB_NAME = 'spiritual_condition_tracker.db';

/**
 * Initialize SQLite database
 * @returns {Promise<object>} Database connection object
 */
export default async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js:14 ] Initializing SQLite database via Capacitor...');
  
  try {
    // Import CapacitorSQLite plugin for iOS
    const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
    const sqlite = CapacitorSQLite;
    
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
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });

        if (!result || !result.values) {
          return [];
        }

        let items = [];
        if (result.values.length > 1 && result.values[0].ios_columns) {
          items = convertIOSFormatToStandard(result.values);
        } else {
          items = result.values;
        }

        return items.map(item => {
          const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
          jsonFields.forEach(field => {
            if (item[field] && typeof item[field] === 'string') {
              try {
                item[field] = JSON.parse(item[field]);
              } catch (e) {
                // Keep as string if parsing fails
              }
            }
          });
          return item;
        });
      },

      async add(collection, item) {
        const columns = Object.keys(item);
        const values = Object.values(item);
        
        const processedValues = values.map(value => {
          if (value === null || value === undefined) {
            return 'NULL';
          }
          if (typeof value === 'object' && value !== null) {
            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          }
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          return value;
        });

        const valuesList = processedValues.join(', ');
        const sql = `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${valuesList});`;
        
        console.log(`[ sqliteLoader.js ] Executing SQL: ${sql}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: sql
        });

        if (result && result.changes && result.changes.changes > 0) {
          // Query the database to get the last inserted ID
          const lastIdQuery = await sqlite.query({
            database: DB_NAME,
            statement: 'SELECT last_insert_rowid() as lastId',
            values: []
          });
          
          // Parse the iOS format result correctly
          const newId = lastIdQuery.values?.[1]?.lastId;
          if (!newId) {
            throw new Error(`Database failed to generate ID for ${collection}`);
          }
          
          const newItem = { 
            ...item, 
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          console.log(`[ sqliteLoader.js ] Created ${collection} item with ID:`, newId);
          return newItem;
        }
        throw new Error(`Failed to insert item into ${collection}`);
      },

      async update(collection, id, updates) {
        const setClause = Object.keys(updates).map((key, index) => {
          const value = Object.values(updates)[index];
          const processedValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
          const escapedValue = typeof processedValue === 'string' ? `'${processedValue.replace(/'/g, "''")}'` : processedValue;
          return `${key} = ${escapedValue}`;
        }).join(', ');

        await sqlite.execute({
          database: DB_NAME,
          statements: `UPDATE ${collection} SET ${setClause} WHERE id = ${id};`
        });

        return this.getById(collection, id);
      },

      async delete(collection, id) {
        try {
          await sqlite.execute({
            database: DB_NAME,
            statements: `DELETE FROM ${collection} WHERE id = ${id};`
          });
          return true;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error deleting from ${collection}:`, error);
          throw error;
        }
      },

      async getById(collection, id) {
        try {
          const escapedId = typeof id === 'string' ? `'${id.replace(/'/g, "''")}'` : id;
          
          const result = await sqlite.query({
            database: DB_NAME,
            statement: `SELECT * FROM ${collection} WHERE id = ${escapedId}`,
            values: []
          });

          if (!result || !result.values || result.values.length === 0) {
            return null;
          }

          let item;
          if (result.values.length > 1 && result.values[0].ios_columns) {
            const items = convertIOSFormatToStandard(result.values);
            item = items[0] || null;
          } else {
            item = result.values[0] || null;
          }
          
          if (item) {
            const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
            jsonFields.forEach(field => {
              if (item[field] && typeof item[field] === 'string') {
                try {
                  item[field] = JSON.parse(item[field]);
                } catch (e) {
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
        return this.delete(collection, id);
      },

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
      const item = {};
      valueArray.ios_values.forEach((value, index) => {
        if (index < columns.length) {
          item[columns[index]] = value;
        }
      });
      items.push(item);
    } else if (typeof valueArray === 'object' && valueArray !== null) {
      items.push(valueArray);
    }
  });

  return items;
}

async function createTables(sqlite) {
  // Create users table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT '',
        lastName TEXT DEFAULT '',
        phoneNumber TEXT DEFAULT '',
        email TEXT DEFAULT '',
        sobrietyDate TEXT DEFAULT '',
        homeGroups TEXT DEFAULT '[]',
        privacySettings TEXT DEFAULT '{"allowMessages": true, "shareLastName": false}',
        preferences TEXT DEFAULT '{"use24HourFormat": false, "darkMode": false, "theme": "default"}',
        isDarkMode INTEGER DEFAULT 0,
        sponsor_name TEXT,
        sponsor_lastName TEXT,
        sponsor_phone TEXT,
        sponsor_email TEXT,
        sponsor_sobrietyDate TEXT,
        sponsor_notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  });

  // Create activities table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT DEFAULT 'default_user',
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        duration INTEGER DEFAULT 0,
        location TEXT,
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
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  });

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
  console.log('[ sqliteLoader.js ] Meetings table created with working schema');



  // Create sponsor_contacts table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsor_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        sponsorId INTEGER,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        topic TEXT,
        duration INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  });

  // Create sponsee_contacts table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS sponsee_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        sponseeId INTEGER NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        topic TEXT,
        duration INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  });

  // Create action_items table with foreign keys to both contact types
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
        deleted INTEGER DEFAULT 0,
        type TEXT DEFAULT 'action',
        sponsorContactId INTEGER,
        sponseeContactId INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sponsorContactId) REFERENCES sponsor_contacts(id),
        FOREIGN KEY (sponseeContactId) REFERENCES sponsee_contacts(id)
      )
    `
  });

  // Create sponsors table
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
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  });

  // Create sponsees table
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
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `
  });

  // Add missing columns to existing tables if they don't exist
  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE sponsor_contacts ADD COLUMN topic TEXT;`
    });
    console.log('[ sqliteLoader.js ] Added topic column to sponsor_contacts');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE sponsor_contacts ADD COLUMN duration INTEGER;`
    });
    console.log('[ sqliteLoader.js ] Added duration column to sponsor_contacts');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE sponsor_contacts ADD COLUMN sponsorId INTEGER;`
    });
    console.log('[ sqliteLoader.js ] Added sponsorId column to sponsor_contacts');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE sponsee_contacts ADD COLUMN topic TEXT;`
    });
    console.log('[ sqliteLoader.js ] Added topic column to sponsee_contacts');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE sponsee_contacts ADD COLUMN duration INTEGER;`
    });
    console.log('[ sqliteLoader.js ] Added duration column to sponsee_contacts');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE action_items ADD COLUMN contactId INTEGER;`
    });
    console.log('[ sqliteLoader.js ] Added contactId column to action_items');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE action_items ADD COLUMN sponsorName TEXT;`
    });
    console.log('[ sqliteLoader.js ] Added sponsorName column to action_items');
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    await sqlite.execute({
      database: DB_NAME,
      statements: `ALTER TABLE action_items ADD COLUMN sponsorId INTEGER;`
    });
    console.log('[ sqliteLoader.js ] Added sponsorId column to action_items');
  } catch (error) {
    // Column already exists, ignore error
  }

  console.log('[ sqliteLoader.js ] All tables created with proper relationships and missing columns added');
}

async function resetDatabase(sqlite) {
  try {
    console.log('[ sqliteLoader.js ] Starting database reset process...');
    // Comprehensive list of ALL tables that might exist - including any possible variations
    const tables = [
      'users', 
      'activities', 
      'meetings', 
      'sponsor_contacts', 
      'sponsee_contacts', 
      'action_items', 
      'sponsors', 
      'sponsees',
      'sponsor_contact_details', // Additional table that might exist
      'contact_details',         // Alternative name
      'todos',                   // In case todo items exist separately
      'preferences'              // User preferences table
    ];
    
    // First, get actual table names from database to ensure we drop everything
    try {
      const tableQuery = await sqlite.query({
        database: DB_NAME,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        values: []
      });
      
      if (tableQuery.values && tableQuery.values.length > 0) {
        console.log('[ sqliteLoader.js ] Found existing tables:', tableQuery.values);
        // Add any discovered tables to our drop list
        const discoveredTables = tableQuery.values.map(row => 
          row.name || (Array.isArray(row) ? row[0] : row)
        ).filter(name => name && !tables.includes(name));
        
        if (discoveredTables.length > 0) {
          console.log('[ sqliteLoader.js ] Adding discovered tables to drop list:', discoveredTables);
          tables.push(...discoveredTables);
        }
      }
    } catch (queryError) {
      console.log('[ sqliteLoader.js ] Could not query existing tables, proceeding with default list:', queryError.message);
    }
    
    // Drop all tables
    for (const table of tables) {
      try {
        console.log(`[ sqliteLoader.js ] Dropping table: ${table}`);
        await sqlite.execute({
          database: DB_NAME,
          statements: `DROP TABLE IF EXISTS ${table};`
        });
        console.log(`[ sqliteLoader.js ] Successfully dropped table: ${table}`);
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error dropping table ${table}:`, error);
        // Continue with other tables even if one fails
      }
    }
    
    console.log('[ sqliteLoader.js ] Recreating tables...');
    await createTables(sqlite);
    console.log('[ sqliteLoader.js ] Database reset complete - all data permanently deleted');
    
  } catch (error) {
    console.error('[ sqliteLoader.js ] Error during database reset:', error);
    throw error;
  }
}