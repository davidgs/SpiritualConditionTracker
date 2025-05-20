/**
 * Storage utilities for the Spiritual Condition Tracker application
 * Provides a consistent API for storing data, handling both SQLite and localStorage
 */

/**
 * Save an activity to storage
 * @param {Object} activity - Activity data to save
 * @returns {Promise<Object>} Saved activity data
 */
export async function saveActivity(activity) {
  try {
    console.log('Saving activity:', activity);
    
    // Ensure required fields are present
    if (!activity.type) {
      activity.type = 'other'; // Default type is 'other'
    }
    
    // Add timestamp if missing
    if (!activity.date) {
      activity.date = new Date().toISOString();
    }
    
    // Check for database initialization
    if (!window.dbInitialized || !window.db) {
      console.warn('Database not initialized yet - using localStorage fallback');
      return saveActivityToLocalStorage(activity);
    }
    
    try {
      // Use the SQLite database
      const result = await window.db.add('activities', activity);
      console.log('Activity saved to SQLite:', result);
      return result;
    } catch (sqliteError) {
      console.error('Error saving activity to SQLite:', sqliteError);
      // Fallback to localStorage
      return saveActivityToLocalStorage(activity);
    }
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
}

/**
 * Fallback function to save activity to localStorage
 * @param {Object} activity - Activity data to save
 * @returns {Object} Saved activity data
 */
function saveActivityToLocalStorage(activity) {
  try {
    // Get existing activities
    const existingActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    // Add the new activity
    existingActivities.push(activity);
    
    // Save back to localStorage
    localStorage.setItem('activities', JSON.stringify(existingActivities));
    
    console.log('Activity saved to localStorage fallback');
    return activity;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
}

/**
 * Save a meeting to storage
 * @param {Object} meeting - Meeting data to save
 * @returns {Promise<Object>} Saved meeting data
 */
export async function saveMeeting(meeting) {
  try {
    console.log('Saving meeting:', meeting);
    
    // Check for database initialization
    if (!window.dbInitialized || !window.db) {
      console.warn('Database not initialized yet - using localStorage fallback');
      return saveMeetingToLocalStorage(meeting);
    }
    
    try {
      // Use the SQLite database
      const result = await window.db.add('meetings', meeting);
      console.log('Meeting saved to SQLite:', result);
      return result;
    } catch (sqliteError) {
      console.error('Error saving meeting to SQLite:', sqliteError);
      // Fallback to localStorage
      return saveMeetingToLocalStorage(meeting);
    }
  } catch (error) {
    console.error('Error saving meeting:', error);
    throw error;
  }
}

/**
 * Fallback function to save meeting to localStorage
 * @param {Object} meeting - Meeting data to save
 * @returns {Object} Saved meeting data
 */
function saveMeetingToLocalStorage(meeting) {
  try {
    // Get existing meetings
    const existingMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    
    // Add the new meeting
    existingMeetings.push(meeting);
    
    // Save back to localStorage
    localStorage.setItem('meetings', JSON.stringify(existingMeetings));
    
    console.log('Meeting saved to localStorage fallback');
    return meeting;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
}

/**
 * Update user profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export async function updateProfile(profileData) {
  try {
    console.log('Updating profile:', profileData);
    
    // Check for database initialization
    if (!window.dbInitialized || !window.db) {
      console.warn('Database not initialized yet - using localStorage fallback');
      return updateProfileInLocalStorage(profileData);
    }
    
    try {
      // Check if user exists
      const users = await window.db.getAll('users');
      
      if (users.length === 0) {
        // No user exists, create one
        const userId = `user_${Date.now()}`;
        const newUser = {
          id: userId,
          ...profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await window.db.add('users', newUser);
        return newUser;
      } else {
        // Update existing user
        const user = users[0];
        const updatedUser = {
          ...user,
          ...profileData,
          updatedAt: new Date().toISOString()
        };
        
        await window.db.update('users', user.id, updatedUser);
        return updatedUser;
      }
    } catch (sqliteError) {
      console.error('Error updating profile in SQLite:', sqliteError);
      // Fallback to localStorage
      return updateProfileInLocalStorage(profileData);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Fallback function to update profile in localStorage
 * @param {Object} profileData - Profile data to update
 * @returns {Object} Updated profile data
 */
function updateProfileInLocalStorage(profileData) {
  try {
    // Get existing profile
    const existingProfile = JSON.parse(localStorage.getItem('profile') || '{}');
    
    // Update profile
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    // Ensure profile has ID
    if (!updatedProfile.id) {
      updatedProfile.id = `user_${Date.now()}`;
      updatedProfile.createdAt = new Date().toISOString();
    }
    
    // Save back to localStorage
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    
    console.log('Profile saved to localStorage fallback');
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile in localStorage:', error);
    throw error;
  }
}