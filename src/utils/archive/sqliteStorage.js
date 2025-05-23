/**
 * DEPRECATED: This file is no longer used
 * All SQLite functionality has been moved to sqliteLoader.js
 * This file remains only for compatibility with existing imports
 */

console.warn('[ sqliteStorage.js ] DEPRECATED: Use sqliteLoader.js instead for database operations');

// For backward compatibility
let db = null;

/**
 * DEPRECATED: This function is no longer used
 * @returns {Promise<boolean>} Always returns false to indicate this implementation is deprecated
 */
export async function initDatabase() {
  console.warn("[ sqliteStorage.js ] DEPRECATED: Use sqliteLoader.js instead for database initialization");
  return Promise.resolve(false);
}

/**
 * Helper functions that do nothing but log deprecation warnings
 */
export async function getItem(collection, id) {
  console.error("[ sqliteStorage.js ] Error getting item by ID from", collection, ":", id);
  return null;
}

export async function addItem(collection, item) {
  console.error("[ sqliteStorage.js ] Error adding item to", collection, ":", item);
  return null;
}

export async function setPreference(key, value) {
  console.error("[ sqliteStorage.js ] Error setting preference", key, ":", value);
  return false;
}

// Default export for compatibility
export default {
  initDatabase,
  getItem,
  addItem,
  setPreference,
  getAll: () => Promise.resolve([]),
  getById: () => Promise.resolve(null),
  add: () => Promise.resolve(null),
  update: () => Promise.resolve(null),
  remove: () => Promise.resolve(false),
  query: () => Promise.resolve([])
};