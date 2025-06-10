    import React, { useState } from 'react';
    import { Box, Typography, Button, Chip, Select, MenuItem, FormControl, InputLabel, Menu } from '@mui/material';
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
      const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({ time: '19:00' });
      const [editingMeeting, setEditingMeeting] = useState<number | null>(null);
      const [dayMenuAnchor, setDayMenuAnchor] = useState<null | HTMLElement>(null);

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
                    setNewMeeting({ ...newMeeting, day: e.target.value, time: '19:00' });
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
                  value={dayjs(`2022-04-17T${newMeeting.time || ''}`)}
                  ampm={!use24HourFormat}
                  minutesStep={5}
                  open={true}
                  onChange={(value) => {
                    console.log('Time picker changed:', value);
                    if (value && value.isValid()) {
                      const timeString = value.format('HH:mm');
                      setNewMeeting(prev => ({ ...prev, time: timeString }));
                    }
                  }}
                  onAccept={(value) => {
                    console.log('Time picker accepted:', value);
                    const timeString = (value && value.isValid()) ? value.format('HH:mm') : (newMeeting.time || '19:00');
                    console.log('Time string:', timeString);
                    console.log('MeeitngTime: ', newMeeting.time);
                    if (editingMeeting !== null) {
                      const updatedSchedule = [...schedule];
                      updatedSchedule[editingMeeting] = {
                        ...updatedSchedule[editingMeeting],
                        time: timeString
                      };
                      onChange(updatedSchedule);

                      setEditingMeeting(null);
                      setNewMeeting({});
                      setCurrentStep('day');
                    } else {
                      setNewMeeting(prev => ({ ...prev, time: timeString }));
                      setCurrentStep('format');
                    }
                  }}
                  onClose={() => {
                    console.log('Time picker closed');
                    const timeString = newMeeting.time || '19:00';
                    console.log('Time string:', timeString);
                    if (editingMeeting !== null) {
                      const updatedSchedule = [...schedule];
                      updatedSchedule[editingMeeting] = {
                        ...updatedSchedule[editingMeeting],
                        time: timeString
                      };
                      onChange(updatedSchedule);

                      setEditingMeeting(null);
                      setNewMeeting({});
                      setCurrentStep('day');
                    } else {
                      setNewMeeting(prev => ({ ...prev, time: timeString }));
                      setCurrentStep('format');
                    }
                  }}
                  slotProps={{
                    textField: {
                      style: { display: 'none' }
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
              <CustomNestedMenu 
                items={[
                  {
                    id: 'select-format',
                    label: '+ Select Meeting Format',
                    color: 'primary.main',
                    fontWeight: 500,
                    indentLevel: 0,
                    children: meetingFormats.map(format => ({
                      id: `format-${format.value}`,
                      label: format.label,
                      color: 'text.primary',
                      fontWeight: 500,
                      indentLevel: 1,
                      onClick: () => {
                        setNewMeeting({ ...newMeeting, format: format.value });
                        setCurrentStep('location');
                      },
                      isExpandable: false
                    })),
                    isExpandable: true
                  }
                ]}
                onActionComplete={() => {}}
              />
            </Box>
          );
        }

        if (currentStep === 'location') {
          return (
            <Box sx={{ mb: 2 }}>
              <CustomNestedMenu 
                items={[
                  {
                    id: 'select-location',
                    label: '+ Select Location Type',
                    color: 'primary.main',
                    fontWeight: 500,
                    indentLevel: 0,
                    children: meetingLocationTypes.map(location => ({
                      id: `location-${location.value}`,
                      label: `${location.icon} ${location.label}`,
                      color: 'text.primary',
                      fontWeight: 500,
                      indentLevel: 1,
                      onClick: () => {
                        setNewMeeting({ ...newMeeting, locationType: location.value });
                        setCurrentStep('access');
                      },
                      isExpandable: false
                    })),
                    isExpandable: true
                  }
                ]}
                onActionComplete={() => {}}
              />
            </Box>
          );
        }

        if (currentStep === 'access') {
          return (
            <Box sx={{ mb: 2 }}>
              <CustomNestedMenu 
                items={[
                  {
                    id: 'select-access',
                    label: '+ Select Access Type',
                    color: 'primary.main',
                    fontWeight: 500,
                    indentLevel: 0,
                    children: meetingAccess.map(access => ({
                      id: `access-${access.value}`,
                      label: access.label,
                      color: 'text.primary',
                      fontWeight: 500,
                      indentLevel: 1,
                      onClick: () => {
                        const updatedMeeting = { ...newMeeting, access: access.value };
                        setNewMeeting(updatedMeeting);

                        // Complete the meeting immediately after access is selected
                        if (editingMeeting !== null) {
                          updateExistingMeeting();
                        } else {
                          // Need to call completeNewMeeting with the updated meeting data
                          if (updatedMeeting.day && updatedMeeting.time && updatedMeeting.format && updatedMeeting.locationType && updatedMeeting.access) {
                            const completeMeeting: ScheduleItem = {
                              day: updatedMeeting.day,
                              time: updatedMeeting.time,
                              format: updatedMeeting.format,
                              locationType: updatedMeeting.locationType,
                              access: updatedMeeting.access
                            };
                            const newSchedule = [...schedule, completeMeeting];
                            onChange(newSchedule);

                            // Reset for next meeting - go back to day selection
                            setNewMeeting({});
                            setCurrentStep('day');
                          }
                        }
                      },
                      isExpandable: false
                    })),
                    isExpandable: true
                  }
                ]}
                onActionComplete={() => {}}
              />
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

          {/* Progressive meeting display - shows as each part is selected */}
          {Object.keys(newMeeting).length > 0 && editingMeeting === null && (
            <Box 
              key={`${newMeeting.day}-${newMeeting.time}-${newMeeting.format}-${newMeeting.locationType}-${newMeeting.access}`}
              sx={(theme) => ({ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
                mb: 2,
                backgroundColor: theme.palette.action.hover,
                borderRadius: 1,
                px: 1
              })}
            >
              <Typography
                onClick={(e) => setDayMenuAnchor(e.currentTarget)}
                sx={{
                  cursor: 'pointer',
                  display: 'inline',
                  fontWeight: 500,
                  minWidth: '70px',
                  textAlign: 'left',
                  color: 'text.primary',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {newMeeting.day ? (days.find(d => d.key === newMeeting.day)?.label || newMeeting.day) : '---'}
              </Typography>
              <Menu
                anchorEl={dayMenuAnchor}
                open={Boolean(dayMenuAnchor)}
                onClose={() => setDayMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {days.map((day) => (
                  <MenuItem key={day.key} onClick={() => {
                    setNewMeeting({ ...newMeeting, day: day.key, time: '19:00' });
                    setCurrentStep('time');
                    setDayMenuAnchor(null);
                  }}>
                    {day.label}
                  </MenuItem>
                ))}
              </Menu>

              <Typography variant="body2" sx={(theme) => ({ 
                minWidth: '70px', 
                textAlign: 'left',
                color: theme.palette.text.primary
              })}>
                {newMeeting.time ? (use24HourFormat ? newMeeting.time : (() => {
                  const [hour, minute] = newMeeting.time.split(':');
                  const hourNum = parseInt(hour);
                  const period = hourNum >= 12 ? 'PM' : 'AM';
                  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                  return `${displayHour}:${minute} ${period}`;
                })()) : '---'}
              </Typography>

              <Typography sx={{ fontSize: '1.2rem' }}>
                {newMeeting.locationType ? (meetingLocationTypes.find(l => l.value === newMeeting.locationType)?.icon || '🏢') : '---'}
              </Typography>

              <Chip 
                label={newMeeting.format ? newMeeting.format.charAt(0).toUpperCase() + newMeeting.format.slice(1).replace('_', ' ') : '---'}
                size="small"
                color={newMeeting.format ? "primary" : "default"}
                variant={newMeeting.format ? "filled" : "outlined"}
                sx={{ fontSize: '0.7rem', height: '24px' }}
              />

              <Chip 
                label={newMeeting.access ? newMeeting.access.charAt(0).toUpperCase() + newMeeting.access.slice(1) : '---'}
                size="small"
                color={newMeeting.access === 'open' ? 'success' : newMeeting.access === 'closed' ? 'error' : 'default'}
                variant={newMeeting.access ? "filled" : "outlined"}
                sx={{ fontSize: '0.7rem', height: '24px' }}
              />
            </Box>
          )}

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