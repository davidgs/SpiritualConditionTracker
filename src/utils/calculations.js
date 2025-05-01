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
  if (!activities || activities.length === 0) {
    return { score: 0, breakdown: {}, message: "No activities recorded" };
  }
  
  const {
    timeframeInDays = 30,
    meetingWeight = 3,
    meditationWeight = 2,
    readingWeight = 2,
    sponsorWeight = 2.5,
    serviceWeight = 2,
    otherWeight = 1,
  } = options;
  
  // Filter activities within the timeframe
  const now = new Date();
  const timeframeCutoff = new Date(now.setDate(now.getDate() - timeframeInDays));
  
  const relevantActivities = activities.filter(
    activity => new Date(activity.date) >= timeframeCutoff
  );
  
  if (relevantActivities.length === 0) {
    return { score: 0, breakdown: {}, message: `No activities in the last ${timeframeInDays} days` };
  }
  
  // Group activities by type
  const groupedActivities = relevantActivities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = [];
    }
    acc[activity.type].push(activity);
    return acc;
  }, {});
  
  // Calculate metrics
  const metrics = {
    meetingCount: (groupedActivities.meeting || []).length,
    totalMeetingMinutes: (groupedActivities.meeting || []).reduce((sum, a) => sum + (parseInt(a.duration, 10) || 0), 0),
    
    meditationCount: (groupedActivities.meditation || []).length,
    totalMeditationMinutes: (groupedActivities.meditation || []).reduce((sum, a) => sum + (parseInt(a.duration, 10) || 0), 0),
    
    readingCount: (groupedActivities.reading || []).length,
    totalReadingMinutes: (groupedActivities.reading || []).reduce((sum, a) => sum + (parseInt(a.duration, 10) || 0), 0),
    
    sponsorCount: (groupedActivities.sponsor || []).length,
    totalSponsorMinutes: (groupedActivities.sponsor || []).reduce((sum, a) => sum + (parseInt(a.duration, 10) || 0), 0),
    
    serviceCount: (groupedActivities.service || []).length,
    totalServiceMinutes: (groupedActivities.service || []).reduce((sum, a) => sum + (parseInt(a.duration, 10) || 0), 0),
    
    otherCount: (groupedActivities.other || []).length,
    totalOtherMinutes: (groupedActivities.other || []).reduce((sum, a) => sum + (parseInt(a.duration, 10) || 0), 0),
  };
  
  // Calculate average activities per week
  const weeksInTimeframe = timeframeInDays / 7;
  const meetingsPerWeek = metrics.meetingCount / weeksInTimeframe;
  const meditationsPerWeek = metrics.meditationCount / weeksInTimeframe;
  
  // Calculate meeting score (0-25)
  // Optimal is 3+ meetings per week
  const meetingScore = Math.min(25, (meetingsPerWeek / 3) * 25);
  
  // Calculate meditation score (0-20)
  // Optimal is daily meditation (7+ per week) with at least 70 minutes per week
  const meditationFrequencyScore = Math.min(10, (meditationsPerWeek / 7) * 10);
  const meditationTimeScore = Math.min(10, (metrics.totalMeditationMinutes / (70 * weeksInTimeframe)) * 10);
  const meditationScore = meditationFrequencyScore + meditationTimeScore;
  
  // Calculate reading score (0-15)
  // Optimal is 30+ minutes of reading per day (210+ minutes per week)
  const targetReadingMinutes = 210 * weeksInTimeframe;
  const readingScore = Math.min(15, (metrics.totalReadingMinutes / targetReadingMinutes) * 15);
  
  // Calculate sponsor/sponsee score (0-15)
  // Optimal is at least 60 minutes per week with sponsor/sponsee
  const targetSponsorMinutes = 60 * weeksInTimeframe;
  const sponsorScore = Math.min(15, (metrics.totalSponsorMinutes / targetSponsorMinutes) * 15);
  
  // Calculate service score (0-15)
  // Optimal is at least 60 minutes per week in service
  const targetServiceMinutes = 60 * weeksInTimeframe;
  const serviceScore = Math.min(15, (metrics.totalServiceMinutes / targetServiceMinutes) * 15);
  
  // Calculate other activities score (0-10)
  // Bonus points for additional recovery activities
  const otherScore = Math.min(10, metrics.otherCount * 2);
  
  // Calculate total score (0-100)
  const totalScore = Math.round(
    meetingScore + 
    meditationScore + 
    readingScore + 
    sponsorScore + 
    serviceScore + 
    otherScore
  );
  
  // Create score breakdown
  const breakdown = {
    meetings: {
      score: Math.round(meetingScore),
      details: `${metrics.meetingCount} meetings (${Math.round(meetingsPerWeek * 10) / 10}/week)`
    },
    meditation: {
      score: Math.round(meditationScore),
      details: `${metrics.meditationCount} sessions, ${metrics.totalMeditationMinutes} minutes`
    },
    reading: {
      score: Math.round(readingScore),
      details: `${metrics.readingCount} sessions, ${metrics.totalReadingMinutes} minutes`
    },
    sponsor: {
      score: Math.round(sponsorScore),
      details: `${metrics.sponsorCount} sessions, ${metrics.totalSponsorMinutes} minutes`
    },
    service: {
      score: Math.round(serviceScore),
      details: `${metrics.serviceCount} sessions, ${metrics.totalServiceMinutes} minutes`
    },
    other: {
      score: Math.round(otherScore),
      details: `${metrics.otherCount} other recovery activities`
    },
  };
  
  // Determine fitness message
  let message = "";
  if (totalScore >= 80) {
    message = "Excellent spiritual fitness. Keep up the great work!";
  } else if (totalScore >= 60) {
    message = "Good spiritual fitness. Maintain consistency in your activities.";
  } else if (totalScore >= 40) {
    message = "Fair spiritual fitness. Consider increasing meeting attendance and meditation.";
  } else {
    message = "Opportunity for growth. Focus on establishing a regular meeting schedule.";
  }
  
  return {
    score: totalScore,
    breakdown,
    message,
    metrics,
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
  const today = new Date();
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate recovery streaks
 * @param {Array} activities - Array of activity objects
 * @returns {Object} Streak information for different activity types
 */
export const calculateStreaks = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      meeting: 0,
      meditation: 0,
      reading: 0,
      overall: 0,
    };
  }
  
  // Group activities by date and type
  const activitiesByDate = {};
  
  activities.forEach(activity => {
    const dateStr = new Date(activity.date).toISOString().split('T')[0];
    
    if (!activitiesByDate[dateStr]) {
      activitiesByDate[dateStr] = {};
    }
    
    if (!activitiesByDate[dateStr][activity.type]) {
      activitiesByDate[dateStr][activity.type] = [];
    }
    
    activitiesByDate[dateStr][activity.type].push(activity);
  });
  
  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(activitiesByDate).sort().reverse();
  
  if (sortedDates.length === 0) {
    return {
      meeting: 0,
      meditation: 0,
      reading: 0,
      overall: 0,
    };
  }
  
  // Calculate streaks
  const calculateTypeStreak = (activityType) => {
    let streak = 0;
    let currentDate = new Date();
    let dateStr = currentDate.toISOString().split('T')[0];
    
    // If there's an activity today, start counting from today
    if (activitiesByDate[dateStr] && activitiesByDate[dateStr][activityType]) {
      streak = 1;
    } else {
      // If no activity today, start from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
      dateStr = currentDate.toISOString().split('T')[0];
    }
    
    // Count consecutive days with activities
    while (
      activitiesByDate[dateStr] && 
      activitiesByDate[dateStr][activityType] &&
      activitiesByDate[dateStr][activityType].length > 0
    ) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
      dateStr = currentDate.toISOString().split('T')[0];
    }
    
    return streak;
  };
  
  // Calculate overall streak (any recovery activity)
  const calculateOverallStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    let dateStr = currentDate.toISOString().split('T')[0];
    
    // If there's any activity today, start counting from today
    if (activitiesByDate[dateStr]) {
      streak = 1;
    } else {
      // If no activity today, start from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
      dateStr = currentDate.toISOString().split('T')[0];
    }
    
    // Count consecutive days with any activities
    while (activitiesByDate[dateStr]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
      dateStr = currentDate.toISOString().split('T')[0];
    }
    
    return streak;
  };
  
  return {
    meeting: calculateTypeStreak('meeting'),
    meditation: calculateTypeStreak('meditation'),
    reading: calculateTypeStreak('reading'),
    overall: calculateOverallStreak(),
  };
};
