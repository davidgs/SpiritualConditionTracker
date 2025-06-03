/**
 * Simple SQLite database loader for Capacitor
 */

const DB_NAME = 'spiritual_condition_tracker.db';

export default async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js:8 ] Initializing SQLite database via Capacitor...');
  
  try {
    // Check if we're in a Capacitor environment
    if (!window.Capacitor || !window.Capacitor.Plugins) {
      throw new Error('Capacitor not found - this app requires a native environment');
    }
    
    const platform = window.Capacitor.getPlatform();
    console.log('[ sqliteLoader.js:16 ]  Capacitor platform detected:', platform);
    console.log('[ sqliteLoader.js:17 ]  Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));
    
    const sqlite = window.Capacitor.Plugins.CapacitorSQLite;
    
    if (!sqlite) {
      throw new Error('CapacitorSQLite plugin not found');
    }
    
    console.log('[ sqliteLoader.js:24 ]  Found CapacitorSQLite plugin:', !!sqlite);
    
    // Create connection
    try {
      await sqlite.createConnection({
        database: DB_NAME,
        version: 1,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false
      });
      console.log('[ sqliteLoader.js:37 ]  Database connection created');
    } catch (connectionError) {
      console.log('[ sqliteLoader.js:39 ]  Connection may already exist:', connectionError.message);
    }

    // Open the database
    await sqlite.open({ database: DB_NAME, readonly: false });
    console.log('[ sqliteLoader.js:43 ]  Database opened successfully');

    // Create all tables
    await createTables(sqlite);
    
    console.log('[ sqliteLoader.js:47 ]  Database initialization complete');

    // Return the database interface
    return {
      async getAll(collection) {
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

        console.log(`[ sqliteLoader.js:264 ] Raw query result for ${collection}:`, result);

        // Handle different response formats
        let items = [];
        
        if (result.values.length > 1 && result.values[0].ios_columns) {
          // iOS format with separate columns and values arrays
          items = convertIOSFormatToStandard(result.values);
        } else {
          // Standard format
          items = result.values || [];
        }

        console.log(`[ sqliteLoader.js:277 ] Processed ${items.length} items from ${collection}`);
        return items;
      },

      async add(collection, item) {
        try {
          console.log(`[ sqliteLoader.js ] Adding to ${collection}:`, item);

          const fields = Object.keys(item);
          const values = Object.values(item);
          
          // Convert values to proper SQL format
          const sqlValues = values.map(value => {
            if (value === null || value === undefined) {
              return 'NULL';
            } else if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
            } else if (typeof value === 'object') {
              return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            } else {
              return value;
            }
          }).join(', ');

          const sql = `INSERT INTO ${collection} (${fields.join(', ')}) VALUES (${sqlValues})`;
          console.log(`[ sqliteLoader.js ] Insert SQL:`, sql);

          const result = await sqlite.execute({
            database: DB_NAME,
            statements: sql,
            values: []
          });

          console.log(`[ sqliteLoader.js ] Insert result:`, result);
          
          // Check if insert was successful
          if (result && result.changes && result.changes.changes > 0) {
            console.log(`[ sqliteLoader.js ] Insert successful, getting the AUTO_INCREMENT ID`);
            
            // Query the most recent record to get the actual AUTO_INCREMENT ID
            const recentRecords = await sqlite.query({
              database: DB_NAME,
              statement: `SELECT id FROM ${collection} ORDER BY id DESC LIMIT 1`,
              values: []
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
                    ...item,
                    id: actualId
                  };
                }
              } else {
                // Handle standard format
                const actualId = recentRecords.values[0].id || recentRecords.values[0][0];
                console.log(`[ sqliteLoader.js ] Found actual AUTO_INCREMENT ID: ${actualId}`);
                
                return {
                  ...item,
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
          
          const fields = Object.keys(updates);
          
          // Convert updates to proper SQL format
          const setClause = fields.map(field => {
            const value = updates[field];
            if (value === null || value === undefined) {
              return `${field} = NULL`;
            } else if (typeof value === 'string') {
              return `${field} = '${value.replace(/'/g, "''")}'`;
            } else if (typeof value === 'object') {
              return `${field} = '${JSON.stringify(value).replace(/'/g, "''")}'`;
            } else {
              return `${field} = ${value}`;
            }
          }).join(', ');
          
          const sql = `UPDATE ${collection} SET ${setClause} WHERE id = ${id}`;
          
          console.log(`[ sqliteLoader.js:334 ] Update SQL:`, sql);
          
          const result = await sqlite.execute({
            database: DB_NAME,
            statements: sql,
            values: []
          });
          
          console.log(`[ sqliteLoader.js:342 ] Update result:`, result);
          
          if (result && result.changes && result.changes.changes > 0) {
            return { ...updates, id };
          } else {
            console.error(`[ sqliteLoader.js:346 ] Update failed - no rows affected`);
            return null;
          }
        } catch (error) {
          console.error(`[ sqliteLoader.js:350 ] Error updating ${collection}:`, error);
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
          console.log(`[ sqliteLoader.js:419 ] Removing from ${collection} id:`, id);
          
          const result = await sqlite.execute({
            database: DB_NAME,
            statements: `DELETE FROM ${collection} WHERE id = ${id}`,
            values: []
          });
          
          console.log(`[ sqliteLoader.js:426 ] Delete result:`, result);
          
          return result && result.changes && result.changes.changes > 0;
        } catch (error) {
          console.error(`[ sqliteLoader.js:430 ] Error removing from ${collection}:`, error);
          throw error;
        }
      }
    };

  } catch (error) {
    console.error('[ sqliteLoader.js:437 ] Database initialization failed:', error);
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
  console.log('[ sqliteLoader.js:70 ] Creating database tables...');

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
  console.log('[ sqliteLoader.js:88 ] Users table created');

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
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js:103 ] Activities table created');

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
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js:123 ] Meetings table created');

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
        notes TEXT,
        sponsorType TEXT DEFAULT 'sponsor',
        createdAt TEXT,
        updatedAt TEXT
      )
    `
  });
  console.log('[ sqliteLoader.js:141 ] Sponsors table created');

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
  console.log('[ sqliteLoader.js:159 ] Sponsor contacts table created');

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
  console.log('[ sqliteLoader.js:177 ] Action items table created');

  console.log('[ sqliteLoader.js:179 ] All tables created successfully');
}