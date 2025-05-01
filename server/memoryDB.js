/**
 * Simple in-memory database for the AA Recovery Tracking application
 */

// In-memory storage
const db = {
  users: [],
  activities: [],
  spiritualFitness: []
};

/**
 * Initialize the database with sample data (empty for MVP)
 */
const initializeMemoryDB = () => {
  console.log('Initializing in-memory database');
  
  // The database starts empty for the MVP
  db.users = [];
  db.activities = [];
  db.spiritualFitness = [];
};

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Array} All items in the collection
 */
const getAll = (collection) => {
  if (!db[collection]) {
    throw new Error(`Collection ${collection} does not exist`);
  }
  
  return [...db[collection]];
};

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Object|null} The found item or null
 */
const getById = (collection, id) => {
  if (!db[collection]) {
    throw new Error(`Collection ${collection} does not exist`);
  }
  
  return db[collection].find(item => item.id === id) || null;
};

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Object} The added item
 */
const add = (collection, item) => {
  if (!db[collection]) {
    throw new Error(`Collection ${collection} does not exist`);
  }
  
  if (!item.id) {
    item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  db[collection].push(item);
  return item;
};

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Object|null} The updated item or null if not found
 */
const update = (collection, id, updates) => {
  if (!db[collection]) {
    throw new Error(`Collection ${collection} does not exist`);
  }
  
  const index = db[collection].findIndex(item => item.id === id);
  if (index === -1) {
    return null;
  }
  
  db[collection][index] = { ...db[collection][index], ...updates };
  return db[collection][index];
};

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {boolean} Whether the item was removed
 */
const remove = (collection, id) => {
  if (!db[collection]) {
    throw new Error(`Collection ${collection} does not exist`);
  }
  
  const initialLength = db[collection].length;
  db[collection] = db[collection].filter(item => item.id !== id);
  
  return db[collection].length < initialLength;
};

/**
 * Query items in a collection
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered items
 */
const query = (collection, predicate) => {
  if (!db[collection]) {
    throw new Error(`Collection ${collection} does not exist`);
  }
  
  return db[collection].filter(predicate);
};

module.exports = {
  initializeMemoryDB,
  getAll,
  getById,
  add,
  update,
  remove,
  query
};
