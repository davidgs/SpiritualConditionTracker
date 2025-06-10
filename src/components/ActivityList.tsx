import React from 'react';
import { formatDateForDisplay, compareDatesForSorting } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';
import { useAppData } from '../contexts/AppDataContext';

export default function ActivityList({ 
  activities, 
  darkMode = false, 
  limit = null, 
  filter = 'all',
  showDate = true,
  maxDaysAgo = null,
  title = null,
  onActivityClick = null,
  meetings = []
}) {

  const theme = useTheme();
  const { deleteActivity } = useAppData();

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(activityId);
    }
  };
  
  // Helper function to get meeting name for an activity
  const getMeetingName = (activity) => {
    if (activity.type !== 'meeting') return null;
    
    // If activity has a direct meeting name, use it
    if (activity.meetingName && activity.meetingName.trim()) {
      return activity.meetingName.trim();
    }
    
    // If activity has a meetingId, look up the meeting name
    if (activity.meetingId && meetings && meetings.length > 0) {
      // Handle both string and number meetingId values
      const meetingIdNum = typeof activity.meetingId === 'string' ? parseInt(activity.meetingId, 10) : activity.meetingId;
      const meeting = meetings.find(m => m.id === meetingIdNum);
      if (meeting && meeting.name && meeting.name.trim()) {
        return meeting.name.trim();
      }
    }
    
    // If activity has a generic name field, use it
    if (activity.name && activity.name.trim()) {
      return activity.name.trim();
    }
    
    return null;
  };
  
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
      case 'action-item': return 'fa-tasks';
      default: return 'fa-check-circle';
    }
  };

  // Get color scheme for activity type
  const getActivityColor = (type) => {
    console.log('🚨 ACTIVITY COLOR FUNCTION CALLED FOR TYPE:', type);
    switch (type) {
      case 'prayer': 
        return {
          background: '#e8f5e8', // Light green
          icon: '#2e7d32',       // Dark green
          backgroundDark: '#1b5e20',
          iconDark: '#4caf50'
        };
      case 'meditation': 
        return {
          background: '#f3e5f5', // Light purple
          icon: '#7b1fa2',       // Dark purple
          backgroundDark: '#4a148c',
          iconDark: '#ba68c8'
        };
      case 'literature': 
        return {
          background: '#fff3e0', // Light orange
          icon: '#ef6c00',       // Dark orange
          backgroundDark: '#e65100',
          iconDark: '#ff9800'
        };
      case 'service': 
        return {
          background: '#e1f5fe', // Light cyan
          icon: '#0277bd',       // Dark cyan
          backgroundDark: '#01579b',
          iconDark: '#29b6f6'
        };
      case 'sponsor':
      case 'sponsor-contact': 
        return {
          background: '#f1f8e9', // Light light-green
          icon: '#558b2f',       // Dark light-green
          backgroundDark: '#33691e',
          iconDark: '#8bc34a'
        };
      case 'sponsee': 
        return {
          background: '#e8eaf6', // Light indigo
          icon: '#3f51b5',       // Dark indigo
          backgroundDark: '#283593',
          iconDark: '#7986cb'
        };
      case 'aa_call':
      case 'call':
      case 'multiple': 
        return {
          background: '#fce4ec', // Light pink
          icon: '#c2185b',       // Dark pink
          backgroundDark: '#880e4f',
          iconDark: '#f06292'
        };
      case 'meeting': 
        return {
          background: '#e3f2fd', // Light blue
          icon: '#1976d2',       // Dark blue
          backgroundDark: '#0d47a1',
          iconDark: '#42a5f5'
        };
      case 'action-item': 
        return {
          background: '#fff8e1', // Light amber
          icon: '#f57c00',       // Dark amber
          backgroundDark: '#ff6f00',
          iconDark: '#ffb300'
        };
      default: 
        return {
          background: '#f5f5f5', // Light grey
          icon: '#616161',       // Dark grey
          backgroundDark: '#424242',
          iconDark: '#bdbdbd'
        };
    }
  };
  
  // Use the shared date formatting function from utils
  const formatDate = formatDateForDisplay;
  
  // Filter activities
  const today = new Date();
  
  console.log('[ ActivityList.js: 39 ] Total activities received:', activities?.length || 0);
 // console.log('[ ActivityList.js: 40 ] Filter params - limit:', limit, 'filter:', filter, 'maxDaysAgo:', maxDaysAgo);
  
  // Create a new copy of the activities array to avoid mutation issues
  const filteredActivities = activities
    ? [...activities]
        // Filter to make sure we don't have duplicate IDs
        .filter((activity, index, self) => {
          const isDuplicate = index !== self.findIndex(a => (a.id === activity.id));
          if (isDuplicate) {
           // console.log('[ ActivityList.js: 49 ] Removing duplicate activity with ID:', activity.id);
          }
          return !isDuplicate;
        })
        // Filter by activity type if a filter is specified
        .filter(activity => {
          const typeMatch = filter === 'all' || activity.type === filter;
          if (!typeMatch) {
          //  console.log('[ ActivityList.js: 57 ] Filtering out activity type:', activity.type, 'filter:', filter);
          }
          return typeMatch;
        })
        // Filter out only uncompleted action items (regular activities should always show)
        .filter(activity => {
          // Only filter action items that aren't completed
          if (activity.type === 'action-item' && activity.location !== 'completed') {
           // console.log('[ ActivityList.js: 65 ] Filtering out uncompleted action item:', activity.id);
            return false;
          }
          // All other activities (prayer, meetings, etc.) should always be shown
          return true;
        })
        // Filter by maximum days ago if specified
        .filter(activity => {
          if (!maxDaysAgo) return true;
          
          const activityDate = new Date(activity.date);
          const diffTime = Math.abs(today.getTime() - activityDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const withinTimeframe = diffDays <= maxDaysAgo;
          
          if (!withinTimeframe) {
           // console.log('[ ActivityList.js: 81 ] Filtering out activity outside timeframe - days ago:', diffDays, 'max:', maxDaysAgo);
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
    //  console.log('[ ActivityList.js: 120 ] Grouping activity with date:', activity.date, 'Type:', typeof activity.date);
      
      let dateKey;
      
      // First check if the date is already in YYYY-MM-DD format
      if (activity.date && activity.date.length === 10 && activity.date.includes('-')) {
        // Already in YYYY-MM-DD format, use it directly
        dateKey = activity.date;
      //  console.log('[ ActivityList.js: 128 ] Using direct YYYY-MM-DD dateKey:', dateKey);
      } else {
        // Handle ISO format or any other format
        // Get the date portion only in YYYY-MM-DD format
        const dateObj = new Date(activity.date);
      //  console.log('[ ActivityList.js: 133 ] Date object created:', dateObj);
        
        if (isNaN(dateObj.getTime())) {
         // console.error('[ ActivityList.js: 136 ] Invalid date object for:', activity.date);
          // Skip this activity if date is invalid
          return;
        }
        
        // Extract only the date part (YYYY-MM-DD) in browser's local timezone
        // This ensures the date shown matches the user's calendar day
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      //  console.log('[ ActivityList.js: 147 ] Generated dateKey from object:', dateKey);
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
                <div 
                  key={activity.id || `${activity.date}-${activity.type}-${index}`} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    paddingBottom: '0.5rem',
                    marginBottom: '0.25rem',
                    cursor: (activity.type === 'sponsor-contact' || activity.type === 'action-item') ? 'pointer' : 'default',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activity.type === 'sponsor-contact' || activity.type === 'action-item') {
                      e.currentTarget.style.backgroundColor = theme.palette.action.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activity.type === 'sponsor-contact' || activity.type === 'action-item') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => {
                    if (activity.type === 'sponsor-contact' && onActivityClick) {
                      onActivityClick(activity, 'sponsor-contact');
                    } else if (activity.type === 'action-item' && onActivityClick) {
                      onActivityClick(activity, 'action-item');
                    }
                  }}
                >
                  <div 
                    className={`${activity.type}-icon`}
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.5rem',
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      marginTop: '2px'
                    }}
                  >
                    <i className={`fas ${getActivityIcon(activity.type)}`} style={{
                      fontSize: '0.8rem',
                      color: (() => {
                        const colors = getActivityColor(activity.type);
                        return darkMode ? colors.iconDark : colors.icon;
                      })()
                    }}></i>
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      color: activity.type === 'action-item' && activity.location === 'deleted' 
                        ? theme.palette.error.main 
                        : theme.palette.text.primary,
                      lineHeight: '1.2',
                      marginBottom: '0.1rem',
                      textDecoration: activity.type === 'action-item' && activity.location === 'deleted' 
                        ? 'line-through' 
                        : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        {/* For call types, show the appropriate label */}
                        {activity.type === 'call' 
                          ? 'Call'
                          : activity.type === 'action-item'
                          ? 'Action Item'
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
                      
                      {/* Delete button aligned with top line */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteActivity(activity.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.palette.error.main,
                          cursor: 'pointer',
                          padding: '6px',
                          fontSize: '0.9rem',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          lineHeight: '1',
                          transition: 'background-color 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.palette.error.light + '20';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Delete activity"
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      fontSize: '0.75rem',
                      color: activity.type === 'action-item' && activity.location === 'deleted' 
                        ? theme.palette.error.main 
                        : theme.palette.text.secondary,
                      lineHeight: '1.2',
                      textDecoration: activity.type === 'action-item' && activity.location === 'deleted' 
                        ? 'line-through' 
                        : 'none'
                    }}>
                      <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '0.5rem',
                        flexGrow: 1
                      }}>
                        {activity.type === 'action-item' ? (
                          // Show action item text/title
                          <span>
                            {activity.text || activity.title || 'Action Item'}
                            {activity.location === 'completed' && (
                              <span style={{ color: theme.palette.success.main, marginLeft: '8px' }}>
                                <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i>
                                Completed
                              </span>
                            )}
                            {activity.location === 'deleted' && (
                              <span style={{ color: theme.palette.error.main, marginLeft: '8px' }}>
                                <i className="fas fa-trash" style={{ marginRight: '4px' }}></i>
                                Deleted
                              </span>
                            )}
                          </span>
                        ) : (
                          // Regular activity display
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>
                              {activity.duration ? `${activity.duration} min` : 'Done'} 
                              {(() => {
                                const meetingName = getMeetingName(activity);
                                if (meetingName) return ` - ${meetingName}`;
                                if (activity.literatureTitle) return ` - ${activity.literatureTitle}`;
                                if (activity.notes && !meetingName && !activity.literatureTitle) return ` - ${activity.notes}`;
                                return '';
                              })()}
                            </span>
                            

                          </div>
                        )}
                      </div>
                      
                      {/* Date aligned with bottom line */}
                      {showDate && (
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: theme.palette.text.secondary,
                          textAlign: 'right',
                          lineHeight: '1.2',
                          flexShrink: 0
                        }}>
                          {formatDate(activity.date)}
                        </div>
                      )}
                      
                      {/* Action buttons for action items */}
                      {activity.type === 'action-item' && activity.location === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onActivityClick) {
                                onActivityClick(activity, 'complete');
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.palette.success.main,
                              cursor: 'pointer',
                              padding: '2px',
                              fontSize: '0.8rem'
                            }}
                            title="Mark as completed"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onActivityClick) {
                                onActivityClick(activity, 'delete');
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.palette.error.main,
                              cursor: 'pointer',
                              padding: '2px',
                              fontSize: '0.8rem'
                            }}
                            title="Delete action item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}