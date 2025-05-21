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
    
    // Debug logging
    console.log('Dashboard useEffect [spiritualFitness] triggered with:', spiritualFitness);
  }, [spiritualFitness]);
  
  // Re-calculate spiritual fitness when timeframe changes
  useEffect(() => {
    console.log('Dashboard useEffect [scoreTimeframe] triggered with timeframe:', scoreTimeframe);
  }, [scoreTimeframe]);
  
  // Modal reference for click outside handling
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  
  // State for the spiritual fitness score display
  const [currentScore, setCurrentScore] = useState(spiritualFitness || 0);
  
  // Update score when the spiritualFitness prop changes
  useEffect(() => {
    if (spiritualFitness !== undefined) {
      setCurrentScore(spiritualFitness);
    } else {
      setCurrentScore(0);
    }
  }, [spiritualFitness]);
  
  // Format the score for display with 2 decimal places
  const formattedScore = Number(currentScore).toFixed(2);
  
  // Calculate the progress percentage for the bar (clamp between 0-100)
  const progressPercent = Math.max(0, Math.min(100, currentScore));
  
  // Function to get color based on score value
  const getScoreColor = (score) => {
    if (score < 30) return 'var(--theme-error-main)';
    if (score < 60) return 'var(--theme-warning-main)';
    return 'var(--theme-success-main)';
  };
  
  // Click outside handler for modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && 
          !modalRef.current.contains(event.target) && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
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
    <div style={{ padding: '1.5rem', maxWidth: '48rem', margin: '0 auto' }}>
      {/* Sobriety & Spiritual Fitness Stats - Fixed height section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{
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
          }}>Sobriety</h3>
          
          {/* Add sobriety date display */}
          {user?.sobrietyDate && (
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'var(--theme-text-secondary)',
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
        </div>
        <div style={{
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
          <div style={{ 
            fontSize: '1.6rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: getScoreColor(currentScore),
            lineHeight: '1.1',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}>
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
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${100 - progressPercent}%`,
              backgroundColor: 'var(--theme-bg-elevation1)',
              zIndex: 1,
              opacity: 0.8
            }}></div>
          </div>
          
          {/* Timeframe selector */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            color: 'var(--theme-text-secondary)',
            marginBottom: '0.5rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>
              {scoreTimeframe} day average
            </span>
            <button 
              style={{ 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Change timeframe"
              onClick={cycleTimeframe}
            >
              <i className="fa-solid fa-shuffle"></i>
            </button>
          </div>
        </div>
      </div>
      
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
              <option value="all">All Types</option>
              <option value="prayer">Prayer</option>
              <option value="meditation">Meditation</option>
              <option value="reading">Reading</option>
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
            
            {/* Add activity button - Using font awesome icon */}
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
      
      {/* Log Activity Modal */}
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