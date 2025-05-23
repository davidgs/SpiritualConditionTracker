import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDateForDisplay } from '../utils/dateUtils';
import { formatPhoneNumberForInput } from '../utils/phoneUtils';
import { MuiTelInput } from 'mui-tel-input';

export default function SponsorFormPage({ initialData, onSave, onCancel }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
    sobrietyDate: '',
    notes: ''
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      // Format sobriety date for input if it exists
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle phone number changes
  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format sobriety date as ISO string if provided
    let dataToSave = { ...formData };
    if (dataToSave.sobrietyDate) {
      dataToSave.sobrietyDate = new Date(dataToSave.sobrietyDate).toISOString();
    }
    
    onSave(dataToSave);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        mt: -1
      }}>
        <IconButton 
          onClick={onCancel}
          sx={{ mr: 1, color: theme.palette.primary.main }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </IconButton>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          {initialData ? 'Edit Your Sponsor' : 'Add Your Sponsor'}
        </Typography>
      </Box>

      <Paper
        elevation={1}
        sx={{ 
          p: 2.5, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: 1,
          borderColor: 'divider',
          borderLeft: 4,
          borderLeftColor: 'primary.main'
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* First Name */}
            <TextField
              name="name"
              label="First Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
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
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
            />
            
            {/* Phone Number */}
            <MuiTelInput
              label="Phone Number"
              value={formData.phone || ''}
              onChange={handlePhoneChange}
              defaultCountry="US"
              forceCallingCode
              continents={['EU', 'OC', 'NA']}
              fullWidth
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
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
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
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
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
              helperText="Your sponsor's sobriety date (if known)"
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
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            {/* Form Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2,
              mt: 1
            }}>
              <Button 
                onClick={onCancel}
                sx={{ 
                  color: theme.palette.text.secondary,
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                sx={{ 
                  height: '36px',
                  borderRadius: '8px',
                }}
              >
                {initialData ? 'Update Sponsor' : 'Add Sponsor'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}