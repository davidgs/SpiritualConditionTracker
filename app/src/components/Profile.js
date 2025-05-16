import React, { useState, useEffect, useContext } from 'react';
import ThemeToggle from './ThemeToggle';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Switch, 
  FormControlLabel, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Divider,
  IconButton
} from '@mui/material';

export default function Profile({ setCurrentView, user, onUpdate }) {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === 'dark';
  
  const [name, setName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [homeGroup, setHomeGroup] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorPhone, setSponsorPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSobrietyDate(user.sobrietyDate ? user.sobrietyDate.split('T')[0] : '');
      setHomeGroup(user.homeGroup || '');
      setSponsorName(user.sponsorName || '');
      setSponsorPhone(user.sponsorPhone || '');
    }
  }, [user]);

  // State for tracking message permission toggle
  const [allowMessages, setAllowMessages] = useState(user?.privacySettings?.allowMessages !== false);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!sobrietyDate) newErrors.sobrietyDate = 'Sobriety date is required';
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create updates object with privacy settings
    const updates = {
      name,
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      homeGroup,
      sponsorName,
      sponsorPhone,
      privacySettings: {
        ...(user?.privacySettings || {}),
        allowMessages
      }
    };
    
    // Update the profile
    onUpdate(updates);
  };

  // Calculate sobriety information if user has a sobriety date
  const sobrietyDays = sobrietyDate 
    ? window.db?.calculateSobrietyDays(sobrietyDate) || 0
    : 0;
  
  const sobrietyYears = sobrietyDate 
    ? window.db?.calculateSobrietyYears(sobrietyDate, 2) || 0
    : 0;
    
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>
          Recovery Tracker
        </Typography>
        <Typography variant="subtitle1" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
          Your personal profile
        </Typography>
      </Box>
      
      <Paper elevation={0} sx={{ 
          p: 3,
          mb: 3,
          bgcolor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: 2,
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: darkMode ? '#d1d5db' : '#374151', mb: 1 }}>
              Sobriety Milestone
            </Typography>
            
            {sobrietyDate && !editingSobriety && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ 
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  fontWeight: 500
                }}>
                  Sober since {formatDateForDisplay(sobrietyDate)}
                </Typography>
                <IconButton 
                  onClick={() => setEditingSobriety(!editingSobriety)}
                  size="small"
                  aria-label="Edit sobriety date"
                  sx={{ 
                    ml: 1,
                    p: 0.5,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    '&:hover': {
                      color: darkMode ? '#60a5fa' : '#3b82f6',
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
                <Typography sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  No sobriety date set
                </Typography>
                <IconButton 
                  onClick={() => setEditingSobriety(true)}
                  size="small"
                  aria-label="Add sobriety date"
                  sx={{ 
                    ml: 1,
                    p: 0.5,
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    '&:hover': {
                      color: darkMode ? '#60a5fa' : '#3b82f6',
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
              <TextField
                label="Sobriety Date"
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
                helperText={errors.sobrietyDate}
                size="small"
                InputLabelProps={{
                  shrink: true,
                  style: { color: darkMode ? '#9ca3af' : '#6b7280' }
                }}
                InputProps={{
                  style: { 
                    color: darkMode ? '#d1d5db' : '#374151',
                    backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : '#ffffff'
                  }
                }}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small"
                  onClick={() => setEditingSobriety(false)}
                  sx={{ 
                    color: darkMode ? '#d1d5db' : '#374151',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (sobrietyDate) {
                      setEditingSobriety(false);
                    } else {
                      setErrors({...errors, sobrietyDate: 'Sobriety date is required'});
                    }
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
                            color: darkMode ? '#60a5fa' : '#3b82f6',
                            mr: 1
                          }}>
                            {sobrietyYears.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            years
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: '1.25rem', 
                          color: darkMode ? '#60a5fa' : '#3b82f6' 
                        }}>
                          {formatNumber(sobrietyDays)} days
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 'bold', 
                            color: darkMode ? '#60a5fa' : '#3b82f6',
                            mr: 1
                          }}>
                            {formatNumber(sobrietyDays)}
                          </Typography>
                          <Typography variant="h6" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            days
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: '1.25rem', 
                          color: darkMode ? '#60a5fa' : '#3b82f6' 
                        }}>
                          {sobrietyYears.toFixed(2)} years
                        </Typography>
                      </>
                    )}
                  </>
                ) : null}
                )}
              </Box>
            </>
          )}
        </Paper>
      
      {/* App Settings */}
      <Paper elevation={0} sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: 2,
        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#d1d5db' : '#374151' }}>
          App Settings
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <ThemeToggle />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 1, color: darkMode ? '#d1d5db' : '#374151' }}>
          Privacy & Messaging
        </Typography>
        
        <FormControlLabel
          control={
            <Switch 
              id="allowMessages"
              name="allowMessages"
              checked={allowMessages}
              onChange={(e) => setAllowMessages(e.target.checked)}
              color="primary"
            />
          }
          label="Allow Messaging"
          sx={{ 
            '& .MuiFormControlLabel-label': { 
              color: darkMode ? '#d1d5db' : '#374151'
            } 
          }}
        />
        
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: darkMode ? '#9ca3af' : '#6b7280' }}>
          When enabled, your connections can send you secure messages.
        </Typography>
      </Paper>
      
      <Paper elevation={0} 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          p: 3,
          bgcolor: darkMode ? '#1f2937' : '#ffffff',
          borderRadius: 2,
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#d1d5db' : '#374151' }}>
          Personal Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
          <TextField
            label="Your Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            variant="outlined"
            InputLabelProps={{
              style: { color: darkMode ? '#9ca3af' : '#6b7280' }
            }}
            InputProps={{
              style: { 
                color: darkMode ? '#d1d5db' : '#374151',
                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : '#ffffff'
              }
            }}
          />
          
          <TextField
            label="Home Group"
            fullWidth
            value={homeGroup}
            onChange={(e) => setHomeGroup(e.target.value)}
            placeholder="Enter your home group"
            variant="outlined"
            InputLabelProps={{
              style: { color: darkMode ? '#9ca3af' : '#6b7280' }
            }}
            InputProps={{
              style: { 
                color: darkMode ? '#d1d5db' : '#374151',
                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : '#ffffff'
              }
            }}
          />
          
          <TextField
            label="Sponsor's Name"
            fullWidth
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            placeholder="Enter your sponsor's name"
            variant="outlined"
            InputLabelProps={{
              style: { color: darkMode ? '#9ca3af' : '#6b7280' }
            }}
            InputProps={{
              style: { 
                color: darkMode ? '#d1d5db' : '#374151',
                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : '#ffffff'
              }
            }}
          />
          
          <TextField
            label="Sponsor's Phone"
            fullWidth
            type="tel"
            value={sponsorPhone}
            onChange={(e) => setSponsorPhone(e.target.value)}
            placeholder="Enter your sponsor's phone number"
            variant="outlined"
            InputLabelProps={{
              style: { color: darkMode ? '#9ca3af' : '#6b7280' }
            }}
            InputProps={{
              style: { 
                color: darkMode ? '#d1d5db' : '#374151',
                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : '#ffffff'
              }
            }}
          />
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            py: 1.5,
            mt: 1,
            bgcolor: darkMode ? '#3b82f6' : '#2563eb',
            '&:hover': {
              bgcolor: darkMode ? '#2563eb' : '#1d4ed8'
            }
          }}
        >
          Save Profile
        </Button>
      </Paper>
    </Box>
  );
}