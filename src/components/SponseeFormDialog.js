import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  IconButton,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ResponsiveContainer from './ResponsiveContainer';

export default function SponseeFormDialog({ open, onClose, onSubmit, initialData }) {
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
    
    // Create sponsee data object
    const sponseeData = {
      name: name.trim(),
      lastName: lastName.trim(),
      phone,
      email: email.trim(),
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      notes: notes.trim()
    };
    
    // Add id if it's an edit (from initialData)
    if (initialData && initialData.id) {
      sponseeData.id = initialData.id;
    }
    
    // Submit the data
    onSubmit(sponseeData);
    
    // Reset form
    resetForm();
  };
  
  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Common native input field styles (iOS-like)
  const inputSx = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px',
    color: theme.palette.text.primary,
    marginBottom: '12px',
    boxSizing: 'border-box',
    '-webkit-appearance': 'none',
    '&:focus': {
      outline: 'none',
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
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
        {initialData ? 'Edit Sponsee' : 'Add Sponsee'}
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
              <div>
                <div style={{ fontSize: '14px', color: theme.palette.primary.main, marginBottom: '4px' }}>
                  First Name*
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  placeholder="First Name"
                  style={{
                    ...inputSx,
                    borderColor: errors.name ? theme.palette.error.main : inputSx.border.split(' ')[2]
                  }}
                />
                {errors.name && (
                  <div style={{ color: theme.palette.error.main, fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                    {errors.name}
                  </div>
                )}
              </div>
              
              {/* Last Name */}
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  style={inputSx}
                />
              </div>
              
              {/* Phone Number */}
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Phone Number"
                  style={inputSx}
                />
              </div>
              
              {/* Email */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  style={inputSx}
                />
              </div>
              
              {/* Sobriety Date */}
              <div>
                <div style={{ fontSize: '14px', color: theme.palette.text.secondary, marginBottom: '4px' }}>
                  Sobriety Date
                </div>
                <input
                  type="date"
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  style={inputSx}
                />
              </div>
              
              {/* Notes */}
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes"
                  rows={4}
                  style={{
                    ...inputSx,
                    resize: 'none',
                    minHeight: '100px'
                  }}
                />
              </div>
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