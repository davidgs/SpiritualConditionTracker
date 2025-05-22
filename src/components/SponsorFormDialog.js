import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Button,
  IconButton,
  Stack,
  Typography,
  InputAdornment,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ResponsiveContainer from './ResponsiveContainer';

export default function SponsorFormDialog({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  // Form state
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  // Track viewport changes for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLastName(initialData.lastName || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setSobrietyDate(initialData.sobrietyDate ? initialData.sobrietyDate.split('T')[0] : '');
      setNotes(initialData.notes || '');
    } else {
      // Reset form for new entry
      resetForm();
    }
  }, [initialData, open]);
  
  // Reset form fields
  const resetForm = () => {
    setName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setSobrietyDate('');
    setNotes('');
    setErrors({});
  };
  
  // Format phone number as (xxx) xxx-xxxx
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-digits
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Take first 10 digits only
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };
  
  // Handle phone number input
  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form - only name is required
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create sponsor data object
    const sponsorData = {
      name: name.trim(),
      lastName: lastName.trim(),
      phone,
      email: email.trim(),
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      notes: notes.trim()
    };
    
    // Submit the data
    onSubmit(sponsorData);
    
    // Reset form
    resetForm();
  };
  
  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Common TextField styling for all form inputs
  const textFieldSx = {
    mb: 1.5,
    '.MuiInputBase-root': {
      overflow: 'hidden',
      borderRadius: 1.5,
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.background.default, 0.1)
        : alpha(theme.palette.background.paper, 0.9),
      transition: theme.transitions.create([
        'border-color',
        'background-color',
        'box-shadow'
      ]),
      '&.Mui-focused': {
        boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`
      }
    },
    '.MuiInputBase-input': {
      fontSize: '1rem',
      padding: '10px 12px'
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[5],
          maxWidth: Math.min(viewportWidth * 0.9, 400), // Reduced from 600 to 400 max width
          overflowX: 'hidden', // Prevent horizontal scroll
          margin: '0 auto', // Center dialog
          width: '90%'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: alpha(theme.palette.common.black, 0.5)
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1,
        paddingRight: 1, // Ensure space for close button
        overflowX: 'hidden'
      }}>
        <Typography variant="h6" component="div">
          {initialData ? 'Edit Sponsor' : 'Add Sponsor'}
        </Typography>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ color: theme.palette.text.secondary }}
          aria-label="close"
        >
          <i className="fa-solid fa-times"></i>
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          py: 2, 
          overflowX: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <ResponsiveContainer>
            <Stack spacing={0} sx={{ width: '100%' }}>
              {/* First Name */}
              <Typography 
                variant="caption" 
                color="primary" 
                sx={{ mb: 0.5, fontWeight: 'medium' }}
              >
                First Name*
              </Typography>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="First Name"
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                fullWidth
                size="small"
                sx={textFieldSx}
              />
              
              {/* Last Name */}
              <TextField
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                variant="outlined"
                fullWidth
                size="small"
                sx={textFieldSx}
              />
              
              {/* Phone Number */}
              <TextField
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Phone Number"
                variant="outlined"
                fullWidth
                size="small"
                sx={textFieldSx}
              />
              
              {/* Email */}
              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                type="email"
                variant="outlined"
                fullWidth
                size="small"
                sx={textFieldSx}
              />
              
              {/* Sobriety Date */}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mb: 0.5, fontWeight: 'medium', mt: 1 }}
              >
                Sobriety Date
              </Typography>
              <TextField
                type="date"
                value={sobrietyDate}
                onChange={(e) => setSobrietyDate(e.target.value)}
                variant="outlined"
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true
                }}
                sx={textFieldSx}
              />
              
              {/* Notes */}
              <TextField
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                variant="outlined"
                fullWidth
                sx={{
                  ...textFieldSx,
                  mt: 1
                }}
              />
            </Stack>
          </ResponsiveContainer>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          pb: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          pt: 2,
          overflowX: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Button 
            onClick={handleCancel} 
            sx={{ 
              color: theme.palette.error.main
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
          >
            {initialData ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}