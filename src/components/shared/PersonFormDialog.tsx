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
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface PersonFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  title: string;
  initialData?: any;
}

export default function PersonFormDialog({
  open,
  onClose,
  onSave,
  title,
  initialData
}: PersonFormDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    sobrietyDate: null,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        lastName: initialData.lastName || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
        sobrietyDate: initialData.sobrietyDate ? dayjs(initialData.sobrietyDate) : null,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        sobrietyDate: null,
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
    
    if (errors.phoneNumber) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phoneNumber;
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: any) => {
    setFormData(prev => ({
      ...prev,
      sobrietyDate: date
    }));
    
    if (errors.sobrietyDate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sobrietyDate;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'First name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const submitData = {
        ...formData,
        sobrietyDate: formData.sobrietyDate ? formData.sobrietyDate.toISOString() : null
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving person:', error);
      // Handle error - could show a snackbar or error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      sobrietyDate: null,
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.spacing(2)
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: theme.spacing(2)
        }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton
            onClick={handleCancel}
            sx={{ 
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <i className="fa-solid fa-times"></i>
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: theme.spacing(3) }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: theme.spacing(3),
            mt: theme.spacing(1)
          }}>
            
            {/* First Name */}
            <TextField
              fullWidth
              label="First Name"
              placeholder="Enter first name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              error={!!errors.name}
              helperText={errors.name}
              variant="outlined"
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary
                }
              }}
            />

            {/* Last Name */}
            <TextField
              fullWidth
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              variant="outlined"
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary
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
              label="Phone Number"
              placeholder="Enter phone number"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary
                }
              }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              placeholder="Enter email address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary
                }
              }}
            />

            {/* Sobriety Date */}
            <DatePicker
              label="Sobriety Date"
              value={formData.sobrietyDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "Select sobriety date",
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.spacing(1),
                      backgroundColor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                      '& fieldset': {
                        borderColor: theme.palette.divider
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary
                    }
                  }
                }
              }}
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              placeholder="Enter any notes or additional information"
              multiline
              rows={4}
              value={formData.notes}
              onChange={handleChange('notes')}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  '& fieldset': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: theme.spacing(3), 
          pt: 0,
          gap: theme.spacing(2)
        }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
            disabled={isLoading}
            sx={{
              borderRadius: theme.spacing(1),
              textTransform: 'none',
              fontWeight: 600,
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              '&:hover': {
                borderColor: theme.palette.error.dark,
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            sx={{
              borderRadius: theme.spacing(1),
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.success.dark
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground
              }
            }}
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}