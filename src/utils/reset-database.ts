/**
 * Utility script to reset the database for testing purposes
 * This will drop and recreate all tables
 */

const DB_NAME = 'spiritualTracker.db';

/**
 * Reset the database by dropping all tables and recreating them
 */
export async function resetDatabase() {
  console.log('[ reset-database.js: 12 ] Attempting to reset database...');

  if (!window.Capacitor || !window.Capacitor.Plugins?.CapacitorSQLite) {
    console.error('[ reset-database.js: 15 ] CapacitorSQLite plugin not available');
    return false;
  }

  try {
    // Use the existing global database connection instead of creating a new one
    const sqlitePlugin = window.Capacitor.Plugins.CapacitorSQLite;
    
    if (!window.db || !window.dbInitialized) {
      console.error('[ reset-database.js: 17 ] Global database not initialized');
      return false;
    }
    
    console.log('[ reset-database.js: 21 ] Using existing database connection');
    
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
    
    // Import and call the table setup function
    const { setupTables } = await import('./sqliteLoader');
    await setupTables(sqlitePlugin);
    
    console.log('[ reset-database.js: 68 ] All tables recreated successfully');
    
    // Close the connection to ensure all changes are saved
    await sqlitePlugin.close({ database: DB_NAME });
    
    // Release the connection
    await sqlitePlugin.closeConnection({ database: DB_NAME });
    
    console.log('[ reset-database.js: 75 ] Database reset completed successfully');
    console.log('[ reset-database.js: 76 ] Database is ready to use');
    
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