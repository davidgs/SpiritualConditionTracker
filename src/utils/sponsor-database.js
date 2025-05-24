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
    
    // Log query parameters for debugging
    console.log('Querying sponsor contacts with userId:', userId);
    
    // Check if there are any contacts available in the database
    try {
      // First just check what's in the database
      const checkContacts = await sqlite.query({
        database: DB_NAME,
        statement: "SELECT * FROM sponsor_contacts",
        values: []
      });
      
      // Log raw results for debugging
      console.log('Raw contacts in database:', JSON.stringify(checkContacts));
      
      // Check if there are actual entries with non-null values
      const hasValidContacts = checkContacts.values && 
          (checkContacts.values.length > 1 || 
           (checkContacts.values.length === 1 && !checkContacts.values[0].ios_columns));
           
      console.log('Has valid contacts:', hasValidContacts);
    } catch (err) {
      console.error('Error checking contacts:', err);
    }
    
    // List all contacts regardless of userId for debugging
    try {
      const allContacts = await sqlite.query({
        database: DB_NAME,
        statement: 'SELECT * FROM sponsor_contacts',
        values: []
      });
      console.log('All contacts in database:', JSON.stringify(allContacts));
    } catch (err) {
      console.error('Error querying all contacts:', err);
    }
    
    // First drop and recreate the table if needed
    try {
      console.log('Checking if we need to recreate the sponsor_contacts table...');
      
      // Get a test contact
      const testContact = await sqlite.query({
        database: DB_NAME,
        statement: 'SELECT * FROM sponsor_contacts LIMIT 1',
        values: []
      });
      
      console.log('Test contact result:', JSON.stringify(testContact));
      
      // Check if we have all NULL values
      if (testContact.values && testContact.values.length > 0) {
        let hasAllNulls = true;
        
        // Skip the column definition for iOS
        const startIdx = testContact.values[0].ios_columns ? 1 : 0;
        
        if (startIdx < testContact.values.length) {
          const contact = testContact.values[startIdx];
          // Check if all values are null
          for (const key in contact) {
            if (contact[key] !== null) {
              hasAllNulls = false;
              break;
            }
          }
          
          if (hasAllNulls) {
            console.log('Found contact with all NULL values, recreating table...');
            
            // Drop the table and recreate it
            await sqlite.execute({
              database: DB_NAME,
              statements: 'DROP TABLE IF EXISTS sponsor_contacts'
            });
            
            // Create the table with proper constraints
            await sqlite.execute({
              database: DB_NAME,
              statements: `
                CREATE TABLE IF NOT EXISTS sponsor_contacts (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  userId TEXT DEFAULT 'default_user',
                  date TEXT DEFAULT NULL,
                  type TEXT DEFAULT 'general',
                  note TEXT DEFAULT '',
                  createdAt TEXT,
                  updatedAt TEXT
                )
              `
            });
            
            console.log('Recreated sponsor_contacts table');
            
            // Since we just recreated the table, there are no contacts yet
            return [];
          }
        }
      }
    } catch (err) {
      console.error('Error checking/recreating table:', err);
    }
    
    // Now query for contacts with the specified userId
    const result = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT * FROM sponsor_contacts WHERE userId = ?',
      values: [userId]
    });
    
    console.log('Raw sponsor contacts query result:', JSON.stringify(result));
    
    // Handle iOS-specific format
    if (result.values && result.values.length > 0) {
      // Check if first item contains column information (iOS format)
      if (result.values[0].ios_columns) {
        // Extract column names
        const columns = result.values[0].ios_columns;
        console.log('iOS columns format detected:', columns);
        
        // Skip the first item (column info) and process the rest
        const processedValues = [];
        
        for (let i = 1; i < result.values.length; i++) {
          const item = result.values[i];
          // Log each item to debug
          console.log('Processing contact item:', item);
          processedValues.push(item);
        }
        
        return processedValues;
      }
    }
    
    // Standard format or empty result
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
    
    // First check if table exists
    try {
      const tables = await sqlite.query({
        database: DB_NAME,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name='sponsor_contact_details'",
        values: []
      });
      
      // Create table if it doesn't exist
      const tableExists = tables.values && 
        ((tables.values[0]?.ios_columns && tables.values.slice(1).some(t => t.name === 'sponsor_contact_details')) || 
         tables.values.some(t => t.name === 'sponsor_contact_details'));
      
      if (!tableExists) {
        console.log('Creating sponsor_contact_details table');
        await sqlite.execute({
          database: DB_NAME,
          statements: `
            CREATE TABLE IF NOT EXISTS sponsor_contact_details (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              contactId INTEGER,
              actionItem TEXT DEFAULT '',
              completed INTEGER DEFAULT 0,
              notes TEXT DEFAULT '',
              dueDate TEXT DEFAULT NULL,
              type TEXT DEFAULT 'general',
              text TEXT DEFAULT '',
              createdAt TEXT,
              FOREIGN KEY (contactId) REFERENCES sponsor_contacts (id)
            )
          `
        });
        return []; // No details yet since we just created the table
      }
    } catch (err) {
      console.error('Error checking tables:', err);
    }
    
    console.log('Querying contact details for contactId:', contactId);
    
    const result = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT * FROM sponsor_contact_details WHERE contactId = ?',
      values: [contactId]
    });
    
    console.log('Raw contact details query result:', JSON.stringify(result));
    
    // Handle iOS-specific format
    if (result.values && result.values.length > 0) {
      // Check if first item contains column information (iOS format)
      if (result.values[0].ios_columns) {
        // Skip the first item (column info) and process the rest
        const processedValues = [];
        
        for (let i = 1; i < result.values.length; i++) {
          const item = result.values[i];
          console.log('Processing detail item:', item);
          processedValues.push(item);
        }
        
        return processedValues;
      }
    }
    
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
    
    // Insert using a simpler approach
    console.log('Inserting contact with simplified approach');
    
    // First try a direct value insertion with a simpler query
    const insertSQL = `
      INSERT INTO sponsor_contacts 
      (userId, type, note, date, createdAt, updatedAt) 
      VALUES 
      ('${contactData.userId}', '${contactData.type}', '${contactData.note}', '${contactData.date || "NULL"}', '${contactData.createdAt}', '${contactData.updatedAt}')
    `;
    
    console.log('Raw SQL statement:', insertSQL);
    
    // Execute the raw SQL
    await sqlite.execute({
      database: DB_NAME,
      statements: insertSQL
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
    
    console.log('Saving contact detail with data:', detailData);
    
    // Use the same direct SQL approach that worked for contacts
    const insertSQL = `
      INSERT INTO sponsor_contact_details 
      (contactId, actionItem, completed, notes, dueDate, type, text, createdAt) 
      VALUES 
      (${detailData.contactId}, '${detailData.actionItem}', ${detailData.completed}, '${detailData.notes || ""}', '${detailData.dueDate || ""}', '${detailData.type}', '${detailData.text || ""}', '${detailData.createdAt}')
    `;
    
    console.log('Detail SQL statement:', insertSQL);
    
    // Execute the raw SQL
    await sqlite.execute({
      database: DB_NAME,
      statements: insertSQL
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
      console.log('Last ID result for detail:', JSON.stringify(lastIdResult));
      
      // Handle iOS-specific format where the first item contains column info
      if (lastIdResult.values[0].ios_columns && lastIdResult.values[1]) {
        detailData.id = lastIdResult.values[1].id;
        console.log('Extracted ID from iOS format for detail:', detailData.id);
      } else {
        // Standard format
        detailData.id = lastIdResult.values[0].id;
        console.log('Extracted ID from standard format for detail:', detailData.id);
      }
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