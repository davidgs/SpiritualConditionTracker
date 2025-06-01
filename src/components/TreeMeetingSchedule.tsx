import React, { useState } from 'react';
import { Box, Typography, Button, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CustomNestedMenu from './CustomNestedMenu';

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
  const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({});
  const [editingMeeting, setEditingMeeting] = useState<number | null>(null);

  const days = [
    { key: 'sunday', label: 'Sunday' },
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' }
  ];

  const hourOptions = [
    { value: '06', label: use24HourFormat ? '06:xx' : '6:xx AM' },
    { value: '07', label: use24HourFormat ? '07:xx' : '7:xx AM' },
    { value: '08', label: use24HourFormat ? '08:xx' : '8:xx AM' },
    { value: '09', label: use24HourFormat ? '09:xx' : '9:xx AM' },
    { value: '10', label: use24HourFormat ? '10:xx' : '10:xx AM' },
    { value: '11', label: use24HourFormat ? '11:xx' : '11:xx AM' },
    { value: '12', label: use24HourFormat ? '12:xx' : '12:xx PM' },
    { value: '13', label: use24HourFormat ? '13:xx' : '1:xx PM' },
    { value: '14', label: use24HourFormat ? '14:xx' : '2:xx PM' },
    { value: '15', label: use24HourFormat ? '15:xx' : '3:xx PM' },
    { value: '16', label: use24HourFormat ? '16:xx' : '4:xx PM' },
    { value: '17', label: use24HourFormat ? '17:xx' : '5:xx PM' },
    { value: '18', label: use24HourFormat ? '18:xx' : '6:xx PM' },
    { value: '19', label: use24HourFormat ? '19:xx' : '7:xx PM' },
    { value: '20', label: use24HourFormat ? '20:xx' : '8:xx PM' },
    { value: '21', label: use24HourFormat ? '21:xx' : '9:xx PM' },
    { value: '22', label: use24HourFormat ? '22:xx' : '10:xx PM' }
  ];

  const minuteOptions = [
    { value: '00', label: ':00' },
    { value: '15', label: ':15' },
    { value: '30', label: ':30' },
    { value: '45', label: ':45' }
  ];

  const meetingFormats = [
    { value: 'discussion', label: 'Discussion' },
    { value: 'speaker', label: 'Speaker' },
    { value: 'mens', label: 'Men\'s' },
    { value: 'womens', label: 'Women\'s' },
    { value: 'young_people', label: 'Young People\'s' },
    { value: 'beginners', label: 'Beginners' },
    { value: 'big_book', label: 'Big Book' },
    { value: 'step_study', label: 'Step Study' },
    { value: 'literature', label: 'Literature' }
  ];

  const meetingLocationTypes = [
    { value: 'in_person', label: 'In-Person', icon: '🏢' },
    { value: 'online', label: 'Online', icon: '💻' },
    { value: 'hybrid', label: 'Hybrid', icon: '🌐' }
  ];

  const meetingAccess = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
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
      
      // Reset for next meeting
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

  const renderStepSelector = () => {
    if (currentStep === 'day') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Select Day</Typography>
          <FormControl fullWidth>
            <InputLabel>Day</InputLabel>
            <Select
              value={newMeeting.day || ''}
              label="Day"
              onChange={(e) => {
                setNewMeeting({ ...newMeeting, day: e.target.value });
                setCurrentStep('time');
              }}
            >
              {days.map(day => (
                <MenuItem key={day.key} value={day.key}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
    }

    if (currentStep === 'time') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Select Time</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileTimePicker
              defaultValue={dayjs('2022-04-17T15:30')}
              onChange={(value) => {
                if (value) {
                  const timeString = value.format('HH:mm');
                  setNewMeeting({ ...newMeeting, time: timeString });
                  setCurrentStep('format');
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      );
    }

    if (currentStep === 'format') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Select Meeting Format</Typography>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={newMeeting.format || ''}
              label="Format"
              onChange={(e) => {
                setNewMeeting({ ...newMeeting, format: e.target.value });
                setCurrentStep('location');
              }}
            >
              {meetingFormats.map(format => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
    }

    if (currentStep === 'location') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Select Location Type</Typography>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={newMeeting.locationType || ''}
              label="Location"
              onChange={(e) => {
                setNewMeeting({ ...newMeeting, locationType: e.target.value });
                setCurrentStep('access');
              }}
            >
              {meetingLocationTypes.map(location => (
                <MenuItem key={location.value} value={location.value}>
                  {location.icon} {location.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
    }

    if (currentStep === 'access') {
      return (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Select Access Type</Typography>
          <FormControl fullWidth>
            <InputLabel>Access</InputLabel>
            <Select
              value={newMeeting.access || ''}
              label="Access"
              onChange={(e) => {
                setNewMeeting({ ...newMeeting, access: e.target.value });
                if (editingMeeting !== null) {
                  updateExistingMeeting();
                } else {
                  completeNewMeeting();
                }
              }}
            >
              {meetingAccess.map(access => (
                <MenuItem key={access.value} value={access.value}>
                  {access.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
            gap: 1, 
            py: 1,
            borderBottom: '1px solid #eee',
            mb: 1
          }}
        >
          <Button
            variant="text"
            onClick={() => startEditingMeeting(index, 'day')}
            sx={{ fontWeight: 500, minWidth: '70px', textAlign: 'left' }}
          >
            {days.find(d => d.key === item.day)?.label || item.day}
          </Button>
          
          <Button
            variant="text"
            onClick={() => startEditingMeeting(index, 'time')}
            sx={{ minWidth: '70px', textAlign: 'left' }}
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
            sx={{ fontSize: '1.2rem', minWidth: 'auto' }}
          >
            {meetingLocationTypes.find(l => l.value === item.locationType)?.icon || '🏢'}
          </Button>
          
          <Chip 
            label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Unknown'}
            size="small"
            color="primary"
            onClick={() => startEditingMeeting(index, 'format')}
            sx={{ fontSize: '0.7rem', height: '24px', cursor: 'pointer' }}
          />
          
          <Chip 
            label={item.access ? item.access.charAt(0).toUpperCase() + item.access.slice(1) : 'Unknown'}
            size="small"
            color={item.access === 'open' ? 'success' : 'error'}
            onClick={() => startEditingMeeting(index, 'access')}
            sx={{ fontSize: '0.7rem', height: '24px', cursor: 'pointer' }}
          />
          
          <Button
            size="small"
            color="error"
            onClick={() => removeScheduleItem(item.day, item.time)}
            sx={{ 
              minWidth: 'auto', 
              width: '24px', 
              height: '24px', 
              px: 0,
              fontSize: '1rem',
              borderRadius: '50%'
            }}
          >
            ×
          </Button>
        </Box>
      ))}

      {/* Tree structure for day selection, then step-by-step flow */}
      {currentStep === 'day' && editingMeeting === null && (
        <CustomNestedMenu 
          items={[
            {
              id: 'select-day',
              label: '+ Select Day',
              color: 'primary.main',
              fontWeight: 500,
              indentLevel: 0,
              children: days.map(day => ({
                id: `day-${day.key}`,
                label: day.label,
                color: 'text.primary',
                fontWeight: 500,
                indentLevel: 1,
                onClick: () => {
                  setNewMeeting({ ...newMeeting, day: day.key });
                  setCurrentStep('time');
                },
                isExpandable: false
              })),
              isExpandable: true
            }
          ]}
          onActionComplete={() => {}}
        />
      )}

      {/* Step-by-step selectors after day is chosen */}
      {currentStep !== 'day' && editingMeeting === null && (
        <Box sx={{ mt: 2 }}>
          {renderStepSelector()}
        </Box>
      )}

      {/* Editing existing meeting */}
      {editingMeeting !== null && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #orange', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Edit Meeting</Typography>
          {renderStepSelector()}
          <Button 
            variant="outlined" 
            onClick={() => {
              setEditingMeeting(null);
              setNewMeeting({});
              setCurrentStep('day');
            }}
            sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TreeMeetingSchedule;