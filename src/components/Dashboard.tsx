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
  spiritualFitness: number;
}

export default function Dashboard({ setCurrentView, user, activities, meetings = [], onSave, onSaveMeeting, spiritualFitness }: DashboardProps) {
  // Get theme from MUI theme provider
  const { mode } = useAppTheme();
  const darkMode = mode === 'dark';
  
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
  const [currentScore, setCurrentScore] = useState(0);
  
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Log spiritualFitness prop for debugging
  console.log('[ Dashboard.js ] Dashboard received spiritualFitness:', spiritualFitness);
  
  // Log current score state
  console.log('[ Dashboard.js ] Dashboard currentScore state:', currentScore);
  
  // Format score to 2 decimal places for display
  const formattedScore = currentScore > 0 ? currentScore.toFixed(2) : '0';
  
  console.log('[ Dashboard.js ] Dashboard formattedScore for display:', formattedScore);
  
  // Use MUI theme for colors
  const muiTheme = useTheme();
  
  // Determine color based on score using theme palette
  const getScoreColor = (score) => {
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
    
    // Check if window.db exists and is fully initialized before attempting to use it
    if (!window.db || !window.dbInitialized) {
      console.warn('[ Dashboard.js ] Database not initialized yet - skipping database operations');
      return; // Skip database operations until initialization is complete
    }
    
    // Save the selected timeframe to SQLite preferences - only if database is ready
    try {
      if (window.db?.setPreference && scoreTimeframe) {
        window.db.setPreference('fitnessTimeframe', scoreTimeframe.toString())
          .catch(err => console.error('[ Dashboard.js ] Error saving timeframe preference:', err));
      }
    } catch (err) {
      console.error('[ Dashboard.js ] Error accessing database for preferences:', err);
    }
    
    async function calculateScore() {
      try {
        // Use the SQLite-based calculation method
        if (window.db?.calculateSpiritualFitnessWithTimeframe) {
          console.log('[ Dashboard.js ] Calculating score with SQLite, timeframe:', scoreTimeframe);
          const score = await window.db.calculateSpiritualFitnessWithTimeframe(scoreTimeframe);
          console.log('[ Dashboard.js ] SQLite calculation result:', score);
          setCurrentScore(score);
        } else {
          console.warn('[ Dashboard.js ] SQLite calculation method not available - using fallback');
          // Use fallback calculation with activities
          const fallbackScore = calculateFallbackFitness();
          setCurrentScore(fallbackScore); 
        }
      } catch (error) {
        console.error('[ Dashboard.js ] Error calculating spiritual fitness:', error);
        // Use fallback calculation with activities
        const fallbackScore = calculateFallbackFitness();
        setCurrentScore(fallbackScore);
      }
    }
    
    calculateScore();
  }, [scoreTimeframe, activities, spiritualFitness]);
  
  // Function to calculate spiritual fitness score independently
  async function calculateSpiritualFitnessScore() {
    try {
      // Use the SQLite-based calculation method
      if (window.db?.calculateSpiritualFitnessWithTimeframe) {
        console.log('[ Dashboard.js ] Calculating score with SQLite, timeframe:', scoreTimeframe);
        const score = await window.db.calculateSpiritualFitnessWithTimeframe(scoreTimeframe);
        console.log('[ Dashboard.js ] SQLite calculation result:', score);
        setCurrentScore(score);
      } else {
        console.warn('[ Dashboard.js ] SQLite calculation method not available - using fallback');
        const fallbackScore = calculateFallbackFitness();
        setCurrentScore(fallbackScore); 
      }
    } catch (error) {
      console.error('[ Dashboard.js ] Error calculating spiritual fitness:', error);
      const fallbackScore = calculateFallbackFitness();
      setCurrentScore(fallbackScore);
    }
  }
  
  // Fallback calculation function using activities data
  function calculateFallbackFitness() {
    console.log('[ Dashboard.js ] Using fallback fitness calculation');
    
    const baseScore = 5;
    let finalScore = baseScore;
    
    if (activities && activities.length > 0) {
      const now = new Date();
      const daysAgo = new Date();
      daysAgo.setDate(now.getDate() - scoreTimeframe);
      
      const recentActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= daysAgo && activityDate <= now;
      });
      
      console.log('[ Dashboard.js ] Found', recentActivities.length, 'activities in the last', scoreTimeframe, 'days');
      
      const activityPoints = Math.min(40, recentActivities.length * 2);
      
      const activityDays = new Set();
      recentActivities.forEach(activity => {
        if (activity.date) {
          const dayKey = new Date(activity.date).toISOString().split('T')[0];
          activityDays.add(dayKey);
        }
      });
      
      const daysWithActivities = activityDays.size;
      const consistencyPercentage = daysWithActivities / scoreTimeframe;
      const consistencyPoints = Math.round(consistencyPercentage * 40);
      
      finalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
      
      console.log('[ Dashboard.js ] Fallback calculation details:', {
        baseScore,
        activityPoints, 
        consistencyPoints,
        finalScore
      });
    }
    
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
              color: 'text.primary'
            }}
          >Activities</Typography>&nbsp;
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