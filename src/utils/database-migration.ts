import { getSQLite } from './sqliteLoader';

const DB_NAME = 'spiritualCondition.db';

/**
 * Migrate the action_items table to include contactId column
 */
export async function migrateActionItemsTable() {
  try {
    console.log('[database-migration] Starting action_items table migration');
    const sqlite = getSQLite();

    // Check if contactId column already exists
    const tableInfo = await sqlite.query({
      database: DB_NAME,
      statement: `SELECT sql FROM sqlite_master WHERE type='table' AND name='action_items'`,
      values: []
    });

    console.log('[database-migration] Current table schema:', JSON.stringify(tableInfo));

    let hasContactId = false;
    if (tableInfo.values && tableInfo.values.length > 0) {
      const schema = tableInfo.values[0].sql || '';
      hasContactId = schema.includes('contactId');
    }

    if (!hasContactId) {
      console.log('[database-migration] Adding contactId column to action_items table');
      
      // Add the contactId column
      await sqlite.execute({
        database: DB_NAME,
        statements: `ALTER TABLE action_items ADD COLUMN contactId INTEGER`
      });

      console.log('[database-migration] Successfully added contactId column');
    } else {
      console.log('[database-migration] contactId column already exists');
    }

    // Ensure the table has proper structure
    await sqlite.execute({
      database: DB_NAME,
      statements: `
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
      `
    });

    // Copy data from old table to new if needed
    const copyResult = await sqlite.execute({
      database: DB_NAME,
      statements: `
        INSERT OR IGNORE INTO action_items_new 
        (id, contactId, title, text, notes, dueDate, completed, type, createdAt, updatedAt)
        SELECT 
          id, 
          contactId, 
          title, 
          text, 
          notes, 
          dueDate, 
          completed, 
          type, 
          createdAt, 
          updatedAt 
        FROM action_items
      `
    });

    console.log('[database-migration] Migration completed successfully');
    return true;
  } catch (error) {
    console.error('[database-migration] Migration failed:', error);
    return false;
  }
}

/**
 * Run all necessary database migrations
 */
export async function runDatabaseMigrations() {
  try {
    console.log('[database-migration] Starting database migrations');
    
    // Run action items migration
    await migrateActionItemsTable();
    
    console.log('[database-migration] All migrations completed');
    return true;
  } catch (error) {
    console.error('[database-migration] Migration process failed:', error);
    return false;
  }
}