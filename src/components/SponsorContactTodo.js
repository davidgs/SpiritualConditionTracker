import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';

export default function SponsorContactTodo({ todos = [], onAddTodo, onToggleTodo, onDeleteTodo }) {
  const theme = useTheme();
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todoItem = {
        id: uuidv4(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      onAddTodo(todoItem);
      setNewTodo(''); // Clear input after adding
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
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* To-do input */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          placeholder="Add new action item..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddTodo}
          disabled={!newTodo.trim()}
          sx={{ 
            borderRadius: '8px',
            height: '56px',
            minWidth: '80px'
          }}
        >
          Add
        </Button>
      </Box>

      {/* To-do list */}
      {todos.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              disableGutters
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => onDeleteTodo(todo.id)}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </IconButton>
              }
              sx={{
                bgcolor: todo.completed ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                borderRadius: '8px',
                mb: 1
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                <Checkbox
                  edge="start"
                  checked={todo.completed}
                  onChange={() => onToggleTodo(todo.id)}
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
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? theme.palette.text.secondary : theme.palette.text.primary
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