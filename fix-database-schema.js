/**
 * Database schema fix for action_items table
 * This script will add the missing contactId column
 */

const sqlite = require('@capacitor-community/sqlite');

async function fixActionItemsSchema() {
  try {
    console.log('Starting database schema fix...');
    
    // Check if we can connect to the database
    const dbName = 'spiritualCondition.db';
    
    // Try to add the contactId column if it doesn't exist
    const alterSQL = 'ALTER TABLE action_items ADD COLUMN contactId INTEGER';
    
    console.log('Attempting to add contactId column to action_items table...');
    console.log('SQL:', alterSQL);
    
    // This will fail if the column already exists, which is fine
    try {
      await sqlite.execute({
        database: dbName,
        statements: alterSQL
      });
      console.log('SUCCESS: Added contactId column to action_items table');
    } catch (alterError) {
      if (alterError.message && alterError.message.includes('duplicate column name')) {
        console.log('INFO: contactId column already exists');
      } else {
        console.log('ALTER TABLE failed:', alterError.message);
        
        // If ALTER fails for other reasons, try creating a new table with proper schema
        console.log('Creating new action_items table with proper schema...');
        
        const createSQL = `
          CREATE TABLE IF NOT EXISTS action_items_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contactId INTEGER,
            title TEXT DEFAULT '',
            text TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            dueDate TEXT DEFAULT NULL,
            completed INTEGER DEFAULT 0,
            type TEXT DEFAULT 'todo',
            createdAt TEXT,
            updatedAt TEXT,
            FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id)
          )
        `;
        
        await sqlite.execute({
          database: dbName,
          statements: createSQL
        });
        
        console.log('SUCCESS: Created new action_items table with contactId');
      }
    }
    
    console.log('Database schema fix completed');
    return true;
    
  } catch (error) {
    console.error('Database schema fix failed:', error);
    return false;
  }
}

// Export for use in other modules
module.exports = { fixActionItemsSchema };

// Run if called directly
if (require.main === module) {
  fixActionItemsSchema();
}