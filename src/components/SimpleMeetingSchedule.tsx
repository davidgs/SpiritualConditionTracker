import React from 'react';
import { formatTimeByPreference } from '../utils/dateUtils';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableRow, 
  Select, 
  MenuItem,
  useTheme
} from '@mui/material';

const SimpleMeetingSchedule = ({ schedule, onChange, use24HourFormat = false }) => {
  const theme = useTheme();
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

  const meetingAccess = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
  ];

  const handleTimeChange = (day, value) => {
    if (value === "none") {
      // Remove this day from schedule
      const newSchedule = schedule.filter(item => item.day !== day);
      onChange(newSchedule);
    } else {
      const existingItemIndex = schedule.findIndex(item => item.day === day);
      
      if (existingItemIndex >= 0) {
        // Update existing day - keep existing format and access if any
        const newSchedule = [...schedule];
        newSchedule[existingItemIndex] = { 
          day, 
          time: value, 
          format: newSchedule[existingItemIndex].format || 'discussion',
          access: newSchedule[existingItemIndex].access || 'open'
        };
        onChange(newSchedule);
      } else {
        // Add new day with default format and access
        onChange([...schedule, { day, time: value, format: 'discussion', access: 'open' }]);
      }
    }
  };

  const handleFormatChange = (day, value) => {
    const existingItemIndex = schedule.findIndex(item => item.day === day);
    
    if (existingItemIndex >= 0) {
      // Update existing day's meeting format
      const newSchedule = [...schedule];
      newSchedule[existingItemIndex] = { 
        ...newSchedule[existingItemIndex],
        format: value 
      };
      onChange(newSchedule);
    }
  };

  const handleAccessChange = (day, value) => {
    const existingItemIndex = schedule.findIndex(item => item.day === day);
    
    if (existingItemIndex >= 0) {
      // Update existing day's meeting access
      const newSchedule = [...schedule];
      newSchedule[existingItemIndex] = { 
        ...newSchedule[existingItemIndex],
        access: value 
      };
      onChange(newSchedule);
    }
  };

  return (
    <Box sx={{ 
      mb: 2, 
      width: '100%', 
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden' 
    }}>
      <Table sx={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        tableLayout: 'fixed',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <TableBody>
          {days.map((day, index) => {
            const existingItem = schedule.find(item => item.day === day.key);
            const hasTime = !!existingItem;
            const timeValue = existingItem ? existingItem.time : '';
            const formatValue = existingItem ? existingItem.format : 'discussion';
            const accessValue = existingItem ? existingItem.access : 'open';
            
            return (
              <TableRow 
                key={day.key} 
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <TableCell 
                  sx={(theme) => ({
                    py: 1.5, 
                    px: 2, 
                    border: 'none',
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    width: '30%',
                    boxSizing: 'border-box'
                  })}
                >
                  {day.label}
                </TableCell>
                <TableCell sx={{ 
                  p: 1, 
                  pt: 1.25, 
                  border: 'none',
                  width: '70%',
                  maxWidth: '70%',
                  boxSizing: 'border-box'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Time Selection */}
                    <Select
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={timeValue || "none"}
                      onChange={(e) => handleTimeChange(day.key, e.target.value)}
                      sx={(theme) => ({
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider
                        },
                        '& .MuiSelect-select': {
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                        },
                        '& .MuiInputBase-root': {
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }
                      })}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="06:00">{use24HourFormat ? "06:00" : "6:00 AM"}</MenuItem>
                      <MenuItem value="07:00">{use24HourFormat ? "07:00" : "7:00 AM"}</MenuItem>
                      <MenuItem value="08:00">{use24HourFormat ? "08:00" : "8:00 AM"}</MenuItem>
                      <MenuItem value="09:00">{use24HourFormat ? "09:00" : "9:00 AM"}</MenuItem>
                      <MenuItem value="10:00">{use24HourFormat ? "10:00" : "10:00 AM"}</MenuItem>
                      <MenuItem value="11:00">{use24HourFormat ? "11:00" : "11:00 AM"}</MenuItem>
                      <MenuItem value="12:00">{use24HourFormat ? "12:00" : "12:00 PM"}</MenuItem>
                      <MenuItem value="13:00">{use24HourFormat ? "13:00" : "1:00 PM"}</MenuItem>
                      <MenuItem value="14:00">{use24HourFormat ? "14:00" : "2:00 PM"}</MenuItem>
                      <MenuItem value="15:00">{use24HourFormat ? "15:00" : "3:00 PM"}</MenuItem>
                      <MenuItem value="16:00">{use24HourFormat ? "16:00" : "4:00 PM"}</MenuItem>
                      <MenuItem value="17:00">{use24HourFormat ? "17:00" : "5:00 PM"}</MenuItem>
                      <MenuItem value="18:00">{use24HourFormat ? "18:00" : "6:00 PM"}</MenuItem>
                      <MenuItem value="19:00">{use24HourFormat ? "19:00" : "7:00 PM"}</MenuItem>
                      <MenuItem value="20:00">{use24HourFormat ? "20:00" : "8:00 PM"}</MenuItem>
                      <MenuItem value="21:00">{use24HourFormat ? "21:00" : "9:00 PM"}</MenuItem>
                      <MenuItem value="22:00">{use24HourFormat ? "22:00" : "10:00 PM"}</MenuItem>
                    </Select>
                    
                    {/* Format Selection - appears when time is selected */}
                    {hasTime && (
                      <Select
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={formatValue}
                        onChange={(e) => handleFormatChange(day.key, e.target.value)}
                        sx={(theme) => ({
                          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.divider
                          }
                        })}
                      >
                        {meetingFormats.map((format) => (
                          <MenuItem key={format.value} value={format.value}>
                            {format.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                    
                    {/* Access Selection - appears when format is selected */}
                    {hasTime && formatValue && (
                      <Select
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={accessValue}
                        onChange={(e) => handleAccessChange(day.key, e.target.value)}
                        sx={(theme) => ({
                          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.divider
                          }
                        })}
                      >
                        {meetingAccess.map((access) => (
                          <MenuItem key={access.value} value={access.value}>
                            {access.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default SimpleMeetingSchedule;