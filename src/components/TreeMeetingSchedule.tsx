import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Chip, SpeedDial, SpeedDialAction, SpeedDialIcon, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface ScheduleItem {
  day: string;
  time: string;
  format: string;
  locationType: string;
  access: string;
}

interface TreeMeetingScheduleProps {
  schedule: ScheduleItem[];
  onChange: (schedule: ScheduleItem[]) => void;
  use24HourFormat?: boolean;
}

const TreeMeetingSchedule: React.FC<TreeMeetingScheduleProps> = ({ 
  schedule, 
  onChange, 
  use24HourFormat = false 
}) => {
  const muiTheme = useTheme();
  
  // State for the step-by-step meeting creation
  const [currentStep, setCurrentStep] = useState<'day' | 'time' | 'format' | 'location' | 'access' | 'complete'>('day');
  const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({ time: '19:00' });
  const [editingMeeting, setEditingMeeting] = useState<number | null>(null);
  
  // SpeedDial state - track which schedule item has active SpeedDial
  const [activeSpeedDial, setActiveSpeedDial] = useState<{type: string, scheduleIndex?: number} | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const scheduleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const days = [
    { key: 'sunday', label: 'Sunday' },
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' }
  ];

  const meetingFormats = [
    { value: 'discussion', label: 'Discussion', icon: '💬' },
    { value: 'speaker', label: 'Speaker', icon: '🎤' },
    { value: 'mens', label: 'Men\'s', icon: '👨' },
    { value: 'womens', label: 'Women\'s', icon: '👩' },
    { value: 'young_people', label: 'Young People\'s', icon: '🧑' },
    { value: 'beginners', label: 'Beginners', icon: '🌱' },
    { value: 'big_book', label: 'Big Book', icon: '📖' },
    { value: 'step_study', label: 'Step Study', icon: '📝' },
    { value: 'literature', label: 'Literature', icon: '📚' }
  ];

  const meetingLocationTypes = [
    { value: 'in_person', label: 'In-Person', icon: '🏢' },
    { value: 'online', label: 'Online', icon: '💻' },
    { value: 'hybrid', label: 'Hybrid', icon: '🌐' }
  ];

  const meetingAccess = [
    { value: 'open', label: 'Open', icon: '🔓' },
    { value: 'closed', label: 'Closed', icon: '🔒' }
  ];

  const completeNewMeeting = () => {
    if (newMeeting.day && newMeeting.time && newMeeting.format && newMeeting.locationType && newMeeting.access) {
      const completeMeeting: ScheduleItem = {
        day: newMeeting.day,
        time: newMeeting.time,
        format: newMeeting.format,
        locationType: newMeeting.locationType,
        access: newMeeting.access
      };
      const newSchedule = [...schedule, completeMeeting];
      onChange(newSchedule);
      
      // Reset for next meeting - go back to day selection
      setNewMeeting({});
      setCurrentStep('day');
    }
  };

  const removeScheduleItem = (day: string, time: string) => {
    const newSchedule = schedule.filter(item => !(item.day === day && item.time === time));
    onChange(newSchedule);
  };

  const startEditingMeeting = (index: number, field: 'day' | 'time' | 'format' | 'locationType' | 'access') => {
    setEditingMeeting(index);
    setNewMeeting({...schedule[index]});
    setCurrentStep(field === 'locationType' ? 'location' : field);
  };

  const updateExistingMeeting = () => {
    if (editingMeeting !== null && newMeeting.day && newMeeting.time && newMeeting.format && newMeeting.locationType && newMeeting.access) {
      const updatedSchedule = [...schedule];
      updatedSchedule[editingMeeting] = {
        day: newMeeting.day,
        time: newMeeting.time,
        format: newMeeting.format,
        locationType: newMeeting.locationType,
        access: newMeeting.access
      };
      onChange(updatedSchedule);
      
      // Reset editing state
      setEditingMeeting(null);
      setNewMeeting({});
      setCurrentStep('day');
    }
  };

  const handleScheduleItemClick = (field: string, scheduleIndex?: number) => {
    setActiveSpeedDial({ type: field, scheduleIndex });
  };

  const handleSpeedDialSelect = (value: string) => {
    if (!activeSpeedDial) return;
    
    const { type, scheduleIndex } = activeSpeedDial;
    
    if (scheduleIndex !== undefined) {
      // Editing existing schedule item
      const updatedSchedule = [...schedule];
      updatedSchedule[scheduleIndex] = {
        ...updatedSchedule[scheduleIndex],
        [type]: value
      };
      onChange(updatedSchedule);
    } else {
      // Creating new meeting
      const updatedMeeting = { ...newMeeting, [type]: value };
      setNewMeeting(updatedMeeting);
      
      // Auto-complete if all fields are filled
      if (updatedMeeting.day && updatedMeeting.time && updatedMeeting.format && 
          updatedMeeting.locationType && updatedMeeting.access) {
        onChange([...schedule, updatedMeeting as ScheduleItem]);
        setNewMeeting({ time: '19:00' });
      }
    }
    
    setActiveSpeedDial(null);
  };

  const renderMeetingPreview = () => {
    // Show preview when creating new meeting or if no meetings exist
    if (Object.keys(newMeeting).length > 0 || (schedule.length === 0 && editingMeeting === null)) {
      return (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 2,
            backgroundColor: muiTheme.palette.grey[50],
            border: `1px solid ${muiTheme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {/* Day Section */}
            <Box 
              onClick={() => {
                setCurrentStep('day');
                setActiveSpeedDial('day');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.day ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.day ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.day ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.day ? days.find(d => d.key === newMeeting.day)?.label : '---'}
            </Box>
            
            {/* Time Section */}
            <Box 
              onClick={() => {
                setCurrentStep('time');
                setShowTimePicker(true);
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.time ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.time ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '80px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.time ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.time ? (use24HourFormat ? newMeeting.time : (() => {
                const [hour, minute] = newMeeting.time.split(':');
                const hourNum = parseInt(hour);
                const period = hourNum >= 12 ? 'PM' : 'AM';
                const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                return `${displayHour}:${minute} ${period}`;
              })()) : '7:00 PM'}
            </Box>
            
            {/* Format Section */}
            <Box 
              onClick={() => {
                setCurrentStep('format');
                setActiveSpeedDial('format');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.format ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.format ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.format ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.format ? meetingFormats.find(f => f.value === newMeeting.format)?.label : '---'}
            </Box>
            
            {/* Location Type Section */}
            <Box 
              onClick={() => {
                setCurrentStep('location');
                setActiveSpeedDial('locationType');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.locationType ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.locationType ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.locationType ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.locationType ? meetingLocationTypes.find(l => l.value === newMeeting.locationType)?.label : '---'}
            </Box>
            
            {/* Access Section */}
            <Box 
              onClick={() => {
                setCurrentStep('access');
                setActiveSpeedDial('access');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.access ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.access ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.access ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.access ? meetingAccess.find(a => a.value === newMeeting.access)?.label : '---'}
            </Box>
          </Box>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Display existing meetings */}
      {schedule.map((item, index) => (
        <Box
          key={index}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            py: 0.5,
            borderBottom: '1px solid #eee',
            mb: 1
          }}
        >
          <Button
            variant="text"
            onClick={() => startEditingMeeting(index, 'day')}
            sx={{ fontWeight: 500, minWidth: '60px', textAlign: 'left', fontSize: '0.85rem', px: 0.5 }}
          >
            {days.find(d => d.key === item.day)?.label || item.day}
          </Button>
          
          <Button
            variant="text"
            onClick={() => startEditingMeeting(index, 'time')}
            sx={{ minWidth: '60px', textAlign: 'left', fontSize: '0.85rem', px: 0.5 }}
          >
            {use24HourFormat ? item.time : (() => {
              const [hour, minute] = item.time.split(':');
              const hourNum = parseInt(hour);
              const period = hourNum >= 12 ? 'PM' : 'AM';
              const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
              return `${displayHour}:${minute} ${period}`;
            })()}
          </Button>
          
          <Button
            variant="text"
            onClick={() => startEditingMeeting(index, 'locationType')}
            sx={{ fontSize: '1rem', minWidth: 'auto', px: 0.5 }}
          >
            {meetingLocationTypes.find(l => l.value === item.locationType)?.icon || '🏢'}
          </Button>
          
          <Chip 
            label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Unknown'}
            size="small"
            color="primary"
            onClick={() => startEditingMeeting(index, 'format')}
            sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer', mx: 0.25 }}
          />
          
          <Chip 
            label={item.access ? item.access.charAt(0).toUpperCase() + item.access.slice(1) : 'Unknown'}
            size="small"
            color={item.access === 'open' ? 'success' : 'error'}
            onClick={() => startEditingMeeting(index, 'access')}
            sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer', mx: 0.25 }}
          />
          
          <Button
            size="small"
            color="error"
            onClick={() => removeScheduleItem(item.day, item.time)}
            sx={{ 
              minWidth: 'auto', 
              width: '20px', 
              height: '20px', 
              px: 0,
              fontSize: '0.9rem',
              borderRadius: '50%',
              ml: 0.5
            }}
          >
            ×
          </Button>
        </Box>
      ))}

      {/* Meeting preview with clickable sections */}
      {(Object.keys(newMeeting).length > 0 || (schedule.length === 0 && editingMeeting === null)) && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 2,
            backgroundColor: muiTheme.palette.grey[50],
            border: `1px solid ${muiTheme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {/* Day Section */}
            <Box 
              onClick={() => {
                if (Object.keys(newMeeting).length === 0) {
                  setNewMeeting({ time: '19:00' });
                }
                setCurrentStep('day');
                setActiveSpeedDial('day');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.day ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.day ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.day ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.day ? days.find(d => d.key === newMeeting.day)?.label : '---'}
            </Box>
            
            {/* Time Section */}
            <Box 
              onClick={() => {
                setCurrentStep('time');
                setShowTimePicker(true);
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.time ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.time ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '80px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.time ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.time ? (use24HourFormat ? newMeeting.time : (() => {
                const [hour, minute] = newMeeting.time.split(':');
                const hourNum = parseInt(hour);
                const period = hourNum >= 12 ? 'PM' : 'AM';
                const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                return `${displayHour}:${minute} ${period}`;
              })()) : '7:00 PM'}
            </Box>
            
            {/* Format Section */}
            <Box 
              onClick={() => {
                setCurrentStep('format');
                setActiveSpeedDial('format');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.format ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.format ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.format ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.format ? meetingFormats.find(f => f.value === newMeeting.format)?.label : '---'}
            </Box>
            
            {/* Location Type Section */}
            <Box 
              onClick={() => {
                setCurrentStep('location');
                setActiveSpeedDial('locationType');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.locationType ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.locationType ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.locationType ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.locationType ? meetingLocationTypes.find(l => l.value === newMeeting.locationType)?.label : '---'}
            </Box>
            
            {/* Access Section */}
            <Box 
              onClick={() => {
                setCurrentStep('access');
                setActiveSpeedDial('access');
              }}
              sx={{ 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: 1,
                backgroundColor: newMeeting.access ? muiTheme.palette.primary.main : 'transparent',
                color: newMeeting.access ? 'white' : muiTheme.palette.text.primary,
                border: `1px solid ${muiTheme.palette.divider}`,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: newMeeting.access ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.access ? meetingAccess.find(a => a.value === newMeeting.access)?.label : '---'}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Select Day button when no day is selected and preview is shown */}
      {(Object.keys(newMeeting).length === 0 || !newMeeting.day) && 
       (schedule.length === 0 || Object.keys(newMeeting).length > 0) && (
        <Button
          variant="text"
          onClick={() => {
            if (Object.keys(newMeeting).length === 0) {
              setNewMeeting({ time: '19:00' });
            }
            setCurrentStep('day');
            setActiveSpeedDial('day');
          }}
          startIcon={<Typography sx={{ fontSize: '16px' }}>›</Typography>}
          sx={{ 
            color: muiTheme.palette.primary.main,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 400,
            justifyContent: 'flex-start',
            pl: 0
          }}
        >
          + Select Day
        </Button>
      )}

      {/* SpeedDial for Day selection */}
      {activeSpeedDial === 'day' && (
        <SpeedDial
          ariaLabel="Select Day"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          icon={<SpeedDialIcon />}
          open={true}
          onClose={() => setActiveSpeedDial(null)}
        >
          {days.map((day) => (
            <SpeedDialAction
              key={day.key}
              icon={<Typography variant="caption">{day.label.slice(0, 3)}</Typography>}
              tooltipTitle={day.label}
              onClick={() => handleSpeedDialSelect('day', day.key)}
            />
          ))}
        </SpeedDial>
      )}

      {/* SpeedDial for Format selection */}
      {activeSpeedDial === 'format' && (
        <SpeedDial
          ariaLabel="Select Format"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          icon={<SpeedDialIcon />}
          open={true}
          onClose={() => setActiveSpeedDial(null)}
        >
          {meetingFormats.map((format) => (
            <SpeedDialAction
              key={format.value}
              icon={<Typography>{format.icon}</Typography>}
              tooltipTitle={format.label}
              onClick={() => handleSpeedDialSelect('format', format.value)}
            />
          ))}
        </SpeedDial>
      )}

      {/* SpeedDial for Location Type selection */}
      {activeSpeedDial === 'locationType' && (
        <SpeedDial
          ariaLabel="Select Location Type"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          icon={<SpeedDialIcon />}
          open={true}
          onClose={() => setActiveSpeedDial(null)}
        >
          {meetingLocationTypes.map((location) => (
            <SpeedDialAction
              key={location.value}
              icon={<Typography>{location.icon}</Typography>}
              tooltipTitle={location.label}
              onClick={() => handleSpeedDialSelect('locationType', location.value)}
            />
          ))}
        </SpeedDial>
      )}

      {/* SpeedDial for Access selection */}
      {activeSpeedDial === 'access' && (
        <SpeedDial
          ariaLabel="Select Access Type"
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          icon={<SpeedDialIcon />}
          open={true}
          onClose={() => setActiveSpeedDial(null)}
        >
          {meetingAccess.map((access) => (
            <SpeedDialAction
              key={access.value}
              icon={<Typography>{access.icon}</Typography>}
              tooltipTitle={access.label}
              onClick={() => handleSpeedDialSelect('access', access.value)}
            />
          ))}
        </SpeedDial>
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileTimePicker
            value={dayjs(`2022-04-17T${newMeeting.time || '19:00'}`)}
            ampm={!use24HourFormat}
            minutesStep={15}
            open={true}
            onChange={(value) => {
              if (value && value.isValid()) {
                const timeString = value.format('HH:mm');
                setNewMeeting(prev => ({ ...prev, time: timeString }));
              }
            }}
            onAccept={(value) => {
              const timeString = (value && value.isValid()) ? value.format('HH:mm') : (newMeeting.time || '19:00');
              handleSpeedDialSelect('time', timeString);
              setShowTimePicker(false);
            }}
            onClose={() => {
              const timeString = newMeeting.time || '19:00';
              handleSpeedDialSelect('time', timeString);
              setShowTimePicker(false);
            }}
            slotProps={{
              textField: {
                style: { display: 'none' }
              }
            }}
          />
        </LocalizationProvider>
      )}
    </Box>
  );
};

export default TreeMeetingSchedule;