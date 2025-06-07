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
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
export function calculateSobrietyDays(sobrietyDate) {
  if (!sobrietyDate) return 0;
  
  const startDate = new Date(sobrietyDate);
  const today = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = today - startDate;
  
  // Convert to days
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate sobriety years with decimal precision
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} - Years of sobriety with decimal precision
 */
export function calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
  if (!sobrietyDate) return 0;
  
  const startDate = new Date(sobrietyDate);
  const today = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = today - startDate;
  
  // Calculate years with decimal precision
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Round to specified decimal places
  return parseFloat(years.toFixed(decimalPlaces));
}

/**
 * DEPRECATED: For compatibility only
 */
export default {
  initDatabase,
  calculateFallbackSpiritualFitness,
  calculateSobrietyDays,
  calculateSobrietyYears,
  // Add any other exports needed for compatibility
  getAll: () => Promise.resolve([]),
  getById: () => Promise.resolve(null),
  add: (collection, item) => Promise.resolve({ ...item }),
  update: () => Promise.resolve(null),
  remove: () => Promise.resolve(false),
  query: () => Promise.resolve([])
};