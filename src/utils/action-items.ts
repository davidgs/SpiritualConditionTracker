/**
 * Action Items Database Utilities
 * Handles the storage and retrieval of action items with SQLite
 */

// Database name
const DB_NAME = 'spiritualTracker.db';

// Get Capacitor SQLite plugin
function getSQLite(): any {
  // First check if database has been initialized
  if (!window.dbInitialized) {
    throw new Error('Database not initialized yet - please wait for initialization to complete');
  }
  
  // Then check if Capacitor SQLite plugin is available
  if (!window.Capacitor?.Plugins?.CapacitorSQLite) {
    throw new Error('CapacitorSQLite plugin not available');
  }
  
  return window.Capacitor.Plugins.CapacitorSQLite;
}

/**
 * Get all action items
 * @returns {Promise<Array>} - Action items
 */
export async function getAllActionItems() {
  try {
    console.log('[action-items.js - getAllActionItems: 29] Getting all action items');
    const sqlite = getSQLite();
    
    const sqlStatement = "SELECT * FROM action_items ORDER BY createdAt DESC";
    console.log('[action-items.js - getAllActionItems: 33] SQL query:', sqlStatement);
    
    const result = await sqlite.query({
      database: DB_NAME,
      statement: sqlStatement,
      values: []
    });
    
    console.log('[action-items.js - getAllActionItems: 40] Query result:', JSON.stringify(result));
    
    return result.values || [];
  } catch (error) {
    console.error('[action-items.js - getAllActionItems: 44] Error getting action items:', error);
    return [];
  }
}

/**
 * Debug function to get all action items and log them
 * @returns {Promise<void>}
 */
export async function getAllActionItemsDebug() {
  try {
    console.log('[action-items.js - getAllActionItemsDebug: 54] DEBUG: Retrieving all action items');
    const sqlite = getSQLite();
    
    // Query to get all action items
    const sqlStatement = "SELECT * FROM action_items ORDER BY createdAt DESC";
    console.log('[action-items.js - getAllActionItemsDebug: 59] DEBUG: SQL query:', sqlStatement);
    
    const result = await sqlite.query({
      database: DB_NAME,
      statement: sqlStatement,
      values: []
    });
    
    console.log('[action-items.js - getAllActionItemsDebug: 66] DEBUG: All action items result:', JSON.stringify(result));
    
    // Log the number of items found
    if (result?.values) {
      const itemCount = result.values.length > 0 && result.values[0].ios_columns ? 
        result.values.length - 1 : result.values.length;
      
      console.log(`[action-items.js - getAllActionItemsDebug: 72] DEBUG: Found ${itemCount} action items in database`);
    } else {
      console.log('[action-items.js - getAllActionItemsDebug: 74] DEBUG: No action items found or result structure invalid');
    }
  } catch (error) {
    console.error('[action-items.js - getAllActionItemsDebug: 77] DEBUG: Error retrieving all action items:', error);
  }
}

/**
 * Get all action items for a contact
 * @param {number} contactId - Contact ID
 * @returns {Promise<Array>} - Action items for the contact
 */
export async function getActionItemsForContact(contactId) {
  try {
    // Convert contactId to integer to ensure proper matching
    const contactIdInt = parseInt(contactId);
    console.log(`[action-items.js - getActionItemsForContact: 91] CONTACT_ID: ${contactIdInt} - Starting to fetch action items`);
    const sqlite = getSQLite();
    
    // First verify that tables exist
    console.log(`[action-items.js - getActionItemsForContact: 95] CONTACT_ID: ${contactIdInt} - Verifying tables exist`);
    try {
      // Ensure the action_items table exists with contactId
      await sqlite.execute({
        database: DB_NAME,
        statements: `
          CREATE TABLE IF NOT EXISTS action_items (
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
      
      // Ensure the join table exists
      await sqlite.execute({
        database: DB_NAME,
        statements: `
          CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contactId INTEGER,
            actionItemId INTEGER,
            createdAt TEXT,
            FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id),
            FOREIGN KEY (actionItemId) REFERENCES action_items(id)
          )
        `
      });
      
      console.log(`[action-items.js - getActionItemsForContact: 145] CONTACT_ID: ${contactIdInt} - Tables verified`);
    } catch (tableError) {
      console.error(`[action-items.js - getActionItemsForContact: 147] CONTACT_ID: ${contactIdInt} - Error verifying tables:`, tableError);
    }
    
    // Query action items directly using contactId
    console.log(`[action-items.js - getActionItemsForContact: 128] CONTACT_ID: ${contactIdInt} - Querying action items directly`);
    
    const result = await sqlite.query({
      database: DB_NAME,
      statement: `SELECT * FROM action_items WHERE contactId = ? ORDER BY createdAt DESC`,
      values: [contactIdInt]
    });
    
    console.log(`[action-items.js - getActionItemsForContact: 166] CONTACT_ID: ${contactId} - Action items result:`, JSON.stringify(result));
    
    // Handle result format
    if (result.values && result.values.length > 0) {
      if (result.values[0].ios_columns) {
        const processedValues = result.values.slice(1);
        console.log(`[action-items.js - getActionItemsForContact: 172] CONTACT_ID: ${contactId} - iOS format, returning ${processedValues.length} items`);
        return processedValues;
      } else {
        console.log(`[action-items.js - getActionItemsForContact: 175] CONTACT_ID: ${contactId} - Standard format, returning ${result.values.length} items`);
        return result.values;
      }
    } else {
      console.log(`[action-items.js - getActionItemsForContact: 179] CONTACT_ID: ${contactId} - No action items found`);
      return [];
    }
  } catch (error) {
    console.error(`[action-items.js - getActionItemsForContact: 189] CONTACT_ID: ${contactId} - Error getting action items:`, error);
    return [];
  }
}

/**
 * Add an action item
 * @param {Object} actionItem - Action item data
 * @returns {Promise<Object>} - Created action item with ID
 */
export async function addActionItem(actionItem) {
  try {
    console.log('[action-items.js - addActionItem: 281] Starting to add action item:', JSON.stringify(actionItem));
    const sqlite = getSQLite();
    
    // First ensure the table exists
    console.log('[action-items.js - addActionItem: 285] Creating action_items table if not exists');
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS action_items (
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
    
    // Create a clean object with valid fields
    const now = new Date().toISOString();
    const actionItemData = {
      contactId: actionItem.contactId || null,
      title: actionItem.title || '',
      text: actionItem.text || actionItem.title || '',
      notes: actionItem.notes || '',
      dueDate: actionItem.dueDate || null,
      completed: typeof actionItem.completed === 'number' ? actionItem.completed : 0,
      type: actionItem.type || 'todo',
      createdAt: now,
      updatedAt: now
    };
    
    console.log('[action-items.js - addActionItem: 310] Saving action item with data:', JSON.stringify(actionItemData));
    
    // Use direct SQL insertion with string values for iOS compatibility
    const insertSQL = `
      INSERT INTO action_items 
      (contactId, title, text, notes, dueDate, completed, type, createdAt, updatedAt) 
      VALUES 
      (${actionItemData.contactId || 'NULL'}, '${actionItemData.title}', '${actionItemData.text}', '${actionItemData.notes}', 
       ${actionItemData.dueDate ? `'${actionItemData.dueDate}'` : 'NULL'}, 
       ${actionItemData.completed}, 
       '${actionItemData.type}',
       '${actionItemData.createdAt}',
       '${actionItemData.updatedAt}')
    `;
    
    console.log('[action-items.js - addActionItem: 325] Raw SQL statement:', insertSQL);
    
    // Execute the SQL directly
    const insertResult = await sqlite.execute({
      database: DB_NAME,
      statements: insertSQL
    });
    
    console.log('[action-items.js - addActionItem: 332] Insert result:', JSON.stringify(insertResult));
    
    // Get the ID in a separate query for compatibility
    const lastIdResult = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT last_insert_rowid() as id',
      values: []
    });
    
    console.log('[action-items.js - addActionItem: 340] Last ID result:', JSON.stringify(lastIdResult));
    
    let newId = null;
    
    // Apply the ID if available
    if (lastIdResult?.values?.length > 0) {
      // Handle iOS-specific format where the first item contains column info
      if (lastIdResult.values[0].ios_columns && lastIdResult.values[1]) {
        newId = lastIdResult.values[1].id;
        console.log('[action-items.js - addActionItem: 349] Using iOS format ID:', newId);
      } else {
        // Standard format
        newId = lastIdResult.values[0].id;
        console.log('[action-items.js - addActionItem: 353] Using standard format ID:', newId);
      }
    }
    
    // Add the ID to the item
    (actionItemData as any).id = newId;
    
    // Verify the item was inserted by querying for it
    if (newId) {
      console.log('[action-items.js - addActionItem: 361] Verifying item was inserted with ID:', newId);
      const verifyResult = await sqlite.query({
        database: DB_NAME,
        statement: `SELECT * FROM action_items WHERE id = ?`,
        values: [newId]
      });
      
      console.log('[action-items.js - addActionItem: 367] Verification result:', JSON.stringify(verifyResult));
    }
    
    // Log the final action item data with ID
    console.log('[action-items.js - addActionItem: 371] Final action item data:', JSON.stringify(actionItemData));
    
    // Query all action items to verify storage
    await getAllActionItemsDebug();
    
    return actionItemData;
  } catch (error) {
    console.error('[action-items.js - addActionItem: 378] Error adding action item:', error);
    // Return the original item with its temporary ID
    return actionItem;
  }
}

/**
 * Associate an action item with a contact
 * @param {number} contactId - Contact ID
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} - Success status
 */
export async function associateActionItemWithContact(contactId, actionItemId) {
  try {
    // Convert IDs to integers to ensure proper matching
    const contactIdInt = parseInt(contactId);
    const actionItemIdInt = parseInt(actionItemId);
    
    console.log(`[action-items.js - associateActionItemWithContact: 157] Starting to associate action item ID ${actionItemIdInt} with contact ID ${contactIdInt}`);
    const sqlite = getSQLite();
    
    // Ensure the join table exists
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contactId INTEGER,
          actionItemId INTEGER,
          createdAt TEXT,
          FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id),
          FOREIGN KEY (actionItemId) REFERENCES action_items(id)
        )
      `
    });
    
    console.log(`[action-items.js - associateActionItemWithContact: 172] Join table verified`);
    
    // Check if association already exists to avoid duplicates
    const checkResult = await sqlite.query({
      database: DB_NAME,
      statement: `
        SELECT * FROM sponsor_contact_action_items 
        WHERE contactId = ? AND actionItemId = ?
      `,
      values: [contactIdInt, actionItemIdInt]
    });
    
    console.log(`[action-items.js - associateActionItemWithContact: 183] Check for existing association result:`, JSON.stringify(checkResult));
    
    // Process the result based on format
    let exists = false;
    if (checkResult?.values) {
      if (checkResult.values.length > 0) {
        if (checkResult.values[0].ios_columns) {
          // iOS format
          exists = checkResult.values.length > 1;
        } else {
          // Standard format
          exists = checkResult.values.length > 0;
        }
      }
    }
    
    if (exists) {
      console.log(`[action-items.js - associateActionItemWithContact: 198] Association already exists, skipping insert`);
      return true;
    }
    
    // Create the association in the join table
    const now = new Date().toISOString();
    
    console.log(`[action-items.js - associateActionItemWithContact: 204] Creating association with SQL:
      INSERT INTO sponsor_contact_action_items 
      (contactId, actionItemId, createdAt) 
      VALUES (${contactIdInt}, ${actionItemIdInt}, '${now}')
    `);
    
    const result = await sqlite.execute({
      database: DB_NAME,
      statements: `
        INSERT INTO sponsor_contact_action_items 
        (contactId, actionItemId, createdAt) 
        VALUES (?, ?, ?)
      `,
      values: [contactIdInt, actionItemIdInt, now]
    });
    
    console.log(`[action-items.js - associateActionItemWithContact: 217] Insert result:`, JSON.stringify(result));
    
    // Verify the association was created
    const verifyResult = await sqlite.query({
      database: DB_NAME,
      statement: `SELECT * FROM sponsor_contact_action_items WHERE contactId = ? AND actionItemId = ?`,
      values: [contactIdInt, actionItemIdInt]
    });
    
    console.log(`[action-items.js - associateActionItemWithContact: 225] Verification result:`, JSON.stringify(verifyResult));
    
    return true;
  } catch (error) {
    console.error(`[action-items.js - associateActionItemWithContact: 229] Error associating action item ${actionItemId} with contact ${contactId}:`, error);
    return false;
  }
}

/**
 * Toggle completion status of an action item
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<Object>} - Updated action item
 */
export async function toggleActionItemCompletion(actionItemId) {
  try {
    const sqlite = getSQLite();
    
    // First get the current completion status
    const result = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT completed FROM action_items WHERE id = ?',
      values: [actionItemId]
    });
    
    if (!result.values || result.values.length === 0) {
      throw new Error(`Action item with ID ${actionItemId} not found`);
    }
    
    // Extract current status, handling iOS format if needed
    let currentStatus = 0;
    if (result.values[0].ios_columns && result.values[1]) {
      currentStatus = result.values[1].completed;
    } else {
      currentStatus = result.values[0].completed;
    }
    
    // Toggle the status
    const newStatus = currentStatus === 1 ? 0 : 1;
    const now = new Date().toISOString();
    
    // Update the item
    await sqlite.execute({
      database: DB_NAME,
      statements: 'UPDATE action_items SET completed = ?, updatedAt = ? WHERE id = ?',
      values: [newStatus, now, actionItemId]
    });
    
    // Return the updated item
    const updatedResult = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT * FROM action_items WHERE id = ?',
      values: [actionItemId]
    });
    
    if (!updatedResult.values || updatedResult.values.length === 0) {
      throw new Error(`Failed to retrieve updated action item with ID ${actionItemId}`);
    }
    
    // Extract the updated item, handling iOS format if needed
    if (updatedResult.values[0].ios_columns && updatedResult.values[1]) {
      return updatedResult.values[1];
    } else {
      return updatedResult.values[0];
    }
  } catch (error) {
    console.error(`Error toggling completion status for action item ${actionItemId}:`, error);
    throw error;
  }
}

/**
 * Delete an action item
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteActionItem(actionItemId) {
  try {
    const sqlite = getSQLite();
    
    // First delete from the join table to maintain referential integrity
    await sqlite.execute({
      database: DB_NAME,
      statements: 'DELETE FROM sponsor_contact_action_items WHERE actionItemId = ?',
      values: [actionItemId]
    });
    
    // Then delete the action item itself
    await sqlite.execute({
      database: DB_NAME,
      statements: 'DELETE FROM action_items WHERE id = ?',
      values: [actionItemId]
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting action item ${actionItemId}:`, error);
    return false;
  }
}