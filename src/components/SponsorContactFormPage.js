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
import { v4 as uuidv4 } from 'uuid';
import SponsorContactTodo from './SponsorContactTodo';

export default function SponsorContactFormPage({ userId, onSave, onCancel, initialData, details = [] }) {
  const theme = useTheme();
  
  // Form state
  const [contactData, setContactData] = useState({
    type: 'phone',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    note: ''
  });
  
  // State for todo items
  const [todos, setTodos] = useState([]);
  
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
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Todo handling functions
  // Add new todo item
  const handleAddTodo = (todoItem) => {
    console.log('Parent received todo item:', todoItem);
    
    const newTodo = {
      ...todoItem,
      contactId: initialData?.id || 'temp-' + uuidv4(),
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
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure we have a valid date
    let isoDate;
    if (contactData.date) {
      // Create full date from the date input
      const date = new Date(contactData.date);
      isoDate = date.toISOString();
    } else {
      // Default to current date if none provided
      isoDate = new Date().toISOString();
    }
    
    // Generate contact ID if this is a new contact
    const contactId = initialData?.id || uuidv4();
    
    // Create new contact data with ID and userId
    const newContact = {
      ...contactData,
      id: contactId,
      userId: userId,
      date: isoDate // Make sure date is never null
    };
    
    // Update todo items with the correct contactId
    const updatedTodos = todos.map(todo => ({
      ...todo,
      contactId: contactId
    }));
    
    // Submit with proper date format and todos
    onSave(newContact, updatedTodos);
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
              onChange={handleChange}
              fullWidth
              placeholder="Brief description of the contact"
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            {/* Todo Items Section */}
            <Box sx={{ mt: 3, mb: 3 }}>
              <SponsorContactTodo 
                todos={todos} 
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            </Box>
            
            {/* Form Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2,
              mt: 3
            }}>
              <Button 
                onClick={onCancel}
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
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}