/**
 * Simple SQLite database loader for Capacitor
 */

const DB_NAME = 'spiritualTracker.db';

async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js:14 ] Initializing SQLite database via Capacitor...');

  try {
    if (!window.Capacitor) {
      throw new Error('Capacitor is not available in this environment');
    }

    const platform = window.Capacitor.getPlatform?.() || 'unknown';
    console.log('[ sqliteLoader.js:24 ]  Capacitor platform detected:', platform);
    console.log('[ sqliteLoader.js:25 ]  Capacitor plugins available:', Object.keys(window.Capacitor.Plugins || {}));

    const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
    if (!sqlitePlugin) {
      throw new Error('CapacitorSQLite plugin not available - ensure the plugin is properly installed');
    }

    console.log('[ sqliteLoader.js:39 ]  Found CapacitorSQLite plugin:', !!sqlitePlugin);

    // Create connection
    try {
      await sqlitePlugin.createConnection({
        database: DB_NAME,
        version: 1,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false
      });
      console.log('[ sqliteLoader.js:54 ]  Database connection created');
    } catch (createError) {
      console.log('[ sqliteLoader.js:71 ]  Connection might already exist, continuing...');
    }

    // Open database
    await sqlitePlugin.open({ database: DB_NAME, readonly: false });
    console.log('[ sqliteLoader.js:76 ]  Database opened successfully');

    // EMERGENCY DATABASE RESET (uncommented to fix NOT NULL constraint issue)
    console.log('[ sqliteLoader.js ] FORCING DATABASE SCHEMA RESET - DROP ALL TABLES');
    const tables = ['users', 'activities', 'action_items', 'sponsor_contacts', 'meetings'];
    
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
    console.error('[ sqliteLoader.js ] Error initializing Capacitor SQLite:', error);
    throw new Error(`CapacitorSQLite plugin not available - ensure the plugin is properly installed`);
  }
}

async function setupBasicSchema(sqlite) {
  console.log('[ sqliteLoader.js:261 ]  Verifying database schema (preserving existing data)');

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
          sponsor_name TEXT,
          sponsor_lastName TEXT,
          sponsor_phone TEXT,
          sponsor_email TEXT,
          sponsor_sobrietyDate TEXT,
          sponsor_notes TEXT,
          messagingKeys TEXT,
          profileImageUri TEXT,
          sponsees TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:305 ]  Users table created successfully');

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
    console.log('[ sqliteLoader.js:341 ]  Activities table created successfully');

    // Action items table
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

    // Sponsor contacts table
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS sponsor_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT DEFAULT 'default_user',
          date TEXT,
          type TEXT DEFAULT 'general',
          note TEXT DEFAULT '',
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:433 ]  Sponsor contacts table created');

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
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });
    console.log('[ sqliteLoader.js:387 ]  Meetings table created successfully');

  } catch (error) {
    console.error('[ sqliteLoader.js ] Error setting up database schema:', error);
    throw error;
  }
}

function createDatabaseInterface(sqlite) {
  return {
    async getAll(collection) {
      try {
        console.log(`[ sqliteLoader.js:523 ] Getting all items from ${collection}`);
        
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });

        if (!result || !result.values) {
          console.log(`[ sqliteLoader.js:547 ] No data found for ${collection}`);
          return [];
        }

        const converted = convertIOSFormatToStandard(result.values);
        console.log(`[ sqliteLoader.js:592 ] Converted ${converted.length} iOS format items to standard format`);
        
        return converted;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error getting all from ${collection}:`, error);
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

        const columns = Object.keys(itemWithTimestamp);
        const values = Object.values(itemWithTimestamp);
        const placeholders = columns.map(() => '?').join(', ');

        const insertSQL = `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        console.log(`[ sqliteLoader.js ] Insert SQL: ${insertSQL}`);
        console.log(`[ sqliteLoader.js ] Values: ${JSON.stringify(values)}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: insertSQL,
          values: values
        });

        if (result && result.changes && result.changes.lastId) {
          return {
            ...itemWithTimestamp,
            id: result.changes.lastId
          };
        }

        return { ...itemWithTimestamp, id: Date.now() };
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

        await sqlite.execute({
          database: DB_NAME,
          statements: updateSQL,
          values: values
        });

        return await this.getById(collection, id);
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error updating ${collection} id ${id}:`, error);
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
        console.error(`[ sqliteLoader.js ] Error getting ${collection} by id ${id}:`, error);
        return null;
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

        return result && result.changes && result.changes.changes > 0;
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error removing ${collection} id ${id}:`, error);
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