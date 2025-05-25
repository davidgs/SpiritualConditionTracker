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
  actionItemLabel = "Action Items",
  emptyMessage = "No action items added yet",
  showInput = true
}) {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(showInput);
  const [todoForm, setTodoForm] = useState({
    title: '',
    text: '',
    dueDate: '',
    notes: '',
    completed: 0,
    type: 'todo'
  });
  const [internalTodos, setInternalTodos] = useState([]);
  
  // Initialize internal state only once on mount
  useEffect(() => {
    setInternalTodos([...todos]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setShowForm(false);
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
    setShowForm(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: 1,
        borderColor: 'divider'
      }}
    >
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
          {actionItemLabel}
        </Typography>
        
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            color="primary"
            startIcon={<i className="fa-solid fa-plus"></i>}
            variant="outlined"
            size="small"
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
              px: 2
            }}
          >
            Add Item
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Collapsible Action Item Form */}
      <Collapse in={showForm} timeout="auto" unmountOnExit>
        <Box 
          component="form" 
          sx={{ 
            mb: 3, 
            p: 2, 
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Title Field */}
          <TextField
            fullWidth
            label="Title"
            placeholder="Enter action item title"
            value={todoForm.title}
            onChange={(e) => setTodoForm({...todoForm, title: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-root': { 
                borderRadius: '8px'
              }
            }}
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
              mb: 2,
              '& .MuiInputBase-root': { 
                borderRadius: '8px'
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
            rows={3}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-root': { 
                borderRadius: '8px'
              }
            }}
          />
          
          {/* Form Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="text"
              color="inherit"
              onClick={handleCancel}
              startIcon={<i className="fa-solid fa-xmark"></i>}
              sx={{ 
                mr: 1,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTodo}
              disabled={!todoForm.title.trim()}
              startIcon={<i className="fa-solid fa-check"></i>}
              sx={{ 
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              
            </Button>
          </Box>
        </Box>
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
    </Paper>
  );
}