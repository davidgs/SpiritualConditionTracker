import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ThemeSelector from './ThemeSelector';
import MeetingFormDialog from './MeetingFormDialog';
import ColorThemePicker from './ColorThemePicker';
import { useAppTheme } from '../contexts/MuiThemeProvider';
import { 
  Switch, 
  FormControlLabel, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Divider,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';

export default function Profile({ setCurrentView, user, onUpdate, meetings }) {
  // Handle Reset All Data button click
  const handleResetAllData = async () => {
    // First confirmation dialog
    if (!window.confirm('Are you sure you want to reset ALL data? This action CANNOT be undone.')) {
      return;
    }
    
    // Second confirmation dialog
    if (!window.confirm('Please confirm again: This will delete ALL your recovery data including sobriety date, meetings, and activities. Are you absolutely sure?')) {
      return;
    }
    
    console.log('Starting data reset process');
    
    try {
      // Clear all data via structured transaction approach
      if (window.db) {
        console.log('Using window.db to clear data');
        
        // Instead of looping through items and removing them one by one (which can cause issues),
        // we'll use direct DELETE statements to clear collections
        
        // Define collections to clear - order matters (due to potential foreign key constraints)
        const collections = ['activities', 'meetings', 'preferences', 'users'];
        
        // Verify database access first
        try {
          const activitiesCount = await window.db.getAll('activities');
          console.log(`Found ${activitiesCount.length} activities before reset`);
        } catch (testError) {
          console.warn('Database test read failed, may need to initialize DB first:', testError);
        }
        
        // Create a safe version of clearing with multiple approaches
        for (const collection of collections) {
          try {
            // Approach 1: Try to use the Capacitor SQLite direct execute method if available
            if (window.Capacitor?.Plugins?.CapacitorSQLite) {
              try {
                const sqlPlugin = window.Capacitor.Plugins.CapacitorSQLite;
                const dbName = 'spiritualTracker.db'; // Match name used in sqliteLoader.js
                
                await sqlPlugin.execute({
                  database: dbName,
                  statements: `DELETE FROM ${collection}`, 
                  values: []
                });
                console.log(`Cleared ${collection} via direct SQL execute`);
                continue; // Skip to next collection if this worked
              } catch (directSqlError) {
                console.log(`Direct SQL clear of ${collection} failed:`, directSqlError);
                // Fall through to next approach
              }
            }
            
            // Approach 2: Use the safer window.db interface if available
            const items = await window.db.getAll(collection) || [];
            console.log(`Clearing ${items.length} items from ${collection}`);
            
            // Clear each item with proper error handling for each
            for (const item of items) {
              try {
                if (item && item.id) {
                  await window.db.remove(collection, item.id);
                }
              } catch (itemError) {
                console.log(`Error removing item ${item.id} from ${collection}:`, itemError);
                // Continue with other items
              }
            }
            
            console.log(`Cleared ${collection}`);
          } catch (collectionError) {
            console.log(`Error clearing ${collection}:`, collectionError);
            // Continue with next collection despite errors
          }
        }
        
        console.log('All collections cleared successfully');
      }
      
      // Clear any localStorage backup data
      try {
        localStorage.removeItem('activities');
        localStorage.removeItem('meetings');
        localStorage.removeItem('user');
        localStorage.removeItem('preferences');
        console.log('localStorage data cleared');
      } catch (localStorageError) {
        console.log('Error clearing localStorage:', localStorageError);
      }
      
      console.log('All data cleared');
      
      // Set initial default data to ensure app works after reset
      if (window.db) {
        try {
          // Add default user record
          await window.db.add('users', {
            id: 'user_default',
            name: 'Anonymous',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          console.log('Created default user after reset');
        } catch (defaultDataError) {
          console.log('Error creating default data:', defaultDataError);
        }
      }
      
      console.log('Data reset complete - navigating to dashboard');
      
      // Show success message
      alert('All data has been reset successfully.');
      
      // Navigate to dashboard instead of reloading the page
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('An error occurred while resetting data. Please try again.');
    }
  };
  // Access MUI theme for consistent styling
  const muiTheme = useTheme();
  const darkMode = muiTheme.palette.mode === 'dark';
  
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [homeGroups, setHomeGroups] = useState([]);
  const [errors, setErrors] = useState({});
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.phoneNumber || '');
      setEmail(user.email || '');
      setSobrietyDate(user.sobrietyDate ? user.sobrietyDate.split('T')[0] : '');
      // Convert homeGroup to array if it's a string, or use empty array
      const homeGroupsData = user.homeGroups ? user.homeGroups : 
                           (user.homeGroup ? [user.homeGroup] : []);
      setHomeGroups(homeGroupsData);
      
      // Load privacy settings and preferences
      setAllowMessages(user.privacySettings?.allowMessages !== false);
      setShareLastName(user.privacySettings?.shareLastName !== false);
      setUse24HourFormat(user.preferences?.use24HourFormat || false);
    }
  }, [user]);

  // State for tracking privacy settings and preferences
  const [allowMessages, setAllowMessages] = useState(user?.privacySettings?.allowMessages !== false);
  const [shareLastName, setShareLastName] = useState(user?.privacySettings?.shareLastName !== false);
  const [use24HourFormat, setUse24HourFormat] = useState(user?.preferences?.use24HourFormat || false);
  
  // Format phone number as (xxx) xxx-xxxx
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Format based on length
    if (phoneNumber.length < 4) {
      return phoneNumber;
    } else if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };
  
  // Handle phone number input
  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
  };
  
  // Handle meeting selection change
  const handleHomeGroupChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setShowMeetingForm(true);
    } else {
      setHomeGroups(value);
    }
  };
  
  // Handle adding a new meeting from meeting form
  const handleAddMeeting = (meeting) => {
    setShowMeetingForm(false);
    if (meeting && meeting.name) {
      // Add the new meeting to homeGroups list if it's not already there
      if (!homeGroups.includes(meeting.name)) {
        setHomeGroups([...homeGroups, meeting.name]);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Validate form
    const newErrors = {};
    if (!sobrietyDate) newErrors.sobrietyDate = 'Sobriety date is required';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create updates object with privacy settings
    // Fix for timezone issue - store the date in a timezone-neutral format (YYYY-MM-DD)
    // This prevents the date from shifting when displayed
    const updates = {
      name,
      lastName,
      phoneNumber,
      email,
      // Store the date as-is without converting to Date object to prevent timezone shift
      sobrietyDate: sobrietyDate || '',
      homeGroups,
      privacySettings: {
        ...(user?.privacySettings || {}),
        allowMessages,
        shareLastName
      },
      preferences: {
        ...(user?.preferences || {}),
        use24HourFormat
      }
    };
    
    // Update the profile and stay on the Profile page
    onUpdate(updates, { redirectToDashboard: false });
  };

  // Calculate sobriety information if user has a sobriety date
  const sobrietyDays = sobrietyDate 
    ? window.db?.calculateSobrietyDays(sobrietyDate) || 0
    : 0;
  
  const sobrietyYears = sobrietyDate 
    ? window.db?.calculateSobrietyYears(sobrietyDate, 2) || 0
    : 0;
    
  // Ensure sobriety date is in correct format for display and calculations
  useEffect(() => {
    if (sobrietyDate && user?.sobrietyDate !== sobrietyDate && !editingSobriety) {
      // Format has changed - update in database to ensure consistency
      const updates = { sobrietyDate };
      onUpdate(updates, { redirectToDashboard: false });
    }
  }, [sobrietyDate, user?.sobrietyDate]);
    
  // State for editing sobriety date
  const [editingSobriety, setEditingSobriety] = useState(false);
  
  // Determine whether to display years or days prominently
  const showYearsProminent = sobrietyYears >= 1;
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format date for display (YYYY-MM-DD -> Month Day, Year)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Meeting Form Dialog - Using our new MeetingFormDialog component */}
      {showMeetingForm && (
        <MeetingFormDialog
          open={showMeetingForm}
          onClose={() => setShowMeetingForm(false)}
          onSave={handleAddMeeting}
          isEdit={false}
        />
      )}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Recovery Tracker
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Your personal profile
        </Typography>
      </Box>
      
      <Paper sx={{ 
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
              Sobriety Milestone
            </Typography>
            
            {sobrietyDate && !editingSobriety && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500
                }}>
                  Sober since {formatDateForDisplay(sobrietyDate)}
                </Typography>
                <IconButton 
                  onClick={() => setEditingSobriety(!editingSobriety)}
                  size="small"
                  aria-label="Edit sobriety date"
                  color="inherit"
                  sx={{ 
                    ml: 1,
                    p: 0.5,
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <i className="fas fa-edit" style={{ fontSize: '0.85rem' }}></i>
                </IconButton>
              </Box>
            )}
            
            {!sobrietyDate && !editingSobriety && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: 'text.secondary' }}>
                  No sobriety date set
                </Typography>
                <IconButton 
                  onClick={() => setEditingSobriety(true)}
                  size="small"
                  aria-label="Add sobriety date"
                  color="inherit"
                  sx={{ 
                    ml: 1,
                    p: 0.5,
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <i className="fas fa-plus-circle" style={{ fontSize: '0.85rem' }}></i>
                </IconButton>
              </Box>
            )}
          </Box>
          
          {editingSobriety ? (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ borderRadius: 1, overflow: 'hidden', mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mb: 1, 
                    color: muiTheme.palette.text.primary,
                    fontWeight: 500
                  }}
                >
                  Sobriety Date*
                </Typography>
                <TextField
                  required
                  fullWidth
                  type="date"
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0]
                  }}
                  variant="outlined"
                  error={!!errors.sobrietyDate}
                  helperText={errors.sobrietyDate || "This date represents the beginning of your recovery journey"}
                  size="small"
                  InputLabelProps={{
                    shrink: true
                  }}
                  sx={{ mb: 1, 
                    '& .MuiOutlinedInput-input': {
                      color: muiTheme.palette.text.primary
                    },
                    '& .MuiFormHelperText-root': {
                      color: muiTheme.palette.text.secondary
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5, 
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  }}
                >
                  Your sobriety date is confidential and used to calculate your recovery milestones
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small"
                  onClick={() => setEditingSobriety(false)}
                  variant="outlined"
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button 
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (sobrietyDate) {
                      // Update the sobriety date directly
                      const updates = {
                        sobrietyDate: sobrietyDate
                      };
                      // Save the sobriety date without redirecting to dashboard
                      onUpdate(updates, { redirectToDashboard: false });
                      setEditingSobriety(false);
                    } else {
                      setErrors({...errors, sobrietyDate: 'Sobriety date is required'});
                    }
                  }}
                  // Using MUI's built-in color system
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {sobrietyDate ? (
                  <>
                    {showYearsProminent ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.main',
                            mr: 1
                          }}>
                            {sobrietyYears.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                            years
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: '1.25rem', 
                          color: 'primary.main'
                        }}>
                          {formatNumber(sobrietyDays)} days
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 'bold', 
                            color: 'primary.main',
                            mr: 1
                          }}>
                            {formatNumber(sobrietyDays)}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                            days
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: '1.25rem', 
                          color: (theme) => theme.palette.primary.main
                        }}>
                          {sobrietyYears.toFixed(2)} years
                        </Typography>
                      </>
                    )}
                  </>
                ) : null}
              </Box>
            </>
          )}
        </Paper>
      
      {/* App Settings */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          App Settings
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Theme Selector */}
          <Box>
            <ThemeSelector />
          </Box>
          
          {/* Color Theme Picker */}
          <Box>
            <ColorThemePicker />
          </Box>
          
          {/* Message Privacy Option */}
          <FormControlLabel
            control={
              <Switch 
                id="allowMessages"
                name="allowMessages"
                checked={allowMessages}
                onChange={(e) => setAllowMessages(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box>
                <Typography sx={{ 
                  fontSize: '0.875rem',
                  color: 'text.primary'
                }}>
                  Allow Messaging
                </Typography>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  color: 'text.secondary'
                }}>
                  When enabled, connections can send you secure messages
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0, mt: 1 }}
          />
          
          {/* Share Last Name Option */}
          <FormControlLabel
            control={
              <Switch 
                id="shareLastName"
                name="shareLastName"
                checked={shareLastName}
                onChange={(e) => setShareLastName(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box>
                <Typography sx={{ 
                  fontSize: '0.875rem',
                  color: 'text.primary'
                }}>
                  Share Last Name
                </Typography>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  color: 'text.secondary'
                }}>
                  Show your last name to other members in recovery
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0, mt: 1 }}
          />
          
          {/* 24-Hour Time Format Option */}
          <FormControlLabel
            control={
              <Switch 
                id="use24HourFormat"
                name="use24HourFormat"
                checked={use24HourFormat}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setUse24HourFormat(newValue);
                  
                  // Save the preference change immediately without redirecting
                  const updates = {
                    preferences: {
                      ...(user?.preferences || {}),
                      use24HourFormat: newValue
                    }
                  };
                  // Update the time format preference without reloading the page
                  onUpdate(updates, { redirectToDashboard: false });
                }}
                color="primary"
                size="small"
              />
            }
            label={
              <Box>
                <Typography sx={{ 
                  fontSize: '0.875rem',
                  color: 'text.primary'
                }}>
                  Use 24-Hour Time Format
                </Typography>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  color: 'text.secondary'
                }}>
                  Display times in 24-hour format (e.g., 18:00 instead of 6:00 PM)
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0, mt: 1 }}
          />
        </Box>
      </Paper>
      
      <Paper elevation={0} 
        component="form" 
        onSubmit={handleSubmit} 
        sx={(theme) => ({ 
          p: 3,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        })}
      >
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Personal Information
            </Typography>
            <IconButton 
              onClick={() => setEditingPersonalInfo(!editingPersonalInfo)}
              size="small"
              aria-label={editingPersonalInfo ? "Cancel editing" : "Edit personal information"}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              <i className={`fas ${editingPersonalInfo ? "fa-times" : "fa-edit"}`} style={{ fontSize: '0.85rem' }}></i>
            </IconButton>
          </Box>
        </Box>
        
        {editingPersonalInfo ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
              <TextField
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your first name"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                InputLabelProps={{
                  sx: { color: 'text.secondary' }
                }}
                InputProps={{
                  sx: { 
                    color: 'text.primary',
                    bgcolor: 'background.paper'
                  }
                }}
              />
              
              <TextField
                fullWidth
                value={lastName != "Not set" ? lastName : "Enter your last name or initials"}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                InputLabelProps={{
                  sx: { color: 'text.secondary' }
                }}
                InputProps={{
                  sx: { 
                    color: 'text.primary',
                    bgcolor: 'background.paper'
                  }
                }}
              />
              
              <TextField
                fullWidth
                value={phoneNumber != "Not set" ? phoneNumber : "Enter your phone number"}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                variant="outlined"
                size="small"
                type="tel"
                sx={{ mb: 2 }}
                InputLabelProps={{
                  sx: { color: 'text.secondary' }
                }}
                InputProps={{
                  sx: { 
                    color: 'text.primary',
                    bgcolor: 'background.paper'
                  }
                }}
              />
              
              <TextField
                fullWidth
                value={email != "Not set" ? email : "Enter your email address"}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                variant="outlined"
                size="small"
                type="email"
                sx={{ mb: 2 }}
                InputLabelProps={{
                  sx: { color: 'text.secondary' }
                }}
                InputProps={{
                  sx: { 
                    color: 'text.primary',
                    bgcolor: 'background.paper'
                  }
                }}
              />
              
              <TextField
                select
                label="Home Group(s)"
                fullWidth
                value={homeGroups != "Not set" ? homeGroups : "Select your home group(s)"}
                onChange={handleHomeGroupChange}
                placeholder="Select your home group(s)"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                InputLabelProps={{
                  sx: { color: 'text.secondary' }
                }}
                InputProps={{
                  sx: { 
                    color: 'text.primary',
                    bgcolor: 'background.paper'
                  }
                }}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => Array.isArray(selected) ? selected.join(', ') : selected,
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        maxHeight: 300
                      }
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {/* Generate menu items from meetings */}
                {(() => {
                  const meetings = window.db?.getAll('meetings') || [];
                  return meetings.length > 0 
                    ? meetings.map(meeting => (
                        <MenuItem key={meeting.id} value={meeting.name}>{meeting.name}</MenuItem>
                      ))
                    : <MenuItem value="none" disabled>No saved meetings</MenuItem>;
                })()}
                <MenuItem value="add_new" sx={{ color: 'primary.main' }}>
                  <i className="fas fa-plus" style={{ marginRight: '8px', fontSize: '0.75rem' }}></i>
                  Add New Meeting
                </MenuItem>
              </TextField>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                size="small"
                onClick={() => setEditingPersonalInfo(false)}
                sx={{ 
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.main'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  handleSubmit({preventDefault: () => {}});
                  setEditingPersonalInfo(false);
                }}
                sx={{ 
                  bgcolor: darkMode ? '#3b82f6' : '#2563eb',
                  '&:hover': {
                    bgcolor: darkMode ? '#2563eb' : '#1d4ed8'
                  }
                }}
              >
                Save
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Name display */}
              <Box>
                <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  First Name
                </Typography>
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                  {name || "Not set"}
                </Typography>
              </Box>
              
              {/* Last Name display */}
              <Box>
                <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Last Name {shareLastName && <span style={{ fontSize: '0.7rem' }}>(Shared)</span>}
                </Typography>
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                  {lastName || "Not set"}
                </Typography>
              </Box>
              
              {/* Phone Number display */}
              <Box>
                <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Phone Number
                </Typography>
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                  {phoneNumber || "Not set"}
                </Typography>
              </Box>
              
              {/* Email display */}
              <Box>
                <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Email Address
                </Typography>
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                  {email || "Not set"}
                </Typography>
              </Box>
              
              {/* Home Groups display */}
              <Box>
                <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Home Groups
                </Typography>
                <Typography sx={{ color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                  {homeGroups && homeGroups.length > 0 
                    ? homeGroups.join(', ')
                    : "Not set"}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Reset All Data Section */}
      <Paper elevation={0} sx={{ 
        p: 3,
        mb: 3,
        bgcolor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: 2,
        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
      }}>
        <Typography variant="h6" sx={{ 
          color: darkMode ? '#d1d5db' : '#374151', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <i className="fas fa-exclamation-triangle" style={{ color: '#dc2626' }}></i>
          Danger Zone
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: darkMode ? '#9ca3af' : '#6b7280' }}>
          Resetting all data will permanently delete your profile information, meetings, activities, and all other app data. This action cannot be undone.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<i className="fas fa-trash-alt"></i>}
            onClick={handleResetAllData}
            sx={{
              borderColor: '#dc2626',
              color: '#dc2626',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                borderColor: '#b91c1c'
              }
            }}
          >
            Reset All Data
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}