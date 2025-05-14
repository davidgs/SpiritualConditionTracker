import React from 'react';
import { formatDateForDisplay, compareDatesForSorting } from '../utils/dateUtils';

export default function ActivityList({ 
  activities, 
  darkMode = false, 
  limit = null, 
  filter = 'all',
  showDate = true,
  maxDaysAgo = null,
  title = null
}) {
  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'prayer': return 'fa-pray';
      case 'meditation': return 'fa-om';
      case 'literature': return 'fa-book-open';
      case 'service': return 'fa-hands-helping';
      case 'sponsor': return 'fa-phone';
      case 'sponsee': return 'fa-user-friends';
      case 'aa_call': return 'fa-phone-alt';
      case 'call': return 'fa-phone';
      case 'meeting': return 'fa-users';
      case 'multiple': return 'fa-phone';
      default: return 'fa-check-circle';
    }
  };
  
  // Use the shared date formatting function from utils
  const formatDate = formatDateForDisplay;
  
  // Filter activities
  const today = new Date();
  // Create a new copy of the activities array to avoid mutation issues
  const filteredActivities = activities
    ? [...activities]
        // Filter to make sure we don't have duplicate IDs
        .filter((activity, index, self) => 
          index === self.findIndex(a => (a.id === activity.id))
        )
        // Filter by activity type if a filter is specified
        .filter(activity => filter === 'all' || activity.type === filter)
        // Filter by maximum days ago if specified
        .filter(activity => {
          if (!maxDaysAgo) return true;
          
          const activityDate = new Date(activity.date);
          const diffTime = Math.abs(today - activityDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= maxDaysAgo;
        })
        // Sort by date (newest first)
        .sort((a, b) => {
          // Explicit conversion to ensure we're comparing dates correctly
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          // Sort in descending order (newest first)
          return dateB - dateA;
        })
        // Limit the number of activities if specified
        .slice(0, limit || activities.length)
    : [];
    
  if (filteredActivities.length === 0) {
    return (
      <div style={{ 
        color: darkMode ? '#9ca3af' : '#6b7280', 
        textAlign: 'center',
        padding: '1rem',
        fontStyle: 'italic',
        fontSize: '0.875rem'
      }}>
        No activities to display.
      </div>
    );
  }
  
  // Group activities by date
  const groupByDate = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      // Debug log to see what dates we're working with
      console.log('Grouping activity with date:', activity.date, 'Type:', typeof activity.date);
      
      let dateKey;
      
      // First check if the date is already in YYYY-MM-DD format
      if (activity.date && activity.date.length === 10 && activity.date.includes('-')) {
        // Already in YYYY-MM-DD format, use it directly
        dateKey = activity.date;
        console.log('Using direct YYYY-MM-DD dateKey:', dateKey);
      } else {
        // Handle ISO format or any other format
        // Get the date portion only in YYYY-MM-DD format
        const dateObj = new Date(activity.date);
        console.log('Date object created:', dateObj);
        
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date object for:', activity.date);
          // Skip this activity if date is invalid
          return;
        }
        
        // Extract only the date part (YYYY-MM-DD) in browser's local timezone
        // This ensures the date shown matches the user's calendar day
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
        console.log('Generated dateKey from object:', dateKey);
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(activity);
    });
    
    // Sort the dates (newest first)
    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      return new Date(b) - new Date(a);
    });
    
    // Return the grouped result with dates in order
    return { groups, sortedDateKeys };
  };
  
  // Get grouped activities
  const { groups, sortedDateKeys } = groupByDate(filteredActivities);
  
  return (
    <div className="activity-container content-scrollable" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {title && (
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
          }}>{title}</h2>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedDateKeys.map(dateKey => (
          <div key={dateKey}>
            {/* Date header */}
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: darkMode ? '#9ca3af' : '#6b7280',
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
            }}>
              {formatDate(dateKey)}
            </div>
            
            {/* Activities for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groups[dateKey].map((activity, index) => (
                <div key={activity.id || `${activity.date}-${activity.type}-${index}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: darkMode ? '1px solid #374151' : '1px solid #f3f4f6',
                  paddingBottom: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.5rem',
                    flexShrink: 0
                  }}>
                    <i className={`fas ${getActivityIcon(activity.type)}`} style={{
                      fontSize: '0.8rem',
                      color: darkMode ? '#60a5fa' : '#3b82f6'
                    }}></i>
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      color: darkMode ? '#e5e7eb' : '#374151',
                      lineHeight: '1.2',
                      marginBottom: '0.1rem'
                    }}>
                      {/* For call types, show the appropriate label */}
                      {activity.type === 'call' 
                        ? 'Call' 
                        : activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      
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
                      
                      {/* Add pills for call types */}
                      {activity.type === 'call' && (
                        <div style={{ display: 'flex', marginLeft: '6px', gap: '4px' }}>
                          {activity.isSponsorCall && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: darkMode ? '#065f46' : '#d1fae5',
                              color: darkMode ? '#10b981' : '#047857',
                              fontWeight: 'bold'
                            }}>Sponsor</span>
                          )}
                          {activity.isSponseeCall && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
                              color: darkMode ? '#60a5fa' : '#1e40af',
                              fontWeight: 'bold'
                            }}>Sponsee</span>
                          )}
                          {activity.isAAMemberCall && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: darkMode ? '#7e22ce' : '#f3e8ff',
                              color: darkMode ? '#c084fc' : '#7e22ce',
                              fontWeight: 'bold'
                            }}>AA Member</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      lineHeight: '1.2'
                    }}>
                      <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '0.5rem'
                      }}>
                        {activity.duration ? `${activity.duration} min` : 'Done'} 
                        {activity.meetingName ? ` - ${activity.meetingName}` : ''}
                        {activity.literatureTitle ? ` - ${activity.literatureTitle}` : ''}
                        {activity.notes && !activity.meetingName && !activity.literatureTitle ? ` - ${activity.notes}` : ''}
                      </div>
                      {showDate && (
                        <div style={{ flexShrink: 0, fontSize: '0.7rem' }}>
                          {formatDate(activity.date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}