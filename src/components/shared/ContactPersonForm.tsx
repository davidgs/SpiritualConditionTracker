import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactPersonFormProps } from '../../types/ContactPerson';

export default function ContactPersonForm({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  submitLabel = 'Save'
}: ContactPersonFormProps) {
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLastName(initialData.lastName || '');
      setPhone(initialData.phoneNumber || '');
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
    setPhone('');
    setEmail('');
    setSobrietyDate('');
    setNotes('');
    setErrors({});
  };

  // Format phone number as (xxx) xxx-xxxx
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (phone && cleanedPhone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clean phone number for storage
    const phoneNumber = phone.replace(/\D/g, '');
    const formattedPhone = phoneNumber ? `+1 ${phone}` : '';

    const formData = {
      name: name.trim(),
      lastName: lastName.trim(),
      phoneNumber: formattedPhone,
      email: email.trim(),
      sobrietyDate: sobrietyDate ? new Date(sobrietyDate).toISOString() : '',
      notes: notes.trim()
    };

    onSubmit(formData);
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
        <Typography variant="h6">{title}</Typography>
        <IconButton 
          onClick={onClose}
          sx={{ color: theme.palette.text.secondary }}
        >
          <i className="fa-solid fa-times"></i>
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ backgroundColor: theme.palette.background.default }}
          />
          
          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={{ backgroundColor: theme.palette.background.default }}
          />
          
          <TextField
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={handlePhoneChange}
            error={!!errors.phone}
            helperText={errors.phone || "Format: (555) 123-4567"}
            sx={{ backgroundColor: theme.palette.background.default }}
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ backgroundColor: theme.palette.background.default }}
          />
          
          <TextField
            fullWidth
            label="Sobriety Date"
            type="date"
            value={sobrietyDate}
            onChange={(e) => setSobrietyDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ backgroundColor: theme.palette.background.default }}
          />
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ backgroundColor: theme.palette.background.default }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        padding: '16px', 
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 1
      }}>
        <Button 
          onClick={handleCancel}
          sx={{ color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}