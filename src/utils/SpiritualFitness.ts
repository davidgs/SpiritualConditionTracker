import { Activity } from '../types/database';

/**
 * Calculate spiritual fitness score based on activities within a given timeframe
 * Uses millisecond-based filtering for consistent results across timeframes
 */
export function calculateSpiritualFitnessScore(
  activities: Activity[], 
  timeframeDays: number
): number {
  // Base score - everyone starts with 5 points
  const baseScore = 5;
//  console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore baseScore:', baseScore);
//  console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore timeframeDays:', timeframeDays);
//  console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore activities #:', activities.length);
  // Filter activities within the timeframe using millisecond calculation
  const now = new Date();
  const timeframeStartMs = now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000);
  
  const recentActivities = activities.filter(activity => {
    if (!activity.date) {
      return false;
    }
    const activityDate = new Date(activity.date);
    //console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore activityDate:', activityDate);
    return activityDate.getTime() >= timeframeStartMs;
  });
  
  if (recentActivities.length === 0) {
    return baseScore;
  }
  
  // Activity type weights - points per activity
  const weights = {
    meeting: 10,
    prayer: 8,
    meditation: 8,
    reading: 6,
    literature: 6,
    callSponsor: 5,
    callSponsee: 4,
    call: 5,
    service: 9,
    stepWork: 10,
    stepwork: 10,
    'action-item': 0.5  // Will be adjusted based on completion status
  };
  
  let totalActivityPoints = 0;
  const activityDays = new Set<string>();
  
  recentActivities.forEach(activity => {
    // Track unique days for consistency calculation
    const day = new Date(activity.date).toISOString().split('T')[0];
    activityDays.add(day);
    //console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore Day:', day);
    
    // Calculate points for this activity
    let points: number;
    if (activity.type === 'action-item') {
      // Special handling for action items based on completion status
      if (activity.location === 'completed') {
        points = 0.5; // Completed action items add points
      } else if (activity.location === 'deleted') {
        points = -0.5; // Deleted action items subtract points
      } else {
        points = 0; // Pending action items don't count
      }
    } else {
      points = weights[activity.type] || 2; // Default 2 points for unknown types
    }
    
    totalActivityPoints += points;
    
  });
//  console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore totalActivityPoints:', totalActivityPoints);
  
  // Scale activity points and cap at 40
  const activityPoints = Math.min(totalActivityPoints / 4, 40);
  
  // Consistency points based on how many unique days had activities
  const consistencyPercentage = activityDays.size / timeframeDays;
  const consistencyPoints = consistencyPercentage * 40; // Up to 40 points
  
  // Total score (capped at 100, rounded to 2 decimal places)
  const totalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
  const preciseScore = Math.round(totalScore * 100) / 100;
//  console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore totalScore:', totalScore);
//  console.log('[ SpiritualFitness.js ] calculateSpiritualFitnessScore preciseScore:', preciseScore);
  return preciseScore;
}

/**
 * Get a breakdown of the spiritual fitness calculation for debugging/display
 */
export function getSpiritualFitnessBreakdown(
  activities: Activity[], 
  timeframeDays: number
): {
  baseScore: number;
  activityPoints: number;
  consistencyPoints: number;
  totalScore: number;
  recentActivities: number;
  activeDays: number;
} {
  const baseScore = 5;
  
  const now = new Date();
  const timeframeStartMs = now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000);
  
  const recentActivities = activities.filter(activity => {
    if (!activity.date) return false;
    const activityDate = new Date(activity.date);
    return activityDate.getTime() >= timeframeStartMs;
  });
  
  if (recentActivities.length === 0) {
    return {
      baseScore,
      activityPoints: 0,
      consistencyPoints: 0,
      totalScore: baseScore,
      recentActivities: 0,
      activeDays: 0
    };
  }
  
  const weights = {
    meeting: 10,
    prayer: 8,
    meditation: 8,
    reading: 6,
    literature: 6,
    callSponsor: 5,
    callSponsee: 4,
    call: 5,
    service: 9,
    stepWork: 10,
    stepwork: 10,
    'action-item': 0.5
  };
  
  let totalActivityPoints = 0;
  const activityDays = new Set<string>();
  
  recentActivities.forEach(activity => {
    const day = new Date(activity.date).toISOString().split('T')[0];
    activityDays.add(day);
    
    let points: number;
    if (activity.type === 'action-item') {
      if (activity.location === 'completed') {
        points = 0.5;
      } else if (activity.location === 'deleted') {
        points = -0.5;
      } else {
        points = 0;
      }
    } else {
      points = weights[activity.type] || 2;
    }
    
    totalActivityPoints += points;
  });
  
  const activityPoints = Math.min(totalActivityPoints / 4, 40);
  const consistencyPercentage = activityDays.size / timeframeDays;
  const consistencyPoints = consistencyPercentage * 40;
  const totalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
  
  return {
    baseScore,
    activityPoints: Math.round(activityPoints * 100) / 100,
    consistencyPoints: Math.round(consistencyPoints * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    recentActivities: recentActivities.length,
    activeDays: activityDays.size
  };
}