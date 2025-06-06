import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatPhoneNumberForInput } from '../../utils/phoneUtils';
import { MuiTelInput } from 'mui-tel-input';

interface PersonFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  title: string;
  isDialog?: boolean;
}

export default function PersonForm({ 
  initialData, 
  onSave, 
  onCancel, 
  title,
  isDialog = false 
}: PersonFormProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    sobrietyDate: '',
    notes: ''
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      let formattedData = { ...initialData };
      if (formattedData.sobrietyDate) {
        formattedData.sobrietyDate = new Date(formattedData.sobrietyDate)
          .toISOString()
          .split('T')[0];
      }
      setFormData(formattedData);
    }
  }, [initialData]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle phone change
  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process data before saving
    let dataToSave = { ...formData };
    
    // Handle sobriety date
    try {
      if (dataToSave.sobrietyDate && dataToSave.sobrietyDate.trim()) {
        const date = new Date(dataToSave.sobrietyDate);
        if (!isNaN(date.getTime())) {
          dataToSave.sobrietyDate = date.toISOString();
        } else {
          dataToSave.sobrietyDate = null;
        }
      } else {
        dataToSave.sobrietyDate = null;
      }
    } catch (error) {
      console.log('Error parsing sobriety date:', error);
      dataToSave.sobrietyDate = null;
    }
    
    onSave(dataToSave);
    if (!isDialog) {
      setTimeout(() => onCancel(), 100);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* First Name */}
          <TextField
            name="name"
            label="First Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />
          
          {/* Last Name */}
          <TextField
            name="lastName"
            label="Last Name"
            value={formData.lastName || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />
          
          {/* Phone Number */}
          <MuiTelInput
            label="Phone Number"
            value={formData.phoneNumber || ''}
            onChange={handlePhoneChange}
            defaultCountry="US"
            forceCallingCode
            continents={['EU', 'OC', 'NA']}
            fullWidth
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />
          
          {/* Email */}
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />
          
          {/* Sobriety Date */}
          <TextField
            name="sobrietyDate"
            label="Sobriety Date"
            type="date"
            value={formData.sobrietyDate || ''}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
            helperText="Their sobriety date (if known)"
          />
          
          {/* Notes */}
          <TextField
            name="notes"
            label="Notes"
            multiline
            rows={4}
            value={formData.notes || ''}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: theme.palette.background.default,
                '& fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
          />
        </Box>
      </Box>
      
      {/* Form Actions */}
      <Box sx={{ 
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        gap: 2,
        justifyContent: 'center'
      }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ 
            flex: 1,
            maxWidth: '120px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          type="submit"
          sx={{ 
            flex: 1,
            maxWidth: '120px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }}
        >
          {initialData ? 'Update' : 'Add'}
        </Button>
      </Box>
    </form>
  );

  if (isDialog) {
    return formContent;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      p: 0
    }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <IconButton 
          onClick={onCancel}
          sx={{ mr: 2, color: theme.palette.text.primary }}
        >
          <i className="fa-solid fa-times"></i>
        </IconButton>
        <Typography 
          variant="h6" 
          component="h1"
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{ 
            p: 0, 
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden'
          }}
        >
          {formContent}
        </Paper>
      </Box>
    </Box>
  );
}