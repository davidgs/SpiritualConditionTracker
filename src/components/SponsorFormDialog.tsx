import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  Typography,
  TextField,
  Button,
  IconButton,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';

export default function SponsorFormDialog({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  
  // Form state
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLastName(initialData.lastName || '');
      setPhoneNumber(initialData.phoneNumber || initialData.phone || '');
      setEmail(initialData.email || '');
      setSobrietyDate(initialData.sobrietyDate ? initialData.sobrietyDate.split('T')[0] : '');
      setNotes(initialData.notes || '');
    } else {
      resetForm();
    }
    setErrors({});
  }, [initialData, open]);
  
  // Reset form fields
  const resetForm = () => {
    setName('');
    setLastName('');
    setPhoneNumber('');
    setEmail('');
    setSobrietyDate('');
    setNotes('');
    setErrors({});
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Prepare data for submission
    const formData = {
      name: name.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber,
      email: email.trim(),
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      notes: notes.trim()
    };
    
    onSubmit(formData);
    resetForm();
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
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: '#f8fafc',
          color: theme.palette.text.primary
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <IconButton 
          onClick={onClose}
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
          {initialData ? 'Edit Sponsor' : 'Add Sponsor'}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                variant="outlined"
                sx={fieldStyle}
              />
              
              {/* Last Name */}
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                variant="outlined"
                sx={fieldStyle}
              />
              
              {/* Phone Number */}
              <MuiTelInput
                label="Phone Number"
                value={phoneNumber}
                onChange={setPhoneNumber}
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={fieldStyle}
              />
              
              {/* Sobriety Date */}
              <TextField
                fullWidth
                label="Sobriety Date"
                type="date"
                value={sobrietyDate}
                onChange={(e) => setSobrietyDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={fieldStyle}
                helperText="Your sponsor's sobriety date (if known)"
              />
              
              {/* Notes */}
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
        justifyContent: 'center'
      }}>
        <Button
          variant="outlined"
          onClick={onClose}
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
    </Dialog>
  );
}