import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';

interface UnifiedPersonFormProps {
  open: boolean;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  title: string;
}

export default function UnifiedPersonForm({ 
  initialData, 
  onSave, 
  onCancel, 
  title
}: UnifiedPersonFormProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    sobrietyDate: '',
    notes: ''
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  const handleSubmit = () => {
    let dataToSave = { ...formData };
    
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
      dataToSave.sobrietyDate = null;
    }
    
    onSave(dataToSave);
  };

  console.log('UnifiedPersonForm is rendering with title:', title);
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        bgcolor: '#4a5568',
        color: 'white'
      }}>
        <IconButton 
          onClick={onCancel}
          sx={{ 
            mr: 2, 
            color: 'white'
          }}
        >
          <i className="fa-solid fa-times"></i>
        </IconButton>
        <Typography 
          variant="h6" 
          component="h1"
          sx={{ 
            fontWeight: 600,
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
        bgcolor: '#4a5568'
      }}>
        <Box sx={{ 
          bgcolor: '#4a5568',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* First Name */}
          <TextField
            fullWidth
            placeholder="First Name*"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
            InputProps={{
              sx: {
                bgcolor: '#2d3748',
                borderRadius: '20px',
                color: 'white',
                '& fieldset': {
                  border: 'none'
                },
                '& input::placeholder': {
                  color: '#a0aec0',
                  opacity: 1
                }
              }
            }}
            sx={{
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
          
          {/* Last Name */}
          <TextField
            fullWidth
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: {
                bgcolor: '#2d3748',
                borderRadius: '20px',
                color: 'white',
                '& fieldset': {
                  border: 'none'
                },
                '& input::placeholder': {
                  color: '#a0aec0',
                  opacity: 1
                }
              }
            }}
            sx={{
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
          
          {/* Phone Number */}
          <MuiTelInput
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            defaultCountry="US"
            forceCallingCode
            fullWidth
            placeholder="Phone Number"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2d3748',
                borderRadius: '20px',
                color: 'white',
                '& fieldset': {
                  border: 'none'
                },
                '& input::placeholder': {
                  color: '#a0aec0',
                  opacity: 1
                }
              },
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
          
          {/* Email */}
          <TextField
            fullWidth
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: {
                bgcolor: '#2d3748',
                borderRadius: '20px',
                color: 'white',
                '& fieldset': {
                  border: 'none'
                },
                '& input::placeholder': {
                  color: '#a0aec0',
                  opacity: 1
                }
              }
            }}
            sx={{
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
          
          {/* Sobriety Date */}
          <Box sx={{ position: 'relative' }}>
            <Typography sx={{ 
              color: '#a0aec0',
              fontSize: '14px',
              mb: 1,
              ml: 2
            }}>
              Sobriety Date
            </Typography>
            <TextField
              fullWidth
              name="sobrietyDate"
              type="date"
              value={formData.sobrietyDate}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                sx: {
                  bgcolor: '#2d3748',
                  borderRadius: '20px',
                  color: 'white',
                  '& fieldset': {
                    border: 'none'
                  }
                }
              }}
              sx={{
                '& .MuiInputLabel-root': {
                  display: 'none'
                }
              }}
            />
          </Box>
          
          {/* Notes */}
          <TextField
            fullWidth
            placeholder="Notes"
            name="notes"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            variant="outlined"
            InputProps={{
              sx: {
                bgcolor: '#2d3748',
                borderRadius: '20px',
                color: 'white',
                '& fieldset': {
                  border: 'none'
                },
                '& textarea::placeholder': {
                  color: '#a0aec0',
                  opacity: 1
                }
              }
            }}
            sx={{
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
        </Box>
      </Box>
      
      {/* Bottom Actions */}
      <Box sx={{ 
        p: 3,
        bgcolor: '#4a5568',
        display: 'flex',
        gap: 2,
        justifyContent: 'center'
      }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ 
            flex: 1,
            maxWidth: '140px',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#4299e1',
            color: '#4299e1',
            '&:hover': {
              borderColor: '#3182ce',
              bgcolor: 'rgba(66, 153, 225, 0.1)'
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
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#4299e1',
            '&:hover': {
              bgcolor: '#3182ce'
            }
          }}
        >
          {initialData ? 'Update' : 'Add'}
        </Button>
      </Box>
    </Box>
  );
}