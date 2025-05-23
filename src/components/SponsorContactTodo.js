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
import { v4 as uuidv4 } from 'uuid';

export default function SponsorContactTodo({ todos = [], onAddTodo, onToggleTodo, onDeleteTodo }) {
  const theme = useTheme();
  const [newTodo, setNewTodo] = useState('');
  const [showInput, setShowInput] = useState(false);
  // Local state for immediate feedback before database operations complete
  const [localTodos, setLocalTodos] = useState([...todos]);
  
  // Update localTodos when props todos change
  useEffect(() => {
    setLocalTodos([...todos]);
  }, [todos]);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todoItem = {
        id: uuidv4(),
        text: newTodo.trim(),
        completed: 0,  // Using 0 for SQLite compatibility
        type: 'todo',  // Important for filtering in the parent component
        createdAt: new Date().toISOString(),
      };
      
      onAddTodo(todoItem);
      setNewTodo(''); // Clear input after adding
      
      // For immediate feedback, add the item to the local todo list
      setLocalTodos(prev => [...prev, todoItem]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
          Todo Items
        </Typography>
        <IconButton
          color="primary"
          onClick={() => {
            setShowInput(!showInput);
          }}
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <i className="fa-solid fa-plus"></i>
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Collapsible To-do input */}
      <Collapse in={showInput} timeout="auto" unmountOnExit>
        <Box sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            placeholder="Add new action item..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
            multiline
            rows={2}
            sx={{ 
              mr: 1,
              '& .MuiInputBase-root': { 
                borderRadius: '8px',
                minHeight: '56px'
              },
              '& .MuiOutlinedInput-input': {
                fontSize: 16,
                padding: '15px 14px'
              }
            }}
          />
          <IconButton
            color="primary"
            onClick={() => {
              handleAddTodo();
              // Don't hide the input after adding
            }}
            disabled={!newTodo.trim()}
            sx={{ 
              backgroundColor: 'transparent',
              color: theme.palette.primary.main,
              height: '56px',
              width: '42px',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&.Mui-disabled': {
                backgroundColor: 'transparent',
                color: theme.palette.action.disabled
              }
            }}
          >
            <i className="fa-solid fa-check"></i>
          </IconButton>
        </Box>
      </Collapse>

      {/* To-do list */}
      {localTodos.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {localTodos.map((todo) => (
            <ListItem
              key={todo.id}
              disableGutters
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => {
                    onDeleteTodo(todo.id);
                    // Remove from local state for immediate UI update
                    setLocalTodos(prev => prev.filter(t => t.id !== todo.id));
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
                    onToggleTodo(todo.id);
                    // Toggle in local state for immediate UI update
                    setLocalTodos(prev => prev.map(t => 
                      t.id === todo.id ? {...t, completed: t.completed === 1 ? 0 : 1} : t
                    ));
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
                primary={todo.text}
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
            No action items added yet
          </Typography>
        </Box>
      )}
    </Paper>
  );
}