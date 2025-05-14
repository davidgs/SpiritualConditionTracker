/**
 * Utility functions for handling dates across the application
 */

/**
 * Format a date string for display without timezone issues
 * Handles both YYYY-MM-DD format and ISO date strings
 * 
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string (e.g., "May 14, 2025")
 */
export function formatDateForDisplay(dateString) {
  console.log("Formatting date:", dateString);
  
  if (!dateString) {
    console.error("Empty date string provided to formatDateForDisplay");
    return "Invalid date";
  }
  
  try {
    // YYYY-MM-DD format (from date input)
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[month - 1]} ${day}, ${year}`;
    } 
    
    // Handle ISO format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error formatting date";
  }
}

/**
 * Compare dates for sorting (newest first)
 * Works with any date format (YYYY-MM-DD or ISO string)
 * 
 * @param {object} a - First activity object with date property
 * @param {object} b - Second activity object with date property
 * @returns {number} Comparison result for sorting (negative if b is newer)
 */
export function compareDatesForSorting(a, b) {
  // For YYYY-MM-DD format, we can sort directly as strings
  if (a.date?.length === 10 && a.date.includes('-') &&
      b.date?.length === 10 && b.date.includes('-')) {
    return b.date.localeCompare(a.date); // Sort in descending order
  }
  
  // For ISO format or mixed formats, convert to timestamp
  const dateA = new Date(a.date || 0).getTime();
  const dateB = new Date(b.date || 0).getTime();
  return dateB - dateA;
}