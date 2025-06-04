import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Button,
  IconButton,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';

export default function SponsorFormDialog({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  // Form state
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      setPhoneNumber(initialData.phoneNumber || initialData.phone || '');
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
    setPhoneNumber('');
    setEmail('');
    setSobrietyDate('');
    setNotes('');
    setErrors({});
  };
  
  // Handle phone number input
  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form - only name is required
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create sponsor data object
    const sponsorData = {
      name: name.trim(),
      lastName: lastName.trim(),
      phoneNumber,
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
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          maxWidth: "95%",
          width: "95%",
          margin: "auto"
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '16px'
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
        <DialogContent sx={{ padding: '16px' }}>
          {/* First Name */}
          <Box sx={{ color: theme.palette.primary.main, fontSize: '14px', mb: '4px' }}>
            First Name*
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            error={!!errors.name}
            helperText={errors.name}
            size="medium"
            margin="none"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': { 
                height: 56,
                borderRadius: 2
              },
              '& .MuiOutlinedInput-input': {
                fontSize: 16,
                padding: '15px 14px'
              }
            }}
          />
          
          {/* Last Name */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            size="medium"
            margin="none"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': { 
                height: 56,
                borderRadius: 2
              },
              '& .MuiOutlinedInput-input': {
                fontSize: 16,
                padding: '15px 14px'
              }
            }}
          />
          
          {/* Phone Number */}
          <MuiTelInput
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={handlePhoneChange}
            defaultCountry="US"
            size="medium"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': { 
                height: 56,
                borderRadius: 2
              },
              '& .MuiOutlinedInput-input': {
                fontSize: 16,
                padding: '15px 14px'
              }
            }}
          />
          
          {/* Email */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="medium"
            margin="none"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': { 
                height: 56,
                borderRadius: 2
              },
              '& .MuiOutlinedInput-input': {
                fontSize: 16,
                padding: '15px 14px'
              }
            }}
          />
          
          {/* Sobriety Date */}
          <Box sx={{ color: theme.palette.text.secondary, fontSize: '14px', mb: '4px' }}>
            Sobriety Date
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            type="date"
            value={sobrietyDate}
            onChange={(e) => setSobrietyDate(e.target.value)}
            size="medium"
            margin="none"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': { 
                height: 56,
                borderRadius: 2
              },
              '& .MuiOutlinedInput-input': {
                fontSize: 16,
                padding: '15px 14px'
              }
            }}
          />
          
          {/* Notes */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="dense"
            sx={{ mb: 1 }}
          />
        </DialogContent>
        
        <DialogActions sx={{ 
          padding: '8px 16px 16px',
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Button 
            size="small"
            variant="outlined"
            onClick={handleCancel} 
            sx={{ 
              color: theme.palette.error.main,
              borderColor: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            size="small"
            type="submit" 
            variant="contained" 
            color="success"
          >
            {initialData ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}