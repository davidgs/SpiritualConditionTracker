/**
 * SQLite database loader optimized for Capacitor
 * Provides cross-platform SQLite access with special handling for iOS
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
    // First, check if Capacitor is available
    if (!window.Capacitor || !window.Capacitor.Plugins) {
      throw new Error('Capacitor not found - this app requires a native environment');
    }
    
    // Detect platform information for specialized handling
    const platform = window.Capacitor.getPlatform();
    console.log('[ sqliteLoader.js:24 ]  Capacitor platform detected:', platform);
    console.log('[ sqliteLoader.js:25 ]  Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));

    // Get the SQLite plugin
    const sqlite = window.Capacitor.Plugins.CapacitorSQLite;
    
    if (!sqlite) {
      throw new Error('CapacitorSQLite plugin not found');
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
        console.log(`[ sqliteLoader.js:523 ] Getting all items from ${collection}`);
        
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });

        if (!result || !result.values) {
          console.log(`[ sqliteLoader.js:531 ] No data found for ${collection}`);
          return [];
        }

        console.log(`[ sqliteLoader.js:535 ] Raw query result for ${collection}:`, result);

        // Handle different response formats
        let items = [];
        
        if (result.values.length > 1 && result.values[0].ios_columns) {
          // iOS format with separate columns and values arrays
          items = convertIOSFormatToStandard(result.values);
        } else {
          // Standard format
          items = result.values || [];
        }

        console.log(`[ sqliteLoader.js:548 ] Processed ${items.length} items from ${collection}`);
        return items;
      },

      async add(collection, item) {
        try {
          console.log('[ sqliteLoader.js ] Original item received for save:', JSON.stringify(item, null, 2));

          // Don't include ID field - let SQLite generate it with AUTOINCREMENT
          const { id, ...itemWithoutId } = item;

          console.log('[ sqliteLoader.js ] Item without ID:', JSON.stringify(itemWithoutId, null, 2));

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

          console.log('[ sqliteLoader.js ] Final item for database:', JSON.stringify(itemWithTimestamps, null, 2));

          // Build the SQL statement with embedded values (Capacitor SQLite format)
          const keys = Object.keys(itemWithTimestamps);
          const values = keys.map(key => itemWithTimestamps[key]);

          console.log('[ sqliteLoader.js ] SQL keys:', keys);
          console.log('[ sqliteLoader.js ] SQL values:', values);

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

          console.log('[ sqliteLoader.js ] Insert completed');

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

            console.log(`[ sqliteLoader.js ] Using ID: ${newId} for new ${collection} record`);
            
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
          console.log(`[ sqliteLoader.js ] Updating ${collection} id ${id} with:`, updates);
          
          // Always include updatedAt timestamp
          const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date().toISOString()
          };

          // Convert objects and arrays to JSON strings
          const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
          jsonFields.forEach(field => {
            if (updatesWithTimestamp[field] !== undefined && updatesWithTimestamp[field] !== null) {
              if (Array.isArray(updatesWithTimestamp[field]) || typeof updatesWithTimestamp[field] === 'object') {
                updatesWithTimestamp[field] = JSON.stringify(updatesWithTimestamp[field]);
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
          
          const sql = `UPDATE ${collection} SET ${setClause} WHERE id = ${id}`;
          console.log(`[ sqliteLoader.js ] Update SQL:`, sql);
          
          await sqlite.execute({
            database: DB_NAME,
            statements: sql
          });
          
          console.log(`[ sqliteLoader.js ] Update completed for ${collection} id ${id}`);
          
          return { ...updatesWithTimestamp, id };
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error updating ${collection}:`, error);
          throw error;
        }
      },

      async getById(collection, id) {
        try {
          const result = await sqlite.query({
            database: DB_NAME,
            statement: `SELECT * FROM ${collection} WHERE id = ${id}`,
            values: []
          });

          if (!result || !result.values || result.values.length === 0) {
            return null;
          }

          // Handle different response formats
          if (result.values.length > 1 && result.values[0].ios_columns) {
            const items = convertIOSFormatToStandard(result.values);
            return items[0] || null;
          } else {
            return result.values[0] || null;
          }
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error getting ${collection} by id ${id}:`, error);
          throw error;
        }
      },

      async remove(collection, id) {
        try {
          console.log(`[ sqliteLoader.js ] Removing from ${collection} id:`, id);
          
          await sqlite.execute({
            database: DB_NAME,
            statements: `DELETE FROM ${collection} WHERE id = ${id}`
          });
          
          console.log(`[ sqliteLoader.js ] Delete completed for ${collection} id ${id}`);
          
          return true;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error removing from ${collection}:`, error);
          throw error;
        }
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
        preferences TEXT DEFAULT '{"use24HourFormat":false}',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Users table created');

  // Activities table
  await sqlite.execute({
    database: DB_NAME,
    statements: `
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Activities table created');

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
        type TEXT DEFAULT 'todo',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js ] Action items table created');

  console.log('[ sqliteLoader.js ] All tables created successfully');
}