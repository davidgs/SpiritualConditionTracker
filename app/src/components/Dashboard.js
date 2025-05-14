import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/logo-small.png';

export default function Dashboard({ setCurrentView, user, activities, spiritualFitness }) {
  // Simplify dark mode detection for now
  const darkMode = document.documentElement.classList.contains('dark');
  
  // State for controlling popover visibility
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Format score to 2 decimal places for display
  const formattedScore = spiritualFitness > 0 ? spiritualFitness.toFixed(2) : '0';
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score < 30) return darkMode ? '#ef4444' : '#dc2626'; // Red
    if (score < 75) return darkMode ? '#f59e0b' : '#d97706'; // Yellow/Amber
    return darkMode ? '#22c55e' : '#16a34a'; // Green
  };
  
  // Calculate progress percentage, capped at 100%
  const progressPercent = Math.min(spiritualFitness, 100);
  
  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef, buttonRef]);
  // Get recent activities (last 5)
  const recentActivities = activities
    ? [...activities].sort((a, b) => {
        // For YYYY-MM-DD format, we can sort directly as strings
        if (a.date.length === 10 && a.date.includes('-') &&
            b.date.length === 10 && b.date.includes('-')) {
          return b.date.localeCompare(a.date); // Sort in descending order
        }
        // Fallback to date object comparison
        return new Date(b.date) - new Date(a.date);
      }).slice(0, 5)
    : [];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    
    // If the date is in YYYY-MM-DD format without time
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      // Use UTC to avoid timezone issues
      return new Date(Date.UTC(year, month - 1, day))
        .toLocaleDateString(undefined, options);
    } else {
      // Fallback for other date formats
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  };

  // Format number with thousands separator
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'prayer': return 'fa-pray';
      case 'meditation': return 'fa-om';
      case 'literature': return 'fa-book-open';
      case 'service': return 'fa-hands-helping';
      case 'sponsee': return 'fa-user-friends';
      case 'meeting': return 'fa-users';
      default: return 'fa-check-circle';
    }
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
    <div className="p-3 pb-16 max-w-md mx-auto">
      {/* Centered logo at the top with forceful inline styles */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2px'
        }}>
          {/* Use static path to logo instead of import */}
          <img 
            src="/app/assets/logo.png"
            alt="App Logo" 
            style={{ 
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              borderRadius: '12px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          />
        </div>
        <h1 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 'bold', 
          color: darkMode ? '#f3f4f6' : '#1f2937',
          marginBottom: '0px',
          lineHeight: '1.1'
        }}>
          Recovery Tracker
        </h1>
        <p style={{ 
          fontSize: '0.8rem', 
          color: darkMode ? '#9ca3af' : '#6b7280',
          lineHeight: '1.1'
        }}>
          Track your spiritual journey
        </p>
      </div>
      
      {/* Sobriety & Spiritual Fitness Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: '0.5rem',
          padding: '0.5rem',
          textAlign: 'left',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: darkMode ? '#d1d5db' : '#374151',
            marginBottom: '0.5rem',
            textAlign: 'left'
          }}>Sobriety</h3>
          
          {showYearsProminent ? (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
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
                lineHeight: '1.1'
              }}>
                {formatNumber(sobrietyDays)} days
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
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
                lineHeight: '1.1'
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
              color: getScoreColor(spiritualFitness),
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
              width: `${100 - Math.min(spiritualFitness, 100)}%`
            }}></div>
          </div>
          
          <div style={{ 
            fontSize: '0.7rem',
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}>30-day score</div>
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
              onClick={() => setShowPopover(!showPopover)}
            >
              How is this calculated?
            </button>
            
            {showPopover && (
              <div 
                ref={popoverRef}
                className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-3 text-left"
                style={{ 
                  // Add a triangle pointer at the bottom
                  filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1))',
                }}
              >
                <div className="relative">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Spiritual Fitness Score (0-100)</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Your score is calculated based on activities from the past 30 days:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4 space-y-1 mb-2">
                    <li>AA Meeting: 5 points (speaker +3, shared +1, chair +1)</li>
                    <li>Reading Literature: 2 points per 30 min</li>
                    <li>Prayer/Meditation: 2 points per 30 min</li>
                    <li>Talking with Sponsor: 3 points per 30 min</li>
                    <li>Working with Sponsee: 4 points per 30 min (max 20)</li>
                    <li>AA Calls: 1 point each (no limit)</li>
                  </ul>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Variety of activities earns bonus points.
                  </p>
                  
                  {/* Triangle pointer */}
                  <div 
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700"
                  ></div>
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
          marginBottom: '0.75rem'
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
        
        {recentActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {recentActivities.map(activity => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: darkMode ? '1px solid #374151' : '1px solid #f3f4f6',
                paddingBottom: '0.25rem',
                marginBottom: '0.25rem'
              }}>
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem'
                }}>
                  <i className={`fas ${getActivityIcon(activity.type)}`} style={{
                    fontSize: '0.7rem',
                    color: darkMode ? '#60a5fa' : '#3b82f6'
                  }}></i>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    color: darkMode ? '#e5e7eb' : '#374151',
                    lineHeight: '1.1',
                    marginBottom: '0.1rem'
                  }}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    
                    {/* Add role pills for meetings */}
                    {activity.type === 'meeting' && (
                      <div style={{ display: 'flex', marginLeft: '6px', gap: '4px' }}>
                        {activity.wasChair && (
                          <span style={{
                            fontSize: '0.6rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            backgroundColor: darkMode ? '#065f46' : '#d1fae5',
                            color: darkMode ? '#10b981' : '#047857',
                            fontWeight: 'bold'
                          }}>Chair</span>
                        )}
                        {activity.wasShare && (
                          <span style={{
                            fontSize: '0.6rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
                            color: darkMode ? '#60a5fa' : '#1e40af',
                            fontWeight: 'bold'
                          }}>Share</span>
                        )}
                        {activity.wasSpeaker && (
                          <span style={{
                            fontSize: '0.6rem',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            backgroundColor: darkMode ? '#7e22ce' : '#f3e8ff',
                            color: darkMode ? '#c084fc' : '#7e22ce',
                            fontWeight: 'bold'
                          }}>Speaker</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    lineHeight: '1.1'
                  }}>
                    {activity.duration ? `${activity.duration} min` : 'Done'} 
                    {activity.meetingName ? ` - ${activity.meetingName}` : ''}
                    {activity.literatureTitle ? ` - ${activity.literatureTitle}` : ''}
                    {activity.notes && !activity.meetingName && !activity.literatureTitle ? ` - ${activity.notes}` : ''}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: darkMode ? '#6b7280' : '#9ca3af'
                }}>{formatDate(activity.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: darkMode ? '#374151' : '#f9fafb',
            borderRadius: '0.375rem'
          }}>
            <p style={{
              fontSize: '0.8rem',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>No activities recorded yet</p>
            <p style={{
              fontSize: '0.7rem',
              color: darkMode ? '#6b7280' : '#9ca3af',
              marginTop: '0.25rem'
            }}>Use the navigation to log a new activity</p>
          </div>
        )}
      </div>
      
      {/* No quick actions - they've been removed */}
    </div>
  );
}