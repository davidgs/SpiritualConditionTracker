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
    const sqlite = getSQLite();
    
    const result = await sqlite.query({
      database: DB_NAME,
      statement: "SELECT * FROM action_items ORDER BY createdAt DESC",
      values: []
    });
    
    return result.values || [];
  } catch (error) {
    console.error('Error getting action items:', error);
    return [];
  }
}

/**
 * Get all action items for a contact
 * @param {number} contactId - Contact ID
 * @returns {Promise<Array>} - Action items for the contact
 */
export async function getActionItemsForContact(contactId) {
  try {
    const sqlite = getSQLite();
    
    // Query action items via join table
    const result = await sqlite.query({
      database: DB_NAME,
      statement: `
        SELECT ai.* 
        FROM action_items ai
        JOIN sponsor_contact_action_items scai ON ai.id = scai.actionItemId
        WHERE scai.contactId = ?
        ORDER BY ai.createdAt DESC
      `,
      values: [contactId]
    });
    
    return result.values || [];
  } catch (error) {
    console.error(`Error getting action items for contact ${contactId}:`, error);
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
    
    console.log('Saving action item with data:', actionItemData);
    
    // Build SQL statement with pre-defined fields
    const keys = Object.keys(actionItemData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => actionItemData[key]);
    
    // Insert using parameterized query
    await sqlite.execute({
      database: DB_NAME,
      statements: `
        INSERT INTO action_items 
        (${keys.join(', ')}) 
        VALUES (${placeholders})
      `,
      values: values
    });
    
    // Get the ID in a separate query for compatibility
    const lastIdResult = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT last_insert_rowid() as id',
      values: []
    });
    
    // Apply the ID if available
    if (lastIdResult?.values?.length > 0) {
      // Handle iOS-specific format where the first item contains column info
      if (lastIdResult.values[0].ios_columns && lastIdResult.values[1]) {
        actionItemData.id = lastIdResult.values[1].id;
      } else {
        // Standard format
        actionItemData.id = lastIdResult.values[0].id;
      }
    }
    
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