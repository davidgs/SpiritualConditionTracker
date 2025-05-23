/**
 * Specialized database module for sponsor-related operations
 * Created to address the SQLite query issues with a direct approach
 */

// Database name
const DB_NAME = 'spiritualTracker.db';

// Get Capacitor SQLite plugin
function getSQLite() {
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
    
    // Remove id field since it's auto-incremented by SQLite
    const contactData = {...contact};
    delete contactData.id;
    
    // Ensure date field is never null (use current date as fallback)
    if (!contactData.date || contactData.date.trim() === '') {
      contactData.date = new Date().toISOString();
    }
    
    // Add timestamps
    if (!contactData.createdAt) {
      contactData.createdAt = new Date().toISOString();
    }
    if (!contactData.updatedAt) {
      contactData.updatedAt = new Date().toISOString();
    }
    
    console.log('Inserting contact into database:', contactData);
    
    // Build SQL statement without the id field
    const keys = Object.keys(contactData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => contactData[key]);
    
    // Execute INSERT and get the last inserted ID
    const result = await sqlite.execute({
      database: DB_NAME,
      statements: `INSERT INTO sponsor_contacts (${keys.join(', ')}) VALUES (${placeholders}); SELECT last_insert_rowid() as id;`,
      values: values
    });
    
    // Get the inserted ID from SQLite and add it to the return object
    const insertedId = result?.changes?.lastId || null;
    if (insertedId) {
      contactData.id = insertedId;
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
    
    // Remove id field since it's auto-incremented by SQLite
    const detailData = {...detail};
    delete detailData.id;
    
    // Add timestamp
    if (!detailData.createdAt) {
      detailData.createdAt = new Date().toISOString();
    }
    
    // Build SQL statement without the id field
    const keys = Object.keys(detailData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => detailData[key]);
    
    // Execute INSERT and get the last inserted ID
    const result = await sqlite.execute({
      database: DB_NAME,
      statements: `INSERT INTO sponsor_contact_details (${keys.join(', ')}) VALUES (${placeholders}); SELECT last_insert_rowid() as id;`,
      values: values
    });
    
    // Get the inserted ID from SQLite and add it to the return object
    const insertedId = result?.changes?.lastId || null;
    if (insertedId) {
      detailData.id = insertedId;
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