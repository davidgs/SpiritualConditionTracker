/**
 * Utility functions for calculating spiritual fitness and other recovery metrics
 */

import { ACTIVITY_TYPES } from '../contexts/ActivitiesContext';

/**
 * Calculate spiritual fitness based on activities
 * @param {Array} activities - Array of activity objects
 * @param {Object} options - Options for calculation
 * @returns {Object} Spiritual fitness score and breakdown
 */
export const calculateSpiritualFitness = (activities, options = {}) => {
  // Default options
  const defaultOptions = {
    timeframe: 30, // Days to look back
    decayFactor: 0.9, // How much older activities are valued less
    categoryWeights: {
      MEETING: 1.0,
      PRAYER: 1.0,
      LITERATURE: 0.8,
      SPONSOR: 0.9,
      SPONSEE: 1.1,
      SERVICE: 1.2,
      STEP_WORK: 1.0,
    },
  };

  const config = { ...defaultOptions, ...options };
  
  // Group activities by type
  const byType = {};
  
  // Calculate cutoff date
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - config.timeframe);
  
  // Filter activities within timeframe
  const recentActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= cutoffDate && activityDate <= now;
  });
  
  // Initialize type groups
  Object.keys(ACTIVITY_TYPES).forEach(type => {
    byType[type] = [];
  });
  
  // Group filtered activities by type
  recentActivities.forEach(activity => {
    const type = activity.type;
    if (byType[type]) {
      byType[type].push(activity);
    }
  });
  
  // Calculate scores for each category
  const scores = {
    prayer: calculateCategoryScore(byType.PRAYER || [], config),
    meetings: calculateCategoryScore(byType.MEETING || [], config),
    literature: calculateCategoryScore(byType.LITERATURE || [], config),
    service: calculateCategoryScore(byType.SERVICE || [], config),
    sponsorship: (
      calculateCategoryScore(byType.SPONSOR || [], config) * 0.5 +
      calculateCategoryScore(byType.SPONSEE || [], config) * 0.5
    ),
    timestamp: new Date().toISOString(),
  };
  
  // Calculate overall score with weighted average
  const categories = Object.keys(scores).filter(k => k !== 'timestamp');
  let overallScore = 0;
  let weightSum = 0;
  
  categories.forEach(category => {
    const weight = category === 'sponsorship' ? 1.0 : // sponsorship is already a combined score
      config.categoryWeights[category.toUpperCase()] || 1.0;
    overallScore += scores[category] * weight;
    weightSum += weight;
  });
  
  if (weightSum > 0) {
    overallScore /= weightSum;
  }
  
  // Ensure minimum score is 0 and maximum is 10
  overallScore = Math.min(Math.max(overallScore, 0), 10);
  
  // Round to 2 decimal places
  scores.overall = parseFloat(overallScore.toFixed(2));
  
  // Round category scores to 2 decimal places
  categories.forEach(category => {
    scores[category] = parseFloat(scores[category].toFixed(2));
  });
  
  return scores;
};

/**
 * Calculate score for a single category
 * @param {Array} activities - Activities in the category
 * @param {Object} options - Calculation options
 * @returns {number} Category score
 */
function calculateCategoryScore(activities, options) {
  if (!activities.length) return 0;
  
  const now = new Date();
  let score = 0;
  
  // Sort activities by date, newest first
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Calculate score with time decay
  activities.forEach(activity => {
    const activityDate = new Date(activity.date);
    const daysDiff = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
    const decayFactor = Math.pow(options.decayFactor, daysDiff);
    
    // Base value from duration (minutes)
    let value = activity.duration / 60; // Convert minutes to hours
    
    // Apply decay factor - more recent activities count more
    value *= decayFactor;
    
    score += value;
  });
  
  // Normalize to 0-10 scale
  // More than 10 hours of activity in the timeframe will give a perfect 10
  const normalizedScore = Math.min(score, 10);
  
  return normalizedScore;
}

/**
 * Calculate sobriety days
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} Days of sobriety
 */
export const calculateSobrietyDays = (sobrietyDate) => {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Time difference in milliseconds
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
  const years = days / 365.25; // Account for leap years
  
  return parseFloat(years.toFixed(decimalPlaces));
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
  const streaks = {};
  const byType = {};
  
  // Group activities by type
  activities.forEach(activity => {
    const type = activity.type;
    if (!byType[type]) byType[type] = [];
    byType[type].push(activity);
  });
  
  // Calculate streaks for each type
  Object.keys(byType).forEach(type => {
    const sorted = byType[type].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sorted.length === 0) {
      streaks[type] = { current: 0, longest: 0 };
      return;
    }
    
    // Initialize streak counting
    let currentStreak = 1;
    let longestStreak = 1;
    let previousDate = new Date(sorted[0].date);
    
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].date);
      
      // Check if dates are consecutive
      const diffDays = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day, streak continues
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
      }
      
      previousDate = currentDate;
    }
    
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