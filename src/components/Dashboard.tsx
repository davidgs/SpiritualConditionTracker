import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo-small.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';
import ActivityList from './ActivityList';
import SpiritualFitnessModal from './SpiritualFitnessModal';
import LogActivityModal from './LogActivityModal';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Paper, Box, Typography, IconButton, Button } from '@mui/material';
import { User, Activity, Meeting } from '../types/database';

interface DashboardProps {
  setCurrentView: (view: string) => void;
  user: User | null;
  activities: Activity[];
  meetings: Meeting[];
  onSave: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTimeframeChange: (timeframe: number) => void;
  currentTimeframe: number;
}

export default function Dashboard({ setCurrentView, user, activities, meetings = [], onSave, onSaveMeeting, onTimeframeChange, currentTimeframe }: DashboardProps) {
  // Get theme from MUI theme provider
  const { mode } = useAppTheme();
  const darkMode = mode === 'dark';
  
  // State for controlling modal visibility and score timeframe
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [activityDaysFilter, setActivityDaysFilter] = useState<number>(7);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  // Use timeframe from props instead of local state
  const scoreTimeframe = currentTimeframe;
  const [spiritualFitness, setSpiritualFitness] = useState<number>(5);
  const [currentScore, setCurrentScore] = useState<number>(0);
  
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Log spiritualFitness prop for debugging
  console.log('[ Dashboard.js ] Dashboard initial spiritualFitness:', spiritualFitness);
  
  // Log current score state
  console.log('[ Dashboard.js ] Dashboard currentScore state:', currentScore);
  
  // Format score to 2 decimal places for display
  const formattedScore: string = currentScore > 0 ? currentScore.toFixed(2) : '0.00';
  
  console.log('[ Dashboard.js ] Dashboard formattedScore for display:', formattedScore);
  
  // Use MUI theme for colors
  const muiTheme = useTheme();
  
  // Determine color based on score using theme palette
  const getScoreColor = (score: number): string => {
    if (score < 30) return muiTheme.palette.error.main; // Red
    if (score < 75) return muiTheme.palette.warning.main; // Yellow/Amber
    return muiTheme.palette.success.main; // Green
  };
  
  // Calculate progress percentage, capped at 100%
  const progressPercent = Math.min(currentScore, 100);
  console.log('[ Dashboard.js ] Dashboard progressPercent:', progressPercent);
  
  // Effect to calculate spiritual fitness when activities change
  useEffect(() => {
    console.log('[ Dashboard.js ] Dashboard useEffect [activities] triggered - calculating spiritual fitness');
    calculateSpiritualFitnessScore();
  }, [activities]);
  
  // Effect to recalculate score when timeframe changes
  useEffect(() => {
    console.log('[ Dashboard.js ] Dashboard useEffect [scoreTimeframe] triggered with timeframe:', scoreTimeframe);
    calculateSpiritualFitnessScore();
  }, [scoreTimeframe]);
  
  // Function to calculate spiritual fitness score using activities from props
  function calculateSpiritualFitnessScore() {
    console.log('[ Dashboard.tsx:94 calculateSpiritualFitnessScore ] Called with activities:', activities.length);
    console.log('[ Dashboard.tsx:95 calculateSpiritualFitnessScore ] Sample activities:', activities.slice(0, 3).map(a => ({ type: a.type, date: a.date })));
    console.log('[ Dashboard.tsx:96 calculateSpiritualFitnessScore ] Timeframe:', scoreTimeframe);
    
    // Calculate score using activities passed from App component
    const score = calculateFitnessFromActivities(activities, scoreTimeframe);
    console.log('[ Dashboard.tsx:100 calculateSpiritualFitnessScore ] Calculated score:', score);
    
    setSpiritualFitness(score);
    setCurrentScore(score);
  }

  // Calculate spiritual fitness from activities array (no database queries)
  function calculateFitnessFromActivities(allActivities: Activity[], timeframeDays: number): number {
    console.log('[ Dashboard.tsx:108 calculateFitnessFromActivities ] Starting calculation with', allActivities.length, 'activities, timeframe:', timeframeDays);
    
    // Base score
    const baseScore = 5;
    
    // Filter activities within the timeframe
    const now = new Date();
    const timeframeStart = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
    
    const recentActivities = allActivities.filter(activity => {
      if (!activity.date) {
        console.log('[ Dashboard.tsx:118 calculateFitnessFromActivities ] Skipping activity with no date:', activity);
        return false;
      }
      const activityDate = new Date(activity.date);
      const isRecent = activityDate >= timeframeStart;
      console.log('[ Dashboard.tsx:123 calculateFitnessFromActivities ] Activity date:', activity.date, 'isRecent:', isRecent);
      return isRecent;
    });
    
    console.log('[ Dashboard.tsx:127 calculateFitnessFromActivities ] Filtered', recentActivities.length, 'recent activities');
    
    if (recentActivities.length === 0) {
      console.log('[ Dashboard.tsx:130 calculateFitnessFromActivities ] No recent activities, returning base score:', baseScore);
      return baseScore;
    }
    
    // Activity points (2 points per activity, max 40)
    const activityPoints = Math.min(recentActivities.length * 2, 40);
    
    // Consistency points - count unique days with activities
    const activityDays = new Set();
    recentActivities.forEach(activity => {
      const day = new Date(activity.date).toISOString().split('T')[0];
      activityDays.add(day);
    });
    
    const consistencyPercentage = activityDays.size / timeframeDays;
    const consistencyPoints = Math.round(consistencyPercentage * 40); // Up to 40 points
    
    // Total score (capped at 100, with decimal precision)
    const totalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
    const preciseScore = Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    
    console.log('[ Dashboard.tsx:147 calculateFitnessFromActivities ] Calculation result:');
    console.log('[ Dashboard.tsx:148 calculateFitnessFromActivities ] - Base score:', baseScore);
    console.log('[ Dashboard.tsx:149 calculateFitnessFromActivities ] - Activity points:', activityPoints, '(from', recentActivities.length, 'activities)');
    console.log('[ Dashboard.tsx:150 calculateFitnessFromActivities ] - Consistency points:', consistencyPoints, '(from', activityDays.size, 'unique days)');
    console.log('[ Dashboard.tsx:151 calculateFitnessFromActivities ] - Total score:', preciseScore);
    
    return preciseScore;
  }
  
  // Fallback calculation function using activities data
  function calculateFallbackFitness() {
    console.log('[ Dashboard.js ] Using fallback fitness calculation');
    
    if (!activities || activities.length === 0) {
      console.log('[ Dashboard.js ] No activities for fallback calculation');
      return 5;
    }
    
    // Define weights for activity types (matching the working calculation)
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
      stepwork: 10
    };
    
    const now = new Date();
    const daysAgo = new Date();
    daysAgo.setDate(now.getDate() - scoreTimeframe);
    
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= daysAgo && activityDate <= now;
    });
    
    console.log('[ Dashboard.js ] Found', recentActivities.length, 'activities in the last', scoreTimeframe, 'days');
    console.log('[ Dashboard.js ] Sample activity types:', recentActivities.slice(0, 3).map(a => a.type));
    
    if (recentActivities.length === 0) {
      return 5;
    }
    
    // Calculate total points and track activity days
    let totalPoints = 0;
    const activityDays = new Set();
    const breakdown = {};
    
    recentActivities.forEach(activity => {
      // Track unique days
      if (activity.date) {
        const dayKey = new Date(activity.date).toISOString().split('T')[0];
        activityDays.add(dayKey);
      }
      
      // Add points for activity type
      const points = weights[activity.type] || 2;
      totalPoints += points;
      
      // Track breakdown
      if (!breakdown[activity.type]) {
        breakdown[activity.type] = { count: 0, points: 0 };
      }
      breakdown[activity.type].count++;
      breakdown[activity.type].points += points;
    });
    
    const daysWithActivities = activityDays.size;
    const varietyTypes = Object.keys(breakdown).length;
    const daysCoveragePercent = (daysWithActivities / scoreTimeframe) * 100;
    
    // Calculate score based on timeframe (with decimal precision)
    let finalScore;
    if (scoreTimeframe <= 30) {
      const basePoints = 20;
      const activityPoints = Math.min(40, totalPoints / 8);
      const consistencyPoints = Math.min(30, daysCoveragePercent * 1.5);
      const varietyBonus = Math.min(10, varietyTypes * 2);
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
    } else if (scoreTimeframe <= 90) {
      const basePoints = 15;
      const activityPoints = Math.min(35, totalPoints / 12);
      const consistencyPoints = Math.min(25, daysCoveragePercent * 2.5);
      const varietyBonus = Math.min(10, varietyTypes * 2);
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
    } else if (scoreTimeframe <= 180) {
      const basePoints = 10;
      const activityPoints = Math.min(30, totalPoints / 18);
      const consistencyPoints = Math.min(20, daysCoveragePercent * 4);
      const varietyBonus = Math.min(10, varietyTypes * 2);
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
    } else {
      const basePoints = 5;
      const activityPoints = Math.min(25, totalPoints / 24);
      const consistencyPoints = Math.min(15, daysCoveragePercent * 6);
      const varietyBonus = Math.min(10, varietyTypes * 2);
      finalScore = basePoints + activityPoints + consistencyPoints + varietyBonus;
    }
    
    finalScore = Math.min(100, Math.round(finalScore * 100) / 100); // Keep 2 decimal places
    
    console.log('[ Dashboard.js ] Fallback calculation details:', {
      totalPoints,
      daysWithActivities,
      daysCoveragePercent: daysCoveragePercent.toFixed(1) + '%',
      varietyTypes,
      finalScore,
      breakdown
    });
    
    return finalScore;
  }
  
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
      case 7: newTimeframe = 30; break;
      case 30: newTimeframe = 60; break;
      case 60: newTimeframe = 90; break;
      case 90: newTimeframe = 180; break;
      case 180: newTimeframe = 365; break;
      default: newTimeframe = 7;
    }
    
    // Save preference to database
    if (window.db?.setPreference) {
      window.db.setPreference('scoreTimeframe', newTimeframe);
    }
    
    // Call the parent's timeframe change handler
    onTimeframeChange(newTimeframe);
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
    <Box sx={{ p: 3, maxWidth: 'md', mx: 'auto' }}>
      {/* Sobriety Section - Full Width */}
      <Paper 
          elevation={1}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 2,
            textAlign: 'center',
            border: 1,
            borderColor: 'divider',
            borderLeft: 4,
            borderLeftColor: 'success.main',
            mb: 1.5,
          }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.5,
              textAlign: 'center'
            }}
          >
            Sobriety
          </Typography>
          
          {/* Add sobriety date display */}
          {user?.sobrietyDate && (
            <Typography
              variant="body2" 
              sx={{ 
                fontSize: '0.85rem', 
                color: 'text.secondary',
                mb: 0.5,
                textAlign: 'center'
              }}
            >
              Since {formatDate(user.sobrietyDate)}
            </Typography>
          )}
          
          {showYearsProminent ? (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5, justifyContent: 'center' }}>
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontSize: '1.6rem', 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    mr: 0.5,
                    lineHeight: 1.1
                  }}
                >
                  {sobrietyYears.toFixed(2)}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1rem', 
                    color: 'text.secondary',
                    lineHeight: 1.1
                  }}
                >
                  years
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1rem', 
                  color: 'primary.main',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  alignmentBaseline: 'middle'
                }}
              >
                {formatNumber(sobrietyDays)} days
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5, justifyContent: 'center' }}>
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontSize: '1.6rem', 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    mr: 0.5,
                    lineHeight: 1.1
                  }}
                >
                  {formatNumber(sobrietyDays)}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1rem', 
                    color: 'text.secondary',
                    lineHeight: 1.1
                  }}
                >
                  days
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1rem', 
                  color: 'primary.main',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  alignmentBaseline: 'middle'
                }}
              >
                {sobrietyYears.toFixed(2)} years
              </Typography>
            </Box>
          )}
      </Paper>
        <Paper 
          elevation={1}
          sx={{
            p: 2,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderLeft: 4,
            borderLeftColor: 'primary.main',
            mb: 1.5,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                m: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Spiritual Fitness
              <Box
                component="button"
                onClick={() => setShowScoreModal(!showScoreModal)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75em',
                  p: '0 0 0 4px',
                  position: 'relative',
                  top: '-5px',
                  color: 'primary.main'
                }}
                aria-label="Show how spiritual fitness is calculated"
              >
                <i className="fa-solid fa-question"></i>
              </Box>
            </Typography>
          </Box>
          
          {/* Score display with dynamic color */}
          <Typography
            variant="h4"
            sx={{ 
              fontSize: '1.6rem', 
              fontWeight: 'bold',
              mb: 0.5,
              color: getScoreColor(currentScore),
              lineHeight: 1.1
            }}
          >
            {formattedScore}
          </Typography>
          
          {/* Gradient progress bar with mask - thicker version with no markers */}
          <Box sx={{ 
            position: 'relative',
            height: '32px',
            width: '100%',
            borderRadius: '12px',
            background: (theme) => `linear-gradient(
              90deg,
              ${theme.palette.error.main} 0%,
              ${theme.palette.error.light} 25%,
              ${theme.palette.warning.main} 50%,
              ${theme.palette.success.light} 75%,
              ${theme.palette.success.main} 100%
            )`,
            mb: '6px',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? 'inset 0 1px 2px rgba(0,0,0,0.2)' 
              : 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{
              borderRadius: '0 8px 8px 0',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#374151' : '#F3F4F6',
              position: 'absolute',
              right: 0,
              bottom: 0,
              top: 0,
              width: `${100 - progressPercent}%`
            }}></Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            fontSize: '1rem',
            color: 'text.secondary'
          }}>
            <Typography variant="body2" sx={{ fontSize: 'inherit' }}>{scoreTimeframe}-day score</Typography>
            <IconButton 
              onClick={cycleTimeframe}
              size="small"
              sx={{
                padding: '2px',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Change timeframe"
            >
              <i className="fa-solid fa-shuffle"></i>
            </IconButton>
          </Box>
          {/* "How is this calculated" button removed - now using the icon in the header */}
          
          {/* Render modal at the end of the Dashboard component body to avoid positioning issues */}
        </Paper>
      
      {/* Recent Activities Section */}
      <Paper 
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderLeft: 4,
          borderLeftColor: 'info.main',
          mb: 1.5,
          // No fixed height or overflow here - the entire page scrolls
        }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.5
        }}>
          <Typography 
            variant="h6" 
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'text.primary',
              paddingRight: '0.15rem'
            }}
          >Activities</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Activity type filter */}
            <Box 
              component="select" 
              sx={{
                bgcolor: 'transparent',
                border: 1,
                borderColor: 'divider',
                borderRadius: 0.25,
                color: 'text.primary',
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
            </Box>
            
            {/* Activity timeframe selector */}
            <Box 
              component="select"
              sx={{
                bgcolor: 'transparent',
                border: 1,
                borderColor: 'divider',
                borderRadius: 0.25,
                color: 'text.primary',
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
            </Box>
            
            {/* Log new activity button */}
            {/* Button to open activity modal */}
            <IconButton
              onClick={() => setShowActivityModal(true)}
              title="Log new activity"
              aria-label="Log new activity"
              size="medium"
              sx={{ 
                fontSize: '1.5rem', 
                p: 0.5,
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
            >
              <i className="fa-solid fa-scroll"></i>
            </IconButton>
            
          </Box>
        </Box>
        
        {/* Use the reusable ActivityList component */}
        <ActivityList 
          activities={activities}
          darkMode={darkMode}
          limit={15}
          maxDaysAgo={activityDaysFilter === 0 ? null : activityDaysFilter}
          filter={activityTypeFilter}
          showDate={true}
        />
      </Paper>
      
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
    </Box>
  );
}