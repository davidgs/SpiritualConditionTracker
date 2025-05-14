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
    ? [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    : [];

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          
          {/* Simple progress bar using HTML table */}
          <table style={{ width: '100%', height: '8px', borderCollapse: 'collapse', marginBottom: '4px' }}>
            <tbody>
              <tr>
                <td 
                  style={{ 
                    backgroundColor: darkMode ? '#dc2626' : '#ef4444', // Red
                    width: '30%',
                    height: '8px',
                    border: '1px solid #aaa',
                    padding: 0
                  }}
                >
                  {spiritualFitness <= 30 && (
                    <div style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                      width: `${(spiritualFitness / 30) * 100}%`,
                      height: '100%'
                    }}></div>
                  )}
                </td>
                <td 
                  style={{ 
                    backgroundColor: darkMode ? '#d97706' : '#f59e0b', // Yellow/Amber
                    width: '45%',
                    height: '8px',
                    border: '1px solid #aaa',
                    padding: 0
                  }}
                >
                  {spiritualFitness > 30 && spiritualFitness <= 75 && (
                    <div style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                      width: `${((spiritualFitness - 30) / 45) * 100}%`,
                      height: '100%'
                    }}></div>
                  )}
                </td>
                <td 
                  style={{ 
                    backgroundColor: darkMode ? '#16a34a' : '#22c55e', // Green
                    width: '25%',
                    height: '8px',
                    border: '1px solid #aaa',
                    padding: 0
                  }}
                >
                  {spiritualFitness > 75 && (
                    <div style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                      width: `${((spiritualFitness - 75) / 25) * 100}%`,
                      height: '100%'
                    }}></div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Score range indicators */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.65rem',
            color: darkMode ? '#9ca3af' : '#6b7280',
            marginBottom: '3px'
          }}>
            <span>0</span>
            <span style={{ marginLeft: '28%' }}>30</span>
            <span style={{ marginRight: '24%' }}>75</span>
            <span>100</span>
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
                    <li>AA Meeting: 5 points (speaker +3, shared +1)</li>
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
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
                <div className="icon-circle bg-blue-50 dark:bg-blue-900">
                  <i className={`fas ${getActivityIcon(activity.type)} icon text-blue-500 dark:text-blue-400`}></i>
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.duration ? `${activity.duration} minutes` : 'Completed'} 
                    {activity.notes ? ` - ${activity.notes}` : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{formatDate(activity.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No activities recorded yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Use the navigation to log a new activity</p>
          </div>
        )}
      </div>
      
      {/* No quick actions - they've been removed */}
    </div>
  );
}