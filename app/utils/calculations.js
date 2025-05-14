/**
 * Utility functions for various calculations 
 * in the Spiritual Condition Tracker app
 */

/**
 * Calculate the number of days sober based on a sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format (YYYY-MM-DD)
 * @returns {number} Number of days sober
 */
export function calculateSobrietyDays(sobrietyDate) {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Reset hours to compare dates only
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate years of sobriety with decimal precision
 * @param {string} sobrietyDate - Sobriety date in ISO format (YYYY-MM-DD) 
 * @param {number} decimalPlaces - Number of decimal places (default: 2)
 * @returns {number} Years of sobriety with decimal precision
 */
export function calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
  const days = calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25; // Account for leap years
  
  return parseFloat(years.toFixed(decimalPlaces));
}

/**
 * Format a number with commas for thousands separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number string with commas
 */
export function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date in ISO format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Get the appropriate icon for an activity type
 * @param {string} type - Activity type
 * @returns {string} Icon class name
 */
export function getActivityIcon(type) {
  const icons = {
    meeting: 'fas fa-users',
    prayer: 'fas fa-pray',
    meditation: 'fas fa-om',
    reading: 'fas fa-book',
    service: 'fas fa-hands-helping',
    stepwork: 'fas fa-tasks',
    sponsorship: 'fas fa-user-friends'
  };
  
  return icons[type] || 'fas fa-star';
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - Input string
 * @returns {string} String with first letter capitalized
 */
export function capitalizeFirst(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Format a duration in minutes to a readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    
    if (remainingMins === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMins} min${remainingMins !== 1 ? 's' : ''}`;
    }
  }
}