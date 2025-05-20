/**
 * DEPRECATED: This file is no longer used
 * All SQLite functionality has been moved to sqliteLoader.js
 * This file remains only for compatibility with existing imports
 */

import { DEFAULT_SPIRITUAL_FITNESS_SCORE } from './constants';

// Make the default score available globally
window.DEFAULT_SPIRITUAL_FITNESS_SCORE = DEFAULT_SPIRITUAL_FITNESS_SCORE;

// DEPRECATED: This file is no longer the source of database connections
console.warn('capacitorStorage.js is deprecated - all SQLite functionality moved to sqliteLoader.js');

/**
 * DEPRECATED: This function is no longer used
 * @returns {Promise<boolean>} Always returns false to indicate this implementation is deprecated
 */
export async function initDatabase() {
  console.warn("[ capacitorStorage.js ] DEPRECATED: Use sqliteLoader.js instead for database initialization");
  
  // Return false to indicate this implementation is deprecated and shouldn't be used
  return Promise.resolve(false);
}

/**
 * DEPRECATED: This function is no longer used
 * @returns {number} Default spiritual fitness score
 */
export function calculateFallbackSpiritualFitness() {
  console.warn("[ capacitorStorage.js ] DEPRECATED: Fallback calculation moved to sqliteLoader.js");
  return DEFAULT_SPIRITUAL_FITNESS_SCORE;
}

/**
 * DEPRECATED: For compatibility only
 */
export default {
  initDatabase,
  calculateFallbackSpiritualFitness,
  // Add any other exports needed for compatibility
  getAll: () => Promise.resolve([]),
  getById: () => Promise.resolve(null),
  add: (collection, item) => Promise.resolve({ ...item }),
  update: () => Promise.resolve(null),
  remove: () => Promise.resolve(false),
  query: () => Promise.resolve([])
};