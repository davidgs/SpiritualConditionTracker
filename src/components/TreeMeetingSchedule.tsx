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

  const addMeetingWithDetails = (day: string, hour: string, minute: string, format: string, locationType: string, access: string) => {
    if (!day || !hour || !minute || !format || !locationType || !access) {
      console.error('Missing required meeting details:', { day, hour, minute, format, locationType, access });
      return;
    }
    
    const time = `${hour}:${minute}`;
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
              {use24HourFormat ? item.time : (() => {
                const [hour, minute] = item.time.split(':');
                const hourNum = parseInt(hour);
                const period = hourNum >= 12 ? 'PM' : 'AM';
                const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                return `${displayHour}:${minute} ${period}`;
              })()}
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
      const hourChildren = hourOptions.map(hour => {
        const minuteChildren = minuteOptions
          .filter(minute => !schedule.some(item => item.day === day.key && item.time === `${hour.value}:${minute.value}`))
          .map(minute => {
            // Only show the 3 most common meeting formats to prevent performance issues
            const commonFormats = [
              { value: 'discussion', label: 'Discussion' },
              { value: 'speaker', label: 'Speaker' },
              { value: 'step_study', label: 'Step Study' }
            ];
            
            const formatChildren = commonFormats.map(format => ({
              id: `${day.key}-${hour.value}-${minute.value}-${format.value}`,
              label: `${format.label} → Select location`,
              color: 'warning.main',
              fontSize: '0.8rem',
              indentLevel: 4,
              children: meetingLocationTypes.map(locationType => ({
                id: `${day.key}-${hour.value}-${minute.value}-${format.value}-${locationType.value}`,
                label: `${locationType.label} → Select access`,
                color: 'secondary.main',
                fontSize: '0.8rem',
                indentLevel: 5,
                children: meetingAccess.map(access => ({
                  id: `${day.key}-${hour.value}-${minute.value}-${format.value}-${locationType.value}-${access.value}`,
                  label: `${access.label} Meeting ← Click to add`,
                  color: access.value === 'open' ? 'success.main' : 'error.main',
                  fontSize: '0.8rem',
                  indentLevel: 6,
                  onClick: () => addMeetingWithDetails(day.key, hour.value, minute.value, format.value, locationType.value, access.value),
                  isExpandable: false
                })),
                isExpandable: true
              })),
              isExpandable: true
            }));

            return {
              id: `${day.key}-${hour.value}-${minute.value}`,
              label: `${minute.label} → Select format`,
              color: 'info.main',
              fontSize: '0.8rem',
              indentLevel: 3,
              children: formatChildren,
              isExpandable: true
            };
          });

        return {
          id: `${day.key}-${hour.value}`,
          label: hour.label,
          color: 'info.main',
          fontSize: '0.85rem',
          indentLevel: 2,
          children: minuteChildren,
          isExpandable: true
        };
      });

      return {
        id: `day-${day.key}`,
        label: day.label,
        color: 'text.primary',
        fontWeight: 500,
        indentLevel: 1,
        children: hourChildren,
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