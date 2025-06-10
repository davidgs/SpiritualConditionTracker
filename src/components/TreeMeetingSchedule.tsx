import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
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
  
  const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({});

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

  const formatTime = (time: string) => {
    if (use24HourFormat) return time;
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  const renderScheduleBox = (content: string, field: string, isSelected: boolean) => {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          border: `1px solid ${isSelected ? muiTheme.palette.primary.main : muiTheme.palette.divider}`,
          borderRadius: 1,
          backgroundColor: isSelected ? muiTheme.palette.primary.light : 'transparent',
          cursor: 'pointer',
          textAlign: 'center',
          minWidth: '80px',
          fontSize: '0.875rem',
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? muiTheme.palette.primary.contrastText : muiTheme.palette.text.primary
        }}
        onClick={() => handleScheduleBoxClick(field)}
      >
        {content || '---'}
      </Box>
    );
  };

  const handleScheduleBoxClick = (field: string) => {
    // Simple click handler for schedule boxes
    console.log(`Clicked ${field}`);
  };

  const addNewMeeting = () => {
    const completeMeeting: ScheduleItem = {
      day: 'monday',
      time: '19:00',
      format: 'beginners',
      locationType: 'in_person',
      access: 'open'
    };
    const newSchedule = [...schedule, completeMeeting];
    onChange(newSchedule);
  };

  const removeScheduleItem = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    onChange(newSchedule);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Display existing meetings in compact horizontal layout */}
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
          <Typography variant="body2" sx={{ minWidth: '60px', fontWeight: 500 }}>
            ---
          </Typography>
          
          <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: 500 }}>
            {formatTime(item.time)}
          </Typography>
          
          <Typography variant="body2" sx={{ minWidth: '40px' }}>
            ---
          </Typography>
          
          <Typography variant="body2" sx={{ minWidth: '60px' }}>
            ---
          </Typography>
          
          <Chip 
            label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Open'}
            size="small"
            color="primary"
            sx={{ fontSize: '0.65rem', height: '20px', mx: 0.25 }}
          />
          
          <Button
            size="small"
            color="error"
            onClick={() => removeScheduleItem(index)}
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

      {/* Add Meeting Button */}
      <Button 
        variant="outlined" 
        onClick={addNewMeeting}
        sx={{ mt: 1 }}
      >
        Add Meeting Time
      </Button>
    </Box>
  );
};

export default TreeMeetingSchedule;