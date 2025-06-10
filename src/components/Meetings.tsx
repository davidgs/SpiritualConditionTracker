import React, { useState, useEffect } from 'react';
import { meetingOperations } from '../utils/database';
import MeetingFormDialog from './MeetingFormDialog';
import QRCodeGenerator from './QRCodeGenerator';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { formatDay, formatTimeByPreference } from '../utils/dateUtils';
import { Paper, Box, Typography, IconButton, Chip, Alert } from '@mui/material';
// Temporary fix for icon imports
const AddIcon = () => <span>+</span>;
const EventIcon = () => <span>📅</span>;
const LocationOnIcon = () => <span>📍</span>;

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
     // console.log('[ Meetings.js ] Setting time format preference to:', timeFormat);
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
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeTitle, setQrCodeTitle] = useState('');
  
  // Edit an existing meeting
  const handleEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setShowForm(true);
  };

  // Generate calendar event data for QR code sharing
  const generateCalendarData = (meeting) => {
    try {
      // Get all meeting days and times from the schedule
      const getAllMeetingDays = (schedule) => {
        const dayMap = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        
        let allDays = [];
        
        if (schedule && Array.isArray(schedule) && schedule.length > 0) {
          // Use the schedule array directly
          allDays = schedule.map(item => ({
            day: item.day,
            time: item.time || '19:00',
            dayNum: dayMap[item.day.toLowerCase()],
            access: item.access,
            format: item.format
          })).filter(item => !isNaN(item.dayNum));
        } else if (meeting.days && meeting.time) {
          // Legacy format support - handle JSON string parsing
          let days = meeting.days;
          if (typeof days === 'string') {
            try {
              days = JSON.parse(days);
            } catch (e) {
              days = [days]; // Treat as single day if not valid JSON
            }
          }
          if (!Array.isArray(days)) days = [days];
          
          allDays = days.map(day => ({
            day: day,
            time: meeting.time || '19:00',
            dayNum: dayMap[day.toLowerCase()]
          })).filter(item => !isNaN(item.dayNum));
        }
        
        return allDays;
      };

      const allMeetingDays = getAllMeetingDays(meeting.schedule || meeting);
      
      if (!allMeetingDays || allMeetingDays.length === 0) {
        // Fallback to text format if no schedule
        let meetingInfo = `${meeting.name}\n\n`;
        if (meeting.address) meetingInfo += `Location: ${meeting.address}\n`;
        if (meeting.onlineUrl) meetingInfo += `Online: ${meeting.onlineUrl}\n`;
        meetingInfo += '\nShared from AA Recovery Tracker';
        return meetingInfo;
      }

      // Format dates for calendar (YYYYMMDDTHHMMSSZ format)
      const formatCalendarDate = (date) => {
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date for calendar formatting');
        }
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      // Helper function to parse time
      const parseTime = (timeStr) => {
        let hours = 19, minutes = 0; // Default fallback
        
        if (timeStr && timeStr.includes(':')) {
          const [hourStr, minuteStr] = timeStr.split(':');
          const parsedHours = parseInt(hourStr);
          const parsedMinutes = parseInt(minuteStr.replace(/[^\d]/g, ''));
          
          if (!isNaN(parsedHours) && !isNaN(parsedMinutes)) {
            hours = parsedHours;
            minutes = parsedMinutes;
            
            // Handle PM designation
            if (timeStr.toLowerCase().includes('pm') && hours < 12) {
              hours += 12;
            } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
              hours = 0;
            }
          }
        }
        
        return { hours, minutes };
      };

      // Helper function to get day abbreviation for RRULE
      const getDayAbbreviation = (day) => {
        const dayAbbrevs = {
          'sunday': 'SU', 'monday': 'MO', 'tuesday': 'TU', 'wednesday': 'WE', 
          'thursday': 'TH', 'friday': 'FR', 'saturday': 'SA'
        };
        return dayAbbrevs[day.toLowerCase()] || 'MO';
      };

      // Start calendar data
      const calendarLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AA Recovery Tracker//EN'
      ];

      // Create a separate event for each meeting day
      allMeetingDays.forEach((meetingDay, index) => {
        const { hours, minutes } = parseTime(meetingDay.time);
        
        // Calculate the next occurrence of this specific day
        const today = new Date().getDay();
        let daysUntil = meetingDay.dayNum - today;
        if (daysUntil <= 0) daysUntil += 7;
        
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + daysUntil);
        eventDate.setHours(hours, minutes, 0, 0);
        
        // Validate the date
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid event date for day:', meetingDay.day);
          return;
        }
        
        const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        // Build meeting type description
        let meetingTypeDescription = 'AA';
        if (meetingDay.access) {
          meetingTypeDescription += ` ${meetingDay.access.charAt(0).toUpperCase() + meetingDay.access.slice(1)}`;
        }
        if (meetingDay.format) {
          meetingTypeDescription += ` ${meetingDay.format.charAt(0).toUpperCase() + meetingDay.format.slice(1).replace('_', ' ')}`;
        }
        meetingTypeDescription += ' Meeting';

        // Add event to calendar
        calendarLines.push(
          'BEGIN:VEVENT',
          `UID:${meeting.id || 'meeting'}-${meetingDay.day}-${Date.now()}@aa-tracker`,
          `DTSTART:${formatCalendarDate(eventDate)}`,
          `DTEND:${formatCalendarDate(endDate)}`,
          `SUMMARY:${meeting.name} (${meetingDay.day.charAt(0).toUpperCase() + meetingDay.day.slice(1)})`,
          `DESCRIPTION:${meetingTypeDescription}`,
          meeting.address ? `LOCATION:${meeting.address}` : '',
          meeting.onlineUrl ? `URL:${meeting.onlineUrl}` : '',
          `RRULE:FREQ=WEEKLY;BYDAY=${getDayAbbreviation(meetingDay.day)}`,
          'END:VEVENT'
        );
      });

      calendarLines.push('END:VCALENDAR');
      
      return calendarLines.filter(line => line).join('\n');
      
    } catch (error) {
      console.error('Error generating calendar data:', error);
      
      // Fallback to simple text format
      let meetingInfo = `${meeting.name}\n\n`;
      if (meeting.address) meetingInfo += `Location: ${meeting.address}\n`;
      if (meeting.onlineUrl) meetingInfo += `Online: ${meeting.onlineUrl}\n`;
      if (meeting.time) meetingInfo += `Time: ${meeting.time}\n`;
      meetingInfo += '\nShared from AA Recovery Tracker';
      return meetingInfo;
    }
  };

  // Share meeting as QR code
  const handleShareMeeting = (meeting) => {
    const calendarData = generateCalendarData(meeting);
  //  console.log('[ Meetings.js ] Sharing meeting calendar data:', calendarData);
    setQrCodeData(calendarData);
    setQrCodeTitle(`Add Meeting: ${meeting.name}`);
    setQrCodeOpen(true);
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
        
       // console.log('[ Meetings.js ] Meeting deleted successfully:', meetingId);
      } catch (error) {
        console.error('[ Meetings.js ] Error deleting meeting:', error);
        setError('Failed to delete meeting. Please try again.');
      }
    }
  };
  
  // Handle form save - simplified to use only App.js onSave prop
  const handleSaveMeeting = async (meetingData) => {
    try {
      console.log('[Meetings] handleSaveMeeting called with:', meetingData);
      
      if (!onSave) {
        throw new Error('No onSave callback provided');
      }
      
      // Call the onSave from the parent component (App.js)
      // This will handle the database operation and return the saved meeting
      const savedMeeting = await onSave(meetingData);
      console.log('[Meetings] Meeting saved successfully:', savedMeeting);
      
      // Reset form state
      setCurrentMeeting(null);
      setShowForm(false);
      
      // State will be updated correctly when the meetings prop updates
      // No need to manually update state here
    } catch (error) {
      console.error('[ Meetings ] Error saving meeting:', error);
      setError('Failed to save meeting. Please try again.');
    }
  };
  
 
  
  // Format address for display
  const formatAddress = (meeting) => {
    // If we have the individual components, use them
    if (meeting.streetAddress) {
      return (
        <Box>
          {meeting.locationName && (
            <Typography variant="body2" sx={{ fontWeight: 'semibold', mb: 0.5 }}>
              {meeting.locationName}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2">{meeting.streetAddress}</Typography>
          </Box>
          {meeting.city && meeting.state && (
            <Typography variant="body2" sx={{ ml: 3 }}>
              {meeting.city}, {meeting.state} {meeting.zipCode}
            </Typography>
          )}
        </Box>
      );
    }
    
    // Otherwise, split the address at commas for better display
    // First check if address exists to prevent "undefined is not an object" error
    const parts = meeting.address ? meeting.address.split(',') : [];
    if (parts.length > 2) {
      // Show first line, and then city, state, zip together
      return (
        <Box>
          <Typography variant="body2">{parts[0]}</Typography>
          <Typography variant="body2">{parts.slice(1).join(',')}</Typography>
        </Box>
      );
    }
    
    // If simple address, just show as is
    return <Typography variant="body2">{meeting.address}</Typography>;
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
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', flex: 1 }}>
              {meeting.isHomeGroup && (
                <i className="fa-solid fa-house" title="Home Group" style={{ fontSize: '1rem', marginRight: '8px', opacity: 0.7 }}></i>
              )}
              {meeting.name}
            </Typography>
            
            {/* Action buttons moved up */}
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <IconButton
                onClick={() => handleShareMeeting(meeting)}
                color="info"
                title="Share meeting"
                size="small"
              >
                <i className="fa-solid fa-share"></i>
              </IconButton>
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
                              clickable={item.locationType === 'online' && meeting.onlineUrl}
                              onClick={item.locationType === 'online' && meeting.onlineUrl ? () => {
                                window.open(meeting.onlineUrl, '_blank');
                              } : undefined}
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                fontWeight: 'medium',
                                ...(item.locationType === 'online' && meeting.onlineUrl && {
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: (theme) => theme.palette.info.dark
                                  }
                                })
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
                  (() => {
                    // Parse days if it's a string (from SQLite JSON storage)
                    let daysArray = meeting.days;
                    if (typeof meeting.days === 'string') {
                      try {
                        daysArray = JSON.parse(meeting.days);
                      } catch (e) {
                        console.error('Failed to parse days JSON:', e);
                        daysArray = [meeting.days]; // Treat as single day if parsing fails
                      }
                    }
                    
                    // Ensure it's an array before mapping
                    if (Array.isArray(daysArray) && daysArray.length > 0) {
                      // Create separate entries for each day (like the schedule format)
                      return daysArray.map((day, idx) => (
                        <Box key={`${meeting.id}-legacy-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="fa-solid fa-calendar-days" style={{ fontSize: '1rem', opacity: 0.7, marginRight: '12px' }}></i>
                            <Typography variant="body2" color="text.secondary">{formatDay(day)}</Typography>
                            {meeting.time && (
                              <>
                                <i className="fa-regular fa-clock" style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0 4px' }}></i>
                                <Typography variant="body2" color="text.secondary">{formatTimeByPreference(meeting.time, use24HourFormat)}</Typography>
                              </>
                            )}
                          </Box>
                          
                          {/* Legacy meetings get default chips */}
                          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                            <Chip
                              label="In-Person"
                              size="small"
                              color="success"
                              sx={{
                                fontSize: '0.65rem',
                                height: '20px',
                                fontWeight: 'medium'
                              }}
                            />
                          </Box>
                        </Box>
                      ));
                    } else {
                      return (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <i className="fa-solid fa-info-circle" style={{ marginRight: '8px', opacity: 0.7 }}></i>
                          Days not specified
                        </Typography>
                      );
                    }
                  })()
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
            
            {/* Online Meeting URL */}
            {meeting.onlineUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <i className="fa-solid fa-link" style={{ fontSize: '1rem', opacity: 0.7, marginRight: '12px' }}></i>
                <Typography 
                  variant="body2" 
                  color="primary"
                  sx={{ 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: 'primary.dark'
                    }
                  }}
                  onClick={() => window.open(meeting.onlineUrl, '_blank')}
                >
                  Join Online Meeting
                </Typography>
              </Box>
            )}
          </Box>

        </Box>
      </Paper>
    );
  };
  
  return (
    <Box sx={{ px: 3, pb: 3, pt: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EventIcon sx={{ fontSize: '2.5rem', color: 'text.secondary' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Meetings
          </Typography>
        </Box>
        <IconButton
          onClick={() => setShowForm(true)}
          aria-label="Add new meeting"
          title={meetings.length > 0 ? 'Add New Meeting' : 'Add Your First Meeting'}
          color="primary"
          size="large"
          sx={{ 
            fontSize: '2rem',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 'inherit' }}
            data-tour="add-meeting-btn"
          />
        </IconButton>
      </Box>

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
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      {/* Meetings List */}
      <Box sx={{ mt: 2 }}>
        {meetings.length > 0 ? (
          meetings.map(meeting => renderMeetingItem(meeting))
        ) : (
          <Paper 
            elevation={1}
            sx={{ 
              textAlign: 'center', 
              p: 4, 
              backgroundColor: 'background.default',
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2, color: 'text.primary' }}>
              No Meetings Found
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              You haven't added any meetings to your schedule yet.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              Click the <AddIcon sx={{ color: 'primary.main', fontSize: '1rem' }} /> button to add your first meeting.
            </Typography>
          </Paper>
        )}
      </Box>



      {/* QR Code Generator */}
      <QRCodeGenerator
        open={qrCodeOpen}
        data={qrCodeData}
        title={qrCodeTitle}
        onClose={() => setQrCodeOpen(false)}
      />
    </Box>
  );
}