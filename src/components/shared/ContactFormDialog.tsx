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
  type: 'todo' | 'action' | 'reminder';
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
  
  // Action Items state
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState({
    title: '',
    text: '',
    notes: '',
    dueDate: null as string | null,
    type: 'todo' as 'todo' | 'action' | 'reminder'
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
      dueDate: null,
      type: 'todo'
    });
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

  // Action Item handlers
  const handleAddActionItem = () => {
    if (!newActionItem.title.trim()) return;
    
    const actionItem: ActionItem = {
      id: Date.now(), // Temporary ID
      title: newActionItem.title,
      text: newActionItem.text || newActionItem.title,
      notes: newActionItem.notes,
      dueDate: newActionItem.dueDate,
      completed: false,
      type: newActionItem.type
    };
    
    setActionItems(prev => [...prev, actionItem]);
    setNewActionItem({
      title: '',
      text: '',
      notes: '',
      dueDate: null,
      type: 'todo'
    });
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

            {/* Action Items Section */}
            <Divider sx={{ my: 3 }} />
            
            <Accordion 
              defaultExpanded 
              sx={{ 
                boxShadow: 'none',
                '&:before': { display: 'none' },
                backgroundColor: 'transparent'
              }}
            >
              <AccordionSummary
                expandIcon={<i className="fa-solid fa-chevron-down"></i>}
                sx={{
                  backgroundColor: theme.palette.background.default,
                  borderRadius: theme.spacing(1),
                  minHeight: '48px',
                  '& .MuiAccordionSummary-content': {
                    margin: '8px 0'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Action Items ({actionItems.length})
                </Typography>
              </AccordionSummary>
              
              <AccordionDetails sx={{ px: 0, pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  
                  {/* Add New Action Item Form */}
                  <Box sx={{ 
                    p: 2, 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    backgroundColor: theme.palette.background.default
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Add Action Item
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Action Item Title"
                        placeholder="What needs to be done?"
                        value={newActionItem.title}
                        onChange={(e) => handleActionItemChange('title', e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: theme.spacing(0.5),
                            backgroundColor: theme.palette.background.paper
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Notes (optional)"
                        placeholder="Additional details..."
                        value={newActionItem.notes}
                        onChange={(e) => handleActionItemChange('notes', e.target.value)}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: theme.spacing(0.5),
                            backgroundColor: theme.palette.background.paper
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={newActionItem.type}
                            onChange={(e) => handleActionItemChange('type', e.target.value)}
                            label="Type"
                          >
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="action">Action</MenuItem>
                            <MenuItem value="reminder">Reminder</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <Button
                          variant="contained"
                          onClick={handleAddActionItem}
                          disabled={!newActionItem.title.trim()}
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.success.main,
                            '&:hover': {
                              backgroundColor: theme.palette.success.dark
                            }
                          }}
                        >
                          Add Item
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Items List */}
                  {actionItems.length > 0 && (
                    <List sx={{ p: 0 }}>
                      {actionItems.map((item) => (
                        <ListItem
                          key={item.id}
                          sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor: theme.palette.background.paper
                          }}
                        >
                          <ListItemText
                            primary={item.title}
                            secondary={item.notes}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              },
                              '& .MuiListItemText-secondary': {
                                color: theme.palette.text.secondary
                              }
                            }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              onClick={() => handleRemoveActionItem(item.id!)}
                              size="small"
                              sx={{ color: theme.palette.error.main }}
                            >
                              <i className="fa-solid fa-times"></i>
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  {actionItems.length === 0 && (
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
              </AccordionDetails>
            </Accordion>
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
            {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}