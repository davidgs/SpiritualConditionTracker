/**
 * Utility script to reset the database for testing purposes
 * This will drop and recreate all tables
 */

const DB_NAME = 'spiritualTracker.db';

/**
 * Reset the database by dropping all tables and recreating them
 */
async function resetDatabase() {
  console.log('[ reset-database.js ] Attempting to reset database...');

  if (!window.Capacitor || !window.Capacitor.Plugins?.CapacitorSQLite) {
    console.error('[ reset-database.js ] CapacitorSQLite plugin not available');
    return false;
  }

  try {
    const sqlitePlugin = window.Capacitor.Plugins.CapacitorSQLite;
    
    // Create connection if needed
    try {
      await sqlitePlugin.createConnection({
        database: DB_NAME,
        encrypted: false,
        mode: 'no-encryption'
      });
      console.log('[ reset-database.js ] Database connection created');
    } catch (error) {
      // Connection might already exist, try to continue
      console.log('[ reset-database.js ] Connection may already exist:', error.message);
    }
    
    // Open the database
    try {
      await sqlitePlugin.open({ database: DB_NAME });
      console.log('[ reset-database.js ] Database opened successfully');
    } catch (error) {
      console.error('[ reset-database.js ] Error opening database:', error);
      return false;
    }
    
    // Drop all tables
    const tables = [
      'users', 'activities', 'meetings', 'messages', 
      'sobriety_milestones', 'spiritual_fitness', 'daily_inventory', 
      'preferences', 'sponsor_contacts', 'sponsor_contact_details'
    ];
    
    console.log('[ reset-database.js ] Dropping all existing tables...');
    for (const table of tables) {
      try {
        await sqlitePlugin.execute({
          database: DB_NAME,
          statements: `DROP TABLE IF EXISTS ${table};`
        });
        console.log(`[ reset-database.js ] Dropped table: ${table}`);
      } catch (error) {
        console.error(`[ reset-database.js ] Error dropping table ${table}:`, error);
      }
    }
    
    // Close the connection to ensure all changes are saved
    await sqlitePlugin.close({ database: DB_NAME });
    
    // Release the connection
    await sqlitePlugin.closeConnection({ database: DB_NAME });
    
    console.log('[ reset-database.js ] Database reset completed successfully');
    console.log('[ reset-database.js ] Please refresh the page to recreate tables');
    
    return true;
  } catch (error) {
    console.error('[ reset-database.js ] Error resetting database:', error);
    return false;
  }
}

// Add a function to the window object so it can be called from the console
window.resetDatabase = resetDatabase;

// Automatically execute if the script contains a specific query parameter
if (window.location.search.includes('reset_db=true')) {
  console.log('[ reset-database.js ] Auto-executing database reset...');
  resetDatabase().then(success => {
    if (success) {
      console.log('[ reset-database.js ] Database reset successful, refreshing page...');
      // Add a small delay to ensure logs are visible
      setTimeout(() => {
        window.location.href = window.location.pathname; // Refresh without the query parameter
      }, 2000);
    }
  });
}

export default resetDatabase;