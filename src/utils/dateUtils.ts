/**
 * Utility functions for handling dates across the application
 */

/**
 * Format a date string for display without timezone issues
 * Handles both YYYY-MM-DD format and ISO date strings
 */
export function formatDateForDisplay(dateString: string): string {
  console.log("Formatting date:", dateString);
  
  if (!dateString) {
    console.error("Empty date string provided to formatDateForDisplay");
    return "Invalid date";
  }
  
  try {
    // YYYY-MM-DD format (from date input) - direct format without timezone issues
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[month - 1]} ${day}, ${year}`;
    } 
    
    // Handle ISO format with timezone handling to prevent date shifts
    if (dateString.includes('T')) {
      // Extract just the date part from an ISO string to avoid timezone issues
      const datePart = dateString.split('T')[0];
      if (datePart && datePart.includes('-')) {
        const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[month - 1]} ${day}, ${year}`;
      }
    }
    
    // Fallback for other date formats
    // Create date in UTC to prevent timezone shifts
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(part => parseInt(part, 10));
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[month - 1]} ${day}, ${year}`;
    }
    
    // Last resort fallback
    console.warn("Using generic date parsing which may have timezone issues:", dateString);
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

export function formatDay(day) {
  console.log("Formatting day:", day);
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

/**
 * Format time based on user preference (12 or 24 hour format)
 * 
 * @param {string|Date} time - Time to format (either Date object or string like "14:30" or "2:30 PM")
 * @param {boolean} use24HourFormat - Whether to use 24-hour format
 * @returns {string} Formatted time string
 */
export function formatTimeByPreference(time, use24HourFormat = false) {
  console.log(`Formatting time: "${time}" with 24-hour format: ${use24HourFormat}`);
  
  // Handle string input in format "HH:MM" or "H:MM AM/PM"
  if (typeof time === 'string') {
    // Check if time is already in 12-hour format with AM/PM
    if (time.includes('AM') || time.includes('PM')) {
      if (use24HourFormat) {
        // Convert 12-hour to 24-hour format
        const [timePart, period] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(num => parseInt(num, 10));
        
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`Converted 12-hour to 24-hour: ${time} -> ${result}`);
        return result;
      }
      console.log(`Keeping 12-hour format: ${time}`);
      return time; // Already in 12-hour format
    }
    
    // Handle 24-hour format string like "14:30"
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      
      if (!use24HourFormat) {
        // Convert 24-hour to 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        const result = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        console.log(`Converted 24-hour to 12-hour: ${time} -> ${result}`);
        return result;
      }
      console.log(`Keeping 24-hour format: ${time}`);
      return time; // Already in 24-hour format
    }
  }
  
  // Handle Date object
  if (time instanceof Date) {
    if (use24HourFormat) {
      const result = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      console.log(`Formatted Date to 24-hour: ${time} -> ${result}`);
      return result;
    } else {
      const result = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      console.log(`Formatted Date to 12-hour: ${time} -> ${result}`);
      return result;
    }
  }
  
  // Return original value if not in a recognized format
  console.log(`Unrecognized time format, returning original: ${time}`);
  return time;
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
  // Ensure we have date strings to work with
  const dateStrA = a.date || '';
  const dateStrB = b.date || '';
  
  // For YYYY-MM-DD format, we can sort directly as strings
  // This works because YYYY-MM-DD format sorts correctly when compared lexicographically
  if (dateStrA.length === 10 && dateStrA.includes('-') &&
      dateStrB.length === 10 && dateStrB.includes('-')) {
    return dateStrB.localeCompare(dateStrA); // Sort in descending order (newest first)
  }
  
  // For ISO format or mixed formats, convert to timestamp for reliable comparison
  // Using Date.parse which handles various formats
  const timestampA = Date.parse(dateStrA) || 0;
  const timestampB = Date.parse(dateStrB) || 0;
  
  // Sort newest first (descending)
  return timestampB - timestampA;
}