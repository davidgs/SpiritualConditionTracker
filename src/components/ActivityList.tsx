import React from 'react';
import { formatDateForDisplay, compareDatesForSorting } from '../utils/dateUtils';
import { useTheme } from '@mui/material/styles';
import { useAppData } from '../contexts/AppDataContext';
import ActionItem from './shared/ActionItem';
import DatabaseService from '../services/DatabaseService';

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
  const { deleteActivity, updateActionItem, deleteActionItem } = useAppData();
  
  // Force re-render when activities prop changes, especially for action items
  const [renderKey, setRenderKey] = React.useState(0);
  const [sponsorContacts, setSponsorContacts] = React.useState([]);
  const [sponseeContacts, setSponseeContacts] = React.useState([]);

  // Load sponsor and sponsee contacts for name lookup
  React.useEffect(() => {
    const loadContacts = async () => {
      try {
        const databaseService = DatabaseService.getInstance();
        const sponsors = await databaseService.getAllSponsors(); // Get actual sponsors, not contacts
        setSponsorContacts(sponsors);
        
        // Handle sponsee contacts if method exists
        try {
          if (typeof databaseService.getAllSponseeContacts === 'function') {
            const sponsees = await databaseService.getAllSponseeContacts();
            setSponseeContacts(sponsees);
          } else {
            setSponseeContacts([]);
          }
        } catch (sponseeError) {
          console.warn('Sponsee contacts not available:', sponseeError);
          setSponseeContacts([]);
        }
      } catch (error) {
        console.error('Failed to load contacts for name lookup:', error);
      }
    };
    loadContacts();
  }, []);
  
  React.useEffect(() => {
    const actionItems = activities.filter(a => a.type === 'sponsor_action_item' || a.type === 'action-item');
    // Force component re-render to ensure synchronization
    setRenderKey(prev => prev + 1);
  }, [activities]);

  // Helper function to get sponsor name - use first sponsor since sponsorContact links are broken
  const getSponsorName = () => {
    if (sponsorContacts && sponsorContacts.length > 0) {
      const sponsor = sponsorContacts[0]; // Use first sponsor from sponsors table
      return `${sponsor.name || ''} ${sponsor.lastName || ''}`.trim() || 'Sponsor';
    }
    return 'Sponsor';
  };

  // Helper function to get sponsee name from sponsee contact
  const getSponseeeName = (sponseeContactId) => {
    const sponsee = sponseeContacts.find(s => s.id === sponseeContactId);
    if (sponsee) {
      return `${sponsee.name || ''} ${sponsee.lastName || ''}`.trim() || 'Sponsee';
    }
    return 'Sponsee';
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(activityId);
    }
  };

  const handleToggleActionItemComplete = async (actionItemId) => {
    try {
      console.log('[ActivityList] Toggling completion for action item ID:', actionItemId);
      
      // Find the activity that references this action item
      const activity = activities.find(a => 
        a.actionItemId === actionItemId || 
        (a.type === 'sponsor_action_item' && a.actionItemId === actionItemId) ||
        (a.type === 'sponsee_action_item' && a.actionItemId === actionItemId)
      );
      
      if (activity) {
        // Get current completion status - check multiple possible locations
        let currentCompleted = 0;
        if (activity.actionItemData && typeof activity.actionItemData.completed !== 'undefined') {
          currentCompleted = activity.actionItemData.completed;
        } else if (typeof activity.completed !== 'undefined') {
          currentCompleted = activity.completed;
        }
        
        const newCompleted = currentCompleted ? 0 : 1;
        
        console.log('[ActivityList] Current completed status:', currentCompleted, '-> New status:', newCompleted);
        
        await updateActionItem(actionItemId, { 
          completed: newCompleted,
          updatedAt: new Date().toISOString()
        });
        
        console.log('[ActivityList] Action item updated successfully');
        
        // Force a re-render to reflect the changes
        setRenderKey(prev => prev + 1);
      } else {
        console.error('[ActivityList] Action item not found in activities:', actionItemId);
        console.log('[ActivityList] Available activities:', activities.map(a => ({ 
          id: a.id, 
          type: a.type, 
          actionItemId: a.actionItemId 
        })));
      }
    } catch (error) {
      console.error('[ActivityList] Failed to toggle action item completion:', error);
    }
  };

  const handleDeleteActionItem = async (actionItemId) => {
    if (window.confirm('Are you sure you want to delete this action item?')) {
      try {
        // Use soft delete (set deleted: 1) instead of hard delete
        await updateActionItem(actionItemId, {
          deleted: 1,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to delete action item:', error);
      }
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

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    const iconMap = {
      'prayer': 'fa-praying-hands',
      'meditation': 'fa-om',
      'literature': 'fa-book-open',
      'meeting': 'fa-users',
      'service': 'fa-hands-helping',
      'call': 'fa-phone',
      'sponsor-contact': 'fa-user-tie',
      'sponsee-contact': 'fa-user-friends',
      'action-item': 'fa-tasks',
      'todo': 'fa-check-square'
    };
    return iconMap[type] || 'fa-circle';
  };

  // Helper function to get activity colors
  const getActivityColor = (type) => {
    const colorMap = {
      'prayer': { bg: '#e8f5e8', icon: '#2e7d2e', iconDark: '#4caf50' },
      'meditation': { bg: '#f3e5f5', icon: '#6a1b9a', iconDark: '#9c27b0' },
      'literature': { bg: '#fff3e0', icon: '#e65100', iconDark: '#ff9800' },
      'meeting': { bg: '#e3f2fd', icon: '#1565c0', iconDark: '#2196f3' },
      'service': { bg: '#e0f2f1', icon: '#00695c', iconDark: '#009688' },
      'call': { bg: '#fce4ec', icon: '#ad1457', iconDark: '#e91e63' },
      'sponsor-contact': { bg: '#f1f8e9', icon: '#33691e', iconDark: '#8bc34a' },
      'sponsee-contact': { bg: '#e8eaf6', icon: '#283593', iconDark: '#3f51b5' },
      'action-item': { bg: '#fff8e1', icon: '#ff8f00', iconDark: '#ffc107' },
      'todo': { bg: '#e0f7fa', icon: '#00838f', iconDark: '#00bcd4' }
    };
    return colorMap[type] || { bg: '#f5f5f5', icon: '#757575', iconDark: '#9e9e9e' };
  };

  // Helper function to format activity text
  const formatActivityText = (activity) => {
    if (activity.type === 'meeting') {
      const meetingName = getMeetingName(activity);
      if (meetingName) {
        return meetingName;
      }
      return 'Meeting';
    }
    
    if (activity.type === 'sponsor-contact') {
      const contactName = activity.sponsorName || activity.name || 'Sponsor';
      return `Contact with ${contactName}`;
    }
    
    if (activity.type === 'sponsee-contact') {
      const contactName = activity.sponseeName || activity.name || 'Sponsee';
      return `Contact with ${contactName}`;
    }
    
    if (activity.type === 'action-item' || activity.type === 'sponsor_action_item') {
      const baseTitle = activity.title || activity.text || 'Action Item';
      
      console.log('[ActivityList] Processing action item with data:', {
        baseTitle,
        type: activity.type,
        hasActionItemData: !!activity.actionItemData,
        sponsorContactId: activity.actionItemData?.sponsorContactId,
        enrichedSponsorName: activity.actionItemData?.sponsorName,
        availableSponsors: sponsorContacts.length,
        fullActivity: activity
      });
      
      // Show sponsor name if this is a sponsor action item
      if (activity.actionItemData && activity.actionItemData.sponsorContactId) {
        const sponsorName = getSponsorName();
        console.log('[ActivityList] Adding sponsor name to title:', sponsorName);
        return `${baseTitle} (from ${sponsorName})`;
      }
      
      // Also check for enriched sponsor name from context
      if (activity.actionItemData && activity.actionItemData.sponsorName) {
        console.log('[ActivityList] Using enriched sponsor name:', activity.actionItemData.sponsorName);
        return `${baseTitle} (from ${activity.actionItemData.sponsorName})`;
      }
      
      console.log('[ActivityList] No sponsor name found, returning base title');
      return baseTitle;
    }
    
    if (activity.type === 'sponsee_action_item') {
      const baseTitle = activity.title || activity.text || 'Action Item';
      // Show sponsee name if available through actionItemData
      if (activity.actionItemData && activity.actionItemData.sponseeContactId) {
        const sponseeName = getSponseeeName(activity.actionItemData.sponseeContactId);
        return `${baseTitle} (for ${sponseeName})`;
      }
      return baseTitle;
    }
    
    if (activity.type === 'todo') {
      return activity.title || activity.text || 'Todo Item';
    }
    
    // For other activity types, use duration if available
    if (activity.duration && activity.duration > 0) {
      const hours = Math.floor(activity.duration / 60);
      const minutes = activity.duration % 60;
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
      return durationText;
    }
    
    // Fallback to activity type name
    return activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
  };

  // Helper function to format activity subtitle
  const formatActivitySubtitle = (activity) => {
    if (activity.notes && activity.notes.trim()) {
      return activity.notes.trim();
    }
    
    if (activity.type === 'meeting') {
      const meetingName = getMeetingName(activity);
      if (meetingName && (activity.duration && activity.duration > 0)) {
        const hours = Math.floor(activity.duration / 60);
        const minutes = activity.duration % 60;
        const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
        return durationText;
      }
    }
    
    return null;
  };

  // Helper function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return formatDateForDisplay(dateString);
    }
  };

  // Helper function to group activities by date
  const groupByDate = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      const dateKey = activity.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    // Sort dates in descending order (most recent first)
    const sortedDateKeys = Object.keys(groups).sort((a, b) => {
      // Convert date strings to Date objects for proper comparison
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
    
    return { groups, sortedDateKeys };
  };

  // Filter activities based on the provided filter and date range
  const filteredActivities = Array.isArray(activities) 
    ? activities
        .filter(activity => {
          // Include sponsor action items in the activity log (user gets credit for completing these)
          if (activity.type === 'sponsor_action_item') {
            return true;
          }
          
          // Filter out regular action items and sponsee action items from general activity log
          if (activity.type === 'action-item' || activity.type === 'sponsee_action_item') {
            return false;
          }
          
          // Filter by type
          if (filter !== 'all' && activity.type !== filter) {
            return false;
          }
          
          // Filter by date range if maxDaysAgo is specified
          if (maxDaysAgo !== null) {
            const activityDate = new Date(activity.date);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - maxDaysAgo);
            if (activityDate < cutoffDate) {
              return false;
            }
          }
          
          return true;
        })
        // Remove duplicates based on actionItemId for action items
        .filter((activity, index, array) => {
          if (activity.type === 'sponsor_action_item' && activity.actionItemId) {
            // Keep only the first occurrence of each action item
            return array.findIndex(a => 
              a.type === 'sponsor_action_item' && 
              a.actionItemId === activity.actionItemId
            ) === index;
          }
          return true;
        })
        // Sort by date (most recent first)
        .sort((a, b) => compareDatesForSorting(b, a))
        // Limit the number of activities if specified
        .slice(0, limit || activities.length)
    : [];
    

    
  if (filteredActivities.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: theme.palette.text.secondary,
        fontStyle: 'italic'
      }}>
        No activities found
      </div>
    );
  }
  
  // Get grouped activities
  const { groups, sortedDateKeys } = groupByDate(filteredActivities);
  
  return (
    <div className="activity-list-container" style={{ height: 'auto', minHeight: '100px' }}>
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <h3 style={{ margin: 0, color: theme.palette.text.primary }}>{title}</h3>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedDateKeys.map(dateKey => (
          <div key={dateKey} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Date header */}
            <div style={{
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.25rem',
              paddingBottom: '0.25rem',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              {formatDate(dateKey)}
            </div>
            
            {/* Activities for this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groups[dateKey]
                .sort((a, b) => {
                  // Sort by createdAt timestamp if available, otherwise by ID (newest first)
                  if (a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  }
                  if (a.id && b.id) {
                    return b.id - a.id; // Higher ID = more recent
                  }
                  return 0;
                })
                .map((activity, index) => {
                  // Handle action items (including sponsor and sponsee action items) with the new ActionItem component
                  if (activity.type === 'action-item' || activity.type === 'sponsor_action_item' || activity.type === 'sponsee_action_item') {
                    const actionItemTitle = activity.actionItemData?.title || activity.notes || 'Action Item';
                    const actionItemPrefix = activity.type === 'sponsor_action_item' ? 'Sponsor Action: ' : 
                                           activity.type === 'sponsee_action_item' ? 'Sponsee Action: ' : '';
                    
                    return (
                      <ActionItem
                        key={activity.id || `${activity.date}-${activity.type}-${index}`}
                        actionItem={{
                          id: activity.id,
                          title: actionItemPrefix + actionItemTitle,
                          notes: activity.actionItemData?.notes,
                          completed: activity.actionItemData?.completed || false,
                          deleted: activity.actionItemData?.deleted || false,
                          date: activity.date,
                          actionItemId: activity.actionItemId,
                          actionItemData: activity.actionItemData
                        }}
                        variant="compact"
                        showDate={showDate}
                        onToggleComplete={handleToggleActionItemComplete}
                        onDelete={handleDeleteActionItem}
                      />
                    );
                  }

                  // Handle other activity types with existing rendering
                  return (
                    <div 
                      key={activity.id || `${activity.date}-${activity.type}-${index}`} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        paddingBottom: '0.5rem',
                        marginBottom: '0.25rem',
                        cursor: activity.type === 'sponsor-contact' ? 'pointer' : 'default',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (activity.type === 'sponsor-contact') {
                          e.currentTarget.style.backgroundColor = theme.palette.action.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activity.type === 'sponsor-contact') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      onClick={() => {
                        if (activity.type === 'sponsor-contact' && onActivityClick) {
                          onActivityClick(activity, 'sponsor-contact');
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
                      fontSize: '0.85rem',
                      color: (() => {
                        const colors = getActivityColor(activity.type);
                        return darkMode ? colors.iconDark : colors.icon;
                      })()
                    }}></i>
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.125rem'
                    }}>
                      <div style={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        lineHeight: '1.2',
                        flex: 1,
                        minWidth: 0,
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {formatActivityText(activity)}
                      </div>
                      
                      {showDate && (
                        <div style={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.8rem',
                          flexShrink: 0,
                          marginLeft: '0.5rem',
                          lineHeight: '1.2'
                        }}>
                          {formatDateForDisplay(activity.date)}
                        </div>
                      )}
                    </div>
                    
                    {formatActivitySubtitle(activity) && (
                      <div style={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.8rem',
                        lineHeight: '1.3',
                        marginTop: '0.125rem',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {formatActivitySubtitle(activity)}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '0.5rem'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActivity(activity.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.palette.error.main,
                        padding: '0.25rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem'
                      }}
                      title="Delete activity"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}