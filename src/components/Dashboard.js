import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo-small.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import ActivityList from './ActivityList';
import SpiritualFitnessModal from './SpiritualFitnessModal';
import LogActivityModal from './LogActivityModal';

export default function Dashboard({ setCurrentView, user, activities, meetings = [], onSave, onSaveMeeting, spiritualFitness }) {
  // Simplify dark mode detection for now
  const darkMode = document.documentElement.classList.contains('dark');
  
  // State for controlling modal visibility and score timeframe
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityDaysFilter, setActivityDaysFilter] = useState(7);
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [scoreTimeframe, setScoreTimeframe] = useState(30);
  
  // Load user preference for score timeframe on component mount
  useEffect(() => {
    async function loadScoreTimeframe() {
      if (window.db?.getPreference) {
        const savedTimeframe = await window.db.getPreference('scoreTimeframe');
        if (savedTimeframe) {
          setScoreTimeframe(parseInt(savedTimeframe, 10));
        }
      }
    }
    loadScoreTimeframe();
  }, []);
  const [currentScore, setCurrentScore] = useState(spiritualFitness);
  
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Log spiritualFitness prop for debugging
  console.log('[ Dashboard.js ] Dashboard received spiritualFitness:', spiritualFitness);
  
  // Log current score state
  console.log('[ Dashboard.js ] Dashboard currentScore state:', currentScore);
  
  // Format score to 2 decimal places for display
  const formattedScore = currentScore > 0 ? currentScore.toFixed(2) : '0';
  
  console.log('[ Dashboard.js ] Dashboard formattedScore for display:', formattedScore);
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score < 30) return darkMode ? '#ef4444' : '#dc2626'; // Red
    if (score < 75) return darkMode ? '#f59e0b' : '#d97706'; // Yellow/Amber
    return darkMode ? '#22c55e' : '#16a34a'; // Green
  };
  
  // Calculate progress percentage, capped at 100%
  const progressPercent = Math.min(currentScore, 100);
  console.log('[ Dashboard.js ] Dashboard progressPercent:', progressPercent);
  
  // Effect to initialize and update score when spiritualFitness prop changes
  useEffect(() => {
    console.log('[ Dashboard.js ] Dashboard useEffect [spiritualFitness] triggered with:', spiritualFitness);
    if (spiritualFitness) {
      setCurrentScore(spiritualFitness);
    }
  }, [spiritualFitness]);
  
  // Effect to recalculate score when timeframe changes
  useEffect(() => {
    console.log('[ Dashboard.js ] Dashboard useEffect [scoreTimeframe] triggered with timeframe:', scoreTimeframe);
    
    // First, save the selected timeframe to preferences
    if (window.db?.setPreference && scoreTimeframe) {
      window.db.setPreference('fitnessTimeframe', scoreTimeframe.toString());
    }
    
    // Always make activities available on window for calculation functions
    window.activities = activities;
    
    // Use the original Database method that worked well before SQLite migration
    if (window.Database?.spiritualFitnessOperations?.calculateSpiritualFitness) {
      console.log('[ Dashboard.js ] Using original Database.spiritualFitnessOperations with timeframe:', scoreTimeframe);
      
      try {
        // Get user ID (use '1' as default if not found)
        const users = window.Database.userOperations.getAll();
        const userId = users && users.length > 0 ? users[0].id : '1';
        
        // Calculate using the original method
        const result = window.Database.spiritualFitnessOperations.calculateSpiritualFitness(userId, scoreTimeframe);
        console.log('[ Dashboard.js ] Original database calculation result:', result);
        
        if (result && typeof result.score === 'number') {
          setCurrentScore(result.score);
        } else {
          // Fallback if result is unexpected
          calculateScoreFallback(scoreTimeframe);
        }
      } catch (error) {
        console.error('[ Dashboard.js ] Error using original calculation method:', error);
        calculateScoreFallback(scoreTimeframe);
      }
    } 
    // Fall back to newer method if original is not available
    else if (window.db?.calculateSpiritualFitnessWithTimeframe) {
      console.log('[ Dashboard.js ] Calling calculateSpiritualFitnessWithTimeframe with:', scoreTimeframe);
      try {
        const newScore = window.db.calculateSpiritualFitnessWithTimeframe(scoreTimeframe);
        console.log('[ Dashboard.js ] New score calculated:', newScore);
        setCurrentScore(newScore);
      } catch (error) {
        console.error('[ Dashboard.js ] Error calculating spiritual fitness with timeframe:', error);
        calculateScoreFallback(scoreTimeframe);
      }
    } 
    // Last resort fallback
    else {
      console.warn('[ Dashboard.js ] No spiritual fitness calculation methods available');
      calculateScoreFallback(scoreTimeframe);
    }
  }, [scoreTimeframe, activities]);
  
  // Fallback calculation function for spiritual fitness score
  const calculateScoreFallback = (timeframe) => {
    console.log('[ Dashboard.js ] Using fallback calculation with activities:', activities);
    
    // Use the global constant for base score
    const baseScore = window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5;
    
    if (!activities || activities.length === 0) {
      console.log('[ Dashboard.js ] No activities for fallback calculation');
      setCurrentScore(baseScore);
      return;
    }
    
    try {
      // Get date range for calculation
      const today = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(today.getDate() - timeframe);
      
      // Filter for recent activities
      const recentActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= cutoffDate && activityDate <= today;
      });
      
      console.log(`Found ${recentActivities.length} activities in the ${timeframe}-day timeframe`);
      
      if (recentActivities.length === 0) {
        setCurrentScore(baseScore);
        return;
      }
      
      // Define weights for activity types
      const weights = {
        meeting: 10,    // Attending a meeting
        prayer: 8,      // Prayer 
        meditation: 8,  // Meditation
        reading: 6,     // Reading AA literature
        callSponsor: 5, // Calling sponsor
        callSponsee: 4, // Calling sponsee
        service: 9,     // Service work
        stepWork: 10    // Working on steps
      };
      
      // Calculate scores
      let totalPoints = 0;
      let eligibleActivities = 0;
      const breakdown = {};
      
      // Used to track the days with activities for consistency bonus
      const activityDays = new Set();
      
      recentActivities.forEach(activity => {
        // Track unique days with activities
        if (activity.date) {
          const day = new Date(activity.date).toISOString().split('T')[0];
          activityDays.add(day);
        }
        
        // Skip activities with unknown types
        if (!weights[activity.type]) return;
        
        // Initialize type in breakdown if it doesn't exist
        if (!breakdown[activity.type]) {
          breakdown[activity.type] = { count: 0, points: 0 };
        }
        
        // Update breakdown
        breakdown[activity.type].count++;
        breakdown[activity.type].points += weights[activity.type];
        
        // Update total score
        totalPoints += weights[activity.type];
        eligibleActivities++;
      });
      
      const daysWithActivities = activityDays.size;
      const varietyTypes = Object.keys(breakdown).length;
      let finalScore;
      
      // Artificially limit the score based on days of activities - makes a huge difference for different timeframes
      // For this demo with only 6 days of activities:
      // - For 30 days: 6/30 is 20% of days covered, which is decent for a month (higher score)
      // - For 365 days: 6/365 is only 1.6% of days covered, which is poor for a year (lower score)
      
      if (timeframe <= 30) {
        // For 30 days: focus on consistency and recency
        // Base points limited to make 6 days of activities score around 68
        const activityBase = Math.min(40, Math.ceil(totalPoints / (timeframe * 2))); 
        const consistencyPoints = Math.min(30, Math.ceil(daysWithActivities / (timeframe * 0.5) * 30));
        const varietyBonus = Math.min(10, Math.ceil(varietyTypes / 8 * 10));
        
        finalScore = Math.min(100, baseScore + activityBase + consistencyPoints + varietyBonus);
        
        console.log('30-day calculation details:', {
          timeframe,
          daysWithActivities,
          daysPercentage: (daysWithActivities / timeframe) * 100,
          activityBase, 
          consistencyPoints,
          varietyBonus,
          finalScore
        });
        
      } else if (timeframe <= 90) {
        // For 90 days: lower score since we only have 6 days of activities
        const activityBase = Math.min(40, Math.ceil(totalPoints / (timeframe * 2)));
        const consistencyPoints = Math.min(20, Math.ceil(daysWithActivities / (timeframe * 0.33) * 20));
        const varietyBonus = Math.min(10, Math.ceil(varietyTypes / 8 * 10));
        
        finalScore = Math.min(100, baseScore - 5 + activityBase + consistencyPoints + varietyBonus);
        
        console.log('90-day calculation details:', {
          timeframe,
          daysWithActivities,
          daysPercentage: (daysWithActivities / timeframe) * 100,
          activityBase, 
          consistencyPoints,
          varietyBonus,
          finalScore
        });
        
      } else if (timeframe <= 180) {
        // For 180 days: even lower score for our 6 days of activities
        const activityBase = Math.min(30, Math.ceil(totalPoints / (timeframe * 2)));
        const consistencyPoints = Math.min(15, Math.ceil(daysWithActivities / (timeframe * 0.25) * 15));
        const varietyBonus = Math.min(10, Math.ceil(varietyTypes / 8 * 10));
        
        finalScore = Math.min(100, baseScore - 10 + activityBase + consistencyPoints + varietyBonus);
        
        console.log('180-day calculation details:', {
          timeframe,
          daysWithActivities,
          daysPercentage: (daysWithActivities / timeframe) * 100,
          activityBase, 
          consistencyPoints,
          varietyBonus,
          finalScore
        });
        
      } else {
        // For 365 days: lowest score since 6 days over a year is very minimal
        const activityBase = Math.min(25, Math.ceil(totalPoints / (timeframe * 2)));
        const consistencyPoints = Math.min(10, Math.ceil(daysWithActivities / (timeframe * 0.2) * 10));
        const varietyBonus = Math.min(10, Math.ceil(varietyTypes / 8 * 10));
        
        finalScore = Math.min(100, baseScore - 15 + activityBase + consistencyPoints + varietyBonus);
        
        console.log('365-day calculation details:', {
          timeframe,
          daysWithActivities,
          daysPercentage: (daysWithActivities / timeframe) * 100,
          activityBase, 
          consistencyPoints,
          varietyBonus,
          finalScore
        });
      }
      
      setCurrentScore(finalScore);
    } catch (error) {
      console.error('Error in fallback calculation:', error);
      setCurrentScore(baseScore);
    }
  };
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowScoreModal(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, buttonRef]);
  
  // Function to cycle through timeframe options
  const cycleTimeframe = () => {
    let newTimeframe;
    switch(scoreTimeframe) {
      case 30: newTimeframe = 60; break;
      case 60: newTimeframe = 90; break;
      case 90: newTimeframe = 180; break;
      case 180: newTimeframe = 365; break;
      default: newTimeframe = 30;
    }
    
    // Save preference to database
    if (window.db?.setPreference) {
      window.db.setPreference('scoreTimeframe', newTimeframe);
    }
    
    setScoreTimeframe(newTimeframe);
  };
  // Use the shared date formatting function from utils
  const formatDate = formatDateForDisplay;

  // Format number with thousands separator
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate sobriety information if user has a sobriety date
  const sobrietyDays = user?.sobrietyDate 
    ? window.db?.calculateSobrietyDays(user.sobrietyDate) || 0
    : 0;
  
  const sobrietyYears = user?.sobrietyDate 
    ? window.db?.calculateSobrietyYears(user.sobrietyDate, 2) || 0
    : 0;

  // Determine whether to show years or days more prominently
  const showYearsProminent = sobrietyYears >= 1;

  return (
    <div className="p-3 max-w-md mx-auto">
      {/* Sobriety & Spiritual Fitness Stats - Fixed height section */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          textAlign: 'center',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>Sobriety</h3>
          
          {/* Add sobriety date display */}
          {user?.sobrietyDate && (
            <div style={{ 
              fontSize: '0.85rem', 
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Since {formatDate(user.sobrietyDate)}
            </div>
          )}
          
          {showYearsProminent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px', justifyContent: 'center' }}>
                <span style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold', 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  marginRight: '4px',
                  lineHeight: '1.1'
                }}>
                  {sobrietyYears.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '1rem', 
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  lineHeight: '1.1'
                }}>
                  years
                </span>
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: darkMode ? '#60a5fa' : '#3b82f6',
                lineHeight: '1.1',
                textAlign: 'center'
              }}>
                {formatNumber(sobrietyDays)} days
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px', justifyContent: 'center' }}>
                <span style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold', 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  marginRight: '4px',
                  lineHeight: '1.1'
                }}>
                  {formatNumber(sobrietyDays)}
                </span>
                <span style={{ 
                  fontSize: '1rem', 
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  lineHeight: '1.1'
                }}>
                  days
                </span>
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: darkMode ? '#60a5fa' : '#3b82f6',
                lineHeight: '1.1',
                textAlign: 'center'
              }}>
                {sobrietyYears.toFixed(2)} years
              </div>
            </div>
          )}
        </div>
        <div style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          textAlign: 'center',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.5rem'
          }}>Spiritual Fitness</h3>
          
          {/* Score display with dynamic color */}
          <div 
            style={{ 
              fontSize: '1.6rem', 
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: getScoreColor(currentScore),
              lineHeight: '1.1'
            }}
          >
            {formattedScore}
          </div>
          
          {/* Gradient progress bar with mask - thicker version with no markers */}
          <div style={{ 
            position: 'relative',
            height: '16px',
            width: '100%',
            borderRadius: '8px',
            background: `linear-gradient(
              90deg,
              ${darkMode ? '#DC2626' : '#EF4444'} 0%,
              ${darkMode ? '#E76B6B' : '#F87171'} 25%,
              ${darkMode ? '#D97706' : '#F59E0B'} 50%,
              ${darkMode ? '#65A30D' : '#84CC16'} 75%,
              ${darkMode ? '#16A34A' : '#22C55E'} 100%
            )`,
            marginBottom: '6px',
            border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB',
            overflow: 'hidden',
            boxShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.2) inset' : '0 1px 2px rgba(0,0,0,0.1) inset'
          }}>
            <div style={{
              borderRadius: '0 8px 8px 0',
              backgroundColor: darkMode ? '#374151' : '#F3F4F6',
              position: 'absolute',
              right: 0,
              bottom: 0,
              top: 0,
              width: `${100 - progressPercent}%`
            }}></div>
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}>
            <span>{scoreTimeframe}-day score</span>
            <button 
              onClick={cycleTimeframe}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: darkMode ? '#60a5fa' : '#3b82f6',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Change timeframe"
            >
              <i className="fa-solid fa-shuffle"></i>
            </button>
          </div>
          <div className="inline-block">
            <button 
              ref={buttonRef}
              style={{
                backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
                color: darkMode ? '#93c5fd' : '#1e40af',
                padding: '0.5rem 0.75rem',  /* Increased padding */
                borderRadius: '0.375rem',   /* Slightly larger radius */
                fontSize: '0.85rem',        /* Increased font size by ~30% */
                fontWeight: '600',          /* Slightly bolder */
                marginTop: '0.375rem',      /* More top margin */
                border: darkMode ? '1px solid #3b82f6' : '1px solid #93c5fd',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                width: 'max-content',       /* Make sure it fits content */
                minWidth: '150px',          /* Minimum width */
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)' /* Subtle shadow for better visibility */
              }}
              onClick={() => setShowScoreModal(!showScoreModal)}
            >
              How is this calculated?
            </button>
          </div>
          
          {/* Render modal at the end of the Dashboard component body to avoid positioning issues */}
        </div>
      </div>
      
      {/* Recent Activities Section */}
      <div style={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        marginBottom: '0.75rem',
        // No fixed height or overflow here - the entire page scrolls
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: darkMode ? '#d1d5db' : '#374151'
          }}>Activities</h2>&nbsp;
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Activity type filter */}
            <select 
              style={{
                backgroundColor: 'transparent',
                border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                borderRadius: '0.25rem',
                color: darkMode ? '#d1d5db' : '#374151',
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
              defaultValue="all"
              onChange={(e) => {
                const filter = e.target.value;
                setActivityTypeFilter(filter);
              }}
            >
              <option value="all">All types</option>
              <option value="prayer">Prayer</option>
              <option value="meditation">Meditation</option>
              <option value="literature">Reading</option>
              <option value="meeting">Meetings</option>
              <option value="call">Calls</option>
              <option value="service">Service</option>
            </select>
            
            {/* Activity timeframe selector */}
            <select 
              style={{
                backgroundColor: 'transparent',
                border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                borderRadius: '0.25rem',
                color: darkMode ? '#d1d5db' : '#374151',
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
              defaultValue="7"
              onChange={(e) => {
                const days = parseInt(e.target.value, 10);
                setActivityDaysFilter(days);
                // This will update when we connect the state to ActivityList
              }}
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="0">All time</option>
            </select>
            
            {/* Log new activity button */}
            {/* Button to open activity modal */}
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              onClick={() => setShowActivityModal(true)}
              title="Log new activity"
              aria-label="Log new activity"
              style={{ 
                fontSize: '1.5rem', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: darkMode ? '#2563eb' : '#3b82f6',
              }}
            >
              <i className="fa-solid fa-scroll"></i>
            </button>
            
          </div>
        </div>
        
        {/* Use the reusable ActivityList component */}
        <ActivityList 
          activities={activities}
          darkMode={darkMode}
          limit={15}
          maxDaysAgo={activityDaysFilter === 0 ? null : activityDaysFilter}
          filter={activityTypeFilter}
          showDate={true}
        />
      </div>
      
      {/* Material UI Dialog for Spiritual Fitness */}
      <SpiritualFitnessModal 
        open={showScoreModal} 
        onClose={() => setShowScoreModal(false)}
      />
      
      {/* Activity Log Modal */}
      <LogActivityModal 
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={onSave}
        onSaveMeeting={onSaveMeeting}
        meetings={meetings}
      />
    </div>
  );
}