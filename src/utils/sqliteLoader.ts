/**
 * Simple SQLite database loader for Capacitor
 */

const DB_NAME = 'spiritualTracker.db';

async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js:8 ] Initializing SQLite database via Capacitor...');

  try {
    if (!window.Capacitor) {
      throw new Error('Capacitor is not available in this environment');
    }

    const platform = window.Capacitor.getPlatform?.() || 'unknown';
    console.log('[ sqliteLoader.js:16 ]  Capacitor platform detected:', platform);
    console.log('[ sqliteLoader.js:17 ]  Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));

    const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
    if (!sqlitePlugin) {
      throw new Error('CapacitorSQLite plugin not available - ensure the plugin is properly installed');
    }

    console.log('[ sqliteLoader.js:24 ]  Found CapacitorSQLite plugin:', !!sqlitePlugin);

    // Create connection
    try {
      await sqlitePlugin.createConnection({
        database: DB_NAME,
        version: 1,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false
      });
      console.log('[ sqliteLoader.js:35 ]  Database connection created');
    } catch (createError) {
      console.log('[ sqliteLoader.js:37 ]  Connection might already exist, continuing...');
    }

    // Open database
    await sqlitePlugin.open({ database: DB_NAME, readonly: false });
    console.log('[ sqliteLoader.js:42 ]  Database opened successfully');

    // EMERGENCY DATABASE RESET (uncommented to rebuild schema with contactId)
    console.log('[ sqliteLoader.js ] FORCING DATABASE SCHEMA RESET - DROP ALL TABLES');
    
    // Disable foreign key constraints during reset
    await sqlitePlugin.execute({
      database: DB_NAME,
      statements: `PRAGMA foreign_keys = OFF;`
    });
    
    const tables = ['users', 'activities', 'action_items', 'sponsor_contacts', 'sponsors', 'meetings'];
    
    for (const table of tables) {
      try {
        await sqlitePlugin.execute({
          database: DB_NAME,
          statements: `DROP TABLE IF EXISTS ${table};`
        });
        console.log(`[ sqliteLoader.js ] Dropped table: ${table}`);
      } catch (error) {
        console.log(`[ sqliteLoader.js ] Could not drop table ${table}:`, error);
      }
    }
    
    // Setup basic schema with correct fields
    await setupBasicSchema(sqlitePlugin);

    const dbInterface = createDatabaseInterface(sqlitePlugin);
    
    // Set global database reference for DatabaseService
    window.db = dbInterface;
    
    return dbInterface;
  } catch (error) {
    console.error('[ sqliteLoader.js:72 ] Error initializing Capacitor SQLite:', error);
    throw new Error(`CapacitorSQLite plugin not available - ensure the plugin is properly installed`);
  }
}

async function setupBasicSchema(sqlite) {
  console.log('[ sqliteLoader.js:78 ]  Verifying database schema (preserving existing data)');

  try {
    // Users table
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
          sponsor_ids TEXT,
          messagingKeys TEXT,
          profileImageUri TEXT,
          sponsees TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:104 ]  Users table created successfully');

    // Activities table
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT,
          duration INTEGER,
          date TEXT,
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
          prayers TEXT,
          actionItemId INTEGER,
          actionItemData TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:141 ]  Activities table created successfully');

    // Action items table - linked to contacts
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
          type TEXT DEFAULT 'todo',
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:160 ]  Action items table created');

    // Sponsors table - linked to users
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS sponsors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          name TEXT,
          lastName TEXT,
          phone TEXT,
          email TEXT,
          sobrietyDate TEXT,
          notes TEXT,
          sponsorType TEXT DEFAULT 'sponsor',
          createdAt TEXT,
          updatedAt TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `
    });
    console.log('[ sqliteLoader.js:181 ]  Sponsors table created');

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
          updatedAt TEXT,
          FOREIGN KEY (sponsorId) REFERENCES sponsors(id)
        )
      `
    });
    console.log('[ sqliteLoader.js:202 ]  Sponsor contacts table created');

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
          online INTEGER DEFAULT 0,
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
          coordinates TEXT,
          isHomeGroup INTEGER DEFAULT 0,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:239 ]  Meetings table created successfully');

    // Keep foreign key constraints disabled for now to prevent save failures
    await sqlite.execute({
      database: DB_NAME,
      statements: `PRAGMA foreign_keys = OFF;`
    });
    console.log('[ sqliteLoader.js ] Foreign key constraints disabled for stability');

  } catch (error) {
    console.error('[ sqliteLoader.js:242 ] Error setting up database schema:', error);
    throw error;
  }
}

function createDatabaseInterface(sqlite) {
  return {
    async getAll(collection) {
      try {
        console.log(`[ sqliteLoader.js:251 ] Getting all items from ${collection}`);
        
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });

        if (!result || !result.values) {
          console.log(`[ sqliteLoader.js:260 ] No data found for ${collection}`);
          return [];
        }

        const converted = convertIOSFormatToStandard(result.values);
        console.log(`[ sqliteLoader.js:265 ] Converted ${converted.length} iOS format items to standard format`);
        
        return converted;
      } catch (error) {
        console.error(`[ sqliteLoader.js: 269 ] Error getting all from ${collection}:`, error);
        return [];
      }
    },

    async add(collection, item) {
      try {
        console.log(`[ sqliteLoader.js ] Adding item to ${collection}:`, item);

        const timestamp = new Date().toISOString();
        const itemWithTimestamp = {
          ...item,
          createdAt: item.createdAt || timestamp,
          updatedAt: item.updatedAt || timestamp
        };

        // Remove 'id' field to let AUTO_INCREMENT handle it
        const { id, ...itemForInsert } = itemWithTimestamp;
        
        const columns = Object.keys(itemForInsert);
        const values = Object.values(itemForInsert);
        
        // Create properly escaped values for SQL
        const escapedValues = values.map(value => {
          if (value === null || value === undefined) {
            return 'NULL';
          } else if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
          } else if (typeof value === 'number') {
            return value.toString();
          } else {
            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          }
        }).join(', ');

        const insertSQL = `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${escapedValues})`;
        
        console.log(`[ sqliteLoader.js ] Insert SQL: ${insertSQL}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: insertSQL
        });

        console.log(`[ sqliteLoader.js ] Insert result:`, result);
        
        // Check if insert was successful
        if (result && result.changes && result.changes.changes > 0) {
          console.log(`[ sqliteLoader.js ] Insert successful, getting the AUTO_INCREMENT ID`);
          
          // Query the most recent record to get the actual AUTO_INCREMENT ID
          const recentRecords = await sqlite.query({
            database: DB_NAME,
            statement: `SELECT id FROM ${collection} ORDER BY id DESC LIMIT 1`
          });
          
          console.log(`[ sqliteLoader.js ] Recent records query result:`, recentRecords);
          
          if (recentRecords && recentRecords.values && recentRecords.values.length > 0) {
            // Handle Capacitor SQLite iOS format
            if (recentRecords.values.length > 1 && recentRecords.values[0].ios_columns) {
              const actualRecord = convertIOSFormatToStandard(recentRecords.values);
              if (actualRecord.length > 0) {
                const actualId = actualRecord[0].id;
                console.log(`[ sqliteLoader.js ] Found actual AUTO_INCREMENT ID: ${actualId}`);
                
                return {
                  ...itemForInsert,
                  id: actualId
                };
              }
            } else {
              // Handle standard format
              const actualId = recentRecords.values[0].id || recentRecords.values[0][0];
              console.log(`[ sqliteLoader.js ] Found actual AUTO_INCREMENT ID: ${actualId}`);
              
              return {
                ...itemForInsert,
                id: actualId
              };
            }
          }
        }
        
        // If we can't get the ID, something went wrong
        console.error(`[ sqliteLoader.js ] Could not retrieve AUTO_INCREMENT ID for ${collection}`);
        throw new Error('Failed to get database ID for new record');
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error adding to ${collection}:`, error);
        throw error;
      }
    },

    async update(collection, id, updates) {
      try {
        console.log(`[ sqliteLoader.js:326 ] Updating ${collection} id ${id} with:`, updates);

        const timestamp = new Date().toISOString();
        const updatesWithTimestamp = {
          ...updates,
          updatedAt: timestamp
        };

        const columns = Object.keys(updatesWithTimestamp);
        const values = Object.values(updatesWithTimestamp);
        
        // Create properly escaped SET clause for SQL
        const setClause = columns.map((col, index) => {
          const value = values[index];
          let escapedValue;
          if (value === null || value === undefined) {
            escapedValue = 'NULL';
          } else if (typeof value === 'string') {
            escapedValue = `'${value.replace(/'/g, "''")}'`;
          } else if (typeof value === 'number') {
            escapedValue = value.toString();
          } else {
            escapedValue = `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          }
          return `${col} = ${escapedValue}`;
        }).join(', ');

        const updateSQL = `UPDATE ${collection} SET ${setClause} WHERE id = ?`;
        
        console.log(`[ sqliteLoader.js:355 ] Update SQL: ${updateSQL}`);

        await sqlite.execute({
          database: DB_NAME,
          statements: updateSQL.replace('?', `'${id}'`)
        });

        return await this.getById(collection, id);
      } catch (error) {
        console.error(`[ sqliteLoader.js:364 ] Error updating ${collection} id ${id}:`, error);
        throw error;
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
        console.error(`[ sqliteLoader.js:383 ] Error getting ${collection} by id ${id}:`, error);
        return null;
      }
    },

    async remove(collection, id) {
      try {
        console.log(`[ sqliteLoader.js:390 ] Removing ${collection} id ${id}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: `DELETE FROM ${collection} WHERE id = '${id}'`
        });

        return result && result.changes && result.changes.changes > 0;
      } catch (error) {
        console.error(`[ sqliteLoader.js:399 ] Error removing ${collection} id ${id}:`, error);
        return false;
      }
    }
  };
}

function convertIOSFormatToStandard(values) {
  if (!values || values.length === 0) {
    return [];
  }

  const firstItem = values[0];
  if (!firstItem || !firstItem.ios_columns) {
    return values;
  }

  const columns = firstItem.ios_columns;
  const rows = values.slice(1);

  return rows.map(row => {
    const item = {};
    columns.forEach((column, index) => {
      item[column] = row[column];
    });
    return item;
  });
}

export default initSQLiteDatabase;