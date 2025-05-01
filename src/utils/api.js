// Import user meetings operations
import { userMeetingOperations } from './database';

/**
 * Get all user meetings 
 * @returns {Promise<Array>} Array of user-defined meetings
 */
export const getUserMeetings = async () => {
  try {
    return await userMeetingOperations.getAllMeetings();
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    throw error;
  }
};

/**
 * Get shared meetings from all users
 * @returns {Promise<Array>} Array of shared meetings
 */
export const getSharedMeetings = async () => {
  try {
    return await userMeetingOperations.getSharedMeetings();
  } catch (error) {
    console.error('Error fetching shared meetings:', error);
    throw error;
  }
};

/**
 * Filter meetings by day, type, or other criteria
 * @param {Array} meetings - Array of meetings to filter
 * @param {Object} filters - Filter criteria 
 * @returns {Array} Filtered meetings
 */
export const filterMeetings = (meetings, filters = {}) => {
  if (!meetings || !Array.isArray(meetings)) {
    return [];
  }
  
  const { day, type, searchText } = filters;
  
  return meetings.filter(meeting => {
    // Filter by day
    if (day && meeting.day && meeting.day.toLowerCase() !== day.toLowerCase()) {
      return false;
    }
    
    // Filter by type
    if (type && meeting.type && !meeting.type.toLowerCase().includes(type.toLowerCase())) {
      return false;
    }
    
    // Filter by search text
    if (searchText) {
      const text = searchText.toLowerCase();
      const matchesName = meeting.name && meeting.name.toLowerCase().includes(text);
      const matchesLocation = meeting.location && meeting.location.toLowerCase().includes(text);
      const matchesAddress = meeting.address && meeting.address.toLowerCase().includes(text);
      const matchesCity = meeting.city && meeting.city.toLowerCase().includes(text);
      const matchesNotes = meeting.notes && meeting.notes.toLowerCase().includes(text);
      
      if (!matchesName && !matchesLocation && !matchesAddress && !matchesCity && !matchesNotes) {
        return false;
      }
    }
    
    return true;
  });
};