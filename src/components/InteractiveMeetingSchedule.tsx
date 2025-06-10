import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Stepper,
  Step,
  StepLabel,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Paper,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

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
  // Customization options
  showStepper?: boolean;
  allowMultipleMeetings?: boolean;
  defaultTime?: string;
  minuteStep?: number;
  compactMode?: boolean;
  // Text customization
  addButtonText?: string;
  emptyStateText?: string;
  // Styling options
  elevation?: number;
  borderRadius?: number;
  // Event handlers
  onMeetingAdded?: (meeting: ScheduleItem) => void;
  onMeetingRemoved?: (meeting: ScheduleItem, index: number) => void;
  onMeetingUpdated?: (meeting: ScheduleItem, index: number) => void;
}

const InteractiveMeetingSchedule: React.FC<InteractiveMeetingScheduleProps> = ({ 
  schedule, 
  onChange, 
  use24HourFormat = false,
  showStepper = true,
  allowMultipleMeetings = true,
  defaultTime = '19:00',
  minuteStep = 15,
  compactMode = false,
  addButtonText = '+ Add Meeting Time',
  emptyStateText = 'No meetings scheduled',
  elevation = 2,
  borderRadius = 1,
  onMeetingAdded,
  onMeetingRemoved,
  onMeetingUpdated
}) => {
  const muiTheme = useTheme();
  
  // State for the step-by-step meeting creation
  const [scheduleStep, setScheduleStep] = useState<'day' | 'time' | 'format' | 'location' | 'access' | 'complete'>('day');
  const [newMeeting, setNewMeeting] = useState<Partial<ScheduleItem>>({});
  const [editingMeeting, setEditingMeeting] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeSpeedDial, setActiveSpeedDial] = useState<string | null>(null);

  const days = [
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' }
  ];

  const meetingFormats = [
    { value: 'discussion', label: 'Discussion', icon: '💬' },
    { value: 'speaker', label: 'Speaker', icon: '🎤' },
    { value: 'mens', label: "Men's", icon: '👨' },
    { value: 'womens', label: "Women's", icon: '👩' },
    { value: 'young_people', label: "Young People's", icon: '🧑' },
    { value: 'beginners', label: 'Beginners', icon: '🌱' },
    { value: 'big_book', label: 'Big Book', icon: '📖' },
    { value: 'step_study', label: 'Step Study', icon: '📚' },
    { value: 'literature', label: 'Literature', icon: '📝' }
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

  const scheduleSteps = [
    { key: 'day', label: 'Day', icon: <EventIcon /> },
    { key: 'time', label: 'Time', icon: <AccessTimeIcon /> },
    { key: 'format', label: 'Format', icon: <GroupIcon /> },
    { key: 'location', label: 'Location', icon: <LocationOnIcon /> },
    { key: 'access', label: 'Access', icon: <CheckIcon /> }
  ];

  const getCurrentStepIndex = () => {
    return scheduleSteps.findIndex(step => step.key === scheduleStep);
  };

  const getDisplayValue = (field: keyof ScheduleItem, value: string) => {
    switch (field) {
      case 'day':
        return days.find(d => d.key === value)?.label || '---';
      case 'time':
        if (!value) return '---';
        const timeObj = dayjs(`2022-04-17T${value}`);
        return timeObj.format(use24HourFormat ? 'HH:mm' : 'h:mm A');
      case 'format':
        return meetingFormats.find(f => f.value === value)?.label || '---';
      case 'locationType':
        return meetingLocationTypes.find(l => l.value === value)?.label || '---';
      case 'access':
        return meetingAccess.find(a => a.value === value)?.label || '---';
      default:
        return value || '---';
    }
  };

  const handleSectionClick = useCallback((field: keyof ScheduleItem, meetingIndex?: number) => {
    if (meetingIndex !== undefined) {
      // Editing existing meeting
      setEditingMeeting(meetingIndex);
      setNewMeeting({...schedule[meetingIndex]});
    }
    
    // Set the appropriate step
    const stepMap: { [K in keyof ScheduleItem]?: typeof scheduleStep } = {
      day: 'day',
      time: 'time',
      format: 'format',
      locationType: 'location',
      access: 'access'
    };
    
    const targetStep = stepMap[field];
    if (targetStep) {
      setScheduleStep(targetStep);
      
      if (field === 'time') {
        setShowTimePicker(true);
      } else {
        setActiveSpeedDial(field);
      }
    }
  }, [schedule]);

  const completeStep = useCallback((field: keyof ScheduleItem, value: string) => {
    const updatedMeeting = { ...newMeeting, [field]: value };
    setNewMeeting(updatedMeeting);
    setActiveSpeedDial(null);
    
    if (editingMeeting !== null) {
      // Update existing meeting
      const updatedSchedule = [...schedule];
      const originalMeeting = updatedSchedule[editingMeeting];
      updatedSchedule[editingMeeting] = updatedMeeting as ScheduleItem;
      onChange(updatedSchedule);
      
      // Fire callback for updated meeting
      if (onMeetingUpdated) {
        onMeetingUpdated(updatedMeeting as ScheduleItem, editingMeeting);
      }
      
      setEditingMeeting(null);
      setNewMeeting({});
      setScheduleStep('day');
    } else {
      // Continue to next step or complete
      const stepOrder = ['day', 'time', 'format', 'location', 'access'];
      const currentIndex = stepOrder.indexOf(scheduleStep);
      
      if (currentIndex < stepOrder.length - 1) {
        setScheduleStep(stepOrder[currentIndex + 1] as typeof scheduleStep);
      } else {
        // Complete the meeting
        if (updatedMeeting.day && updatedMeeting.time && updatedMeeting.format && 
            updatedMeeting.locationType && updatedMeeting.access) {
          const completeMeeting: ScheduleItem = updatedMeeting as ScheduleItem;
          const newSchedule = [...schedule, completeMeeting];
          onChange(newSchedule);
          
          // Fire callback for added meeting
          if (onMeetingAdded) {
            onMeetingAdded(completeMeeting);
          }
          
          setNewMeeting({});
          setScheduleStep('day');
          
          // If not allowing multiple meetings, don't show add button anymore
          if (!allowMultipleMeetings) {
            // Component will hide add button based on schedule length
          }
        }
      }
    }
  }, [newMeeting, editingMeeting, schedule, scheduleStep, onChange, onMeetingAdded, onMeetingUpdated, allowMultipleMeetings]);

  const removeMeeting = useCallback((index: number) => {
    const meetingToRemove = schedule[index];
    const newSchedule = schedule.filter((_, i) => i !== index);
    onChange(newSchedule);
    
    // Fire callback for removed meeting
    if (onMeetingRemoved) {
      onMeetingRemoved(meetingToRemove, index);
    }
  }, [schedule, onChange, onMeetingRemoved]);

  const renderMeetingPreview = useCallback((meeting: Partial<ScheduleItem>, isComplete: boolean = false) => (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: compactMode ? 1.5 : 2, 
        mb: compactMode ? 1 : 2, 
        borderRadius: borderRadius,
        backgroundColor: isComplete ? muiTheme.palette.background.paper : muiTheme.palette.grey[50],
        border: isComplete ? `2px solid ${muiTheme.palette.success.main}` : `1px solid ${muiTheme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {/* Day Section */}
          <Chip 
            label={getDisplayValue('day', meeting.day || '')}
            onClick={() => handleSectionClick('day', isComplete ? schedule.findIndex(s => s === meeting) : undefined)}
            variant={meeting.day ? 'filled' : 'outlined'}
            color={meeting.day ? 'primary' : 'default'}
            sx={{ minWidth: 80, cursor: 'pointer' }}
          />
          
          {/* Time Section */}
          <Chip 
            label={getDisplayValue('time', meeting.time || '')}
            onClick={() => handleSectionClick('time', isComplete ? schedule.findIndex(s => s === meeting) : undefined)}
            variant={meeting.time ? 'filled' : 'outlined'}
            color={meeting.time ? 'primary' : 'default'}
            sx={{ minWidth: 80, cursor: 'pointer' }}
          />
          
          {/* Format Section */}
          <Chip 
            label={getDisplayValue('format', meeting.format || '')}
            onClick={() => handleSectionClick('format', isComplete ? schedule.findIndex(s => s === meeting) : undefined)}
            variant={meeting.format ? 'filled' : 'outlined'}
            color={meeting.format ? 'primary' : 'default'}
            sx={{ minWidth: 100, cursor: 'pointer' }}
          />
          
          {/* Location Type Section */}
          <Chip 
            label={getDisplayValue('locationType', meeting.locationType || '')}
            onClick={() => handleSectionClick('locationType', isComplete ? schedule.findIndex(s => s === meeting) : undefined)}
            variant={meeting.locationType ? 'filled' : 'outlined'}
            color={meeting.locationType ? 'primary' : 'default'}
            sx={{ minWidth: 90, cursor: 'pointer' }}
          />
          
          {/* Access Section */}
          <Chip 
            label={getDisplayValue('access', meeting.access || '')}
            onClick={() => handleSectionClick('access', isComplete ? schedule.findIndex(s => s === meeting) : undefined)}
            variant={meeting.access ? 'filled' : 'outlined'}
            color={meeting.access ? 'primary' : 'default'}
            sx={{ minWidth: 70, cursor: 'pointer' }}
          />
          
          {isComplete && (
            <IconButton 
              onClick={() => removeMeeting(schedule.findIndex(s => s === meeting))}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Paper>
  ), [elevation, compactMode, borderRadius, muiTheme, handleSectionClick, removeMeeting, schedule]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ position: 'relative' }}>
        {/* Mini stepper for schedule creation */}
        {(Object.keys(newMeeting).length > 0 || editingMeeting !== null) && (
          <Box sx={{ mb: 2 }}>
            <Stepper activeStep={getCurrentStepIndex()} alternativeLabel>
              {scheduleSteps.map((step) => (
                <Step key={step.key}>
                  <StepLabel 
                    icon={step.icon}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '0.7rem'
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* Existing meetings */}
        {schedule.map((meeting, index) => (
          <Box key={`${meeting.day}-${meeting.time}-${index}`}>
            {renderMeetingPreview(meeting, true)}
          </Box>
        ))}

        {/* New meeting in progress */}
        {Object.keys(newMeeting).length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: muiTheme.palette.primary.main }}>
              Creating Meeting:
            </Typography>
            {renderMeetingPreview(newMeeting, false)}
          </Box>
        )}

        {/* Add new meeting button */}
        {Object.keys(newMeeting).length === 0 && editingMeeting === null && 
         (allowMultipleMeetings || schedule.length === 0) && (
          <Button
            variant="outlined"
            onClick={() => setScheduleStep('day')}
            startIcon={<EventIcon />}
            sx={{ 
              width: '100%', 
              py: compactMode ? 1 : 1.5,
              borderStyle: 'dashed',
              color: muiTheme.palette.primary.main
            }}
          >
            {addButtonText}
          </Button>
        )}

        {/* Empty state */}
        {schedule.length === 0 && Object.keys(newMeeting).length === 0 && 
         (!allowMultipleMeetings && schedule.length > 0) && (
          <Box sx={{ 
            textAlign: 'center', 
            py: compactMode ? 2 : 3, 
            color: muiTheme.palette.text.secondary 
          }}>
            <Typography variant="body2">
              {emptyStateText}
            </Typography>
          </Box>
        )}

        {/* SpeedDial for Day selection */}
        {activeSpeedDial === 'day' && (
          <SpeedDial
            ariaLabel="Select Day"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            icon={<SpeedDialIcon />}
            open={true}
            onClose={() => setActiveSpeedDial(null)}
          >
            {days.map((day) => (
              <SpeedDialAction
                key={day.key}
                icon={<Typography variant="caption">{day.short}</Typography>}
                tooltipTitle={day.label}
                onClick={() => completeStep('day', day.key)}
              />
            ))}
          </SpeedDial>
        )}

        {/* SpeedDial for Format selection */}
        {activeSpeedDial === 'format' && (
          <SpeedDial
            ariaLabel="Select Format"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            icon={<SpeedDialIcon />}
            open={true}
            onClose={() => setActiveSpeedDial(null)}
          >
            {meetingFormats.map((format) => (
              <SpeedDialAction
                key={format.value}
                icon={<Typography>{format.icon}</Typography>}
                tooltipTitle={format.label}
                onClick={() => completeStep('format', format.value)}
              />
            ))}
          </SpeedDial>
        )}

        {/* SpeedDial for Location Type selection */}
        {activeSpeedDial === 'locationType' && (
          <SpeedDial
            ariaLabel="Select Location Type"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            icon={<SpeedDialIcon />}
            open={true}
            onClose={() => setActiveSpeedDial(null)}
          >
            {meetingLocationTypes.map((location) => (
              <SpeedDialAction
                key={location.value}
                icon={<Typography>{location.icon}</Typography>}
                tooltipTitle={location.label}
                onClick={() => completeStep('locationType', location.value)}
              />
            ))}
          </SpeedDial>
        )}

        {/* SpeedDial for Access selection */}
        {activeSpeedDial === 'access' && (
          <SpeedDial
            ariaLabel="Select Access Type"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            icon={<SpeedDialIcon />}
            open={true}
            onClose={() => setActiveSpeedDial(null)}
          >
            {meetingAccess.map((access) => (
              <SpeedDialAction
                key={access.value}
                icon={<Typography>{access.icon}</Typography>}
                tooltipTitle={access.label}
                onClick={() => completeStep('access', access.value)}
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
              completeStep('time', timeString);
              setShowTimePicker(false);
            }}
            onClose={() => {
              const timeString = newMeeting.time || '19:00';
              completeStep('time', timeString);
              setShowTimePicker(false);
            }}
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