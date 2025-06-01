import React, { useState, useEffect } from 'react';
import { meetingOperations } from '../utils/database';
import MeetingFormDialog from './MeetingFormDialog';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { formatDay, formatTimeByPreference } from '../utils/dateUtils';
import { Paper, Box, Typography, IconButton, Chip } from '@mui/material';

export default function Meetings({ setCurrentView, meetings = [], onSave, onDelete, user }) {
  // Get dark mode from theme context
  const muiTheme = useTheme();
  const { theme } = useAppTheme();
  const darkMode = muiTheme.palette.mode === 'dark';
  
  // Get user preferences
  const [use24HourFormat, setUse24HourFormat] = useState(false);
  
  // Keep user preferences in sync
  useEffect(() => {
    if (user && user.preferences) {
      const timeFormat = user.preferences.use24HourFormat || false;
      console.log('[ Meetings.js ] Setting time format preference to:', timeFormat);
      setUse24HourFormat(timeFormat);
    }
  }, [user, user?.preferences?.use24HourFormat]);
  
  // Get user's home groups
  const [userHomeGroups, setUserHomeGroups] = useState([]);
  
  // Load user data to get home groups
  useEffect(() => {
    if (user) {
      // Handle both the new array format and legacy string format
      const homeGroups = user.homeGroups 
        ? user.homeGroups 
        : (user.homeGroup ? [user.homeGroup] : []);
      setUserHomeGroups(homeGroups);
      console.log('[ Meetings.js ] User: ', user);
      console.log('[ Meetings.js ] Meetings: ', meetings);
    }
  }, [user, meetings]); // Refresh when user or meetings change
  
  const [showForm, setShowForm] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [error, setError] = useState('');
  
  // Edit an existing meeting
  const handleEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setShowForm(true);
  };
  
  // Delete a meeting (using proper data flow through App component)
  const handleDelete = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        if (!onDelete) {
          throw new Error('No onDelete callback provided');
        }
        
        // Call the onDelete from the parent component (App.js)
        // This will handle the database operation through AppDataContext
        const success = await onDelete(meetingId);
        
        if (!success) {
          throw new Error('Delete operation failed');
        }
        
        console.log('[ Meetings.js ] Meeting deleted successfully:', meetingId);
      } catch (error) {
        console.error('[ Meetings.js ] Error deleting meeting:', error);
        setError('Failed to delete meeting. Please try again.');
      }
    }
  };
  
  // Handle form save - simplified to use only App.js onSave prop
  const handleSaveMeeting = (meetingData) => {
    try {
      if (!onSave) {
        throw new Error('No onSave callback provided');
      }
      
      // Call the onSave from the parent component (App.js)
      // This will handle the database operation and return the saved meeting
      const savedMeeting = onSave(meetingData);
      
      // Reset form state
      setCurrentMeeting(null);
      setShowForm(false);
      
      // State will be updated correctly when the meetings prop updates
      // No need to manually update state here
    } catch (error) {
      console.error('[ Meetings.js ] Error saving meeting:', error);
      setError('Failed to save meeting. Please try again.');
    }
  };
  
 
  
  // Format address for display
  const formatAddress = (meeting) => {
    // If we have the individual components, use them
    if (meeting.streetAddress) {
      return (
        <>
          {meeting.locationName && (
            <div className="font-semibold mb-1">{meeting.locationName}</div>
          )}
          <div><i className="fa-solid fa-location-dot text-gray-500 dark:text-gray-400 mr-3 mt-1 flex-shrink-0" style={{ fontSize: '1rem' }}></i>
          &nbsp;{meeting.streetAddress}</div>
          {meeting.city && meeting.state && (
            <div>{meeting.city}, {meeting.state} {meeting.zipCode}</div>
          )}
        </>
      );
    }
    
    // Otherwise, split the address at commas for better display
    // First check if address exists to prevent "undefined is not an object" error
    const parts = meeting.address ? meeting.address.split(',') : [];
    if (parts.length > 2) {
      // Show first line, and then city, state, zip together
      return (
        <>
          <div>{parts[0]}</div>
          <div>{parts.slice(1).join(',')}</div>
        </>
      );
    }
    
    // If simple address, just show as is
    return meeting.address;
  };

  // Render a single meeting item
  const renderMeetingItem = (meeting) => {
    return (
      <Paper 
        key={meeting.id} 
        elevation={2}
        sx={{ 
          p: 3, 
          mb: 2, 
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              {meeting.isHomeGroup && (
                <i className="fa-solid fa-house" title="Home Group" style={{ fontSize: '1rem', marginRight: '8px', opacity: 0.7 }}></i>
              )}
              {meeting.name}
            </Typography>
            

          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '0.875rem' }}>
            {/* Use schedule if available, otherwise use days/time */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Schedule display - handle both array and JSON string formats */}
              {meeting.schedule ? (
                (() => {
                  // Parse schedule if it's a string (from SQLite JSON storage)
                  let scheduleArray = meeting.schedule;
                  
                  if (typeof meeting.schedule === 'string') {
                    try {
                      scheduleArray = JSON.parse(meeting.schedule);
                    } catch (e) {
                      console.error('Failed to parse schedule JSON:', e);
                      return (
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar-days text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" style={{ fontSize: '1rem' }}></i>&nbsp;
                          <span className="text-gray-600 dark:text-gray-300">Meeting schedule not available</span>
                        </div>
                      );
                    }
                  }
                  
                  // Ensure it's an array before mapping
                  if (Array.isArray(scheduleArray) && scheduleArray.length > 0) {
                    return scheduleArray.map((item, idx) => (
                      <Box key={`${meeting.id}-schedule-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className="fa-solid fa-calendar-days" style={{ fontSize: '1rem', opacity: 0.7, marginRight: '12px' }}></i>
                          <Typography variant="body2" color="text.secondary">{formatDay(item.day)}</Typography>
                          <i className="fa-regular fa-clock" style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0 4px' }}></i>
                          <Typography variant="body2" color="text.secondary">{formatTimeByPreference(item.time, use24HourFormat)}</Typography>
                        </Box>
                        
                        {/* Meeting type chips for this specific day */}
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                          {/* Location Type */}
                          {item.locationType && (
                            <Chip
                              label={(() => {
                                const locationConfig = {
                                  'in_person': 'In-Person',
                                  'online': 'Online',
                                  'hybrid': 'Hybrid'
                                };
                                return locationConfig[item.locationType] || item.locationType;
                              })()}
                              size="small"
                              color={(() => {
                                const colorConfig = {
                                  'in_person': 'success',
                                  'online': 'info',
                                  'hybrid': 'warning'
                                };
                                return colorConfig[item.locationType] || 'default';
                              })()}
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                fontWeight: 'medium'
                              }}
                            />
                          )}
                          
                          {/* Format */}
                          {item.format && (
                            <Chip
                              label={item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ')}
                              size="small"
                              color="primary"
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                fontWeight: 'medium'
                              }}
                            />
                          )}
                          
                          {/* Access */}
                          {item.access && (
                            <Chip
                              label={item.access.charAt(0).toUpperCase() + item.access.slice(1)}
                              size="small"
                              color={item.access === 'open' ? 'success' : 'error'}
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                fontWeight: 'medium'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    ));
                  }
                  
                  // If schedule is not a valid array, return null to fall back to legacy format
                  return null;
                })()
              ) : (
                // Legacy format - if there's no schedule, show days/time if available
                meeting.days ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <i className="fa-solid fa-calendar-days" style={{ fontSize: '1rem', opacity: 0.7, marginRight: '12px' }}></i>
                      <Typography variant="body2" color="text.secondary">
                        {(() => {
                          // Parse days if it's a string (from SQLite JSON storage)
                          let daysArray = meeting.days;
                          if (typeof meeting.days === 'string') {
                            try {
                              daysArray = JSON.parse(meeting.days);
                            } catch (e) {
                              console.error('Failed to parse days JSON:', e);
                              return 'Meeting days not available';
                            }
                          }
                          
                          // Ensure it's an array before mapping
                          if (Array.isArray(daysArray) && daysArray.length > 0) {
                            return daysArray.map((day, idx) => (
                              <span key={`${meeting.id}-day-${idx}`}>
                                {idx > 0 && ', '}
                                {formatDay(day)}
                              </span>
                            ));
                          } else {
                            return 'Days not specified';
                          }
                        })()}
                      </Typography>
                    </Box>
                    {meeting.time && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fa-regular fa-clock" style={{ fontSize: '1rem', opacity: 0.7, marginRight: '12px' }}></i>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimeByPreference(meeting.time, use24HourFormat)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <i className="fa-solid fa-info-circle" style={{ marginRight: '8px', opacity: 0.7 }}></i>
                    No schedule information available
                  </Typography>
                )
              )}
            </Box>
            
            {/* Address */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatAddress(meeting)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2, pt: 2, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => handleEdit(meeting)}
                color="primary"
                title="Edit meeting"
                size="small"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </IconButton>
              <IconButton
                onClick={() => handleDelete(meeting.id)}
                color="error"
                title="Delete meeting"
                size="small"
              >
                <i className="fa-solid fa-trash-can"></i>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };
  
  return (
    <div className="p-3">
      <div className="flex flex-col items-center justify-between mb-6">
       <span> <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 items-center">
          <i className="fa-solid fa-calendar text-gray-300 dark:text-gray-600 mr-3" style={{ fontSize: '2.5rem' }}></i>&nbsp;
          Meetings&nbsp; <button
           onClick={() => setShowForm(true)}
           aria-label="Add new meeting"
           title={meetings.length > 0 ? 'Add New Meeting' : 'Add Your First Meeting'}
           className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
           style={{ 
             background: 'transparent', 
             border: 'none', 
             cursor: 'pointer',
             outline: 'none',
             boxShadow: 'none',
             fontSize: '2rem',  
             padding: '0.5rem'
           }}
         >
           <i className="fa-solid fa-calendar-plus"></i>
         </button>
        </h1></span>
       
      </div>

      {/* Meeting Form Dialog */}
      <MeetingFormDialog 
        open={showForm}
        meeting={currentMeeting}
        onSave={handleSaveMeeting}
        onClose={() => {
          setCurrentMeeting(null);
          setShowForm(false);
        }}
        isEdit={!!currentMeeting}
        use24HourFormat={use24HourFormat}
      />
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{error}</p>
          <button 
            className="text-sm text-red-700 underline mt-1"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Meetings List */}
      <div className="mt-4">
        {meetings.length > 0 ? (
          meetings.map(meeting => renderMeetingItem(meeting))
        ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Meetings Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              You haven't added any meetings to your schedule yet.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Click the <i className="fa-solid fa-calendar-plus text-blue-500"></i> button to add your first meeting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}