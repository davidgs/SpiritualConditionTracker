/**
 * Utility functions for calculating spiritual fitness and other recovery metrics
 */

/**
 * Calculate spiritual fitness based on activities
 * @param {Array} activities - Array of activity objects
 * @param {Object} options - Options for calculation
 * @returns {Object} Spiritual fitness score and breakdown
 */
export const calculateSpiritualFitness = (activities, options = {}) => {
  const now = new Date();
  
  // Define weights for different activity types
  const weights = {
    meeting: 10,   // Attending a meeting
    prayer: 8,     // Prayer
    meditation: 8, // Meditation
    reading: 6,    // Reading AA literature
    callSponsor: 5, // Calling sponsor
    callSponsee: 4, // Calling sponsee
    service: 9,    // Service work
    stepWork: 10   // Working on steps
  };
  
  // Days to consider for calculation (default: 30 days)
  const daysToConsider = options.days || 30;
  
  // Initialize scores
  let totalScore = 0;
  let breakdown = {};
  let eligibleActivities = 0;
  
  // Group activities by type and calculate scores
  activities.forEach(activity => {
    // Skip activities without a date
    if (!activity.date) return;
    
    // Only count activities from the specified time period
    const activityDate = new Date(activity.date);
    const daysDiff = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= daysToConsider && weights[activity.type]) {
      // Initialize type in breakdown if not exists
      if (!breakdown[activity.type]) {
        breakdown[activity.type] = {
          count: 0,
          points: 0,
          recentDates: []
        };
      }
      
      // Update breakdown
      breakdown[activity.type].count++;
      breakdown[activity.type].points += weights[activity.type];
      breakdown[activity.type].recentDates.push(activity.date);
      
      // Update total score
      totalScore += weights[activity.type];
      eligibleActivities++;
    }
  });
  
  // Calculate final score (normalized to 10)
  let finalScore = 0;
  if (eligibleActivities > 0) {
    // Base score on total points, but cap at 10 and round to 2 decimal places
    finalScore = Math.min(10, (totalScore / (eligibleActivities * 4)));
    finalScore = Math.round(finalScore * 100) / 100;
  }
  
  return {
    score: finalScore,
    breakdown,
    eligibleActivities,
    totalPoints: totalScore,
    daysConsidered: daysToConsider
  };
};

/**
 * Calculate sobriety days
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} Days of sobriety
 */
export const calculateSobrietyDays = (sobrietyDate) => {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffTime = Math.abs(now - start);
  
  // Convert to days and round down
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
  
  const days = calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25;
  
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

/**
 * Calculate recovery streaks
 * @param {Array} activities - Array of activity objects
 * @returns {Object} Streak information for different activity types
 */
export const calculateStreaks = (activities) => {
  // Group activities by date and type
  const activityMap = {};
  
  // Sort activities by date
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Initialize streaks object
  const streaks = {
    meeting: { current: 0, longest: 0, lastDate: null },
    prayer: { current: 0, longest: 0, lastDate: null },
    meditation: { current: 0, longest: 0, lastDate: null },
    overall: { current: 0, longest: 0, lastDate: null }
  };
  
  // Process each activity
  sortedActivities.forEach(activity => {
    const date = activity.date.split('T')[0]; // Get YYYY-MM-DD part
    
    // Initialize date in map if not exists
    if (!activityMap[date]) {
      activityMap[date] = new Set();
    }
    
    // Add activity type to the date
    activityMap[date].add(activity.type);
  });
  
  // Convert dates to sorted array
  const dates = Object.keys(activityMap).sort().reverse(); // Oldest to newest
  
  // Calculate streaks for each activity type
  for (let i = 0; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const types = activityMap[dates[i]];
    
    // Check if previous date exists and is consecutive
    if (i > 0) {
      const prevDate = new Date(dates[i-1]);
      const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      // If dates are not consecutive, reset current streaks
      if (dayDiff !== 1) {
        Object.keys(streaks).forEach(type => {
          streaks[type].current = 0;
        });
      }
    }
    
    // Update streaks for each type
    Object.keys(streaks).forEach(type => {
      // Skip 'overall' type, we'll calculate that separately
      if (type === 'overall') return;
      
      if (types.has(type)) {
        // Increment streak
        streaks[type].current++;
        
        // Update last date
        streaks[type].lastDate = dates[i];
        
        // Update longest streak if needed
        if (streaks[type].current > streaks[type].longest) {
          streaks[type].longest = streaks[type].current;
        }
      } else {
        // Reset streak for this type
        streaks[type].current = 0;
      }
    });
    
    // Update overall streak (any recovery activity counts)
    if (types.size > 0) {
      streaks.overall.current++;
      
      // Update last date
      streaks.overall.lastDate = dates[i];
      
      // Update longest streak if needed
      if (streaks.overall.current > streaks.overall.longest) {
        streaks.overall.longest = streaks.overall.current;
      }
    } else {
      // Reset overall streak
      streaks.overall.current = 0;
    }
  }
  
  return streaks;
};

/**
 * Format a date in a user-friendly format
 * @param {string} dateString - Date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const format = options.format || 'short';
  const includeTime = options.includeTime || false;
  
  let formattedDate;
  
  switch (format) {
    case 'full':
      formattedDate = date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      break;
    case 'medium':
      formattedDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      break;
    case 'short':
    default:
      formattedDate = date.toLocaleDateString();
      break;
  }
  
  if (includeTime) {
    formattedDate += ' ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return formattedDate;
};

/**
 * Calculate days since last activity of a specific type
 * @param {Array} activities - Array of activity objects
 * @param {string} type - Activity type
 * @returns {number} Days since last activity (-1 if no activity found)
 */
export const daysSinceLastActivity = (activities, type) => {
  if (!activities || activities.length === 0) return -1;
  
  // Filter activities by type
  const typedActivities = activities.filter(a => a.type === type);
  
  if (typedActivities.length === 0) return -1;
  
  // Sort by date (newest first)
  typedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get most recent activity
  const lastActivity = typedActivities[0];
  
  // Calculate days difference
  const now = new Date();
  const lastDate = new Date(lastActivity.date);
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};