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

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      }
    },
    '& .MuiInputLabel-root': {
      color: '#666666',
      fontSize: '14px',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main,
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <IconButton 
          onClick={onCancel}
          sx={{ 
            mr: 2, 
            color: '#374151',
            '&:hover': {
              bgcolor: '#f3f4f6'
            }
          }}
        >
          <i className="fa-solid fa-times"></i>
        </IconButton>
        <Typography 
          variant="h6" 
          component="h1"
          sx={{ 
            fontWeight: 600,
            color: '#111827',
            fontSize: '18px'
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Form Content */}
      <Box sx={{ 
        flex: 1,
        p: 3,
        bgcolor: '#f8fafc'
      }}>
        <Box sx={{ 
          bgcolor: '#ffffff',
          borderRadius: '12px',
          p: 3,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* First Name */}
              <TextField
                fullWidth
                label="First Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                sx={fieldStyle}
              />
              
              {/* Last Name */}
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
                sx={fieldStyle}
              />
              
              {/* Phone Number */}
              <MuiTelInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                defaultCountry="US"
                forceCallingCode
                fullWidth
                sx={{
                  ...fieldStyle,
                  '& .MuiTelInput-Flag': {
                    borderRadius: '4px'
                  }
                }}
              />
              
              {/* Email */}
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                sx={fieldStyle}
              />
              
              {/* Sobriety Date */}
              <TextField
                fullWidth
                label="Sobriety Date"
                name="sobrietyDate"
                type="date"
                value={formData.sobrietyDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={fieldStyle}
                helperText="Your sponsor's sobriety date (if known)"
              />
              
              {/* Notes */}
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                variant="outlined"
                sx={fieldStyle}
                placeholder="Add any additional notes about your sponsor..."
              />
            </Box>
          </form>
        </Box>
      </Box>
      
      {/* Bottom Actions */}
      <Box sx={{ 
        p: 3,
        bgcolor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        position: 'sticky',
        bottom: 0
      }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ 
            flex: 1,
            maxWidth: '140px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#d1d5db',
            color: '#374151',
            '&:hover': {
              borderColor: '#9ca3af',
              bgcolor: '#f9fafb'
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ 
            flex: 1,
            maxWidth: '140px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {initialData ? 'Update' : 'Add'}
        </Button>
      </Box>
    </Box>
  );
}