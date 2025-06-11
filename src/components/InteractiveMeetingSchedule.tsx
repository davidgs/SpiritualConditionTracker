import React, { useState, useRef } from 'react';
import { Box, Typography, Button, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
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

interface InteractiveMeetingScheduleProps {
  schedule: ScheduleItem[];
  onChange: (schedule: ScheduleItem[]) => void;
  use24HourFormat?: boolean;
}

const InteractiveMeetingSchedule: React.FC<InteractiveMeetingScheduleProps> = ({ 
  schedule, 
  onChange, 
  use24HourFormat = false 
}) => {
  const muiTheme = useTheme();
  
  // State for the meeting creation/editing
  const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({ time: '19:00' });
  const [activeSpeedDial, setActiveSpeedDial] = useState<{type: string, index?: number, anchorEl?: HTMLElement} | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const days = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' }
  ];

  const meetingFormats = [
    { value: 'discussion', label: 'Discussion', icon: '💬' },
    { value: 'speaker', label: 'Speaker', icon: '🎤' },
    { value: 'mens', label: 'Men\'s', icon: '👨' },
    { value: 'womens', label: 'Women\'s', icon: '👩' },
    { value: 'big_book', label: 'Big Book', icon: '📖' },
    { value: 'step_study', label: 'Step Study', icon: '📝' }
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

  const handleBoxClick = (type: string, event: React.MouseEvent<HTMLDivElement>, index?: number) => {
    if (type === 'time') {
      setShowTimePicker(true);
      return;
    }
    
    setActiveSpeedDial({ 
      type, 
      index, 
      anchorEl: event.currentTarget 
    });
  };

  const handleSpeedDialSelect = (value: string) => {
    if (!activeSpeedDial) return;
    
    const { type, index } = activeSpeedDial;
    
    if (index !== undefined) {
      // Editing existing schedule item
      const updatedSchedule = [...schedule];
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [type === 'location' ? 'locationType' : type]: value
      };
      onChange(updatedSchedule);
    } else {
      // Creating new meeting
      const updatedMeeting = { 
        ...newMeeting, 
        [type === 'location' ? 'locationType' : type]: value 
      };
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

  const formatTime = (time: string) => {
    if (use24HourFormat) return time;
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  const renderScheduleBox = (content: string, type: string, isSelected: boolean, index?: number) => (
    <Box
      onClick={(e) => handleBoxClick(type, e, index)}
      sx={{
        minWidth: '80px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        border: `1px solid ${muiTheme.palette.divider}`,
        backgroundColor: isSelected ? muiTheme.palette.primary.main : 'transparent',
        color: isSelected ? 'white' : muiTheme.palette.text.primary,
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: isSelected ? muiTheme.palette.primary.dark : muiTheme.palette.action.hover
        }
      }}
    >
      {content}
    </Box>
  );

  const getSpeedDialPosition = () => {
    if (!activeSpeedDial?.anchorEl) return { top: 0, left: 0 };
    
    const rect = activeSpeedDial.anchorEl.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 2, position: 'relative' }}>
        {/* Existing meetings */}
        {schedule.map((item, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
              gap: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: muiTheme.palette.grey[50],
              border: `1px solid ${muiTheme.palette.divider}`
            }}>
              {renderScheduleBox(
                days.find(d => d.key === item.day)?.label || item.day,
                'day',
                true,
                index
              )}
              {renderScheduleBox(
                formatTime(item.time),
                'time',
                true,
                index
              )}
              {renderScheduleBox(
                meetingFormats.find(f => f.value === item.format)?.label || item.format,
                'format',
                true,
                index
              )}
              {renderScheduleBox(
                meetingLocationTypes.find(l => l.value === item.locationType)?.label || item.locationType,
                'location',
                true,
                index
              )}
              {renderScheduleBox(
                meetingAccess.find(a => a.value === item.access)?.label || item.access,
                'access',
                true,
                index
              )}
            </Box>
            <Button
              size="small"
              color="error"
              onClick={() => {
                const newSchedule = schedule.filter((_, i) => i !== index);
                onChange(newSchedule);
              }}
              sx={{ mt: 1, fontSize: '12px' }}
            >
              Remove
            </Button>
          </Box>
        ))}

        {/* New meeting creation grid */}
        {(schedule.length === 0 || Object.keys(newMeeting).length > 0) && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
              gap: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor: muiTheme.palette.grey[50],
              border: `1px solid ${muiTheme.palette.divider}`
            }}>
              {renderScheduleBox(
                newMeeting.day ? days.find(d => d.key === newMeeting.day)?.label || '' : '---',
                'day',
                !!newMeeting.day
              )}
              {renderScheduleBox(
                newMeeting.time ? formatTime(newMeeting.time) : '7:00 PM',
                'time',
                !!newMeeting.time
              )}
              {renderScheduleBox(
                newMeeting.format ? meetingFormats.find(f => f.value === newMeeting.format)?.label || '' : '---',
                'format',
                !!newMeeting.format
              )}
              {renderScheduleBox(
                newMeeting.locationType ? meetingLocationTypes.find(l => l.value === newMeeting.locationType)?.label || '' : '---',
                'location',
                !!newMeeting.locationType
              )}
              {renderScheduleBox(
                newMeeting.access ? meetingAccess.find(a => a.value === newMeeting.access)?.label || '' : '---',
                'access',
                !!newMeeting.access
              )}
            </Box>
          </Box>
        )}

        {/* Select Day button */}
        {Object.keys(newMeeting).length === 0 && (
          <Button
            variant="text"
            onClick={(e) => handleBoxClick('day', e)}
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

        {/* SpeedDials anchored to clicked boxes */}
        {activeSpeedDial && (
          <SpeedDial
            ariaLabel={`Select ${activeSpeedDial.type}`}
            sx={{ 
              position: 'fixed',
              ...getSpeedDialPosition(),
              transform: 'translateX(-50%)',
              '& .MuiSpeedDial-fab': {
                width: 40,
                height: 40
              }
            }}
            icon={<SpeedDialIcon />}
            open={true}
            onClose={() => setActiveSpeedDial(null)}
            direction="down"
          >
            {activeSpeedDial.type === 'day' && days.map((day) => (
              <SpeedDialAction
                key={day.key}
                icon={<Typography variant="caption" sx={{ fontSize: '10px' }}>{day.label}</Typography>}
                tooltipTitle={day.key}
                onClick={() => handleSpeedDialSelect(day.key)}
                sx={{
                  '& .MuiSpeedDialAction-fab': {
                    width: 36,
                    height: 36,
                    fontSize: '10px'
                  }
                }}
              />
            ))}
            
            {activeSpeedDial.type === 'format' && meetingFormats.map((format) => (
              <SpeedDialAction
                key={format.value}
                icon={<Typography sx={{ fontSize: '14px' }}>{format.icon}</Typography>}
                tooltipTitle={format.label}
                onClick={() => handleSpeedDialSelect(format.value)}
                sx={{
                  '& .MuiSpeedDialAction-fab': {
                    width: 36,
                    height: 36
                  }
                }}
              />
            ))}
            
            {activeSpeedDial.type === 'location' && meetingLocationTypes.map((location) => (
              <SpeedDialAction
                key={location.value}
                icon={<Typography sx={{ fontSize: '14px' }}>{location.icon}</Typography>}
                tooltipTitle={location.label}
                onClick={() => handleSpeedDialSelect(location.value)}
                sx={{
                  '& .MuiSpeedDialAction-fab': {
                    width: 36,
                    height: 36
                  }
                }}
              />
            ))}
            
            {activeSpeedDial.type === 'access' && meetingAccess.map((access) => (
              <SpeedDialAction
                key={access.value}
                icon={<Typography sx={{ fontSize: '14px' }}>{access.icon}</Typography>}
                tooltipTitle={access.label}
                onClick={() => handleSpeedDialSelect(access.value)}
                sx={{
                  '& .MuiSpeedDialAction-fab': {
                    width: 36,
                    height: 36
                  }
                }}
              />
            ))}
          </SpeedDial>
        )}

        {/* Time Picker */}
        {showTimePicker && (
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
              const updatedMeeting = { ...newMeeting, time: timeString };
              setNewMeeting(updatedMeeting);
              
              // Auto-complete if all fields are filled
              if (updatedMeeting.day && updatedMeeting.time && updatedMeeting.format && 
                  updatedMeeting.locationType && updatedMeeting.access) {
                onChange([...schedule, updatedMeeting as ScheduleItem]);
                setNewMeeting({ time: '19:00' });
              }
              
              setShowTimePicker(false);
            }}
            onClose={() => setShowTimePicker(false)}
            slotProps={{
              textField: {
                style: { display: 'none' }
              }
            }}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default InteractiveMeetingSchedule;