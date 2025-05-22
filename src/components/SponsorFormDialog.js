import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  IconButton,
  Box,
  Paper,
  Grid
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
          maxWidth: Math.min(viewportWidth * 0.95, 600), // Constrain width to 95% of viewport
          overflowX: 'hidden', // Prevent horizontal scroll
          margin: '0 auto' // Center dialog
        }
      }}
      // Prevent scrolling of background content when dialog is open
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
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
        {initialData ? 'Edit Sponsor' : 'Add Sponsor'}
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
          py: 3, 
          overflowX: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <ResponsiveContainer>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                  autoFocus
                  size="small"
                  color="primary"
                  InputProps={{
                    sx: {
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }
                  }}
                />
              </Grid>
              
              {/* Last Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  margin="normal"
                  size="small"
                  color="primary"
                  InputProps={{
                    sx: {
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }
                  }}
                />
              </Grid>
              
              {/* Phone Number */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  value={phone}
                  onChange={handlePhoneChange}
                  fullWidth
                  margin="normal"
                  placeholder="(123) 456-7890"
                  size="small"
                  color="primary"
                  InputProps={{
                    sx: {
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }
                  }}
                />
              </Grid>
              
              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  type="email"
                  size="small"
                  color="primary"
                  InputProps={{
                    sx: {
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }
                  }}
                />
              </Grid>
              
              {/* Sobriety Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Sobriety Date"
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  fullWidth
                  margin="normal"
                  type="date"
                  InputLabelProps={{
                    shrink: true
                  }}
                  size="small"
                  color="primary"
                  InputProps={{
                    sx: {
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Notes */}
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              placeholder="Enter any notes about your sponsor"
              sx={{ mt: 2 }}
              color="primary"
              InputProps={{
                sx: {
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }
              }}
            />
          </ResponsiveContainer>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          pb: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          pt: 2,
          overflowX: 'hidden',
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Button 
            onClick={handleCancel} 
            sx={{ 
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.main + '1A' // Adding 10% opacity
              }
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