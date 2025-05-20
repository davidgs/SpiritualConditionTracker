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
    
    // Create a deep copy to avoid modifying the original
    const activityToSave = JSON.parse(JSON.stringify(activity));
    
    // Add activity type validation logging
    console.log('Activity type before processing:', activityToSave.type);
    
    // CRITICAL: Apply multiple safeguards for the required type field
    if (!activityToSave.type || activityToSave.type === '') {
      console.warn('Activity missing type, setting to default: meeting');
      activityToSave.type = 'meeting';
    }
    
    // Double check the type field again (belt and suspenders approach)
    if (typeof activityToSave.type !== 'string' || activityToSave.type.trim() === '') {
      console.warn('Activity type is invalid or empty after first check, enforcing default');
      activityToSave.type = 'meeting';
    }
    
    // Add timestamp if missing
    if (!activityToSave.date) {
      activityToSave.date = new Date().toISOString();
    }
    
    // Add ID if missing
    if (!activityToSave.id) {
      activityToSave.id = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    console.log('Processed activity ready to save:', {
      id: activityToSave.id,
      type: activityToSave.type,
      date: activityToSave.date
    });
    
    // Check for database initialization
    if (!window.dbInitialized || !window.db) {
      console.warn('Database not initialized yet - using localStorage fallback');
      return saveActivityToLocalStorage(activityToSave);
    }
    
    try {
      // Preferably use the direct database API to bypass middleware
      if (window.db.add) {
        // Use the SQLite database
        const result = await window.db.add('activities', activityToSave);
        console.log('Activity saved to SQLite:', result);
        return result;
      } else {
        throw new Error('Database add method not available');
      }
    } catch (sqliteError) {
      console.error('Error saving activity to SQLite:', sqliteError);
      
      // If we have direct access to Capacitor SQLite plugin, try a more direct approach
      if (window.Capacitor?.Plugins?.CapacitorSQLite) {
        try {
          const sqlPlugin = window.Capacitor.Plugins.CapacitorSQLite;
          const dbName = 'spiritualTracker.db';
          
          // Create an enhanced activity model that matches our expanded schema
          const enhancedActivity = {
            id: activityToSave.id,
            type: activityToSave.type, // Guaranteed to be set above
            date: activityToSave.date,
            duration: activityToSave.duration || 0,
            notes: activityToSave.notes || '',
            meeting: activityToSave.meeting || '',
            meetingName: activityToSave.meetingName || '',
            wasChair: activityToSave.wasChair ? 1 : 0,
            wasShare: activityToSave.wasShare ? 1 : 0,
            wasSpeaker: activityToSave.wasSpeaker ? 1 : 0,
            literatureTitle: activityToSave.literatureTitle || '',
            stepNumber: activityToSave.stepNumber || null,
            personCalled: activityToSave.personCalled || '',
            serviceType: activityToSave.serviceType || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Try a completely different approach with a hardcoded SQL statement
          // This eliminates potential issues with parameter binding
          
          // Ensure we have non-null values for required fields
          const safeType = enhancedActivity.type || 'prayer';
          const safeId = enhancedActivity.id || `activity_${Date.now()}`;
          const safeDuration = enhancedActivity.duration || 0;
          const safeDate = enhancedActivity.date || new Date().toISOString();
          const safeNotes = enhancedActivity.notes || '';
          const safeCreated = enhancedActivity.createdAt || new Date().toISOString();
          const safeUpdated = enhancedActivity.updatedAt || new Date().toISOString();
          
          // Create a simple array of values in the correct order
          const values = [
            safeId,            // id
            safeType,          // type (critical field with NOT NULL constraint)
            safeDuration,      // duration
            safeDate,          // date
            safeNotes,         // notes
            safeCreated,       // createdAt
            safeUpdated        // updatedAt
          ];
          
          // Log the final values for debugging
          console.log('SQL fields:', JSON.stringify(["id", "type", "duration", "date", "notes", "createdAt", "updatedAt"]));
          console.log('SQL values:', JSON.stringify(values));
          
          // Use a simple prepared statement without dynamic field names
          const sql = `
            INSERT INTO activities 
            (id, type, duration, date, notes, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          try {
            await sqlPlugin.execute({
              database: dbName,
              statements: sql,
              values: values
            });
            console.log('Activity saved with hardcoded SQL statement');
          } catch (sqlError) {
            console.error('SQL execution error with full details:', sqlError);
            
            // Last resort: Try an even more explicit approach with direct value insertion
            const directSql = `
              INSERT INTO activities (id, type, duration, date, notes, createdAt, updatedAt)
              VALUES (
                '${safeId}',
                'prayer',
                ${safeDuration},
                '${safeDate}',
                '${safeNotes.replace(/'/g, "''")}',
                '${safeCreated}',
                '${safeUpdated}'
              )
            `;
            
            console.log('Attempting direct SQL insertion as last resort');
            await sqlPlugin.execute({
              database: dbName,
              statements: directSql
            });
          }
          
          console.log('Activity saved via direct SQLite execute');
          return minimalActivity;
        } catch (directSqlError) {
          console.error('Direct SQL insert also failed:', directSqlError);
          // Fall through to localStorage
        }
      }
      
      // Fallback to localStorage as last resort
      return saveActivityToLocalStorage(activityToSave);
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