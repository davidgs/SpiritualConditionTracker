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
  const [scoreTimeframe, setScoreTimeframe] = useState(
    window.db?.getPreference('scoreTimeframe') || 30
  );
  const [currentScore, setCurrentScore] = useState(spiritualFitness);
  
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Format score to 2 decimal places for display
  const formattedScore = currentScore > 0 ? currentScore.toFixed(2) : '0';
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score < 30) return darkMode ? '#ef4444' : '#dc2626'; // Red
    if (score < 75) return darkMode ? '#f59e0b' : '#d97706'; // Yellow/Amber
    return darkMode ? '#22c55e' : '#16a34a'; // Green
  };
  
  // Calculate progress percentage, capped at 100%
  const progressPercent = Math.min(currentScore, 100);
  
  // Effect to recalculate score when timeframe changes
  useEffect(() => {
    if (window.db?.calculateSpiritualFitnessWithTimeframe) {
      const newScore = window.db.calculateSpiritualFitnessWithTimeframe(scoreTimeframe);
      setCurrentScore(newScore);
    }
  }, [scoreTimeframe]);
  
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
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.65rem',
                fontWeight: '500',
                marginTop: '0.25rem',
                border: darkMode ? '1px solid #3b82f6' : '1px solid #93c5fd',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
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
          }}>Activities</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                // Update the maxDaysAgo property in ActivityList
                // This is a placeholder; we'll add actual implementation
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="0">All activities</option>
            </select>
            
            {/* Log new activity button */}
            <button
              style={{
                backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              onClick={() => setShowActivityModal(true)}
              title="Add activity"
            >
              <i className="fas fa-plus"></i>
              <span>Add</span>
            </button>
          </div>
        </div>
        
        {/* Use the reusable ActivityList component */}
        <ActivityList 
          activities={activities}
          darkMode={darkMode}
          limit={15}
          maxDaysAgo={7}
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