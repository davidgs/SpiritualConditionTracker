import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo-small.png';
import { formatDateForDisplay } from '../utils/dateUtils';
import ActivityList from './ActivityList';

export default function Dashboard({ setCurrentView, user, activities, spiritualFitness }) {
  // Simplify dark mode detection for now
  const darkMode = document.documentElement.classList.contains('dark');
  
  // State for controlling modal visibility and score timeframe
  const [showScoreModal, setShowScoreModal] = useState(false);
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
          <div className="relative inline-block">
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
            
            {showScoreModal && (
              <div 
                ref={modalRef}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={(e) => {
                  // Close when clicking outside the content area
                  if (e.target === e.currentTarget) {
                    setShowScoreModal(false);
                  }
                }}
              >
                <div 
                  className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto m-4"
                >
                  {/* Close button */}
                  <button 
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => setShowScoreModal(false)}
                  >
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                      Spiritual Fitness Score
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Base Points for Activities
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
                          <li>AA Meeting: 5 points (speaker +3, shared +1, chair +1)</li>
                          <li>Reading Literature: 2 points per 30 min</li>
                          <li>Prayer/Meditation: 2 points per 30 min</li>
                          <li>Talking with Sponsor: 3 points per 30 min</li>
                          <li>Working with Sponsee: 4 points per 30 min (max 20)</li>
                          <li>AA Calls: 1 point each (no limit)</li>
                          <li>Variety of activities: 1-5 bonus points</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Timeframe Adjustments
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
                          <li>Consistency bonus for regular activity across weeks</li>
                          <li>Higher expectations for longer timeframes</li>
                          <li>Recent activity weighted more heavily</li>
                          <li>Score reflects sustained engagement over time</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          How Timeframes Affect Your Score
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Shorter timeframes (30 days) focus on recent activity, while 
                          longer timeframes (60-365 days) measure your consistent 
                          engagement over time. A high score over a 365-day period 
                          demonstrates sustained spiritual fitness.
                        </p>
                      </div>
                      
                      <div className="pt-2 text-center">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Maximum score is 100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
          }}>Recent Activities</h2>
          <button 
            style={{
              backgroundColor: darkMode ? '#2563eb' : '#3b82f6',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.7rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentView('history')}
          >
            View All
          </button>
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
    </div>
  );
}