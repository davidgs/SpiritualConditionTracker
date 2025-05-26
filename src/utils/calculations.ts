/**
 * Utility functions for date and metric calculations
 */

/**
 * Calculate sobriety days
 */
export const calculateSobrietyDays = (sobrietyDate: string): number => {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate the difference in days
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate sobriety years with optional decimal places
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places (default 2)
 * @returns {number} Years of sobriety with decimal places
 */
export const calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
  if (!sobrietyDate) return 0;
  
  // Get sobriety date and current date
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate exact years including fractional part
  const diffTime = now - start;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25; // Account for leap years
  
  // Format to specified decimal places
  return Number(years.toFixed(decimalPlaces));
};

/**
 * Format a number with thousands separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number with commas as thousands separators
 */
export const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};