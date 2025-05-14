/**
 * Utility functions for formatting dates for the messaging feature
 */

/**
 * Format a date for display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  // Get today and yesterday for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get the date to compare
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  // Check if date is today, yesterday, or earlier
  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    // Format as MM-DD-YYYY
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`;
  }
};

/**
 * Format a timestamp for message display
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted time string
 */
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * Format a timestamp for conversation list display
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted timestamp
 */
export const formatConversationTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If timestamp is today, return time
  if (date.toDateString() === now.toDateString()) {
    return formatMessageTime(timestamp);
  }
  
  // If timestamp is within the past week, return day of week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  if (date > oneWeekAgo) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
  
  // Otherwise, return MM-DD-YY
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
};