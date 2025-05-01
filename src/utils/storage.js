/**
 * Utility functions for storing and retrieving recovery data
 * This uses localStorage for the MVP, but could be expanded to use a server API
 */

/**
 * Save a new activity to storage
 * @param {Object} activity - The activity to save
 * @returns {Promise} Promise resolving to the saved activity
 */
export const saveActivity = async (activity) => {
  // Validate activity
  if (!activity.type || !activity.date) {
    throw new Error('Activity must have a type and date');
  }
  
  // Generate ID if not provided
  if (!activity.id) {
    activity.id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  try {
    // Get existing activities
    const existingActivities = await fetchAllActivities();
    
    // Add new activity
    existingActivities.push(activity);
    
    // Save to storage
    localStorage.setItem('activities', JSON.stringify(existingActivities));
    
    // Update spiritual fitness
    await updateSpiritualFitness(existingActivities);
    
    return activity;
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
};

/**
 * Update or recalculate spiritual fitness based on activities
 * @param {Array} activities - Array of activity objects (optional)
 * @returns {Promise} Promise resolving to the updated spiritual fitness
 */
export const updateSpiritualFitness = async (activities = null) => {
  try {
    // If activities not provided, fetch them
    const allActivities = activities || await fetchAllActivities();
    
    // Import the calculation function
    const { calculateSpiritualFitness } = await import('./calculations');
    
    // Calculate spiritual fitness
    const fitnessData = calculateSpiritualFitness(allActivities);
    
    // Save to storage
    localStorage.setItem('spiritualFitness', JSON.stringify(fitnessData));
    
    return fitnessData;
  } catch (error) {
    console.error('Error updating spiritual fitness:', error);
    throw error;
  }
};

/**
 * Fetch spiritual fitness data
 * @returns {Promise} Promise resolving to the spiritual fitness object
 */
export const fetchSpiritualFitness = async () => {
  try {
    // Get from storage
    const fitnessData = localStorage.getItem('spiritualFitness');
    
    if (fitnessData) {
      return JSON.parse(fitnessData);
    }
    
    // If not found, calculate and save
    return await updateSpiritualFitness();
  } catch (error) {
    console.error('Error fetching spiritual fitness:', error);
    throw error;
  }
};

/**
 * Fetch all activities
 * @returns {Promise} Promise resolving to array of all activities
 */
export const fetchAllActivities = async () => {
  try {
    const activitiesData = localStorage.getItem('activities');
    return activitiesData ? JSON.parse(activitiesData) : [];
  } catch (error) {
    console.error('Error fetching all activities:', error);
    throw error;
  }
};

/**
 * Fetch recent activities
 * @param {number} limit - Maximum number of activities to return (0 for all)
 * @returns {Promise} Promise resolving to array of recent activities
 */
export const fetchRecentActivities = async (limit = 0) => {
  try {
    const allActivities = await fetchAllActivities();
    
    // Sort by date (newest first)
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply limit if specified
    return limit > 0 ? allActivities.slice(0, limit) : allActivities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Delete an activity by ID
 * @param {string} activityId - ID of the activity to delete
 * @returns {Promise} Promise resolving when deletion is complete
 */
export const deleteActivity = async (activityId) => {
  try {
    // Get existing activities
    const existingActivities = await fetchAllActivities();
    
    // Filter out the activity to delete
    const updatedActivities = existingActivities.filter(
      activity => activity.id !== activityId
    );
    
    // Save updated list
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    
    // Update spiritual fitness
    await updateSpiritualFitness(updatedActivities);
    
    return true;
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

/**
 * Clear all activity data
 * @returns {Promise} Promise resolving when deletion is complete
 */
export const clearAllData = async () => {
  try {
    // Remove activities and spiritual fitness data
    localStorage.removeItem('activities');
    localStorage.removeItem('spiritualFitness');
    
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
