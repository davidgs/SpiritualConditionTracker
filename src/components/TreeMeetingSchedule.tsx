import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
    { value: '06:15', label: use24HourFormat ? '06:15' : '6:15 AM' },
    { value: '06:30', label: use24HourFormat ? '06:30' : '6:30 AM' },
    { value: '06:45', label: use24HourFormat ? '06:45' : '6:45 AM' },
    { value: '07:00', label: use24HourFormat ? '07:00' : '7:00 AM' },
    { value: '07:15', label: use24HourFormat ? '07:15' : '7:15 AM' },
    { value: '07:30', label: use24HourFormat ? '07:30' : '7:30 AM' },
    { value: '07:45', label: use24HourFormat ? '07:45' : '7:45 AM' },
    { value: '08:00', label: use24HourFormat ? '08:00' : '8:00 AM' },
    { value: '08:15', label: use24HourFormat ? '08:15' : '8:15 AM' },
    { value: '08:30', label: use24HourFormat ? '08:30' : '8:30 AM' },
    { value: '08:45', label: use24HourFormat ? '08:45' : '8:45 AM' },
    { value: '09:00', label: use24HourFormat ? '09:00' : '9:00 AM' },
    { value: '09:15', label: use24HourFormat ? '09:15' : '9:15 AM' },
    { value: '09:30', label: use24HourFormat ? '09:30' : '9:30 AM' },
    { value: '09:45', label: use24HourFormat ? '09:45' : '9:45 AM' },
    { value: '10:00', label: use24HourFormat ? '10:00' : '10:00 AM' },
    { value: '10:15', label: use24HourFormat ? '10:15' : '10:15 AM' },
    { value: '10:30', label: use24HourFormat ? '10:30' : '10:30 AM' },
    { value: '10:45', label: use24HourFormat ? '10:45' : '10:45 AM' },
    { value: '11:00', label: use24HourFormat ? '11:00' : '11:00 AM' },
    { value: '11:15', label: use24HourFormat ? '11:15' : '11:15 AM' },
    { value: '11:30', label: use24HourFormat ? '11:30' : '11:30 AM' },
    { value: '11:45', label: use24HourFormat ? '11:45' : '11:45 AM' },
    { value: '12:00', label: use24HourFormat ? '12:00' : '12:00 PM' },
    { value: '12:15', label: use24HourFormat ? '12:15' : '12:15 PM' },
    { value: '12:30', label: use24HourFormat ? '12:30' : '12:30 PM' },
    { value: '12:45', label: use24HourFormat ? '12:45' : '12:45 PM' },
    { value: '13:00', label: use24HourFormat ? '13:00' : '1:00 PM' },
    { value: '13:15', label: use24HourFormat ? '13:15' : '1:15 PM' },
    { value: '13:30', label: use24HourFormat ? '13:30' : '1:30 PM' },
    { value: '13:45', label: use24HourFormat ? '13:45' : '1:45 PM' },
    { value: '14:00', label: use24HourFormat ? '14:00' : '2:00 PM' },
    { value: '14:15', label: use24HourFormat ? '14:15' : '2:15 PM' },
    { value: '14:30', label: use24HourFormat ? '14:30' : '2:30 PM' },
    { value: '14:45', label: use24HourFormat ? '14:45' : '2:45 PM' },
    { value: '15:00', label: use24HourFormat ? '15:00' : '3:00 PM' },
    { value: '15:15', label: use24HourFormat ? '15:15' : '3:15 PM' },
    { value: '15:30', label: use24HourFormat ? '15:30' : '3:30 PM' },
    { value: '15:45', label: use24HourFormat ? '15:45' : '3:45 PM' },
    { value: '16:00', label: use24HourFormat ? '16:00' : '4:00 PM' },
    { value: '16:15', label: use24HourFormat ? '16:15' : '4:15 PM' },
    { value: '16:30', label: use24HourFormat ? '16:30' : '4:30 PM' },
    { value: '16:45', label: use24HourFormat ? '16:45' : '4:45 PM' },
    { value: '17:00', label: use24HourFormat ? '17:00' : '5:00 PM' },
    { value: '17:15', label: use24HourFormat ? '17:15' : '5:15 PM' },
    { value: '17:30', label: use24HourFormat ? '17:30' : '5:30 PM' },
    { value: '17:45', label: use24HourFormat ? '17:45' : '5:45 PM' },
    { value: '18:00', label: use24HourFormat ? '18:00' : '6:00 PM' },
    { value: '18:15', label: use24HourFormat ? '18:15' : '6:15 PM' },
    { value: '18:30', label: use24HourFormat ? '18:30' : '6:30 PM' },
    { value: '18:45', label: use24HourFormat ? '18:45' : '6:45 PM' },
    { value: '19:00', label: use24HourFormat ? '19:00' : '7:00 PM' },
    { value: '19:15', label: use24HourFormat ? '19:15' : '7:15 PM' },
    { value: '19:30', label: use24HourFormat ? '19:30' : '7:30 PM' },
    { value: '19:45', label: use24HourFormat ? '19:45' : '7:45 PM' },
    { value: '20:00', label: use24HourFormat ? '20:00' : '8:00 PM' },
    { value: '20:15', label: use24HourFormat ? '20:15' : '8:15 PM' },
    { value: '20:30', label: use24HourFormat ? '20:30' : '8:30 PM' },
    { value: '20:45', label: use24HourFormat ? '20:45' : '8:45 PM' },
    { value: '21:00', label: use24HourFormat ? '21:00' : '9:00 PM' },
    { value: '21:15', label: use24HourFormat ? '21:15' : '9:15 PM' },
    { value: '21:30', label: use24HourFormat ? '21:30' : '9:30 PM' },
    { value: '21:45', label: use24HourFormat ? '21:45' : '9:45 PM' },
    { value: '22:00', label: use24HourFormat ? '22:00' : '10:00 PM' },
    { value: '22:15', label: use24HourFormat ? '22:15' : '10:15 PM' },
    { value: '22:30', label: use24HourFormat ? '22:30' : '10:30 PM' },
    { value: '22:45', label: use24HourFormat ? '22:45' : '10:45 PM' }
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

  const addMeetingWithDetails = (day: string, time: string, format: string, locationType: string, access: string) => {
    if (!day || !time || !format || !locationType || !access) {
      console.error('Missing required meeting details:', { day, time, format, locationType, access });
      return;
    }
    
    const newMeeting = { 
      day: day.trim(), 
      time: time.trim(), 
      format: format.trim(), 
      locationType: locationType.trim(),
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
            <Typography sx={{ fontSize: '1.2rem' }}>
              {meetingLocationTypes.find(l => l.value === item.locationType)?.icon || '🏢'}
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
              color={item.access === 'open' ? 'success' : 'error'}
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
            const locationChildren = meetingLocationTypes.map(locationType => {
              const accessChildren = meetingAccess.map(access => ({
                id: `${day.key}-${time.value}-${format.value}-${locationType.value}-${access.value}`,
                label: `${access.label} Meeting ← Click to add`,
                color: access.value === 'open' ? 'success.main' : 'error.main',
                fontSize: '0.8rem',
                indentLevel: 5,
                onClick: () => addMeetingWithDetails(day.key, time.value, format.value, locationType.value, access.value),
                isExpandable: false
              }));

              return {
                id: `${day.key}-${time.value}-${format.value}-${locationType.value}`,
                label: locationType.label,
                color: 'secondary.main',
                fontSize: '0.8rem',
                indentLevel: 4,
                children: accessChildren,
                isExpandable: true
              };
            });

            return {
              id: `${day.key}-${time.value}-${format.value}`,
              label: format.label,
              color: 'warning.main',
              fontSize: '0.8rem',
              indentLevel: 3,
              children: locationChildren,
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