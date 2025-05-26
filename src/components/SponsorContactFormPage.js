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
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Not using UUIDs for database IDs
import SponsorContactTodo from './SponsorContactTodo';

export default function SponsorContactFormPage({ userId, onSave, onCancel, initialData, details = [] }) {
  const theme = useTheme();
  
  // Form state
  const [contactData, setContactData] = useState({
    type: 'phone',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    note: ''
  });
  
  // State for todo items and UI controls
  const [todos, setTodos] = useState([]);
  const [showInput, setShowInput] = useState(false);
  
  // Update form state when initial data changes
  useEffect(() => {
    if (initialData) {
      // Format date for input
      const formattedData = {
        ...initialData,
        date: initialData.date ? 
          new Date(initialData.date).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      };
      setContactData(formattedData);
      
      // Load associated todo items if any
      const todoItems = details.filter(item => item.type === 'todo');
      if (todoItems.length > 0) {
        setTodos(todoItems);
      }
    } else {
      // Reset to defaults
      setContactData({
        type: 'phone',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      setTodos([]);
    }
  }, [initialData, details]);
  
  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Contact form field changed: ${name} = ${value}`);
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Todo handling functions
  // Add new todo item
  const handleAddTodo = (todoItem) => {
    console.log('Parent received todo item:', todoItem);
    
    // In SQLite, the ID will be generated automatically with AUTOINCREMENT
    // We'll use a temporary negative ID for the UI state only
    const tempId = -Math.floor(Math.random() * 10000) - 1;
    
    const newTodo = {
      ...todoItem,
      id: tempId, // Temporary negative ID for UI only
      // Use either the existing contact ID or null (SQLite will handle this after both records are created)
      contactId: initialData?.id || null,
      type: 'todo',
      // Make sure we're using numbers for SQLite compatibility
      completed: typeof todoItem.completed === 'number' ? todoItem.completed : 0
    };
    
    // Create brand new array for setState to force re-render
    const newTodos = [...todos, newTodo];
    console.log('Setting todos to:', newTodos);
    
    // Direct state assignment for immediate update
    setTodos(newTodos);
    
    // Force a re-render with an empty state update
    setTimeout(() => {
      setContactData(prev => ({...prev}));
    }, 50);
  };
  
  // Toggle todo completion
  const handleToggleTodo = (todoId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          completed: todo.completed ? 0 : 1  // Toggle between 0 and 1
        };
      }
      return todo;
    });
    
    setTodos(updatedTodos);
  };
  
  // Delete todo item
  const handleDeleteTodo = (todoId) => {
    // Filter out the deleted todo
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    setTodos(updatedTodos);
  };
  
  // Note: handleAddAction is no longer needed as the SponsorContactTodo component now handles this internally
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure we have a valid date - critical for database constraint
    // Always use current date as fallback to avoid NOT NULL constraint errors
    let isoDate;
    try {
      if (contactData.date && contactData.date.trim() !== '') {
        // Create full date from the date input
        const date = new Date(contactData.date);
        if (!isNaN(date.getTime())) {
          isoDate = date.toISOString();
        } else {
          // Invalid date format, use current date
          isoDate = new Date().toISOString();
        }
      } else {
        // No date provided, use current date
        isoDate = new Date().toISOString();
      }
    } catch (error) {
      // Any error in date parsing, use current date
      console.log('Error parsing date, using current date:', error);
      isoDate = new Date().toISOString();
    }
    
    // Create new contact data with userId and date
    // If initialData has an id, keep it for updates, otherwise let SQLite generate one
    const newContact = {
      ...contactData,
      // Only include id if it's an existing contact
      ...(initialData?.id ? { id: initialData.id } : {}),
      userId: userId,
      date: isoDate // Make sure date is never null
    };
    
    // Convert action items to the proper format
    // For new todos, we need to preserve all the fields for the new action items table
    const actionItems = todos.map(todo => {
      // Extract all fields needed for action items
      return {
        title: todo.title || todo.text || '',
        text: todo.text || todo.title || '',
        notes: todo.notes || '',
        dueDate: todo.dueDate || null,
        completed: todo.completed || 0,
        type: todo.type || 'todo',
        id: todo.id // Keep temporary ID for tracking in the UI
      };
    });
    
    // Pass the contact, action items, and a flag indicating if this is a new contact
    onSave(newContact, actionItems);
    
    // Explicitly navigate back to main view after save
    setTimeout(() => onCancel(), 100); // Small delay to ensure save completes first
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        mt: -1
      }}>
        <IconButton 
          onClick={onCancel}
          sx={{ mr: 1, color: theme.palette.primary.main }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </IconButton>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          {initialData ? 'Edit Contact' : 'Add Sponsor Contact'}
        </Typography>
      </Box>
      
      <Paper
        elevation={1}
        sx={{ 
          p: 2.5, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: 1,
          borderColor: 'divider',
          borderLeft: 4,
          borderLeftColor: 'primary.main'
        }}
      >
        <form onSubmit={handleSubmit}>
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
            
            {/* Action Items Section */}
            <Box sx={{ mt: 3, mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <i className="fa-solid fa-list-check" style={{ marginRight: '10px' }}></i>
                  Action Items
                </Typography>
                
                <Button
                  onClick={() => setShowInput(!showInput)}
                  size="small"
                    sx={{ 
                      color: theme.palette.primary.main, 
                      '&:hover': { 
                        backgroundColor: theme.palette.background.transparent || 'transparent' 
                      },
                      ml: 0.5,
                      p: 0.5,
                      minWidth: 'auto'
                    }}
                  >
                    <i className="fa-solid fa-plus"></i>
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {/* Enhanced Action Item Component */}
              <SponsorContactTodo 
                todos={todos} 
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                showForm={showInput}
                onFormClose={() => setShowInput(false)}
                emptyMessage="No action items added yet"
              />
            </Box>
            
            {/* Form Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2,
              mt: 3
            }}>
              <IconButton 
                color="default"
                onClick={onCancel}
                sx={{ 
                  mr: 2,
                  fontSize: '1.2rem'
                }}
                aria-label="Cancel"
                >
                <i className="fa-solid fa-xmark"></i>
              </IconButton>
              <IconButton 
                type="submit"
                color="primary"
                aria-label="Save Item"
                  sx={{ 
                    mr: 2,
                    fontSize: '1.2rem'
                  }}
                >
                  <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i>
              </IconButton>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}