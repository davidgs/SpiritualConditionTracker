/**
 * Action Items Database Utilities
 * Handles the storage and retrieval of action items with SQLite
 */

// Database name
const DB_NAME = 'spiritualTracker.db';

// Get Capacitor SQLite plugin
function getSQLite() {
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
    console.log(`[action-items.js - getActionItemsForContact: 87] Getting action items for contact ID: ${contactId}`);
    const sqlite = getSQLite();
    
    // Construct the SQL query with join
    const sqlStatement = `
      SELECT ai.* 
      FROM action_items ai
      JOIN sponsor_contact_action_items scai ON ai.id = scai.actionItemId
      WHERE scai.contactId = ?
      ORDER BY ai.createdAt DESC
    `;
    
    console.log(`[action-items.js - getActionItemsForContact: 99] SQL query for contact ${contactId}:`, sqlStatement);
    
    // Query action items via join table
    const result = await sqlite.query({
      database: DB_NAME,
      statement: sqlStatement,
      values: [contactId]
    });
    
    console.log(`[action-items.js - getActionItemsForContact: 107] Raw action items result for contact ${contactId}:`, JSON.stringify(result));
    
    // Handle iOS-specific format where first item contains column information
    if (result.values && result.values.length > 0) {
      console.log(`[action-items.js - getActionItemsForContact: 111] Found ${result.values.length} results in query`);
      
      // Check if first item contains column information (iOS format)
      if (result.values[0].ios_columns) {
        console.log('[action-items.js - getActionItemsForContact: 115] iOS format detected for action items, processing values');
        // Skip the first item (column info) and process the rest
        const processedValues = result.values.slice(1);
        console.log(`[action-items.js - getActionItemsForContact: 118] Processed ${processedValues.length} action items for iOS format`);
        return processedValues;
      } else {
        console.log(`[action-items.js - getActionItemsForContact: 121] Standard format with ${result.values.length} action items`);
      }
    } else {
      console.log(`[action-items.js - getActionItemsForContact: 124] No action items found for contact ${contactId}`);
    }
    
    // Query the join table directly to see what associations exist
    try {
      const joinTableQuery = `
        SELECT * FROM sponsor_contact_action_items 
        WHERE contactId = ?
      `;
      console.log(`[action-items.js - getActionItemsForContact: 132] Querying join table:`, joinTableQuery);
      
      const joinResult = await sqlite.query({
        database: DB_NAME,
        statement: joinTableQuery,
        values: [contactId]
      });
      
      console.log(`[action-items.js - getActionItemsForContact: 139] Join table result:`, JSON.stringify(joinResult));
    } catch (joinError) {
      console.error(`[action-items.js - getActionItemsForContact: 142] Error querying join table:`, joinError);
    }
    
    return result.values || [];
  } catch (error) {
    console.error(`[action-items.js - getActionItemsForContact: 147] Error getting action items for contact ${contactId}:`, error);
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
    console.log('[action-items.js - addActionItem: 92] Starting to add action item');
    const sqlite = getSQLite();
    
    // Create a clean object with valid fields
    const now = new Date().toISOString();
    const actionItemData = {
      title: actionItem.title || '',
      text: actionItem.text || actionItem.title || '',
      notes: actionItem.notes || '',
      dueDate: actionItem.dueDate || null,
      completed: typeof actionItem.completed === 'number' ? actionItem.completed : 0,
      type: actionItem.type || 'todo',
      createdAt: now,
      updatedAt: now
    };
    
    console.log('[action-items.js - addActionItem: 108] Saving action item with data:', JSON.stringify(actionItemData));
    
    // Build SQL statement with pre-defined fields
    const keys = Object.keys(actionItemData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => actionItemData[key]);
    
    // Construct full SQL statement for logging
    const fullSqlStatement = `
      INSERT INTO action_items 
      (${keys.join(', ')}) 
      VALUES (${placeholders})
    `;
    
    console.log('[action-items.js - addActionItem: 122] Full SQL statement:', fullSqlStatement);
    console.log('[action-items.js - addActionItem: 123] Values:', JSON.stringify(values));
    
    // Insert using parameterized query
    const insertResult = await sqlite.execute({
      database: DB_NAME,
      statements: fullSqlStatement,
      values: values
    });
    
    console.log('[action-items.js - addActionItem: 131] Insert result:', JSON.stringify(insertResult));
    
    // Get the ID in a separate query for compatibility
    const lastIdResult = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT last_insert_rowid() as id',
      values: []
    });
    
    console.log('[action-items.js - addActionItem: 139] Last ID result:', JSON.stringify(lastIdResult));
    
    // Apply the ID if available
    if (lastIdResult?.values?.length > 0) {
      // Handle iOS-specific format where the first item contains column info
      if (lastIdResult.values[0].ios_columns && lastIdResult.values[1]) {
        actionItemData.id = lastIdResult.values[1].id;
        console.log('[action-items.js - addActionItem: 146] Using iOS format ID:', lastIdResult.values[1].id);
      } else {
        // Standard format
        actionItemData.id = lastIdResult.values[0].id;
        console.log('[action-items.js - addActionItem: 150] Using standard format ID:', lastIdResult.values[0].id);
      }
    }
    
    // Log the final action item data with ID
    console.log('[action-items.js - addActionItem: 155] Final action item data:', JSON.stringify(actionItemData));
    
    // Query all action items to verify storage
    await getAllActionItemsDebug();
    
    return actionItemData;
  } catch (error) {
    console.error('Error adding action item:', error);
    throw error;
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
    const sqlite = getSQLite();
    
    // Create the association in the join table
    const now = new Date().toISOString();
    
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        INSERT INTO sponsor_contact_action_items 
        (contactId, actionItemId, createdAt) 
        VALUES (?, ?, ?)
      `,
      values: [contactId, actionItemId, now]
    });
    
    return true;
  } catch (error) {
    console.error(`Error associating action item ${actionItemId} with contact ${contactId}:`, error);
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