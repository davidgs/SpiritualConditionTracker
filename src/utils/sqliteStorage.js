/**
 * SQLite storage implementation for the Spiritual Condition Tracker
 * Works across iOS, Android, and web platforms
 */

// The database connection
let db = null;

/**
 * Initialize the database connection
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export async function initDatabase() {
  console.log("[ sqliteStorage.js ] Initializing SQLite database...");
  
  try {
    // For React Native environments
    if (window.ReactNative) {
      const SQLite = require('react-native-sqlite-storage');
      SQLite.enablePromise(true);
      
      db = await SQLite.openDatabase({
        name: 'spiritualTracker.db',
        location: 'default'
      });
      
      console.log("[ sqliteStorage.js ] SQLite database initialized successfully (React Native)");
    } 
    // For Expo environments
    else if (window.Expo) {
      const SQLite = require('expo-sqlite');
      db = SQLite.openDatabase('spiritualTracker.db');
      
      console.log("[ sqliteStorage.js ] SQLite database initialized successfully (Expo)");
    }
    // For web environments, fallback to IndexedDB since WebSQL is deprecated
    else {
      console.log("[ sqliteStorage.js ] Web environment detected, using IndexedDB as SQLite alternative");
      db = await initIndexedDB();
    }
    
    // Create tables
    await createTables();
    
    return true;
  } catch (error) {
    console.error("[ sqliteStorage.js ] Error initializing database:", error);
    return false;
  }
}

/**
 * Initialize IndexedDB as a fallback for web environments
 * @returns {Object} A database object with SQLite-like interface
 */
async function initIndexedDB() {
  console.log("[ sqliteStorage.js ] Initializing IndexedDB as SQLite alternative...");
  
  const DB_NAME = 'spiritualTrackerDB';
  const DB_VERSION = 1;
  const STORES = ['users', 'activities', 'meetings', 'messages', 'preferences'];
  
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("[ sqliteStorage.js ] Error opening IndexedDB:", event.target.error);
      reject(event.target.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
    
    request.onsuccess = (event) => {
      const indexedDB = event.target.result;
      
      // Create SQLite-like interface for IndexedDB
      const dbWrapper = {
        _db: indexedDB,
        transaction: function(callback) {
          return callback({
            executeSql: async function(query, params, successCallback, errorCallback) {
              try {
                // Parse the query to determine operation and table
                const queryLower = query.toLowerCase();
                
                if (queryLower.startsWith('create table')) {
                  // CREATE TABLE operations are handled during onupgradeneeded
                  successCallback({}, { rows: { length: 0 } });
                }
                else if (queryLower.startsWith('select')) {
                  await handleSelect(queryLower, params, successCallback, errorCallback);
                }
                else if (queryLower.startsWith('insert')) {
                  await handleInsert(queryLower, params, successCallback, errorCallback);
                }
                else if (queryLower.startsWith('update')) {
                  await handleUpdate(queryLower, params, successCallback, errorCallback);
                }
                else if (queryLower.startsWith('delete')) {
                  await handleDelete(queryLower, params, successCallback, errorCallback);
                }
                else {
                  // Unsupported operation
                  console.warn("[ sqliteStorage.js ] Unsupported SQL operation:", query);
                  successCallback({}, { rows: { length: 0 } });
                }
              } catch (error) {
                console.error("[ sqliteStorage.js ] Error executing SQL:", error);
                if (errorCallback) errorCallback({}, error);
              }
            }
          });
        }
      };
      
      // Simplified handlers for basic SQL operations
      async function handleSelect(query, params, successCallback, errorCallback) {
        try {
          // Extract table name (very simplified parser)
          const fromMatch = query.match(/from\s+([^\s,)]+)/i);
          if (!fromMatch) {
            errorCallback({}, new Error("Invalid SELECT query: " + query));
            return;
          }
          
          const tableName = fromMatch[1];
          
          // Open a transaction and get all items
          const transaction = indexedDB.transaction(tableName, 'readonly');
          const store = transaction.objectStore(tableName);
          const request = store.getAll();
          
          request.onsuccess = () => {
            const items = request.result || [];
            
            // Create a result object with a row-like interface
            const result = {
              rows: {
                length: items.length,
                item: (index) => items[index],
                _array: items
              }
            };
            
            successCallback({}, result);
          };
          
          request.onerror = (event) => {
            errorCallback({}, event.target.error);
          };
        } catch (error) {
          errorCallback({}, error);
        }
      }
      
      async function handleInsert(query, params, successCallback, errorCallback) {
        try {
          // Extract table name (very simplified parser)
          const intoMatch = query.match(/into\s+([^\s(]+)/i);
          if (!intoMatch) {
            errorCallback({}, new Error("Invalid INSERT query: " + query));
            return;
          }
          
          const tableName = intoMatch[1];
          
          // Construct an object from the params
          // This is a simplified approach - in a real impl you'd parse the column names from the query
          const item = constructItemFromParams(tableName, params);
          
          // Open transaction and add item
          const transaction = indexedDB.transaction(tableName, 'readwrite');
          const store = transaction.objectStore(tableName);
          const request = store.add(item);
          
          request.onsuccess = () => {
            successCallback({}, { insertId: item.id, rowsAffected: 1 });
          };
          
          request.onerror = (event) => {
            errorCallback({}, event.target.error);
          };
        } catch (error) {
          errorCallback({}, error);
        }
      }
      
      async function handleUpdate(query, params, successCallback, errorCallback) {
        try {
          // Extract table name (very simplified parser)
          const updateMatch = query.match(/update\s+([^\s]+)/i);
          const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
          
          if (!updateMatch || !whereMatch) {
            errorCallback({}, new Error("Invalid UPDATE query: " + query));
            return;
          }
          
          const tableName = updateMatch[1];
          const idField = whereMatch[1];
          const idValue = params[params.length - 1]; // assuming ID is the last param
          
          // First get the existing item
          const transaction1 = indexedDB.transaction(tableName, 'readonly');
          const store1 = transaction1.objectStore(tableName);
          const getRequest = store1.get(idValue);
          
          getRequest.onsuccess = () => {
            const existingItem = getRequest.result;
            
            if (!existingItem) {
              successCallback({}, { rowsAffected: 0 });
              return;
            }
            
            // Construct updated item
            const updatedItem = constructItemFromParams(tableName, params, existingItem);
            
            // Update the item
            const transaction2 = indexedDB.transaction(tableName, 'readwrite');
            const store2 = transaction2.objectStore(tableName);
            const putRequest = store2.put(updatedItem);
            
            putRequest.onsuccess = () => {
              successCallback({}, { rowsAffected: 1 });
            };
            
            putRequest.onerror = (event) => {
              errorCallback({}, event.target.error);
            };
          };
          
          getRequest.onerror = (event) => {
            errorCallback({}, event.target.error);
          };
        } catch (error) {
          errorCallback({}, error);
        }
      }
      
      async function handleDelete(query, params, successCallback, errorCallback) {
        try {
          // Extract table name (very simplified parser)
          const fromMatch = query.match(/from\s+([^\s]+)/i);
          const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
          
          if (!fromMatch || !whereMatch) {
            errorCallback({}, new Error("Invalid DELETE query: " + query));
            return;
          }
          
          const tableName = fromMatch[1];
          const idValue = params[0]; // assuming ID is the first param
          
          // Open transaction and delete item
          const transaction = indexedDB.transaction(tableName, 'readwrite');
          const store = transaction.objectStore(tableName);
          const request = store.delete(idValue);
          
          request.onsuccess = () => {
            successCallback({}, { rowsAffected: 1 });
          };
          
          request.onerror = (event) => {
            errorCallback({}, event.target.error);
          };
        } catch (error) {
          errorCallback({}, error);
        }
      }
      
      // Helper to construct an object from params based on table
      function constructItemFromParams(tableName, params, existingItem = {}) {
        let item = { ...existingItem };
        
        // Just a simplified example - in a real impl you'd parse the columns from the query
        switch (tableName) {
          case 'users':
            if (params[0] && !item.id) item.id = params[0];
            if (params[1]) item.name = params[1];
            if (params[2]) item.lastName = params[2];
            // etc.
            break;
          case 'activities':
            if (params[0] && !item.id) item.id = params[0];
            if (params[1]) item.type = params[1];
            if (params[2]) item.duration = params[2];
            // etc.
            break;
          // Add cases for other tables as needed
        }
        
        return item;
      }
      
      resolve(dbWrapper);
    };
  });
}

/**
 * Create database tables
 */
async function createTables() {
  if (!db) return;
  
  // Define table creation queries
  const createTablesQueries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      sobrietyDate TEXT,
      homeGroups TEXT,
      privacySettings TEXT,
      preferences TEXT,
      sponsor TEXT,
      sponsees TEXT,
      messagingKeys TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      duration INTEGER,
      date TEXT,
      notes TEXT,
      meeting TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      days TEXT,
      time TEXT,
      schedule TEXT,
      address TEXT,
      locationName TEXT,
      streetAddress TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      coordinates TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT,
      recipientId TEXT,
      content TEXT,
      encrypted BOOLEAN,
      timestamp TEXT,
      read BOOLEAN
    )`,
    `CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      value TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`
  ];
  
  // Execute each create table query
  for (const query of createTablesQueries) {
    await executeQuery(query, []);
  }
  
  console.log("[ sqliteStorage.js ] Database tables created successfully");
}

/**
 * Execute a SQL query
 * @param {string} query - The SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query result
 */
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    
    try {
      db.transaction((tx) => {
        tx.executeSql(
          query,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            console.error("[ sqliteStorage.js ] SQL Error:", error);
            reject(error);
            return false;
          }
        );
      });
    } catch (error) {
      console.error("[ sqliteStorage.js ] Transaction Error:", error);
      reject(error);
    }
  });
}

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Promise<Array>} All items in the collection
 */
export async function getAll(collection) {
  try {
    const result = await executeQuery(`SELECT * FROM ${collection}`);
    const items = [];
    const len = result.rows.length;
    
    for (let i = 0; i < len; i++) {
      const item = result.rows.item(i);
      
      // Parse JSON fields
      if (collection === 'users') {
        item.privacySettings = JSON.parse(item.privacySettings || '{}');
        item.preferences = JSON.parse(item.preferences || '{}');
        item.homeGroups = JSON.parse(item.homeGroups || '[]');
        item.sponsor = JSON.parse(item.sponsor || 'null');
        item.sponsees = JSON.parse(item.sponsees || '[]');
        item.messagingKeys = JSON.parse(item.messagingKeys || '{}');
      } else if (collection === 'meetings') {
        item.days = JSON.parse(item.days || '[]');
        item.schedule = JSON.parse(item.schedule || '[]');
        item.coordinates = JSON.parse(item.coordinates || 'null');
      } else if (collection === 'preferences') {
        item.value = JSON.parse(item.value || 'null');
      }
      
      items.push(item);
    }
    
    return items;
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error getting all items from ${collection}:`, error);
    return [];
  }
}

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<Object|null>} The found item or null
 */
export async function getById(collection, id) {
  try {
    const result = await executeQuery(
      `SELECT * FROM ${collection} WHERE id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const item = result.rows.item(0);
    
    // Parse JSON fields
    if (collection === 'users') {
      item.privacySettings = JSON.parse(item.privacySettings || '{}');
      item.preferences = JSON.parse(item.preferences || '{}');
      item.homeGroups = JSON.parse(item.homeGroups || '[]');
      item.sponsor = JSON.parse(item.sponsor || 'null');
      item.sponsees = JSON.parse(item.sponsees || '[]');
      item.messagingKeys = JSON.parse(item.messagingKeys || '{}');
    } else if (collection === 'meetings') {
      item.days = JSON.parse(item.days || '[]');
      item.schedule = JSON.parse(item.schedule || '[]');
      item.coordinates = JSON.parse(item.coordinates || 'null');
    } else if (collection === 'preferences') {
      item.value = JSON.parse(item.value || 'null');
    }
    
    return item;
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error getting item by ID from ${collection}:`, error);
    return null;
  }
}

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Promise<Object>} The added item
 */
export async function add(collection, item) {
  try {
    // Generate ID if not provided
    if (!item.id) {
      item.id = `${collection.slice(0, -1)}_${Date.now()}`;
    }
    
    // Add timestamps
    const now = new Date().toISOString();
    item.createdAt = now;
    item.updatedAt = now;
    
    // Prepare the item based on the collection type
    let columns, placeholders, values;
    
    if (collection === 'users') {
      const privacySettings = JSON.stringify(item.privacySettings || {});
      const preferences = JSON.stringify(item.preferences || {});
      const homeGroups = JSON.stringify(item.homeGroups || []);
      const sponsor = JSON.stringify(item.sponsor || null);
      const sponsees = JSON.stringify(item.sponsees || []);
      const messagingKeys = JSON.stringify(item.messagingKeys || {});
      
      columns = 'id, name, lastName, phoneNumber, email, sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.name, item.lastName, item.phoneNumber, item.email, 
        item.sobrietyDate, homeGroups, privacySettings, preferences, 
        sponsor, sponsees, messagingKeys, item.createdAt, item.updatedAt
      ];
    } else if (collection === 'activities') {
      columns = 'id, type, duration, date, notes, meeting, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.type, item.duration, item.date, item.notes, 
        item.meeting, item.createdAt, item.updatedAt
      ];
    } else if (collection === 'meetings') {
      const days = JSON.stringify(item.days || []);
      const schedule = JSON.stringify(item.schedule || []);
      const coordinates = JSON.stringify(item.coordinates || null);
      
      columns = 'id, name, days, time, schedule, address, locationName, streetAddress, city, state, zipCode, coordinates, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.name, days, item.time, schedule, item.address, 
        item.locationName, item.streetAddress, item.city, item.state, 
        item.zipCode, coordinates, item.createdAt, item.updatedAt
      ];
    } else if (collection === 'messages') {
      columns = 'id, senderId, recipientId, content, encrypted, timestamp, read';
      placeholders = '?, ?, ?, ?, ?, ?, ?';
      values = [
        item.id, item.senderId, item.recipientId, item.content, 
        item.encrypted ? 1 : 0, item.timestamp, item.read ? 1 : 0
      ];
    } else if (collection === 'preferences') {
      columns = 'id, value, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?';
      values = [
        item.id, JSON.stringify(item.value), item.createdAt, item.updatedAt
      ];
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    // Execute the insert query
    await executeQuery(
      `INSERT INTO ${collection} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    console.log(`[ sqliteStorage.js ] Added item to ${collection} with ID: ${item.id}`);
    return item;
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error adding item to ${collection}:`, error);
    throw error;
  }
}

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object|null>} The updated item or null if not found
 */
export async function update(collection, id, updates) {
  try {
    // Update timestamp
    updates.updatedAt = new Date().toISOString();
    
    // Get the existing item first
    const existingItem = await getById(collection, id);
    
    if (!existingItem) {
      console.log(`[ sqliteStorage.js ] Item with ID ${id} not found in ${collection}`);
      return null;
    }
    
    // Merge existing item with updates
    const updatedItem = { ...existingItem, ...updates };
    
    // Prepare the update based on collection type
    let setClauses, values;
    
    if (collection === 'users') {
      const privacySettings = JSON.stringify(updatedItem.privacySettings || {});
      const preferences = JSON.stringify(updatedItem.preferences || {});
      const homeGroups = JSON.stringify(updatedItem.homeGroups || []);
      const sponsor = JSON.stringify(updatedItem.sponsor || null);
      const sponsees = JSON.stringify(updatedItem.sponsees || []);
      const messagingKeys = JSON.stringify(updatedItem.messagingKeys || {});
      
      setClauses = 'name = ?, lastName = ?, phoneNumber = ?, email = ?, sobrietyDate = ?, homeGroups = ?, privacySettings = ?, preferences = ?, sponsor = ?, sponsees = ?, messagingKeys = ?, updatedAt = ?';
      values = [
        updatedItem.name, updatedItem.lastName, updatedItem.phoneNumber, updatedItem.email, 
        updatedItem.sobrietyDate, homeGroups, privacySettings, preferences, 
        sponsor, sponsees, messagingKeys, updatedItem.updatedAt, id
      ];
    } else if (collection === 'activities') {
      setClauses = 'type = ?, duration = ?, date = ?, notes = ?, meeting = ?, updatedAt = ?';
      values = [
        updatedItem.type, updatedItem.duration, updatedItem.date, 
        updatedItem.notes, updatedItem.meeting, updatedItem.updatedAt, id
      ];
    } else if (collection === 'meetings') {
      const days = JSON.stringify(updatedItem.days || []);
      const schedule = JSON.stringify(updatedItem.schedule || []);
      const coordinates = JSON.stringify(updatedItem.coordinates || null);
      
      setClauses = 'name = ?, days = ?, time = ?, schedule = ?, address = ?, locationName = ?, streetAddress = ?, city = ?, state = ?, zipCode = ?, coordinates = ?, updatedAt = ?';
      values = [
        updatedItem.name, days, updatedItem.time, schedule, updatedItem.address, 
        updatedItem.locationName, updatedItem.streetAddress, updatedItem.city, 
        updatedItem.state, updatedItem.zipCode, coordinates, updatedItem.updatedAt, id
      ];
    } else if (collection === 'messages') {
      setClauses = 'content = ?, encrypted = ?, read = ?';
      values = [
        updatedItem.content, updatedItem.encrypted ? 1 : 0, updatedItem.read ? 1 : 0, id
      ];
    } else if (collection === 'preferences') {
      setClauses = 'value = ?, updatedAt = ?';
      values = [
        JSON.stringify(updatedItem.value), updatedItem.updatedAt, id
      ];
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    // Execute the update query
    const result = await executeQuery(
      `UPDATE ${collection} SET ${setClauses} WHERE id = ?`,
      values
    );
    
    if (result.rowsAffected === 0) {
      console.log(`[ sqliteStorage.js ] No rows affected when updating ${collection} with ID: ${id}`);
      return null;
    }
    
    console.log(`[ sqliteStorage.js ] Updated item in ${collection} with ID: ${id}`);
    return updatedItem;
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error updating item in ${collection}:`, error);
    throw error;
  }
}

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<boolean>} Whether the item was removed
 */
export async function remove(collection, id) {
  try {
    const result = await executeQuery(
      `DELETE FROM ${collection} WHERE id = ?`,
      [id]
    );
    
    const success = result.rowsAffected > 0;
    
    if (success) {
      console.log(`[ sqliteStorage.js ] Removed item from ${collection} with ID: ${id}`);
    } else {
      console.log(`[ sqliteStorage.js ] No item found in ${collection} with ID: ${id}`);
    }
    
    return success;
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error removing item from ${collection}:`, error);
    return false;
  }
}

/**
 * Query items in a collection
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Promise<Array>} Filtered items
 */
export async function query(collection, predicate) {
  try {
    const items = await getAll(collection);
    return items.filter(predicate);
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error querying ${collection}:`, error);
    return [];
  }
}

/**
 * Get user preference
 * @param {string} key - The preference key
 * @returns {Promise<any>} The preference value
 */
export async function getPreference(key) {
  try {
    const preference = await getById('preferences', key);
    return preference?.value;
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error getting preference ${key}:`, error);
    return null;
  }
}

/**
 * Set user preference
 * @param {string} key - The preference key
 * @param {any} value - The preference value
 * @returns {Promise<void>}
 */
export async function setPreference(key, value) {
  try {
    const now = new Date().toISOString();
    const preference = {
      id: key,
      value: value,
      createdAt: now,
      updatedAt: now
    };
    
    // Check if preference exists
    const existingPref = await getById('preferences', key);
    
    if (existingPref) {
      // Update existing preference
      await update('preferences', key, { value, updatedAt: now });
    } else {
      // Add new preference
      await add('preferences', preference);
    }
  } catch (error) {
    console.error(`[ sqliteStorage.js ] Error setting preference ${key}:`, error);
  }
}

/**
 * Calculate spiritual fitness score
 * @param {Array} activities - The activities array
 * @param {number} timeframe - Timeframe in days (default: 30)
 * @returns {Promise<number>} Spiritual fitness score
 */
export async function calculateSpiritualFitness(activities, timeframe = 30) {
  if (!activities || activities.length === 0) {
    return 20; // Base score if no activities
  }
  
  try {
    // Get user preference for timeframe if available
    const storedTimeframe = await getPreference('fitnessTimeframe');
    const calculationTimeframe = storedTimeframe ? parseInt(storedTimeframe, 10) : timeframe;
    
    // Start with a base score
    const baseScore = 20;
    let score = baseScore;
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - calculationTimeframe);
    
    // Filter activities to those within the timeframe
    const recentActivities = activities.filter(activity => 
      new Date(activity.date) >= cutoffDate && new Date(activity.date) <= now
    );
    
    if (recentActivities.length === 0) {
      return baseScore; // Base score only if no recent activities
    }
    
    // Calculate points based on activities
    const activityPoints = Math.min(40, recentActivities.length * 2); // Cap at 40 points
    
    // Calculate consistency points
    // Group activities by day to check daily activity
    const activityDayMap = {};
    recentActivities.forEach(activity => {
      const day = new Date(activity.date).toISOString().split('T')[0];
      if (!activityDayMap[day]) {
        activityDayMap[day] = [];
      }
      activityDayMap[day].push(activity);
    });
    
    // Count days with activities
    const daysWithActivities = Object.keys(activityDayMap).length;
    
    // Calculate consistency as a percentage of the timeframe days
    const consistencyPercentage = daysWithActivities / calculationTimeframe;
    const consistencyPoints = Math.round(consistencyPercentage * 40); // Up to 40 points for consistency
    
    // Total score
    score = baseScore + activityPoints + consistencyPoints;
    
    // Ensure score doesn't exceed 100
    score = Math.min(100, score);
    
    // Round to 2 decimal places
    score = Math.round(score * 100) / 100;
    
    return score;
  } catch (error) {
    console.error('[ sqliteStorage.js ] Error calculating spiritual fitness:', error);
    return 20; // Default base score on error
  }
}

/**
 * Calculate distance between two lat/long points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Miles
  return dist;
}

/**
 * Check if there is data in localStorage to migrate
 * @returns {boolean} Whether localStorage contains data to migrate
 */
export function hasLocalStorageData() {
  return !!(
    localStorage.getItem('user') ||
    localStorage.getItem('activities') ||
    localStorage.getItem('meetings') ||
    localStorage.getItem('messages')
  );
}

/**
 * Migrate data from localStorage to the database
 * @returns {Promise<boolean>} Whether migration was successful
 */
export async function migrateFromLocalStorage() {
  console.log("[ sqliteStorage.js ] Starting migration from localStorage to SQLite...");
  
  try {
    // Migrate user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      console.log("[ sqliteStorage.js ] Migrating user data...");
      await add('users', userData);
    }
    
    // Migrate activities
    const activitiesData = JSON.parse(localStorage.getItem('activities') || '[]');
    if (activitiesData.length > 0) {
      console.log(`[ sqliteStorage.js ] Migrating ${activitiesData.length} activities...`);
      for (const activity of activitiesData) {
        await add('activities', activity);
      }
    }
    
    // Migrate meetings
    const meetingsData = JSON.parse(localStorage.getItem('meetings') || '[]');
    if (meetingsData.length > 0) {
      console.log(`[ sqliteStorage.js ] Migrating ${meetingsData.length} meetings...`);
      for (const meeting of meetingsData) {
        await add('meetings', meeting);
      }
    }
    
    // Migrate messages
    const messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
    if (messagesData.length > 0) {
      console.log(`[ sqliteStorage.js ] Migrating ${messagesData.length} messages...`);
      for (const message of messagesData) {
        await add('messages', message);
      }
    }
    
    console.log("[ sqliteStorage.js ] Migration completed successfully!");
    
    // Optionally clear localStorage after successful migration
    // localStorage.clear();
    
    return true;
  } catch (error) {
    console.error("[ sqliteStorage.js ] Error during migration:", error);
    return false;
  }
}

/**
 * Set up global window.db object for backward compatibility
 * @returns {Object} The database interface
 */
export function setupGlobalDbObject() {
  window.db = {
    getAll,
    getById,
    add,
    update,
    remove,
    query,
    calculateDistance,
    getPreference,
    setPreference,
    calculateSpiritualFitness,
    hasLocalStorageData,
    migrateFromLocalStorage
  };
  
  return window.db;
}