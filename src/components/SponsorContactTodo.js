import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// No longer using uuids for database ids

export default function SponsorContactTodo({ 
  todos = [], 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo,
  emptyMessage = "No action items added yet",
  showForm = false,
  onFormClose = () => {}
}) {
  const theme = useTheme();
  const [todoForm, setTodoForm] = useState({
    title: '',
    text: '',
    dueDate: '',
    notes: '',
    completed: 0,
    type: 'todo'
  });
  const [internalTodos, setInternalTodos] = useState([]);
  
  // Update internal todos when props change
  useEffect(() => {
    if (todos && todos.length > 0) {
      setInternalTodos([...todos]);
    }
  }, [todos]);

  const handleAddTodo = () => {
    if (todoForm.title.trim()) {
      // For UI state, we need a temporary ID that won't conflict with database IDs
      // Use negative numbers which SQLite auto-increment will never generate
      const tempUIId = -Math.floor(Math.random() * 10000) - 1;
      
      const todoItem = {
        // For UI state only, we'll use a temporary negative ID
        // SQLite auto-increment will always use positive integers
        id: tempUIId,
        title: todoForm.title.trim(),
        text: todoForm.text.trim() || todoForm.title.trim(), // Use title as text if text is empty
        notes: todoForm.notes || '',
        dueDate: todoForm.dueDate || null,
        completed: 0,  // Using 0 for SQLite compatibility
        type: 'todo',  // Important for filtering in the parent component
        createdAt: new Date().toISOString(),
      };
      
      // Add to internal state immediately for UI feedback
      setInternalTodos(prev => [...prev, todoItem]);
      
      // Pass to parent component without the temporary ID
      // For database insertion, we should exclude the ID field completely
      const { id, ...todoDataForDatabase } = todoItem;
      console.log('Adding todo item (for database):', todoDataForDatabase);
      onAddTodo(todoDataForDatabase);
      
      // Clear form and hide it
      resetForm();
      onFormClose();
    }
  };
  
  const resetForm = () => {
    setTodoForm({
      title: '',
      text: '',
      dueDate: '',
      notes: '',
      completed: 0,
      type: 'todo'
    });
  };

  const handleCancel = () => {
    resetForm();
    onFormClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  return (
    <Box>
      {/* Collapsible Action Item Form */}
      <Collapse in={showForm} timeout="auto" unmountOnExit>
        <Paper
          elevation={1}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Action Item Title */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {todoForm.title}
          </Typography>
          {/* Title Field */}
          <TextField
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            sx={{ 
              '& .MuiInputBase-root': { 
                height: '56px', 
                borderRadius: '8px',
              }
            }}
            label="Title"
            placeholder="Enter action item title"
            value={todoForm.title}
            onChange={(e) => setTodoForm({...todoForm, title: e.target.value})}
            autoFocus
          />
          
          {/* Due Date Field */}
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={todoForm.dueDate}
            onChange={(e) => setTodoForm({...todoForm, dueDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              '& .MuiInputBase-root': { 
                height: '56px', 
                borderRadius: '8px',
              }
            }}
          />
          
          {/* Notes Field */}
          <TextField
            fullWidth
            label="Notes"
            placeholder="Add details or context (optional)"
            value={todoForm.notes}
            onChange={(e) => setTodoForm({...todoForm, notes: e.target.value})}
            onKeyPress={handleKeyPress}
            multiline
            rows={4}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              mb: 3,
              '& .MuiInputBase-root': { 
                borderRadius: 1.5
              }
            }}
          />
          
          {/* Form Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <IconButton
              color="default"
              onClick={handleCancel}
              sx={{ 
                mr: 2,
                fontSize: '1.2rem'
              }}
              aria-label="Cancel"
            >
              <i className="fa-solid fa-xmark"></i>
            </IconButton>
            
            <IconButton
              color="primary"
              onClick={handleAddTodo}
              aria-label="Save Item"
              disabled={!todoForm.title.trim()}
              sx={{ 
                mr: 2,
                fontSize: '1.2rem'
              }}
            >
              <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i>
            </IconButton>
          </Box>
        </Paper>
      </Collapse>

      {/* To-do list */}
      {internalTodos && internalTodos.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {internalTodos.map((todo) => (
            <ListItem
              key={todo.id}
              disableGutters
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => {
                    // Update internal state immediately for UI feedback
                    setInternalTodos(prev => prev.filter(t => t.id !== todo.id));
                    // Notify parent component
                    onDeleteTodo(todo.id);
                  }}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </IconButton>
              }
              sx={{
                bgcolor: todo.completed === 1 ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                borderRadius: '8px',
                mb: 1
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                <Checkbox
                  edge="start"
                  checked={todo.completed === 1}
                  onChange={() => {
                    // Update internal state immediately for UI feedback
                    setInternalTodos(prev => prev.map(t => 
                      t.id === todo.id ? {...t, completed: t.completed === 1 ? 0 : 1} : t
                    ));
                    // Notify parent component
                    onToggleTodo(todo.id);
                  }}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    }
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={todo.title || todo.text}
                secondary={todo.notes && (
                  <Typography variant="body2" component="span" color="text.secondary">
                    {todo.notes}
                    {todo.dueDate && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, fontWeight: 'medium' }}>
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Typography>
                )}
                sx={{
                  textDecoration: todo.completed === 1 ? 'line-through' : 'none',
                  color: todo.completed === 1 ? theme.palette.text.secondary : theme.palette.text.primary
                }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          py: 2, 
          textAlign: 'center',
          color: theme.palette.text.secondary
        }}>
          <Typography variant="body2">
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
}