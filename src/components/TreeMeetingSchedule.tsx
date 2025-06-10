import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Place as PlaceIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';

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

export default function TreeMeetingSchedule({ 
  schedule, 
  onChange, 
  use24HourFormat = false 
}: TreeMeetingScheduleProps) {
  const muiTheme = useTheme();
  
  // State for new meeting creation
  const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({ time: '19:00' });
  
  // SpeedDial state
  const [activeSpeedDial, setActiveSpeedDial] = useState<{
    type: string;
    index?: number;
    anchorEl?: HTMLElement;
  } | null>(null);

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
    { value: 'beginners', label: 'Beginners' },
    { value: 'open_discussion', label: 'Open Discussion' },
    { value: 'big_book', label: 'Big Book' },
    { value: 'step_study', label: 'Step Study' },
    { value: 'speaker', label: 'Speaker' },
    { value: 'literature', label: 'Literature' }
  ];

  const meetingLocationTypes = [
    { value: 'in_person', label: 'In Person', icon: '🏢' },
    { value: 'online', label: 'Online', icon: '💻' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
  ];

  const accessTypes = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
  ];

  // Handle clicking on elements to show SpeedDial
  const handleElementClick = (type: string, event: React.MouseEvent, index?: number) => {
    event.preventDefault();
    setActiveSpeedDial({
      type,
      index,
      anchorEl: event.currentTarget as HTMLElement
    });
  };

  // Handle SpeedDial action selection
  const handleSpeedDialSelect = (value: string) => {
    if (!activeSpeedDial) return;
    
    const { type, index } = activeSpeedDial;
    
    if (index !== undefined) {
      // Editing existing schedule item
      const updatedSchedule = [...schedule];
      updatedSchedule[index] = {
        ...updatedSchedule[index],
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

  // Remove schedule item
  const removeScheduleItem = (day: string, time: string) => {
    const updatedSchedule = schedule.filter(item => !(item.day === day && item.time === time));
    onChange(updatedSchedule);
  };

  // Get SpeedDial actions based on type
  const getSpeedDialActions = () => {
    if (!activeSpeedDial) return [];
    
    switch (activeSpeedDial.type) {
      case 'day':
        return days.map(day => ({
          icon: <TodayIcon />,
          name: day.label,
          onClick: () => handleSpeedDialSelect(day.key)
        }));
      case 'format':
        return meetingFormats.map(format => ({
          icon: <GroupIcon />,
          name: format.label,
          onClick: () => handleSpeedDialSelect(format.value)
        }));
      case 'locationType':
        return meetingLocationTypes.map(location => ({
          icon: <PlaceIcon />,
          name: location.label,
          onClick: () => handleSpeedDialSelect(location.value)
        }));
      case 'access':
        return accessTypes.map(access => ({
          icon: access.value === 'open' ? <LockOpenIcon /> : <LockIcon />,
          name: access.label,
          onClick: () => handleSpeedDialSelect(access.value)
        }));
      default:
        return [];
    }
  };

  const formatTime = (time: string) => {
    if (use24HourFormat) return time;
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <Box sx={{ mb: 2, position: 'relative' }}>
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
            onClick={(e) => handleElementClick('day', e, index)}
            sx={{ fontWeight: 500, minWidth: '60px', textAlign: 'left', fontSize: '0.85rem', px: 0.5 }}
          >
            {days.find(d => d.key === item.day)?.label || item.day}
          </Button>
          
          <Button
            variant="text"
            onClick={(e) => handleElementClick('time', e, index)}
            sx={{ minWidth: '60px', textAlign: 'left', fontSize: '0.85rem', px: 0.5 }}
          >
            {formatTime(item.time)}
          </Button>
          
          <Button
            variant="text"
            onClick={(e) => handleElementClick('locationType', e, index)}
            sx={{ fontSize: '1rem', minWidth: 'auto', px: 0.5 }}
          >
            {meetingLocationTypes.find(l => l.value === item.locationType)?.icon || '🏢'}
          </Button>
          
          <Chip 
            label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Unknown'}
            size="small"
            color="primary"
            onClick={(e) => handleElementClick('format', e, index)}
            sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer', mx: 0.25 }}
          />
          
          <Chip 
            label={item.access ? item.access.charAt(0).toUpperCase() + item.access.slice(1) : 'Unknown'}
            size="small"
            color={item.access === 'open' ? 'success' : 'error'}
            onClick={(e) => handleElementClick('access', e, index)}
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

      {/* Meeting preview for new meeting creation */}
      {(Object.keys(newMeeting).length > 0 || schedule.length === 0) && (
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
          <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}>
            Meeting Schedule
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {/* Day Section */}
            <Button
              variant="outlined"
              onClick={(e) => handleElementClick('day', e)}
              sx={{
                minWidth: '60px',
                height: '32px',
                fontSize: '0.75rem',
                borderColor: muiTheme.palette.divider,
                color: newMeeting.day ? muiTheme.palette.text.primary : muiTheme.palette.text.secondary,
                backgroundColor: newMeeting.day ? muiTheme.palette.primary.light : 'transparent',
                '&:hover': {
                  backgroundColor: muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.day ? days.find(d => d.key === newMeeting.day)?.label : '---'}
            </Button>

            {/* Time Section */}
            <Button
              variant="outlined"
              onClick={(e) => handleElementClick('time', e)}
              sx={{
                minWidth: '60px',
                height: '32px',
                fontSize: '0.75rem',
                borderColor: muiTheme.palette.divider,
                color: muiTheme.palette.text.primary,
                '&:hover': {
                  backgroundColor: muiTheme.palette.action.hover
                }
              }}
            >
              {formatTime(newMeeting.time || '19:00')}
            </Button>

            {/* Location Type Section */}
            <Button
              variant="outlined"
              onClick={(e) => handleElementClick('locationType', e)}
              sx={{
                minWidth: '40px',
                height: '32px',
                fontSize: '1rem',
                borderColor: muiTheme.palette.divider,
                backgroundColor: newMeeting.locationType ? muiTheme.palette.primary.light : 'transparent',
                '&:hover': {
                  backgroundColor: muiTheme.palette.action.hover
                }
              }}
            >
              {newMeeting.locationType ? 
                meetingLocationTypes.find(l => l.value === newMeeting.locationType)?.icon : 
                '---'
              }
            </Button>

            {/* Format Section */}
            <Chip
              label={newMeeting.format ? 
                newMeeting.format.charAt(0).toUpperCase() + newMeeting.format.slice(1).replace('_', ' ') : 
                'Beginners'
              }
              size="small"
              color="primary"
              onClick={(e) => handleElementClick('format', e)}
              sx={{ 
                fontSize: '0.65rem', 
                height: '32px', 
                cursor: 'pointer',
                backgroundColor: newMeeting.format ? muiTheme.palette.primary.main : muiTheme.palette.grey[300]
              }}
            />

            {/* Access Section */}
            <Chip
              label={newMeeting.access ? 
                newMeeting.access.charAt(0).toUpperCase() + newMeeting.access.slice(1) : 
                'Open'
              }
              size="small"
              color={newMeeting.access === 'closed' ? 'error' : 'success'}
              onClick={(e) => handleElementClick('access', e)}
              sx={{ 
                fontSize: '0.65rem', 
                height: '32px', 
                cursor: 'pointer',
                backgroundColor: newMeeting.access === 'closed' ? 
                  muiTheme.palette.error.main : 
                  newMeeting.access === 'open' ? 
                    muiTheme.palette.success.main : 
                    muiTheme.palette.grey[300]
              }}
            />
          </Box>
        </Paper>
      )}

      {/* SpeedDial for options */}
      {activeSpeedDial && (
        <SpeedDial
          ariaLabel="Meeting options"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1300
          }}
          icon={<SpeedDialIcon />}
          open={true}
          onClose={() => setActiveSpeedDial(null)}
          direction="up"
        >
          {getSpeedDialActions().map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
      )}
    </Box>
  );
}