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

export default function SponseeFormDialog({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  
  // Form state
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  
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
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
          boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        pb: 1
      }}>
        {initialData ? 'Edit Sponsee' : 'Add Sponsee'}
        <IconButton onClick={onClose} size="small" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
          <i className="fa-solid fa-times"></i>
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 3 }}>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
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
            
            {/* Last Name */}
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
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
            
            {/* Phone Number */}
            <TextField
              label="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              fullWidth
              margin="normal"
              placeholder="(123) 456-7890"
              size="small"
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
            
            {/* Email */}
            <TextField
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              type="email"
              size="small"
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
            
            {/* Sobriety Date */}
            <TextField
              label="Sobriety Date"
              value={sobrietyDate}
              onChange={(e) => setSobrietyDate(e.target.value)}
              fullWidth
              margin="normal"
              type="date"
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
              size="small"
            />
          </Box>
          
          {/* Notes */}
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder="Enter any notes about this sponsee"
            sx={{ mt: 2 }}
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
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          pb: 2, 
          borderTop: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          pt: 2
        }}>
          <Button 
            onClick={handleCancel} 
            sx={{ 
              color: darkMode ? '#f87171' : '#ef4444',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)'
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