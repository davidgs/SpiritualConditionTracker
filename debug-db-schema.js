/**
 * Debug script to check the actual database schema
 */

const { CapacitorSQLite } = require('@capacitor-community/sqlite');

async function checkDatabaseSchema() {
  try {
    console.log('Checking database schema...');
    
    // Get table info for meetings
    const result = await CapacitorSQLite.execute({
      database: 'spiritual_condition_tracker.db',
      statements: 'PRAGMA table_info(meetings);'
    });
    
    console.log('Current meetings table schema:');
    console.log(JSON.stringify(result, null, 2));
    
    // Also check if the table exists
    const tableCheck = await CapacitorSQLite.execute({
      database: 'spiritual_condition_tracker.db', 
      statements: "SELECT name FROM sqlite_master WHERE type='table' AND name='meetings';"
    });
    
    console.log('Table exists check:');
    console.log(JSON.stringify(tableCheck, null, 2));
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkDatabaseSchema();