import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomNestedMenu from './CustomNestedMenu';

interface ScheduleItem {
  day: string;
  time: string;
  format: string;
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

  const days = [
    { key: 'sunday', label: 'Sunday' },
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' }
  ];

  const timeOptions = [
    { value: '06:00', label: use24HourFormat ? '06:00' : '6:00 AM' },
    { value: '07:00', label: use24HourFormat ? '07:00' : '7:00 AM' },
    { value: '08:00', label: use24HourFormat ? '08:00' : '8:00 AM' },
    { value: '09:00', label: use24HourFormat ? '09:00' : '9:00 AM' },
    { value: '10:00', label: use24HourFormat ? '10:00' : '10:00 AM' },
    { value: '11:00', label: use24HourFormat ? '11:00' : '11:00 AM' },
    { value: '12:00', label: use24HourFormat ? '12:00' : '12:00 PM' },
    { value: '13:00', label: use24HourFormat ? '13:00' : '1:00 PM' },
    { value: '14:00', label: use24HourFormat ? '14:00' : '2:00 PM' },
    { value: '15:00', label: use24HourFormat ? '15:00' : '3:00 PM' },
    { value: '16:00', label: use24HourFormat ? '16:00' : '4:00 PM' },
    { value: '17:00', label: use24HourFormat ? '17:00' : '5:00 PM' },
    { value: '18:00', label: use24HourFormat ? '18:00' : '6:00 PM' },
    { value: '19:00', label: use24HourFormat ? '19:00' : '7:00 PM' },
    { value: '20:00', label: use24HourFormat ? '20:00' : '8:00 PM' },
    { value: '21:00', label: use24HourFormat ? '21:00' : '9:00 PM' },
    { value: '22:00', label: use24HourFormat ? '22:00' : '10:00 PM' }
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

  const meetingAccess = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
  ];

  const addMeetingWithDetails = (day: string, time: string, format: string, access: string) => {
    if (!day || !time || !format || !access) {
      console.error('Missing required meeting details:', { day, time, format, access });
      return;
    }
    
    const newMeeting = { 
      day: day.trim(), 
      time: time.trim(), 
      format: format.trim(), 
      access: access.trim() 
    };
    
    const newSchedule = [...schedule, newMeeting];
    onChange(newSchedule);
  };

  const removeScheduleItem = (day: string, time: string) => {
    const newSchedule = schedule.filter(item => !(item.day === day && item.time === time));
    onChange(newSchedule);
  };

  const buildMenuItems = () => {
    const menuItems: any[] = [];

    // Add existing meetings first
    schedule.forEach((item, index) => {
      menuItems.push({
        id: `existing-${index}`,
        label: (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            py: 0.5,
            flexWrap: 'nowrap',
            minWidth: '100%'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '70px', textAlign: 'left' }}>
              {days.find(d => d.key === item.day)?.label || item.day}
            </Typography>
            <Typography variant="body2" sx={{ minWidth: '70px', textAlign: 'left' }}>
              {timeOptions.find(t => t.value === item.time)?.label || item.time}
            </Typography>
            <Chip 
              label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Unknown'}
              size="small"
              color="primary"
              sx={{ fontSize: '0.7rem', height: '20px', minWidth: 'fit-content' }}
            />
            <Chip 
              label={item.access ? item.access.charAt(0).toUpperCase() + item.access.slice(1) : 'Unknown'}
              size="small"
              color="secondary"
              sx={{ fontSize: '0.7rem', height: '20px', minWidth: 'fit-content' }}
            />
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                removeScheduleItem(item.day, item.time);
              }}
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
        ),
        indentLevel: 0,
        isExpandable: false
      });
    });

    // Add the "Select Day" menu structure
    const dayChildren = days.map(day => {
      const timeChildren = timeOptions
        .filter(time => !schedule.some(item => item.day === day.key && item.time === time.value))
        .map(time => {
          const formatChildren = meetingFormats.map(format => {
            const accessChildren = meetingAccess.map(access => ({
              id: `${day.key}-${time.value}-${format.value}-${access.value}`,
              label: `${access.label} Meeting ← Click to add`,
              color: access.value === 'open' ? 'success.main' : 'error.main',
              fontSize: '0.8rem',
              indentLevel: 4,
              onClick: () => addMeetingWithDetails(day.key, time.value, format.value, access.value),
              isExpandable: false
            }));

            return {
              id: `${day.key}-${time.value}-${format.value}`,
              label: format.label,
              color: 'warning.main',
              fontSize: '0.8rem',
              indentLevel: 3,
              children: accessChildren,
              isExpandable: true
            };
          });

          return {
            id: `${day.key}-${time.value}`,
            label: time.label,
            color: 'info.main',
            fontSize: '0.8rem',
            indentLevel: 2,
            children: formatChildren,
            isExpandable: true
          };
        });

      return {
        id: `day-${day.key}`,
        label: day.label,
        color: 'text.primary',
        fontWeight: 500,
        indentLevel: 1,
        children: timeChildren,
        isExpandable: true
      };
    });

    menuItems.push({
      id: 'select-day',
      label: '+ Select Day',
      color: 'primary.main',
      fontWeight: 500,
      indentLevel: 0,
      children: dayChildren,
      isExpandable: true
    });

    return menuItems;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <CustomNestedMenu 
        items={buildMenuItems()} 
        onActionComplete={() => {
          // Additional cleanup can be done here if needed
        }}
      />
    </Box>
  );
};

export default TreeMeetingSchedule;