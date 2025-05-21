import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo-small.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';
import ActivityList from './ActivityList';
import SpiritualFitnessModal from './SpiritualFitnessModal';
import LogActivityModal from './LogActivityModal';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { Paper, Box, Typography, Button, Card, CardContent, LinearProgress } from '@mui/material';

export default function Dashboard({ setCurrentView, user, activities, meetings = [], onSave, onSaveMeeting, spiritualFitness }) {
  // Get theme from MUI theme provider
  const { mode } = useAppTheme();
  const darkMode = mode === 'dark';
  const theme = useTheme();
  
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
          console.warn('[ Dashboard.js ] SQLite calculation method not available');
          // Use the prop value directly instead of hardcoded 5
          setCurrentScore(spiritualFitness || 5); 
        }
      } catch (error) {
        console.error('[ Dashboard.js ] Error calculating spiritual fitness:', error);
        // Use the prop value directly instead of hardcoded 5
        setCurrentScore(spiritualFitness || 5);
      }
    }
    
    calculateScore();
  }, [scoreTimeframe, activities, spiritualFitness]);
  
  // Note: We've removed the fallback calculation function since
  // we're now using SQLite via Capacitor exclusively for data persistence
  
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
      {/* Sobriety & Spiritual Fitness Stats - Fixed height section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
        <Paper sx={{
          borderRadius: 2,
          p: 1,
          textAlign: 'center',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Typography 
            variant="h6" 
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              mb: 1,
              textAlign: 'center',
              color: 'text.primary'
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
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px', justifyContent: 'center' }}>
                <span style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold', 
                  color: 'var(--theme-primary-main)',
                  marginRight: '4px',
                  lineHeight: '1.1'
                }}>
                  {sobrietyYears.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '1rem', 
                  color: 'var(--theme-text-secondary)',
                  lineHeight: '1.1'
                }}>
                  years
                </span>
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: 'var(--theme-primary-main)',
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
                  color: 'var(--theme-primary-main)',
                  marginRight: '4px',
                  lineHeight: '1.1'
                }}>
                  {formatNumber(sobrietyDays)}
                </span>
                <span style={{ 
                  fontSize: '1rem', 
                  color: 'var(--theme-text-secondary)',
                  lineHeight: '1.1'
                }}>
                  days
                </span>
              </div>
              <div style={{ 
                fontSize: '1rem', 
                color: 'var(--theme-primary-main)',
                lineHeight: '1.1',
                textAlign: 'center'
              }}>
                {sobrietyYears.toFixed(2)} years
              </div>
            </div>
          )}
        </Paper>
        <Paper sx={{
          backgroundColor: 'var(--theme-bg-paper)',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          textAlign: 'center',
          border: '1px solid var(--theme-divider)'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--theme-text-primary)',
            marginBottom: '0.5rem'
          }}>Spiritual Fitness</h3>
          
          {/* Score display with dynamic color and question mark button */}
          <div 
            style={{ 
              fontSize: '1.6rem', 
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: getScoreColor(currentScore),
              lineHeight: '1.1',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center'
            }}
          >
            {formattedScore}
            <button 
              ref={buttonRef}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--theme-primary-main)',
                padding: '0',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                position: 'relative',
                top: '-0.5rem',
                marginLeft: '0.2rem'
              }}
              onClick={() => setShowScoreModal(!showScoreModal)}
              aria-label="How is this calculated?"
              title="How is this calculated?"
            >
              <i className="fa-solid fa-question"></i>
            </button>
          </div>
          
          {/* Gradient progress bar with mask - thicker version with no markers */}
          <div style={{ 
            position: 'relative',
            height: '16px',
            width: '100%',
            borderRadius: '8px',
            background: `linear-gradient(
              90deg,
              var(--theme-error-main) 0%,
              var(--theme-warning-light) 25%,
              var(--theme-warning-main) 50%, 
              var(--theme-success-light) 75%,
              var(--theme-success-main) 100%
            )`,
            marginBottom: '6px',
            border: '1px solid var(--theme-divider)',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15) inset'
          }}>
            <div style={{
              borderRadius: '0 8px 8px 0',
              backgroundColor: 'var(--theme-bg-default)',
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
            color: 'var(--theme-text-secondary)'
          }}>
            <span>{scoreTimeframe}-day score</span>
            <button 
              onClick={cycleTimeframe}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--theme-primary-main)',
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
          {/* "How is this calculated" button removed - now using the question mark icon */}
          
          {/* Render modal at the end of the Dashboard component body to avoid positioning issues */}
        </Paper>
      </Box>
      
      {/* Recent Activities Section */}
      <div style={{
        backgroundColor: 'var(--theme-bg-paper)',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        border: '1px solid var(--theme-divider)',
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
            color: 'var(--theme-text-primary)'
          }}>Activities</h2>&nbsp;
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Activity type filter */}
            <select 
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--theme-divider)',
                borderRadius: '0.25rem',
                color: 'var(--theme-text-primary)',
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
                border: '1px solid var(--theme-divider)',
                borderRadius: '0.25rem',
                color: 'var(--theme-text-primary)',
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
                color: 'var(--theme-primary-main)',
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