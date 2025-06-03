import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function SponsorContactFormDialog({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  
  console.log('SponsorContactFormDialog initialData:', initialData);
  
  // Form state
  const [contactData, setContactData] = useState({
    type: 'phone',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    note: ''
  });
  
  // Update form state when initial data changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data for SponsorContactFormDialog:', initialData);
      // Format date for input
      const formattedData = {
        ...initialData,
        date: initialData.date ? 
          new Date(initialData.date).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      };
      setContactData(formattedData);
    } else {
      // Reset to defaults
      setContactData({
        type: 'phone',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
  }, [initialData, open]);
  
  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create full date from the date input
    const date = new Date(contactData.date);
    const isoDate = date.toISOString();
    
    // Submit with proper date format
    onSubmit({
      ...contactData,
      date: isoDate
    });
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 2,
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle 
          sx={{ 
            pb: 1, 
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          {initialData ? 'Edit Contact' : 'Add Sponsor Contact'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Contact Type */}
            <FormControl fullWidth>
              <InputLabel id="contact-type-label">Contact Type</InputLabel>
              <Select
                labelId="contact-type-label"
                id="type"
                name="type"
                value={contactData.type}
                onChange={handleChange}
                label="Contact Type"
                required
                sx={{ 
                  height: '56px', 
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="phone">Phone Call</MenuItem>
                <MenuItem value="in-person">In Person</MenuItem>
                <MenuItem value="video">Video Call</MenuItem>
                <MenuItem value="text">Text Message</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            {/* Contact Date */}
            <TextField
              id="date"
              name="date"
              label="Date"
              type="date"
              value={contactData.date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
            />
            
            {/* Note */}
            <TextField
              id="note"
              name="note"
              label="Note"
              multiline
              rows={4}
              value={contactData.note || ''}
              onBlur={handleChange}
              fullWidth
              placeholder="Brief description of the contact"
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              }
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
              textTransform: 'none'
            }}
          >
            {initialData ? 'Update Contact' : 'Add Contact'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}