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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  title: string;
  initialData?: any;
}

export default function ContactFormDialog({
  open,
  onClose,
  onSave,
  title,
  initialData
}: ContactFormDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    type: 'call',
    date: dayjs(),
    note: '',
    topic: '',
    duration: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'call',
        date: initialData.date ? dayjs(initialData.date) : dayjs(),
        note: initialData.note || '',
        topic: initialData.topic || '',
        duration: initialData.duration || ''
      });
    } else {
      setFormData({
        type: 'call',
        date: dayjs(),
        note: '',
        topic: '',
        duration: ''
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

  const handleSelectChange = (field: string) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: any) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
    
    if (errors.date) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.note.trim()) {
      newErrors.note = 'Contact notes are required';
    }

    if (!formData.date) {
      newErrors.date = 'Contact date is required';
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
        date: formData.date ? formData.date.toISOString() : null,
        duration: formData.duration ? parseInt(formData.duration) : null
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      // Handle error - could show a snackbar or error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'call',
      date: dayjs(),
      note: '',
      topic: '',
      duration: ''
    });
    setErrors({});
    onClose();
  };

  const contactTypes = [
    { value: 'call', label: 'Phone Call' },
    { value: 'meeting', label: 'In-Person Meeting' },
    { value: 'text', label: 'Text Message' },
    { value: 'email', label: 'Email' },
    { value: 'video', label: 'Video Call' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            paddingTop: '10vh'
          }
        }}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.spacing(2),
            margin: theme.spacing(2)
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
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
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
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
            
            {/* Contact Type */}
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={{ color: theme.palette.text.secondary }}>
                Contact Type
              </InputLabel>
              <Select
                value={formData.type}
                onChange={handleSelectChange('type')}
                label="Contact Type"
                sx={{
                  height: '56px',
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                {contactTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Contact Date */}
            <DatePicker
              label="Contact Date"
              value={formData.date}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date,
                  InputProps: {
                    sx: {
                      height: '56px'
                    }
                  },
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
                    },
                    '& .MuiInputBase-input': {
                      color: theme.palette.text.primary
                    }
                  }
                }
              }}
            />

            {/* Topic */}
            <TextField
              fullWidth
              label="Topic/Subject"
              placeholder="What was discussed?"
              value={formData.topic}
              onChange={handleChange('topic')}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.spacing(1),
                  backgroundColor: theme.palette.background.default,
                  minHeight: '56px',
                  '& input': {
                    padding: '16px 14px',
                    fontSize: '16px',
                    lineHeight: '1.5'
                  },
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
                  color: theme.palette.text.secondary,
                  fontSize: '16px'
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary
                }
              }}
            />

            {/* Duration (for calls/meetings) */}
            {(formData.type === 'call' || formData.type === 'meeting' || formData.type === 'video') && (
              <TextField
                fullWidth
                label="Duration (minutes)"
                placeholder="How long was the contact?"
                type="number"
                value={formData.duration}
                onChange={handleChange('duration')}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.spacing(1),
                    backgroundColor: theme.palette.background.default,
                    minHeight: '56px',
                    '& input': {
                      padding: '16px 14px',
                      fontSize: '16px',
                      lineHeight: '1.5'
                    },
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
                    color: theme.palette.text.secondary,
                    fontSize: '16px'
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary
                  }
                }}
              />
            )}

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              placeholder="Enter details about this contact"
              multiline
              rows={4}
              value={formData.note}
              onChange={handleChange('note')}
              required
              error={!!errors.note}
              helperText={errors.note}
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
          pt: theme.spacing(2),
          gap: theme.spacing(2),
          justifyContent: 'flex-end'
        }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
            disabled={isLoading}
            size="large"
            sx={{
              borderRadius: theme.spacing(1.5),
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '16px',
              minHeight: '48px',
              px: theme.spacing(4),
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              backgroundColor: 'transparent',
              '&:hover': {
                borderColor: theme.palette.error.main,
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
            size="large"
            sx={{
              borderRadius: theme.spacing(1.5),
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '16px',
              minHeight: '48px',
              px: theme.spacing(4),
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              boxShadow: theme.shadows[2],
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
                boxShadow: theme.shadows[4]
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
              }
            }}
          >
            {isLoading ? 'Saving...' : (initialData ? 'Update Contact' : 'Add Contact')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}