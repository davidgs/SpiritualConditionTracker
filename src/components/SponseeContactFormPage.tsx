import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactType, ContactFormData, ActionItemFormData } from '../types/database';
import ActionItemForm from './ActionItemForm';

interface SponseeContactFormProps {
  open: boolean;
  userId: string | number | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
  details?: any;
  sponseeId?: number;
}

export default function SponseeContactFormPage({ open, userId, onSubmit, onClose, initialData, details = [], sponseeId }: SponseeContactFormProps) {
  const theme = useTheme();
  
  // Form state with strict typing
  const [contactData, setContactData] = useState<ContactFormData>({
    type: 'phone' as ContactType,
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  
  // State for todo items and UI controls with strict typing
  const [todos, setTodos] = useState<ActionItemFormData[]>([]);
  const [showInput, setShowInput] = useState<boolean>(false);
  
  // Load existing action items for this contact
  const loadContactActionItems = async (contactId: number) => {
    try {
      if (!window.db) return [];
      
      const allActionItems = await window.db.getAll('action_items');
      const actionItemsArray = Array.isArray(allActionItems) ? allActionItems : [];
      
      // Find action items that belong to this contact
      const contactActionItems = actionItemsArray.filter(item => 
        item && item.contactId === contactId
      );
      
      // Convert to ActionItemFormData format
      const formattedItems = contactActionItems.map(item => ({
        id: item.id,
        title: item.title || '',
        text: item.text || '',
        notes: item.notes || '',
        dueDate: item.dueDate || '',
        completed: item.completed || false,
        type: item.type || 'action_item'
      }));
      
      console.log('Loaded action items for contact:', contactId, formattedItems);
      return formattedItems;
    } catch (error) {
      console.error('Error loading contact action items:', error);
      return [];
    }
  };

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setContactData({
        type: initialData.type || 'phone',
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        note: initialData.note || ''
      });
      
      // Load existing action items if editing
      if (initialData.id) {
        loadContactActionItems(initialData.id).then(items => {
          setTodos(items);
        });
      }
    } else {
      // Reset form for new contact
      setContactData({
        type: 'phone' as ContactType,
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      setTodos([]);
    }
  }, [initialData]);

  // Handle form input changes
  const handleChange = (field: keyof ContactFormData, value: string) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle adding a new todo item
  const handleAddTodo = (todoData: ActionItemFormData) => {
    console.log('[SponseeContactFormPage.tsx:handleAddTodo] New todo object:', todoData);
    
    const newTodo: ActionItemFormData = {
      id: Date.now(), // Temporary ID for new items
      title: todoData.title,
      text: todoData.text,
      notes: todoData.notes || '',
      dueDate: todoData.dueDate || '',
      completed: false,
      type: todoData.type || 'action_item'
    };

    setTodos(prev => [...prev, newTodo]);
    setShowInput(false);
  };

  // Handle removing a todo item
  const handleRemoveTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Handle form submission
  const handleSubmit = () => {
    const submitData = {
      contact: {
        ...contactData,
        sponseeId: sponseeId
      },
      actionItems: todos
    };
    
    console.log('[SponseeContactFormPage.tsx] Submitting data:', submitData);
    onSubmit(submitData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          backgroundColor: theme.palette.background.default,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 3,
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 600
      }}>
        {initialData ? 'Edit Contact' : 'Add Contact with Sponsee'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 4, pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Contact Type Selection */}
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel sx={{ color: theme.palette.text.secondary }}>Contact Type</InputLabel>
            <Select
              value={contactData.type}
              label="Contact Type"
              onChange={(e) => handleChange('type', e.target.value as ContactType)}
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                }
              }}
            >
              <MenuItem value="phone">Phone Call</MenuItem>
              <MenuItem value="text">Text Message</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="meeting">In-Person Meeting</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          {/* Date Input */}
          <TextField
            fullWidth
            label="Contact Date"
            type="date"
            value={contactData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            InputLabelProps={{
              shrink: true,
              sx: { color: theme.palette.text.secondary }
            }}
            sx={{ 
              mb: 1,
              backgroundColor: theme.palette.background.paper,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.divider
                }
              }
            }}
          />

          {/* Notes Input */}
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={4}
            value={contactData.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Add any notes about this contact..."
            InputLabelProps={{
              sx: { color: theme.palette.text.secondary }
            }}
            sx={{ 
              backgroundColor: theme.palette.background.paper,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.divider
                }
              }
            }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Action Items Section */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h6" sx={{ 
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
                fontWeight: 600
              }}>
                Action Items
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowInput(true)}
                startIcon={<i className="fa-solid fa-plus"></i>}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                  }
                }}
              >
                Add Action Item
              </Button>
            </Box>

            {/* Add Action Item Form */}
            {showInput && (
              <Paper sx={{ p: 2, mb: 2, backgroundColor: theme.palette.background.paper }}>
                <ActionItemForm
                  onSubmit={handleAddTodo}
                  onCancel={() => setShowInput(false)}
                />
              </Paper>
            )}

            {/* Existing Action Items */}
            {todos.length > 0 && (
              <Box className="space-y-2">
                {todos.map((todo) => (
                  <Paper key={todo.id} sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
                    <Box className="flex justify-between items-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                          {todo.title}
                        </Typography>
                        {todo.text && (
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                            {todo.text}
                          </Typography>
                        )}
                        {todo.notes && (
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                            Notes: {todo.notes}
                          </Typography>
                        )}
                        {todo.dueDate && (
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                            Due: {todo.dueDate}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveTodo(todo.id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            {todos.length === 0 && !showInput && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                px: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                border: `1px dashed ${theme.palette.divider}`
              }}>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 1,
                  fontSize: '0.95rem'
                }}>
                  No action items yet. Click "Add Action Item" to create one.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          {initialData ? 'Update Contact' : 'Save Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}