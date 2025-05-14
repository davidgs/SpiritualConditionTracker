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
  const {
    timeframe = 30, // Default to 30 days
    weights = {
      meeting: 5,      // Points per meeting
      meditation: 3,   // Points per meditation
      reading: 2,      // Points per reading
      service: 4,      // Points per service
      stepwork: 5,     // Points per stepwork
      sponsorship: 4   // Points per sponsorship
    },
    maxScore = 100     // Maximum possible score
  } = options;
  
  // Get current date for comparison
  const now = new Date();
  const timeframeCutoff = new Date(now);
  timeframeCutoff.setDate(timeframeCutoff.getDate() - timeframe);
  
  // Filter activities within timeframe
  const recentActivities = activities.filter(
    activity => new Date(activity.date) >= timeframeCutoff
  );
  
  // Count activity types
  const typeCounts = {};
  recentActivities.forEach(activity => {
    typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
  });
  
  // Calculate base score from activity counts
  let score = 0;
  const breakdown = {};
  
  Object.keys(typeCounts).forEach(type => {
    const count = typeCounts[type];
    const weight = weights[type] || 1;
    const typeScore = count * weight;
    
    score += typeScore;
    breakdown[type] = {
      count,
      weight,
      score: typeScore
    };
  });
  
  // Add bonus for variety (different types of activities)
  const activityTypesCount = Object.keys(typeCounts).length;
  const varietyBonus = Math.min(20, activityTypesCount * 5);
  score += varietyBonus;
  
  // Cap score at maximum
  score = Math.min(maxScore, score);
  
  return {
    score,
    breakdown,
    activityCount: recentActivities.length,
    activityTypes: activityTypesCount,
    varietyBonus,
    timeframe,
    lastCalculated: now.toISOString()
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
  
  // Calculate the difference in days
  const diffTime = Math.abs(now - start);
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
  
  // Get sobriety date and current date
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate exact years including fractional part
  const diffTime = now - start;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25; // Account for leap years
  
  // Format to specified decimal places
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
  // Group activities by type
  const typeGroups = {};
  activities.forEach(activity => {
    if (!typeGroups[activity.type]) {
      typeGroups[activity.type] = [];
    }
    typeGroups[activity.type].push(activity);
  });
  
  // Calculate streak for each type
  const streaks = {};
  Object.keys(typeGroups).forEach(type => {
    // Sort activities by date (newest first)
    const typeActivities = typeGroups[type].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    if (typeActivities.length === 0) {
      streaks[type] = { current: 0, longest: 0 };
      return;
    }
    
    // Check if most recent activity was today or yesterday
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mostRecentDate = new Date(typeActivities[0].date);
    mostRecentDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // If most recent activity wasn't today or yesterday, streak is broken
    if (mostRecentDate < yesterday) {
      streaks[type] = { current: 0, longest: 0 };
      return;
    }
    
    // Calculate current streak
    let currentStreak = 1; // Count the most recent day
    let longestStreak = 1;
    let currentDate = mostRecentDate;
    
    for (let i = 1; i < typeActivities.length; i++) {
      const activityDate = new Date(typeActivities[i].date);
      activityDate.setHours(0, 0, 0, 0); // Set to start of day
      
      // Check if this activity was the day before the current date
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      if (activityDate.getTime() === expectedDate.getTime()) {
        // Activity was on the consecutive previous day, continue streak
        currentStreak++;
        currentDate = activityDate;
      } else {
        // Streak is broken
        break;
      }
    }
    
    // Calculate longest streak (simplified: just using current for now)
    longestStreak = Math.max(currentStreak, longestStreak);
    
    streaks[type] = { current: currentStreak, longest: longestStreak };
  });
  
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
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Calculate days since last activity of a specific type
 * @param {Array} activities - Array of activity objects
 * @param {string} type - Activity type
 * @returns {number} Days since last activity (-1 if no activity found)
 */
export const daysSinceLastActivity = (activities, type) => {
  if (!activities || !activities.length) return -1;
  
  // Filter activities by type
  const filteredActivities = activities.filter(activity => activity.type === type);
  
  if (!filteredActivities.length) return -1;
  
  // Find most recent activity
  const sortedActivities = [...filteredActivities].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  
  const lastActivity = sortedActivities[0];
  const lastDate = new Date(lastActivity.date);
  const now = new Date();
  
  // Calculate days difference
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};