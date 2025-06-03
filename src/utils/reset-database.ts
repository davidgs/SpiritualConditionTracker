/**
 * Utility script to reset the database for testing purposes
 * This will drop and recreate all tables
 */

const DB_NAME = 'spiritualCondition.db';

async function setupBasicSchema(sqlite) {
  console.log('[ reset-database.js ] Setting up database schema...');

  try {
    // Users table with complete schema
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

    // Activities table
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
          prayers TEXT,
          actionItemId INTEGER,
          actionItemData TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `
    });

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

    console.log('[ reset-database.js ] Database schema setup complete');
  } catch (error) {
    console.error('[ reset-database.js ] Error setting up database schema:', error);
    throw error;
  }
}

/**
 * Reset the database by dropping all tables and recreating them
 */
export async function resetDatabase() {
  console.log('Starting data reset process');

  if (!window.Capacitor || !window.Capacitor.Plugins?.CapacitorSQLite) {
    console.error('[ reset-database.js: 15 ] CapacitorSQLite plugin not available');
    return false;
  }

  try {
    const sqlitePlugin = window.Capacitor.Plugins.CapacitorSQLite;
    
    console.log('[ reset-database.js: 21 ] Using CapacitorSQLite plugin directly');
    
    // Ensure connection exists
    try {
      await sqlitePlugin.createConnection({
        database: DB_NAME,
        version: 1,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false
      });
    } catch (createError) {
      console.log('[ reset-database.js ] Connection already exists, continuing...');
    }
    
    // Open database
    await sqlitePlugin.open({ database: DB_NAME, readonly: false });
    
    // Drop all tables - updated list from current sqliteLoader
    const tables = [
      'sponsor_contact_action_items', // Drop this first due to foreign keys
      'sponsor_contact_details',      // Drop this second due to foreign keys
      'action_items',
      'sponsor_contacts', 
      'meetings',
      'activities',
      'users'
    ];
    
    console.log('[ reset-database.js: 51 ] Dropping all existing tables...');
    for (const table of tables) {
      try {
        await sqlitePlugin.execute({
          database: DB_NAME,
          statements: `DROP TABLE IF EXISTS ${table};`
        });
        console.log(`[ reset-database.js: 58 ] Dropped table: ${table}`);
      } catch (error) {
        console.error(`[ reset-database.js: 60 ] Error dropping table ${table}:`, error);
      }
    }
    
    // Recreate all tables using the current schema from sqliteLoader
    console.log('[ reset-database.js: 63 ] Recreating tables with current schema...');
    
    // Recreate tables directly since simplified sqliteLoader doesn't export setupTables
    await setupBasicSchema(sqlitePlugin);
    
    console.log('[ reset-database.js: 68 ] All tables recreated successfully');
    
    console.log('[ reset-database.js: 68 ] All tables recreated successfully');
    
    // Clear the global database reference so it gets reinitialized
    if (window.db) {
      delete window.db;
    }
    
    console.log('[ reset-database.js: 75 ] Database reset completed successfully');
    return true;
  } catch (error) {
    console.error('[ reset-database.js: 75 ] Error resetting database:', error);
    return false;
  }
}

// Add a function to the window object so it can be called from the console
window.resetDatabase = resetDatabase;

// Automatically execute if the script contains a specific query parameter
if (window.location.search.includes('reset_db=true')) {
  console.log('[ reset-database.js: 85 ] Auto-executing database reset...');
  resetDatabase().then(success => {
    if (success) {
      console.log('[ reset-database.js: 88 ] Database reset successful, refreshing page...');
      // Add a small delay to ensure logs are visible
      setTimeout(() => {
        window.location.href = window.location.pathname; // Refresh without the query parameter
      }, 2000);
    }
  });
}

export default resetDatabase;