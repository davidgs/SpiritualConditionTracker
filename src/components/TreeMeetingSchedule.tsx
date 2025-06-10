import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Paper,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

  // Popover state for anchored options
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverType, setPopoverType] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | undefined>();

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

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // Handle clicking on elements to show popover
  const handleElementClick = (event: React.MouseEvent<HTMLElement>, type: string, index?: number) => {
    setAnchorEl(event.currentTarget);
    setPopoverType(type);
    setEditingIndex(index);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverType('');
    setEditingIndex(undefined);
  };

  // Handle selection from popover
  const handleSelection = (value: string) => {
    if (editingIndex !== undefined) {
      // Editing existing schedule item
      const updatedSchedule = [...schedule];
      updatedSchedule[editingIndex] = {
        ...updatedSchedule[editingIndex],
        [popoverType]: value
      };
      onChange(updatedSchedule);
    } else {
      // Creating new meeting
      const updatedMeeting = { ...newMeeting, [popoverType]: value };
      setNewMeeting(updatedMeeting);
      
      // Auto-complete if all fields are filled
      if (updatedMeeting.day && updatedMeeting.time && updatedMeeting.format && 
          updatedMeeting.locationType && updatedMeeting.access) {
        onChange([...schedule, updatedMeeting as ScheduleItem]);
        setNewMeeting({ time: '19:00' });
        setCurrentStep('day');
      }
    }
    
    handlePopoverClose();
  };

  // Remove schedule item
  const removeScheduleItem = (day: string, time: string) => {
    const updatedSchedule = schedule.filter(item => !(item.day === day && item.time === time));
    onChange(updatedSchedule);
  };

  const formatTime = (time: string) => {
    if (use24HourFormat) return time;
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  // Get options for current popover
  const getPopoverOptions = () => {
    switch (popoverType) {
      case 'day':
        return days.map(day => ({ value: day.key, label: day.label }));
      case 'time':
        return timeOptions.map(time => ({ value: time, label: formatTime(time) }));
      case 'format':
        return meetingFormats;
      case 'locationType':
        return meetingLocationTypes.map(location => ({ 
          value: location.value, 
          label: `${location.icon} ${location.label}` 
        }));
      case 'access':
        return accessTypes;
      default:
        return [];
    }
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
            onClick={(e) => handleElementClick(e, 'day', index)}
            sx={{ fontWeight: 500, minWidth: '60px', textAlign: 'left', fontSize: '0.85rem', px: 0.5 }}
          >
            {days.find(d => d.key === item.day)?.label || item.day}
          </Button>
          
          <Button
            variant="text"
            onClick={(e) => handleElementClick(e, 'time', index)}
            sx={{ minWidth: '60px', textAlign: 'left', fontSize: '0.85rem', px: 0.5 }}
          >
            {formatTime(item.time)}
          </Button>
          
          <Button
            variant="text"
            onClick={(e) => handleElementClick(e, 'locationType', index)}
            sx={{ fontSize: '1rem', minWidth: 'auto', px: 0.5 }}
          >
            {meetingLocationTypes.find(l => l.value === item.locationType)?.icon || '🏢'}
          </Button>
          
          <Chip 
            label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Unknown'}
            size="small"
            color="primary"
            onClick={(e) => handleElementClick(e, 'format', index)}
            sx={{ fontSize: '0.65rem', height: '20px', cursor: 'pointer', mx: 0.25 }}
          />
          
          <Chip 
            label={item.access ? item.access.charAt(0).toUpperCase() + item.access.slice(1) : 'Unknown'}
            size="small"
            color={item.access === 'open' ? 'success' : 'error'}
            onClick={(e) => handleElementClick(e, 'access', index)}
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

      {/* Meeting preview with clickable sections for new meeting creation */}
      {(Object.keys(newMeeting).length > 0 || (schedule.length === 0 && editingMeeting === null)) && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 1.5, 
            mb: 2, 
            borderRadius: 2,
            backgroundColor: muiTheme.palette.grey[50],
            border: `1px solid ${muiTheme.palette.divider}`
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>
            Meeting Schedule
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {/* Day Section */}
            <Button
              variant="outlined"
              onClick={(e) => handleElementClick(e, 'day')}
              sx={{
                minWidth: '45px',
                height: '28px',
                fontSize: '0.7rem',
                borderColor: muiTheme.palette.divider,
                color: newMeeting.day ? muiTheme.palette.text.primary : muiTheme.palette.text.secondary,
                backgroundColor: newMeeting.day ? muiTheme.palette.primary.light : 'transparent',
                px: 1
              }}
            >
              {newMeeting.day ? days.find(d => d.key === newMeeting.day)?.label?.slice(0, 3) : '---'}
            </Button>

            {/* Time Section */}
            <Button
              variant="outlined"
              onClick={(e) => handleElementClick(e, 'time')}
              sx={{
                minWidth: '60px',
                height: '28px',
                fontSize: '0.7rem',
                borderColor: muiTheme.palette.divider,
                color: muiTheme.palette.text.primary,
                px: 1
              }}
            >
              {formatTime(newMeeting.time || '19:00')}
            </Button>

            {/* Location Type Section */}
            <Button
              variant="outlined"
              onClick={(e) => handleElementClick(e, 'locationType')}
              sx={{
                minWidth: '32px',
                height: '28px',
                fontSize: '0.9rem',
                borderColor: muiTheme.palette.divider,
                backgroundColor: newMeeting.locationType ? muiTheme.palette.primary.light : 'transparent',
                px: 0.5
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
              onClick={(e) => handleElementClick(e, 'format')}
              sx={{ 
                fontSize: '0.65rem', 
                height: '28px', 
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
              onClick={(e) => handleElementClick(e, 'access')}
              sx={{ 
                fontSize: '0.65rem', 
                height: '28px', 
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

      {/* Anchored Popover for options */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            maxHeight: 300,
            minWidth: 150
          }
        }}
      >
        <List dense>
          {getPopoverOptions().map((option) => (
            <ListItem key={option.value} disablePadding>
              <ListItemButton onClick={() => handleSelection(option.value)}>
                <ListItemText 
                  primary={option.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  );
};

export default TreeMeetingSchedule;