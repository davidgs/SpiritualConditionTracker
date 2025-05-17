/**
 * Capacitor-compatible SQLite storage implementation
 * Optimized for native iOS and Android compiled apps
 * With improved error handling and iOS support
 */

import { isPlatform } from '@ionic/react';

// Database connection
let db = null;
let sqlitePlugin = null;
let initializationAttempted = false;

/**
 * Initialize the database connection
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export async function initDatabase() {
  // Prevent multiple initialization attempts
  if (initializationAttempted) {
    console.log("Database initialization already attempted");
    return db !== null;
  }
  
  initializationAttempted = true;
  console.log("Initializing SQLite database for Capacitor...");
  
  try {
    // Import the appropriate SQLite plugin based on platform
    if (isPlatform('capacitor') || isPlatform('cordova') || isPlatform('ios')) {
      console.log("Detected native platform, using native SQLite implementation");
      
      // For Capacitor/iOS
      if (isPlatform('capacitor') || isPlatform('ios')) {
        try {
          console.log("Loading Capacitor SQLite implementation...");
          const capacitorModule = await import('@capacitor-community/sqlite');
          console.log("Capacitor SQLite module loaded:", capacitorModule);
          sqlitePlugin = capacitorModule.CapacitorSQLite;
        } catch (error) {
          console.error("Error loading Capacitor SQLite module:", error);
          throw error;
        }
      } 
      // For Cordova
      else if (isPlatform('cordova')) {
        console.log("Using Cordova SQLite implementation");
        sqlitePlugin = window.sqlitePlugin;
      }
      
      // Check if plugin is available
      if (!sqlitePlugin) {
        console.error("SQLite plugin not available on this platform");
        throw new Error("SQLite plugin not available");
      }
      
      console.log("Opening database with SQLite plugin...");
      // Open or create the database
      try {
        db = await sqlitePlugin.openDatabase({
          name: 'spiritualTracker.db',
          location: 'default'
        });
        console.log("Database opened successfully:", db);
      } catch (error) {
        console.error("Error opening database:", error);
        throw error;
      }
    }
    // Web fallback - if Web SQL is available
    else if (window.openDatabase) {
      console.log("Using WebSQL implementation for browser");
      db = window.openDatabase(
        'spiritualTracker.db',
        '1.0',
        'Spiritual Condition Tracker Database',
        5 * 1024 * 1024 // 5MB
      );
    }
    // No SQL support - use localStorage
    else {
      console.warn("SQLite not available - using localStorage fallback");
      setupLocalStorageFallback();
      return false;
    }
    
    // Create tables
    try {
      await createTables();
      console.log("SQLite database tables created successfully");
    } catch (error) {
      console.error("Error creating database tables:", error);
      throw error;
    }
    
    console.log("SQLite database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    
    // Set up localStorage fallback
    console.log("Setting up localStorage fallback due to initialization error");
    setupLocalStorageFallback();
    
    // For debugging: log all available methods on window
    console.log("Available window methods:", Object.keys(window));
    
    return false;
  }
}

/**
 * Create a fallback using localStorage if SQLite is not available
 */
function setupLocalStorageFallback() {
  console.log("Setting up localStorage fallback for data persistence");
  
  // Create an object that mimics SQLite interface but uses localStorage
  db = {
    transaction: (fn) => {
      const tx = {
        executeSql: (query, params, successCallback, errorCallback) => {
          try {
            // Very simplified SQL parsing - handle only basic operations
            const queryLower = query.toLowerCase().trim();
            
            if (queryLower.startsWith('create table')) {
              // For create table, just do nothing as localStorage doesn't need tables
              successCallback({}, { rows: { length: 0 } });
            }
            else if (queryLower.startsWith('select')) {
              handleLocalStorageSelect(queryLower, params, successCallback, errorCallback);
            }
            else if (queryLower.startsWith('insert')) {
              handleLocalStorageInsert(queryLower, params, successCallback, errorCallback);
            }
            else if (queryLower.startsWith('update')) {
              handleLocalStorageUpdate(queryLower, params, successCallback, errorCallback);
            }
            else if (queryLower.startsWith('delete')) {
              handleLocalStorageDelete(queryLower, params, successCallback, errorCallback);
            }
            else {
              // Unknown query
              console.warn("Unsupported SQL query for localStorage:", query);
              successCallback({}, { rows: { length: 0 } });
            }
          } catch (error) {
            console.error("Error in localStorage fallback:", error);
            if (errorCallback) errorCallback({}, error);
          }
        }
      };
      fn(tx);
    }
  };
  
  // Helper functions for localStorage operations
  function getCollection(name) {
    return JSON.parse(localStorage.getItem(name) || '[]');
  }
  
  function saveCollection(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
  }
  
  function handleLocalStorageSelect(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const fromMatch = query.match(/from\s+([^\s,)]+)/i);
    if (!fromMatch) {
      throw new Error("Invalid SELECT query: " + query);
    }
    
    const tableName = fromMatch[1];
    let items = getCollection(tableName);
    
    // Handle WHERE clause (very simplified)
    const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    if (whereMatch && params.length > 0) {
      const fieldName = whereMatch[1];
      items = items.filter(item => item[fieldName] === params[0]);
    }
    
    // Create a result object with a row-like interface
    const result = {
      rows: {
        length: items.length,
        item: (index) => items[index],
        _array: items
      }
    };
    
    successCallback({}, result);
  }
  
  function handleLocalStorageInsert(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const intoMatch = query.match(/into\s+([^\s(]+)/i);
    if (!intoMatch) {
      throw new Error("Invalid INSERT query: " + query);
    }
    
    const tableName = intoMatch[1];
    
    // Construct an object from params (very simplified)
    const item = constructItemFromParams(tableName, params);
    
    // Add to collection
    const items = getCollection(tableName);
    items.push(item);
    saveCollection(tableName, items);
    
    successCallback({}, { insertId: item.id, rowsAffected: 1 });
  }
  
  function handleLocalStorageUpdate(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const updateMatch = query.match(/update\s+([^\s]+)/i);
    const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    
    if (!updateMatch || !whereMatch) {
      throw new Error("Invalid UPDATE query: " + query);
    }
    
    const tableName = updateMatch[1];
    const fieldName = whereMatch[1];
    const fieldValue = params[params.length - 1]; // assuming last param is the ID
    
    const items = getCollection(tableName);
    const index = items.findIndex(item => item[fieldName] === fieldValue);
    
    if (index === -1) {
      successCallback({}, { rowsAffected: 0 });
      return;
    }
    
    // Update the item
    const updatedItem = constructItemFromParams(tableName, params, items[index]);
    items[index] = updatedItem;
    saveCollection(tableName, items);
    
    successCallback({}, { rowsAffected: 1 });
  }
  
  function handleLocalStorageDelete(query, params, successCallback) {
    // Extract table name (very simplified parser)
    const fromMatch = query.match(/from\s+([^\s]+)/i);
    const whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    
    if (!fromMatch || !whereMatch) {
      throw new Error("Invalid DELETE query: " + query);
    }
    
    const tableName = fromMatch[1];
    const fieldName = whereMatch[1];
    const fieldValue = params[0];
    
    const items = getCollection(tableName);
    const filteredItems = items.filter(item => item[fieldName] !== fieldValue);
    
    if (filteredItems.length === items.length) {
      successCallback({}, { rowsAffected: 0 });
      return;
    }
    
    saveCollection(tableName, filteredItems);
    successCallback({}, { rowsAffected: 1 });
  }
  
  function constructItemFromParams(tableName, params, existingItem = {}) {
    // Very simplified approach - in a real implementation you would
    // parse column names from the query
    
    // This is just a basic implementation to make it work
    const item = { ...existingItem };
    
    // Set some fields based on table and params
    if (tableName === 'users' && params.length >= 3) {
      item.id = params[0] || existingItem.id || `user_${Date.now()}`;
      item.name = params[1] || existingItem.name;
      item.lastName = params[2] || existingItem.lastName;
      // Add more fields as needed
    }
    else if (tableName === 'activities' && params.length >= 3) {
      item.id = params[0] || existingItem.id || `activity_${Date.now()}`;
      item.type = params[1] || existingItem.type;
      item.duration = params[2] || existingItem.duration;
      // Add more fields as needed
    }
    else if (tableName === 'preferences' && params.length >= 2) {
      item.id = params[0] || existingItem.id || `pref_${Date.now()}`;
      item.value = params[1] || existingItem.value;
    }
    // Default handling for any table
    else {
      item.id = params[0] || existingItem.id || `${tableName}_${Date.now()}`;
      
      // Try to assign remaining parameters as fields
      if (params.length > 1) {
        item.value = params[1] || existingItem.value;
      }
      if (params.length > 2) {
        item.data = params[2] || existingItem.data;
      }
    }
    
    return item;
  }
}

/**
 * Create database tables
 */
async function createTables() {
  if (!db) {
    console.error("Cannot create tables - database not initialized");
    return;
  }
  
  // Define table creation queries
  const tableQueries = [
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
      encrypted INTEGER,
      timestamp TEXT,
      read INTEGER
    )`,
    
    `CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      value TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`
  ];
  
  // Execute each table creation query
  for (const query of tableQueries) {
    try {
      await executeQuery(query);
      console.log(`Table creation successful: ${query.substring(0, 40)}...`);
    } catch (error) {
      console.error(`Error creating table: ${query.substring(0, 40)}...`, error);
      throw error;
    }
  }
}

/**
 * Execute a SQL query
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query result
 */
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    
    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          console.error("SQL Error:", error);
          reject(error);
          return false;
        }
      );
    });
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
      
      // Parse JSON fields based on collection type
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
    console.error(`Error getting all items from ${collection}:`, error);
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
    
    // Parse JSON fields based on collection type
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
    console.error(`Error getting item by ID from ${collection}:`, error);
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
    item.createdAt = item.createdAt || now;
    item.updatedAt = now;
    
    // Prepare item based on collection type
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
      const value = JSON.stringify(item.value);
      
      columns = 'id, value, createdAt, updatedAt';
      placeholders = '?, ?, ?, ?';
      values = [item.id, value, item.createdAt, item.updatedAt];
    } else {
      throw new Error(`Unknown collection: ${collection}`);
    }
    
    // Execute the insert query
    const query = `INSERT INTO ${collection} (${columns}) VALUES (${placeholders})`;
    await executeQuery(query, values);
    
    return item;
  } catch (error) {
    console.error(`Error adding item to ${collection}:`, error);
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
    // Get the existing item
    const item = await getById(collection, id);
    if (!item) {
      return null;
    }
    
    // Update the item with the new values
    const updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
    
    // Prepare update query based on collection type
    let setClauses = [];
    let values = [];
    
    if (collection === 'users') {
      if (updates.name !== undefined) {
        setClauses.push('name = ?');
        values.push(updates.name);
      }
      if (updates.lastName !== undefined) {
        setClauses.push('lastName = ?');
        values.push(updates.lastName);
      }
      if (updates.phoneNumber !== undefined) {
        setClauses.push('phoneNumber = ?');
        values.push(updates.phoneNumber);
      }
      if (updates.email !== undefined) {
        setClauses.push('email = ?');
        values.push(updates.email);
      }
      if (updates.sobrietyDate !== undefined) {
        setClauses.push('sobrietyDate = ?');
        values.push(updates.sobrietyDate);
      }
      if (updates.homeGroups !== undefined) {
        setClauses.push('homeGroups = ?');
        values.push(JSON.stringify(updates.homeGroups));
      }
      if (updates.privacySettings !== undefined) {
        setClauses.push('privacySettings = ?');
        values.push(JSON.stringify(updates.privacySettings));
      }
      if (updates.preferences !== undefined) {
        setClauses.push('preferences = ?');
        values.push(JSON.stringify(updates.preferences));
      }
      if (updates.sponsor !== undefined) {
        setClauses.push('sponsor = ?');
        values.push(JSON.stringify(updates.sponsor));
      }
      if (updates.sponsees !== undefined) {
        setClauses.push('sponsees = ?');
        values.push(JSON.stringify(updates.sponsees));
      }
      if (updates.messagingKeys !== undefined) {
        setClauses.push('messagingKeys = ?');
        values.push(JSON.stringify(updates.messagingKeys));
      }
    } else if (collection === 'activities') {
      if (updates.type !== undefined) {
        setClauses.push('type = ?');
        values.push(updates.type);
      }
      if (updates.duration !== undefined) {
        setClauses.push('duration = ?');
        values.push(updates.duration);
      }
      if (updates.date !== undefined) {
        setClauses.push('date = ?');
        values.push(updates.date);
      }
      if (updates.notes !== undefined) {
        setClauses.push('notes = ?');
        values.push(updates.notes);
      }
      if (updates.meeting !== undefined) {
        setClauses.push('meeting = ?');
        values.push(updates.meeting);
      }
    } else if (collection === 'meetings') {
      if (updates.name !== undefined) {
        setClauses.push('name = ?');
        values.push(updates.name);
      }
      if (updates.days !== undefined) {
        setClauses.push('days = ?');
        values.push(JSON.stringify(updates.days));
      }
      if (updates.time !== undefined) {
        setClauses.push('time = ?');
        values.push(updates.time);
      }
      if (updates.schedule !== undefined) {
        setClauses.push('schedule = ?');
        values.push(JSON.stringify(updates.schedule));
      }
      if (updates.address !== undefined) {
        setClauses.push('address = ?');
        values.push(updates.address);
      }
      if (updates.locationName !== undefined) {
        setClauses.push('locationName = ?');
        values.push(updates.locationName);
      }
      if (updates.streetAddress !== undefined) {
        setClauses.push('streetAddress = ?');
        values.push(updates.streetAddress);
      }
      if (updates.city !== undefined) {
        setClauses.push('city = ?');
        values.push(updates.city);
      }
      if (updates.state !== undefined) {
        setClauses.push('state = ?');
        values.push(updates.state);
      }
      if (updates.zipCode !== undefined) {
        setClauses.push('zipCode = ?');
        values.push(updates.zipCode);
      }
      if (updates.coordinates !== undefined) {
        setClauses.push('coordinates = ?');
        values.push(JSON.stringify(updates.coordinates));
      }
    } else if (collection === 'messages') {
      if (updates.content !== undefined) {
        setClauses.push('content = ?');
        values.push(updates.content);
      }
      if (updates.encrypted !== undefined) {
        setClauses.push('encrypted = ?');
        values.push(updates.encrypted ? 1 : 0);
      }
      if (updates.read !== undefined) {
        setClauses.push('read = ?');
        values.push(updates.read ? 1 : 0);
      }
    } else if (collection === 'preferences') {
      if (updates.value !== undefined) {
        setClauses.push('value = ?');
        values.push(JSON.stringify(updates.value));
      }
    }
    
    // Always update the updatedAt timestamp
    setClauses.push('updatedAt = ?');
    values.push(updatedItem.updatedAt);
    
    // Add the ID to the values array for the WHERE clause
    values.push(id);
    
    // Execute the update query
    const query = `UPDATE ${collection} SET ${setClauses.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return updatedItem;
  } catch (error) {
    console.error(`Error updating item in ${collection}:`, error);
    return null;
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
    
    return result.rowsAffected > 0;
  } catch (error) {
    console.error(`Error removing item from ${collection}:`, error);
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
    console.error(`Error querying items in ${collection}:`, error);
    return [];
  }
}

/**
 * Calculate spirituality score based on activities and other factors
 * This is implemented with fallbacks to work across all platforms
 * @returns {Promise<number>} Spirituality score from 0-100
 */
export async function calculateSpiritualFitness() {
  try {
    // First try the direct database approach
    let activities = [];
    
    try {
      // Get activities from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateThreshold = thirtyDaysAgo.toISOString();
      
      activities = await query('activities', item => 
        item.date && item.date >= dateThreshold
      );
      
      // Log for debugging
      console.log(`Found ${activities.length} activities in the last 30 days using SQLite`);
    } catch (dbError) {
      console.warn("Error calculating spiritual fitness via SQLite:", dbError);
      
      // Try localStorage fallback
      try {
        const storedActivities = localStorage.getItem('activities');
        if (storedActivities) {
          const allActivities = JSON.parse(storedActivities);
          
          // Filter for last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const dateThreshold = thirtyDaysAgo.toISOString();
          
          activities = allActivities.filter(item => 
            item.date && item.date >= dateThreshold
          );
          
          console.log(`Found ${activities.length} activities in the last 30 days using localStorage fallback`);
        }
      } catch (lsError) {
        console.error("Error with localStorage fallback:", lsError);
        
        // Last resort hardcoded fallback for testing
        console.warn("Using hardcoded fallback data for spiritual fitness calculation");
        activities = [
          { type: 'prayer', duration: 15, date: new Date().toISOString() },
          { type: 'meditation', duration: 20, date: new Date().toISOString() },
          { type: 'meeting', duration: 60, date: new Date().toISOString() }
        ];
      }
    }
    
    // Calculate score (simplified scoring system)
    // Each activity type contributes differently to the score
    
    const activityPoints = {
      prayer: 5,
      meditation: 5,
      meeting: 10,
      stepwork: 15,
      service: 20,
      sponsor: 10,
      reading: 5
    };
    
    let totalPoints = 0;
    const activityCounts = {};
    
    // Count activities by type
    activities.forEach(activity => {
      const type = activity.type;
      activityCounts[type] = (activityCounts[type] || 0) + 1;
      
      // Add points based on activity type
      totalPoints += activityPoints[type] || 3; // Default 3 points for unknown activities
    });
    
    // Calculate diversity bonus (more different types of activities = higher score)
    const diversityBonus = Object.keys(activityCounts).length * 5;
    
    // Calculate consistency bonus (more activities of the same type = higher score)
    let consistencyBonus = 0;
    Object.values(activityCounts).forEach(count => {
      if (count >= 5) consistencyBonus += 10;
      else if (count >= 3) consistencyBonus += 5;
    });
    
    // Calculate final score (cap at 100)
    const finalScore = Math.min(100, totalPoints + diversityBonus + consistencyBonus);
    
    console.log("Spiritual fitness score:", finalScore);
    console.log("- Activity points:", totalPoints);
    console.log("- Diversity bonus:", diversityBonus);
    console.log("- Consistency bonus:", consistencyBonus);
    
    return finalScore;
  } catch (error) {
    console.error("Error calculating spiritual fitness score:", error);
    return 0; // Default to 0 on error
  }
}

/**
 * If SQLite initialization failed, this provides a way to
 * get spiritual fitness using a fallback implementation
 * @returns {number} Spiritual fitness score from 0-100
 */
export function getFallbackSpiritualFitness() {
  try {
    // Get activities from localStorage
    const storedActivities = localStorage.getItem('activities');
    let activities = [];
    
    if (storedActivities) {
      const allActivities = JSON.parse(storedActivities);
      
      // Filter for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateThreshold = thirtyDaysAgo.toISOString();
      
      activities = allActivities.filter(item => 
        item.date && item.date >= dateThreshold
      );
    }
    
    // If no activities found, return a default value
    if (activities.length === 0) {
      return 50; // Default middle value
    }
    
    // Simple scoring: 5 points per activity up to 100
    return Math.min(100, activities.length * 5);
  } catch (error) {
    console.error("Error in fallback spiritual fitness calculation:", error);
    return 50; // Default to middle value on error
  }
}

// Export localStorage-specific functions for platforms that need them
export const localStorageFunctions = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
      return false;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
      return false;
    }
  }
};