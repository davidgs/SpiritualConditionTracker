/**
 * IndexedDB implementation for the Spiritual Condition Tracker
 * This replaces both SQLite and localStorage for better data persistence
 */

const DB_NAME = 'spiritualTrackerDB';
const DB_VERSION = 1;
const STORES = ['users', 'activities', 'meetings', 'messages', 'preferences'];

/**
 * Initialize the database
 * @returns {Promise<IDBDatabase>} The database connection
 */
export function initDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Initializing IndexedDB database...');
    
    if (!window.indexedDB) {
      console.error('IndexedDB not supported in this browser');
      reject(new Error('IndexedDB not supported'));
      return;
    }
    
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
    
    request.onupgradeneeded = (event) => {
      console.log('Creating or upgrading database...');
      const db = event.target.result;
      
      // Create object stores if they don't exist
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          console.log(`Creating object store: ${storeName}`);
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
    
    request.onsuccess = (event) => {
      console.log('IndexedDB initialized successfully');
      const db = event.target.result;
      resolve(db);
    };
  });
}

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Promise<Array>} All items in the collection
 */
export async function getAll(collection) {
  return new Promise((resolve, reject) => {
    const db = await openDatabase();
    
    const transaction = db.transaction(collection, 'readonly');
    const store = transaction.objectStore(collection);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting items from ${collection}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<Object|null>} The found item or null
 */
export async function getById(collection, id) {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    
    const transaction = db.transaction(collection, 'readonly');
    const store = transaction.objectStore(collection);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting item from ${collection}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Promise<Object>} The added item
 */
export async function add(collection, item) {
  return new Promise(async (resolve, reject) => {
    // Generate ID if not provided
    if (!item.id) {
      item.id = `${collection.slice(0, -1)}_${Date.now()}`;
    }
    
    // Add timestamps
    const now = new Date().toISOString();
    item.createdAt = now;
    item.updatedAt = now;
    
    const db = await openDatabase();
    
    const transaction = db.transaction(collection, 'readwrite');
    const store = transaction.objectStore(collection);
    const request = store.add(item);
    
    request.onsuccess = () => {
      console.log(`Added item to ${collection} with ID: ${item.id}`);
      resolve(item);
    };
    
    request.onerror = (event) => {
      console.error(`Error adding item to ${collection}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object|null>} The updated item or null if not found
 */
export async function update(collection, id, updates) {
  return new Promise(async (resolve, reject) => {
    // Update timestamp
    updates.updatedAt = new Date().toISOString();
    
    const db = await openDatabase();
    
    // First, get the existing item
    const transaction1 = db.transaction(collection, 'readonly');
    const store1 = transaction1.objectStore(collection);
    const getRequest = store1.get(id);
    
    getRequest.onsuccess = () => {
      const existingItem = getRequest.result;
      
      if (!existingItem) {
        console.log(`Item with ID ${id} not found in ${collection}`);
        resolve(null);
        return;
      }
      
      // Merge existing item with updates
      const updatedItem = { ...existingItem, ...updates };
      
      // Update the item
      const transaction2 = db.transaction(collection, 'readwrite');
      const store2 = transaction2.objectStore(collection);
      const putRequest = store2.put(updatedItem);
      
      putRequest.onsuccess = () => {
        console.log(`Updated item in ${collection} with ID: ${id}`);
        resolve(updatedItem);
      };
      
      putRequest.onerror = (event) => {
        console.error(`Error updating item in ${collection}:`, event.target.error);
        reject(event.target.error);
      };
    };
    
    getRequest.onerror = (event) => {
      console.error(`Error getting item from ${collection}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<boolean>} Whether the item was removed
 */
export async function remove(collection, id) {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    
    const transaction = db.transaction(collection, 'readwrite');
    const store = transaction.objectStore(collection);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log(`Removed item from ${collection} with ID: ${id}`);
      resolve(true);
    };
    
    request.onerror = (event) => {
      console.error(`Error removing item from ${collection}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Query items in a collection using a filter function
 * @param {string} collection - The collection name
 * @param {function} predicate - Function to filter items
 * @returns {Promise<Array>} Filtered items
 */
export async function query(collection, predicate) {
  const allItems = await getAll(collection);
  return allItems.filter(predicate);
}

/**
 * Cache for the database connection to avoid opening multiple connections
 */
let dbPromise = null;

/**
 * Get a database connection
 * @returns {Promise<IDBDatabase>} The database connection
 */
async function openDatabase() {
  if (!dbPromise) {
    dbPromise = initDatabase();
  }
  return dbPromise;
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
    console.error(`Error getting preference ${key}:`, error);
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
    const preference = {
      id: key,
      value: value
    };
    
    // Check if preference exists
    const existingPref = await getById('preferences', key);
    
    if (existingPref) {
      // Update existing preference
      await update('preferences', key, preference);
    } else {
      // Add new preference
      await add('preferences', preference);
    }
  } catch (error) {
    console.error(`Error setting preference ${key}:`, error);
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
    console.error('Error calculating spiritual fitness:', error);
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
 * Set up global window.db object for backward compatibility
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
    calculateSpiritualFitness
  };
  
  return window.db;
}

/**
 * Check if there is data in localStorage to migrate
 */
export function hasLocalStorageData() {
  return (
    localStorage.getItem('user') ||
    localStorage.getItem('activities') ||
    localStorage.getItem('meetings') ||
    localStorage.getItem('messages')
  );
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage() {
  console.log("Starting migration from localStorage to IndexedDB...");
  
  try {
    // Migrate user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      console.log("Migrating user data...");
      await add('users', userData);
    }
    
    // Migrate activities
    const activitiesData = JSON.parse(localStorage.getItem('activities') || '[]');
    if (activitiesData.length > 0) {
      console.log(`Migrating ${activitiesData.length} activities...`);
      for (const activity of activitiesData) {
        await add('activities', activity);
      }
    }
    
    // Migrate meetings
    const meetingsData = JSON.parse(localStorage.getItem('meetings') || '[]');
    if (meetingsData.length > 0) {
      console.log(`Migrating ${meetingsData.length} meetings...`);
      for (const meeting of meetingsData) {
        await add('meetings', meeting);
      }
    }
    
    // Migrate messages
    const messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
    if (messagesData.length > 0) {
      console.log(`Migrating ${messagesData.length} messages...`);
      for (const message of messagesData) {
        await add('messages', message);
      }
    }
    
    console.log("Migration completed successfully!");
    
    // Optionally clear localStorage after successful migration
    // (uncomment this if you want to clear after migration)
    // localStorage.clear();
    
    return true;
  } catch (error) {
    console.error("Error during migration:", error);
    return false;
  }
}