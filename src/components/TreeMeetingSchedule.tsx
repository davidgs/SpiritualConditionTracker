import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useTheme } from '@mui/material/styles';

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

  const addTimeToDay = (day: string, time: string) => {
    // Don't add immediately - just expand to show format options
    setExpandedItems(prev => [...prev, day, `${day}-${time}-new`]);
  };

  const addMeetingWithDetails = (day: string, time: string, format: string, access: string) => {
    // Validate all parameters are provided
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
    
    // Collapse all expanded items to clean up the interface
    setExpandedItems([]);
  };

  const updateScheduleItem = (day: string, time: string, field: 'format' | 'access', value: string) => {
    const newSchedule = schedule.map(item => {
      if (item.day === day && item.time === time) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newSchedule);
  };

  const removeScheduleItem = (day: string, time: string) => {
    const newSchedule = schedule.filter(item => !(item.day === day && item.time === time));
    onChange(newSchedule);
  };

  const getDaySchedule = (day: string) => {
    return schedule.filter(item => item.day === day);
  };

  const handleExpandedItemsChange = (event: React.SyntheticEvent, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <SimpleTreeView
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
        sx={{
          '& .MuiTreeItem-content': {
            py: 1,
            px: 2,
            borderRadius: 1,
            '&:hover': {
              bgcolor: muiTheme.palette.action.hover
            }
          },
          '& .MuiTreeItem-label': {
            fontSize: '0.875rem'
          }
        }}
      >
        {/* Show all existing meetings first */}
        {schedule.map((item, index) => (
          <TreeItem
            key={`existing-${index}`}
            itemId={`existing-${index}`}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {days.find(d => d.key === item.day)?.label || item.day}
                </Typography>
                <Typography variant="body2">
                  {timeOptions.find(t => t.value === item.time)?.label || item.time}
                </Typography>
                <Chip 
                  label={item.format ? item.format.charAt(0).toUpperCase() + item.format.slice(1).replace('_', ' ') : 'Unknown'}
                  size="small"
                  color="primary"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
                <Chip 
                  label={item.access ? item.access.charAt(0).toUpperCase() + item.access.slice(1) : 'Unknown'}
                  size="small"
                  color="secondary"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeScheduleItem(item.day, item.time)}
                  sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem' }}
                >
                  Remove
                </Button>
              </Box>
            }
          />
        ))}

        {/* Single "Select Day" item that starts the progressive flow */}
        <TreeItem
          itemId="select-day"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                + Select Day
              </Typography>
            </Box>
          }
        >
          {/* Step 1: Day selection */}
          {days.map(day => (
            <TreeItem
              key={`day-${day.key}`}
              itemId={`day-${day.key}`}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {day.label}
                  </Typography>
                </Box>
              }
            >
              {/* Step 2: Time selection - only show times not already taken for this day */}
              {timeOptions.filter(time => 
                !schedule.some(item => item.day === day.key && item.time === time.value)
              ).map(time => (
                <TreeItem
                  key={`day-${day.key}-time-${time.value}`}
                  itemId={`day-${day.key}-time-${time.value}`}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {time.label}
                      </Typography>
                    </Box>
                  }
                >
                  {/* Step 3: Format selection */}
                  {meetingFormats.map(format => (
                    <TreeItem
                      key={`day-${day.key}-time-${time.value}-format-${format.value}`}
                      itemId={`day-${day.key}-time-${time.value}-format-${format.value}`}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {format.label}
                          </Typography>
                        </Box>
                      }
                    >
                      {/* Step 4: Access selection - completes the meeting creation */}
                      {meetingAccess.map(access => (
                        <TreeItem
                          key={`day-${day.key}-time-${time.value}-format-${format.value}-access-${access.value}`}
                          itemId={`day-${day.key}-time-${time.value}-format-${format.value}-access-${access.value}`}
                          label={
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                py: 0.5,
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: muiTheme.palette.action.hover
                                }
                              }}
                              onClick={() => addMeetingWithDetails(day.key, time.value, format.value, access.value)}
                            >
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>
                                {access.label} Meeting
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'primary.main' }}>
                                ← Click to add
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </TreeItem>
          ))}
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
};

export default TreeMeetingSchedule;