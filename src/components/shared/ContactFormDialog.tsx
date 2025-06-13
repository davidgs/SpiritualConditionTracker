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
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface ActionItem {
  id?: number;
  title: string;
  text: string;
  notes: string;
  dueDate: string | null;
  completed: boolean;
}

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any, actionItems?: ActionItem[]) => void;
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showAddActionItemForm, setShowAddActionItemForm] = useState(false);
  
  // Action Items state
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState({
    title: '',
    text: '',
    notes: '',
    dueDate: null as string | null
  });

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
    // Reset action items when dialog opens
    setActionItems([]);
    setNewActionItem({
      title: '',
      text: '',
      notes: '',
      dueDate: null
    });
    setShowAddActionItemForm(false);
    // Reset scroll indicator
    setShowScrollIndicator(true);
  }, [initialData, open]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Special validation for duration field - only allow numbers
    if (field === 'duration') {
      // Remove any non-numeric characters
      value = value.replace(/[^0-9]/g, '');
      
      // Convert to number and validate range
      const numericValue = parseInt(value);
      if (value !== '' && (isNaN(numericValue) || numericValue < 1 || numericValue > 1440)) {
        // Don't update if invalid number or outside range
        return;
      }
    }
    
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

  // Action Item handlers
  const handleAddActionItem = () => {
    if (!newActionItem.title.trim()) return;
    
    const actionItem: ActionItem = {
      id: Date.now(), // Temporary ID
      title: newActionItem.title,
      text: newActionItem.text || newActionItem.title,
      notes: newActionItem.notes,
      dueDate: newActionItem.dueDate,
      completed: false
    };
    
    setActionItems(prev => [...prev, actionItem]);
    setNewActionItem({
      title: '',
      text: '',
      notes: '',
      dueDate: null
    });
    setShowAddActionItemForm(false);
  };

  const handleRemoveActionItem = (id: number) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleActionItemChange = (field: string, value: any) => {
    setNewActionItem(prev => ({
      ...prev,
      [field]: value
    }));
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
      
      await onSave(submitData, actionItems);
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
            paddingTop: '5vh'
          }
        }}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.spacing(2),
            margin: theme.spacing(1),
            maxHeight: '90vh',
            overflow: 'auto'
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

        <DialogContent 
          sx={{ 
            p: theme.spacing(3),
            maxHeight: '70vh',
            overflowY: 'auto',
            position: 'relative'
          }}
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
            // Hide indicator when user scrolls past 30%
            if (scrollPercentage > 30) {
              setShowScrollIndicator(false);
            }
          }}
        >


          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: theme.spacing(2),
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
                inputProps={{ 
                  min: 1, 
                  max: 1440,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                value={formData.duration || ''}
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
              rows={3}
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

            {/* Action Items Section - Simplified */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.text.primary,
                  fontSize: '18px'
                }}>
                  Action Items ({actionItems.length})
                </Typography>
                
                <IconButton
                  onClick={() => setShowAddActionItemForm(!showAddActionItemForm)}
                  sx={{
                    color: theme.palette.primary.main,
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ fontSize: '16px' }}></i>
                </IconButton>
              </Box>

              {/* Add Action Item Form */}
              {showAddActionItemForm && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: theme.spacing(3),
                  mb: theme.spacing(3)
                }}>
                  <TextField
                    fullWidth
                    label="What needs to be done?"
                    placeholder="Enter action item"
                    value={newActionItem.title}
                    onChange={(e) => handleActionItemChange('title', e.target.value)}
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
                  
                  <TextField
                    fullWidth
                    label="Notes (optional)"
                    placeholder="Additional details"
                    value={newActionItem.notes}
                    onChange={(e) => handleActionItemChange('notes', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={3}
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
                        color: theme.palette.text.secondary,
                        fontSize: '16px'
                      },
                      '& .MuiInputBase-input': {
                        color: theme.palette.text.primary
                      }
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowAddActionItemForm(false)}
                      size="small"
                      sx={{
                        borderRadius: theme.spacing(1),
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        px: theme.spacing(2),
                        py: theme.spacing(0.75),
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        '&:hover': {
                          borderColor: theme.palette.error.main,
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleAddActionItem}
                      disabled={!newActionItem.title.trim()}
                      size="small"
                      sx={{
                        borderRadius: theme.spacing(1),
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '14px',
                        px: theme.spacing(2),
                        py: theme.spacing(0.75),
                        backgroundColor: theme.palette.success.main,
                        color: theme.palette.success.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.success.dark
                        },
                        '&:disabled': {
                          backgroundColor: theme.palette.action.disabledBackground,
                          color: theme.palette.action.disabled
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Action Items List */}
              {actionItems.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {actionItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: theme.palette.background.paper,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        {item.notes && (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {item.notes}
                          </Typography>
                        )}
                      </Box>
                      <IconButton 
                        onClick={() => handleRemoveActionItem(item.id!)}
                        size="small"
                        sx={{ color: theme.palette.error.main, ml: 1 }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textAlign: 'center', 
                    color: theme.palette.text.secondary,
                    fontStyle: 'italic',
                    py: 2
                  }}
                >
                  No action items added yet
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: theme.spacing(2), 
          gap: 1,
          justifyContent: 'flex-end'
        }}>
          <Button
            onClick={handleCancel}
            variant="outlined"
            disabled={isLoading}
            size="small"
            sx={{
              borderRadius: theme.spacing(1),
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              px: theme.spacing(2),
              py: theme.spacing(0.75),
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
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
            size="small"
            sx={{
              borderRadius: theme.spacing(1),
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              px: theme.spacing(2),
              py: theme.spacing(0.75),
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.success.dark
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
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