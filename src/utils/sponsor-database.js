/**
 * Specialized database module for sponsor-related operations
 * Created to address the SQLite query issues with a direct approach
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
 * Get all sponsor contacts for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Sponsor contacts
 */
export async function getSponsorContacts(userId) {
  try {
    const sqlite = getSQLite();
    
    // Use the raw query with object parameters
    const result = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT * FROM sponsor_contacts WHERE userId = ?',
      values: [userId]
    });
    
    return result.values || [];
  } catch (error) {
    console.error('Error getting sponsor contacts:', error);
    return [];
  }
}

/**
 * Get details for a sponsor contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<Array>} - Contact details
 */
export async function getContactDetails(contactId) {
  try {
    const sqlite = getSQLite();
    
    const result = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT * FROM sponsor_contact_details WHERE contactId = ?',
      values: [contactId]
    });
    
    return result.values || [];
  } catch (error) {
    console.error('Error getting contact details:', error);
    return [];
  }
}

/**
 * Add a new sponsor contact
 * @param {Object} contact - Contact data
 * @returns {Promise<Object>} - Added contact
 */
export async function addSponsorContact(contact) {
  try {
    const sqlite = getSQLite();
    
    // Create a clean object with valid fields, handling all database constraints
    const contactData = {
      userId: contact.userId || 'default_user',
      type: contact.type || 'general',
      note: contact.note || '',
      
      // Handle the date field properly to avoid constraints
      date: (() => {
        try {
          // If date is missing or empty, use null (now allowed by our schema)
          if (!contact.date || contact.date === '') {
            console.log('No date provided, using null value');
            return null;
          }
          
          // Try to create a valid date
          const dateObj = new Date(contact.date);
          
          // Check if the date is valid
          if (isNaN(dateObj.getTime())) {
            console.log('Invalid date format, using null instead');
            return null;
          }
          
          // Format date as ISO string
          console.log('Formatting date:', dateObj.toISOString());
          return dateObj.toISOString();
        } catch (e) {
          console.log('Error parsing date, using null instead:', e);
          return null;
        }
      })(),
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Inserting contact into database:', contactData);
    
    // Build SQL statement with pre-defined fields to avoid accidentally including the ID
    const keys = Object.keys(contactData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => contactData[key]);
    
    // Execute a simple INSERT without trying to get the last ID in the same statement
    await sqlite.execute({
      database: DB_NAME,
      statements: `INSERT INTO sponsor_contacts (${keys.join(', ')}) VALUES (${placeholders})`,
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
      // Log the entire result to see what structure we're getting
      console.log('Last ID result from database:', JSON.stringify(lastIdResult));
      
      // Handle iOS-specific format where the first item contains column info
      if (lastIdResult.values[0].ios_columns && lastIdResult.values[1]) {
        contactData.id = lastIdResult.values[1].id;
        console.log('Extracted ID from iOS format:', contactData.id);
      } else {
        // Standard format
        contactData.id = lastIdResult.values[0].id;
        console.log('Extracted ID from standard format:', contactData.id);
      }
    }
    
    return contactData;
  } catch (error) {
    console.error('Error adding sponsor contact:', error);
    throw error;
  }
}

/**
 * Add contact detail
 * @param {Object} detail - Detail data
 * @returns {Promise<Object>} - Added detail
 */
export async function addContactDetail(detail) {
  try {
    const sqlite = getSQLite();
    
    // Create a clean object with valid fields
    const detailData = {
      contactId: detail.contactId,
      actionItem: detail.actionItem || '',
      completed: typeof detail.completed === 'number' ? detail.completed : 0,
      notes: detail.notes || '',
      dueDate: detail.dueDate || null,
      type: detail.type || 'todo',
      text: detail.text || '',
      createdAt: new Date().toISOString()
    };
    
    // Build SQL statement with pre-defined fields only
    const keys = Object.keys(detailData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => detailData[key]);
    
    // Execute a simple INSERT
    await sqlite.execute({
      database: DB_NAME,
      statements: `INSERT INTO sponsor_contact_details (${keys.join(', ')}) VALUES (${placeholders})`,
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
      detailData.id = lastIdResult.values[0].id;
    }
    
    return detailData;
  } catch (error) {
    console.error('Error adding contact detail:', error);
    throw error;
  }
}

/**
 * Update contact detail
 * @param {Object} detail - Detail data
 * @returns {Promise<Object>} - Updated detail
 */
export async function updateContactDetail(detail) {
  try {
    const sqlite = getSQLite();
    
    // Build SET clause
    const setClause = Object.keys(detail)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    // Prepare values
    const values = Object.keys(detail)
      .filter(key => key !== 'id')
      .map(key => detail[key]);
    
    // Add ID for WHERE clause
    values.push(detail.id);
    
    await sqlite.execute({
      database: DB_NAME,
      statements: `UPDATE sponsor_contact_details SET ${setClause} WHERE id = ?`,
      values: values
    });
    
    return detail;
  } catch (error) {
    console.error('Error updating contact detail:', error);
    throw error;
  }
}

/**
 * Delete sponsor contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<boolean>} - Success
 */
export async function deleteSponsorContact(contactId) {
  try {
    const sqlite = getSQLite();
    
    // Delete details first
    await sqlite.execute({
      database: DB_NAME,
      statements: 'DELETE FROM sponsor_contact_details WHERE contactId = ?',
      values: [contactId]
    });
    
    // Delete contact
    await sqlite.execute({
      database: DB_NAME,
      statements: 'DELETE FROM sponsor_contacts WHERE id = ?',
      values: [contactId]
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting sponsor contact:', error);
    return false;
  }
}

/**
 * Delete contact detail
 * @param {string} detailId - Detail ID
 * @returns {Promise<boolean>} - Success
 */
export async function deleteContactDetail(detailId) {
  try {
    const sqlite = getSQLite();
    
    await sqlite.execute({
      database: DB_NAME,
      statements: 'DELETE FROM sponsor_contact_details WHERE id = ?',
      values: [detailId]
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting contact detail:', error);
    return false;
  }
}

export default {
  getSponsorContacts,
  getContactDetails,
  addSponsorContact,
  addContactDetail,
  updateContactDetail,
  deleteSponsorContact,
  deleteContactDetail
};