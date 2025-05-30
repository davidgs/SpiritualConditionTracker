import React from 'react';
import { formatDateForDisplay, compareDatesForSorting } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';

export default function ActivityList({ 
  activities, 
  darkMode = false, 
  limit = null, 
  filter = 'all',
  showDate = true,
  maxDaysAgo = null,
  title = null
}) {
  const theme = useTheme();
  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'prayer': return 'fa-pray';
      case 'meditation': return 'fa-om';
      case 'literature': return 'fa-book-open';
      case 'service': return 'fa-hands-helping';
      case 'sponsor': return 'fa-phone';
      case 'sponsor-contact': return 'fa-user-tie';
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
  
  console.log('[ ActivityList.js ] Total activities received:', activities?.length || 0);
  console.log('[ ActivityList.js ] Filter params - limit:', limit, 'filter:', filter, 'maxDaysAgo:', maxDaysAgo);
  
  // Create a new copy of the activities array to avoid mutation issues
  const filteredActivities = activities
    ? [...activities]
        // Filter to make sure we don't have duplicate IDs
        .filter((activity, index, self) => {
          const isDuplicate = index !== self.findIndex(a => (a.id === activity.id));
          if (isDuplicate) {
            console.log('[ ActivityList.js ] Removing duplicate activity with ID:', activity.id);
          }
          return !isDuplicate;
        })
        // Filter by activity type if a filter is specified
        .filter(activity => {
          const typeMatch = filter === 'all' || activity.type === filter;
          if (!typeMatch) {
            console.log('[ ActivityList.js ] Filtering out activity type:', activity.type, 'filter:', filter);
          }
          return typeMatch;
        })
        // Filter by maximum days ago if specified
        .filter(activity => {
          if (!maxDaysAgo) return true;
          
          const activityDate = new Date(activity.date);
          const diffTime = Math.abs(today.getTime() - activityDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const withinTimeframe = diffDays <= maxDaysAgo;
          
          if (!withinTimeframe) {
            console.log('[ ActivityList.js ] Filtering out activity outside timeframe - days ago:', diffDays, 'max:', maxDaysAgo);
          }
          
          return withinTimeframe;
        })
        // Sort by date (newest first)
        .sort((a, b) => {
          // Explicit conversion to ensure we're comparing dates correctly
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          // Sort in descending order (newest first)
          return dateB.getTime() - dateA.getTime();
        })
        // Limit the number of activities if specified
        .slice(0, limit || activities.length)
    : [];
    
  console.log('[ ActivityList.js ] Final filtered activities count:', filteredActivities.length);
    
  if (filteredActivities.length === 0) {
    return (
      <div style={{ 
        color: theme.palette.text.secondary, 
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
      console.log('[ ActivityList.js ] Grouping activity with date:', activity.date, 'Type:', typeof activity.date);
      
      let dateKey;
      
      // First check if the date is already in YYYY-MM-DD format
      if (activity.date && activity.date.length === 10 && activity.date.includes('-')) {
        // Already in YYYY-MM-DD format, use it directly
        dateKey = activity.date;
        console.log('[ ActivityList.js ] Using direct YYYY-MM-DD dateKey:', dateKey);
      } else {
        // Handle ISO format or any other format
        // Get the date portion only in YYYY-MM-DD format
        const dateObj = new Date(activity.date);
        console.log('[ ActivityList.js ] Date object created:', dateObj);
        
        if (isNaN(dateObj.getTime())) {
          console.error('[ ActivityList.js ] Invalid date object for:', activity.date);
          // Skip this activity if date is invalid
          return;
        }
        
        // Extract only the date part (YYYY-MM-DD) in browser's local timezone
        // This ensures the date shown matches the user's calendar day
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
        console.log('[ ActivityList.js ] Generated dateKey from object:', dateKey);
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(activity);
    });
    
    // Sort the dates (newest first)
    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    // Return the grouped result with dates in order
    return { groups, sortedDateKeys };
  };
  
  // Get grouped activities
  const { groups, sortedDateKeys } = groupByDate(filteredActivities);
  
  return (
    <div className="activity-list-container" style={{ height: 'auto', minHeight: '100px' }}>
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
            color: theme.palette.text.primary
          }}>{title}</h2>
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        height: 'auto'
      }}>
        {sortedDateKeys.map(dateKey => (
          <div key={dateKey}>
            {/* Date header */}
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              {formatDate(dateKey)}
            </div>
            
            {/* Activities for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groups[dateKey].map((activity, index) => (
                <div key={activity.id || `${activity.date}-${activity.type}-${index}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  paddingBottom: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.5rem',
                    flexShrink: 0
                  }}>
                    <i className={`fas ${getActivityIcon(activity.type)}`} style={{
                      fontSize: '0.8rem',
                      color: theme.palette.primary.main
                    }}></i>
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      color: theme.palette.text.primary,
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
                              backgroundColor: theme.palette.success.light,
                              color: theme.palette.success.dark,
                              fontWeight: 'bold'
                            }}>Chair</span>
                          )}
                          {activity.wasShare && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: theme.palette.info.light,
                              color: theme.palette.info.dark,
                              fontWeight: 'bold'
                            }}>Share</span>
                          )}
                          {activity.wasSpeaker && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: theme.palette.secondary.light,
                              color: theme.palette.secondary.dark,
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
                              backgroundColor: theme.palette.success.light,
                              color: theme.palette.success.dark,
                              fontWeight: 'bold'
                            }}>Sponsor</span>
                          )}
                          {activity.isSponseeCall && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: theme.palette.info.light,
                              color: theme.palette.info.dark,
                              fontWeight: 'bold'
                            }}>Sponsee</span>
                          )}
                          {activity.isAAMemberCall && (
                            <span style={{
                              fontSize: '0.6rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: theme.palette.secondary.light,
                              color: theme.palette.secondary.dark,
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
                      color: theme.palette.text.secondary,
                      lineHeight: '1.2'
                    }}>
                      <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '0.5rem'
                      }}>
                        {activity.duration ? `${activity.duration} min` : 
                         activity.type === 'action-item' && activity.location === 'completed' ? 
                         <span style={{ color: darkMode ? '#10b981' : '#047857' }}>
                           <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i>
                           Completed
                         </span> : 'Done'} 
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