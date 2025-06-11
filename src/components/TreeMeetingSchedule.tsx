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
      meetingName?: string;
    }

    const TreeMeetingSchedule: React.FC<TreeMeetingScheduleProps> = ({ 
      schedule, 
      onChange, 
      use24HourFormat = false,
      meetingName = ''
    }) => {
      const muiTheme = useTheme();

      // State for the step-by-step meeting creation
      const [currentStep, setCurrentStep] = useState<'day' | 'time' | 'format' | 'location' | 'access' | 'complete'>('day');
      const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({ time: '19:00' });
      const [editingMeeting, setEditingMeeting] = useState<number | null>(null);
      const [editDayMenuAnchor, setEditDayMenuAnchor] = useState<null | HTMLElement>(null);
      const [editLocationMenuAnchor, setEditLocationMenuAnchor] = useState<null | HTMLElement>(null);
      const [editFormatMenuAnchor, setEditFormatMenuAnchor] = useState<null | HTMLElement>(null);
      const [editAccessMenuAnchor, setEditAccessMenuAnchor] = useState<null | HTMLElement>(null);
      const [isEditTimePickerOpen, setIsEditTimePickerOpen] = useState(false);
      const [dayMenuAnchor, setDayMenuAnchor] = useState<null | HTMLElement>(null);
      const [locationMenuAnchor, setLocationMenuAnchor] = useState<null | HTMLElement>(null);
      const [formatMenuAnchor, setFormatMenuAnchor] = useState<null | HTMLElement>(null);
      const [accessMenuAnchor, setAccessMenuAnchor] = useState<null | HTMLElement>(null);
      const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
      const [timePickerValue, setTimePickerValue] = useState<dayjs.Dayjs | null>(null);


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
          {/* Display existing meetings with inline editing */}
          {schedule.map((item, index) => (
            <Box
              key={index}
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
                onClick={(e) => {
                  setEditingMeeting(index);
                  setEditDayMenuAnchor(e.currentTarget);
                }}
                sx={(theme) => ({
                  cursor: 'pointer',
                  display: 'inline',
                  fontWeight: 500,
                  minWidth: '70px',
                  textAlign: 'left',
                  color: `${theme.palette.primary.main}`,
                })}
              >
                {days.find(d => d.key === item.day)?.label || item.day}
              </Typography>
              <Menu
                anchorEl={editDayMenuAnchor}
                open={Boolean(editDayMenuAnchor && editingMeeting === index)}
                onClose={() => {
                  setEditDayMenuAnchor(null);
                  setEditingMeeting(null);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {days.map((day) => (
                  <MenuItem key={day.key} onClick={() => {
                    const updatedSchedule = [...schedule];
                    updatedSchedule[index] = { ...updatedSchedule[index], day: day.key };
                    onChange(updatedSchedule);
                    setEditDayMenuAnchor(null);
                    setEditingMeeting(null);
                  }}>
                    {day.label}
                  </MenuItem>
                ))}
              </Menu>

              <Typography 
                variant="body2" 
                onClick={() => {
                  setEditingMeeting(index);
                  setIsEditTimePickerOpen(true);
                }}
                sx={(theme) => ({ 
                  minWidth: '70px', 
                  textAlign: 'left',
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                })}>
                {use24HourFormat ? item.time : (() => {
                  const [hour, minute] = item.time.split(':');
                  const hourNum = parseInt(hour);
                  const period = hourNum >= 12 ? 'PM' : 'AM';
                  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                  return `${displayHour}:${minute} ${period}`;
                })()}
              </Typography>

              <Typography 
                onClick={(e) => {
                  setEditingMeeting(index);
                  setEditLocationMenuAnchor(e.currentTarget);
                }}
                sx={{ 
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {meetingLocationTypes.find(l => l.value === item.locationType)?.icon || '🏢'}
              </Typography>
              <Menu
                anchorEl={editLocationMenuAnchor}
                open={Boolean(editLocationMenuAnchor && editingMeeting === index)}
                onClose={() => {
                  setEditLocationMenuAnchor(null);
                  setEditingMeeting(null);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {meetingLocationTypes.map((locationType) => (
                  <MenuItem key={locationType.value} onClick={() => {
                    const updatedSchedule = [...schedule];
                    updatedSchedule[index] = { ...updatedSchedule[index], locationType: locationType.value };
                    onChange(updatedSchedule);
                    setEditLocationMenuAnchor(null);
                    setEditingMeeting(null);
                  }}>
                    {locationType.icon} {locationType.label}
                  </MenuItem>
                ))}
              </Menu>

              <Chip 
                label={meetingFormats.find(f => f.value === item.format)?.label || item.format}
                size="small"
                color="primary"
                onClick={(e) => {
                  setEditingMeeting(index);
                  setEditFormatMenuAnchor(e.currentTarget);
                }}
                sx={{ 
                  fontSize: '0.7rem', 
                  height: '24px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
              <Menu
                anchorEl={editFormatMenuAnchor}
                open={Boolean(editFormatMenuAnchor && editingMeeting === index)}
                onClose={() => {
                  setEditFormatMenuAnchor(null);
                  setEditingMeeting(null);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {meetingFormats.map((format) => (
                  <MenuItem key={format.value} onClick={() => {
                    const updatedSchedule = [...schedule];
                    updatedSchedule[index] = { ...updatedSchedule[index], format: format.value };
                    onChange(updatedSchedule);
                    setEditFormatMenuAnchor(null);
                    setEditingMeeting(null);
                  }}>
                    {format.label}
                  </MenuItem>
                ))}
              </Menu>

              <Chip 
                label={meetingAccess.find(a => a.value === item.access)?.label || item.access}
                size="small"
                color={item.access === 'open' ? 'success' : 'error'}
                onClick={(e) => {
                  setEditingMeeting(index);
                  setEditAccessMenuAnchor(e.currentTarget);
                }}
                sx={{ 
                  fontSize: '0.7rem', 
                  height: '24px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
              <Menu
                anchorEl={editAccessMenuAnchor}
                open={Boolean(editAccessMenuAnchor && editingMeeting === index)}
                onClose={() => {
                  setEditAccessMenuAnchor(null);
                  setEditingMeeting(null);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {meetingAccess.map((access) => (
                  <MenuItem key={access.value} onClick={() => {
                    const updatedSchedule = [...schedule];
                    updatedSchedule[index] = { ...updatedSchedule[index], access: access.value };
                    onChange(updatedSchedule);
                    setEditAccessMenuAnchor(null);
                    setEditingMeeting(null);
                  }}>
                    {access.label}
                  </MenuItem>
                ))}
              </Menu>

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

          {/* Add Another Meeting Button - show when meetings exist and no meeting is in progress */}
          {schedule.length > 0 && Object.keys(newMeeting).length === 0 && editingMeeting === null && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setNewMeeting({ time: '19:00' });
                  setCurrentStep('day');
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 1,
                  px: 2,
                  py: 1
                }}
              >
                + Add Another Meeting Time
              </Button>
            </Box>
          )}

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
                sx={(theme) => ({
                  cursor: 'pointer',
                  display: 'inline',
                  fontWeight: 500,
                  minWidth: '70px',
                  textAlign: 'left',
                  color: `${theme.palette.primary.main}`,
                })}
              >
                {newMeeting.day ? (days.find(d => d.key === newMeeting.day)?.label || newMeeting.day) : 'Day'}
              </Typography>
              <Menu
                anchorEl={dayMenuAnchor}
                open={Boolean(dayMenuAnchor)}
                onClose={() => setDayMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {days.map((day) => (
                  <MenuItem key={day.key} onClick={() => {
                    const updatedMeeting = { ...newMeeting, day: day.key, time: newMeeting.time || '19:00' };
                    setNewMeeting(updatedMeeting);
                    setDayMenuAnchor(null);
                    
                    // Auto-complete meeting if all fields are filled
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
                      
                      // Reset for next meeting
                      setNewMeeting({});
                      setCurrentStep('day');
                    }
                  }}>
                    {day.label}
                  </MenuItem>
                ))}
              </Menu>

              <Typography 
                variant="body2" 
                onClick={() => setIsTimePickerOpen(true)}
                sx={(theme) => ({ 
                  minWidth: '70px', 
                  textAlign: 'left',
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                })}>
                {newMeeting.time ? (use24HourFormat ? newMeeting.time : (() => {
                  const [hour, minute] = newMeeting.time.split(':');
                  const hourNum = parseInt(hour);
                  const period = hourNum >= 12 ? 'PM' : 'AM';
                  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                  return `${displayHour}:${minute} ${period}`;
                })()) : '---'}
              </Typography>

              <Typography 
                onClick={(e) => setLocationMenuAnchor(e.currentTarget)}
                sx={{ 
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {newMeeting.locationType ? (meetingLocationTypes.find(l => l.value === newMeeting.locationType)?.icon || '🏢') : '---'}
              </Typography>
              <Menu
                anchorEl={locationMenuAnchor}
                open={Boolean(locationMenuAnchor)}
                onClose={() => setLocationMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {meetingLocationTypes.map((location) => (
                  <MenuItem key={location.value} onClick={() => {
                    const updatedMeeting = { ...newMeeting, locationType: location.value };
                    setNewMeeting(updatedMeeting);
                    setLocationMenuAnchor(null);
                    
                    // Auto-complete meeting if all fields are filled
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
                      
                      // Reset for next meeting
                      setNewMeeting({});
                      setCurrentStep('day');
                    }
                  }}>
                    {location.icon} {location.label}
                  </MenuItem>
                ))}
              </Menu>

              <Chip 
                label={newMeeting.format ? newMeeting.format.charAt(0).toUpperCase() + newMeeting.format.slice(1).replace('_', ' ') : 'format'}
                size="small"
                color={newMeeting.format ? "primary" : "primary"}
                variant={newMeeting.format ? "filled" : "outlined"}
                onClick={(e) => setFormatMenuAnchor(e.currentTarget)}
                sx={{ 
                  fontSize: '0.7rem', 
                  height: '24px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
              <Menu
                anchorEl={formatMenuAnchor}
                open={Boolean(formatMenuAnchor)}
                onClose={() => setFormatMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {meetingFormats.map((format) => (
                  <MenuItem key={format.value} onClick={() => {
                    const updatedMeeting = { ...newMeeting, format: format.value };
                    setNewMeeting(updatedMeeting);
                    setFormatMenuAnchor(null);
                    
                    // Auto-complete meeting if all fields are filled
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
                      
                      // Reset for next meeting
                      setNewMeeting({});
                      setCurrentStep('day');
                    }
                  }}>
                    {format.label}
                  </MenuItem>
                ))}
              </Menu>

              <Chip 
                label={newMeeting.access ? newMeeting.access.charAt(0).toUpperCase() + newMeeting.access.slice(1) : 'access'}
                size="small"
                color={newMeeting.access === 'open' ? 'success' : newMeeting.access === 'closed' ? 'error' : 'primary'}
                variant={newMeeting.access ? "filled" : "outlined"}
                onClick={(e) => setAccessMenuAnchor(e.currentTarget)}
                sx={{ 
                  fontSize: '0.7rem', 
                  height: '24px',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              />
              <Menu
                anchorEl={accessMenuAnchor}
                open={Boolean(accessMenuAnchor)}
                onClose={() => setAccessMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {meetingAccess.map((access) => (
                  <MenuItem key={access.value} onClick={() => {
                    const updatedMeeting = { ...newMeeting, access: access.value };
                    setNewMeeting(updatedMeeting);
                    setAccessMenuAnchor(null);
                    
                    // Auto-complete meeting if all fields are filled
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
                      
                      // Reset for next meeting
                      setNewMeeting({});
                      setCurrentStep('day');
                    }
                  }}>
                    {access.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}





          {/* Edit Time Picker Modal */}
          {isEditTimePickerOpen && editingMeeting !== null && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileTimePicker
                label="Meeting Time"
                value={dayjs(`2023-01-01T${schedule[editingMeeting].time}:00`)}
                onChange={(value) => {
                  if (value && value.isValid()) {
                    const timeString = value.format('HH:mm');
                    const updatedSchedule = [...schedule];
                    updatedSchedule[editingMeeting] = { ...updatedSchedule[editingMeeting], time: timeString };
                    onChange(updatedSchedule);
                  }
                }}
                onAccept={(value) => {
                  if (value && value.isValid()) {
                    const timeString = value.format('HH:mm');
                    const updatedSchedule = [...schedule];
                    updatedSchedule[editingMeeting] = { ...updatedSchedule[editingMeeting], time: timeString };
                    onChange(updatedSchedule);
                  }
                  setIsEditTimePickerOpen(false);
                  setEditingMeeting(null);
                }}
                onClose={() => {
                  setIsEditTimePickerOpen(false);
                  setEditingMeeting(null);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                  mobilePaper: {
                    sx: {
                      top: '20%',
                      transform: 'translateY(-20%)'
                    }
                  },
                  actionBar: {
                    actions: ['accept', 'cancel'],
                  },
                }}
              />
            </LocalizationProvider>
          )}

          {/* Time Picker Modal */}
          {isTimePickerOpen && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileTimePicker
                value={timePickerValue || dayjs(`2022-04-17T${newMeeting.time || '19:00'}`)}
                ampm={!use24HourFormat}
                minutesStep={5}
                open={true}
                onChange={(value) => {
                  if (value && value.isValid()) {
                    setTimePickerValue(value);
                    console.log('Time picker onChange:', value.format('HH:mm'));
                  }
                }}
                onAccept={(value) => {
                  const finalValue = timePickerValue || value;
                  const timeString = (finalValue && finalValue.isValid()) ? finalValue.format('HH:mm') : (newMeeting.time || '19:00');
                  const updatedMeeting = { ...newMeeting, time: timeString };
                  setNewMeeting(updatedMeeting);
                  setIsTimePickerOpen(false);
                  setTimePickerValue(null);
                  
                  // Auto-complete meeting if all fields are filled
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
                    
                    // Reset for next meeting
                    setNewMeeting({});
                    setCurrentStep('day');
                  }
                }}
                onClose={() => {
                  setIsTimePickerOpen(false);
                  setTimePickerValue(null);
                }}
                slotProps={{
                  textField: {
                    style: { display: 'none' }
                  },
                  mobilePaper: {
                    sx: {
                      top: '20%',
                      transform: 'translateY(-20%)'
                    }
                  },
                  actionBar: {
                    actions: ['accept', 'cancel'],
                  },
                }}
              />
            </LocalizationProvider>
          )}


        </Box>
      );
    };

export default TreeMeetingSchedule;