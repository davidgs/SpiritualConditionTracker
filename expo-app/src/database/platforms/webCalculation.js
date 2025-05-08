/**
 * Web-specific implementation for spiritual fitness calculation
 * This avoids using GROUP BY queries which are problematic in the web database implementation
 */

/**
 * Calculate spiritual fitness for web platform without complex SQL
 * @param {string} cutoffDateStr - Date string for filtering activities 
 * @param {Object} idb - IndexedDB instance
 * @returns {Object} Spiritual fitness calculation result
 */
export const calculateWebSpiritualFitness = async (cutoffDateStr, idb) => {
  try {
    // Open the database first
    const dbPromise = new Promise((resolve, reject) => {
      const request = idb.open('spiritual_condition_db');
      request.onerror = () => reject(new Error('Failed to open database'));
      request.onsuccess = (event) => resolve(event.target.result);
    });
    
    const db = await dbPromise;
    
    // Now access the activity_log store
    let transaction;
    try {
      transaction = db.transaction(['activity_log'], 'readonly');
    } catch (error) {
      console.log('No activity_log store exists yet, returning default values');
      return { score: 0, activities: {}, pointValues: {}, daysConsidered: 30 };
    }
    
    const store = transaction.objectStore('activity_log');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onerror = () => {
        reject(new Error('Error fetching activities from IndexedDB'));
      };
      
      request.onsuccess = (event) => {
        const activities = event.target.result;
        
        // Filter activities by date
        const filteredActivities = activities.filter(activity => {
          return activity.date >= cutoffDateStr;
        });
        
        // Group activities by type (similar to SQL's GROUP BY)
        const groupedActivities = {};
        
        filteredActivities.forEach(activity => {
          const type = activity.activity_type;
          if (!groupedActivities[type]) {
            groupedActivities[type] = {
              activity_type: type,
              count: 0,
              total_duration: 0
            };
          }
          
          groupedActivities[type].count++;
          groupedActivities[type].total_duration += (parseInt(activity.duration) || 0);
        });
        
        // Convert to array (similar to SQL result rows)
        const result = {
          rows: {
            _array: Object.values(groupedActivities),
            length: Object.keys(groupedActivities).length,
            item: (index) => Object.values(groupedActivities)[index]
          }
        };
        
        // Point values for different activities
        const pointValues = {
          'meeting': 1.0,      // Attending a meeting: 1 point
          'step_work': 1.5,    // Step work: 1.5 points per hour
          'service': 2.0,      // Service work: 2 points per hour
          'reading': 1.0,      // Reading literature: 1 point per hour
          'meditation': 1.5,   // Meditation: 1.5 points per hour
          'prayer': 1.0,       // Prayer: 1 point per hour
          'sponsor_call': 1.0, // Call with sponsor: 1 point
          'sponsee_call': 1.5, // Call with sponsee: 1.5 points
          'gratitude': 0.5     // Gratitude list: 0.5 points
        };
        
        let totalPoints = 0;
        const activityPoints = {};
        
        // Calculate points for each activity type
        for (let i = 0; i < result.rows.length; i++) {
          const activity = result.rows.item(i);
          const { activity_type, count, total_duration } = activity;
          
          if (pointValues[activity_type]) {
            let points = 0;
            
            // Some activities are scored per occurrence, others by duration
            if (['meeting', 'sponsor_call', 'sponsee_call', 'gratitude'].includes(activity_type)) {
              points = count * pointValues[activity_type];
            } else {
              // Convert duration from minutes to hours and calculate points
              const hours = (total_duration || 0) / 60;
              points = hours * pointValues[activity_type];
            }
            
            activityPoints[activity_type] = points;
            totalPoints += points;
          }
        }
        
        // Normalize to a 0-100 scale with max being about 75 for very active
        // This means somebody doing everything daily would be around 100
        const normalizedScore = Math.min(100, totalPoints * (100 / 75));
        
        // Return score with 2 decimal precision
        resolve({
          score: parseFloat(normalizedScore.toFixed(2)),
          activities: activityPoints,
          pointValues: pointValues,
          daysConsidered: 30
        });
      };
    });
  } catch (error) {
    console.error('Error in web spiritual fitness calculation:', error);
    return { score: 0, activities: {}, error: error.message };
  }
};