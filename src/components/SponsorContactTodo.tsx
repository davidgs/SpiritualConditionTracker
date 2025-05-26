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
import { ActionItemFormData } from '../types/database';

interface SponsorContactTodoProps {
  onSave: (todoItem: ActionItemFormData) => void;
  onCancel: () => void;
}

export default function SponsorContactTodo({ onSave, onCancel }: SponsorContactTodoProps) {
  const theme = useTheme();
  const [todoForm, setTodoForm] = useState({
    title: '',
    text: '',
    notes: '',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (!todoForm.title.trim()) {
      alert('Please enter a title for the action item');
      return;
    }
    
    const todoItem: ActionItemFormData = {
      title: todoForm.title,
      text: todoForm.text,
      notes: todoForm.notes,
      dueDate: todoForm.dueDate || null,
      completed: false,
      type: 'todo'
    };
    
    console.log("[SponsorContactTodo.tsx: handleSubmit] Todo item created:", todoItem);
    
    // Pass to parent component for handling
    onSave(todoItem);
    
    // Clear form
    resetForm();
  };
  
  const resetForm = (): void => {
    setTodoForm({
      title: '',
      text: '',
      notes: '',
      dueDate: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setTodoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Action Item
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          name="title"
          label="Action Item Title"
          value={todoForm.title}
          onChange={handleChange}
          placeholder="What needs to be done?"
          required
        />
        
        <TextField
          fullWidth
          margin="normal"
          name="text"
          label="Description"
          multiline
          rows={2}
          value={todoForm.text}
          onChange={handleChange}
          placeholder="Additional details..."
        />
        
        <TextField
          fullWidth
          margin="normal"
          name="notes"
          label="Notes"
          multiline
          rows={2}
          value={todoForm.notes}
          onChange={handleChange}
          placeholder="Any notes or comments..."
        />
        
        <TextField
          fullWidth
          margin="normal"
          name="dueDate"
          label="Due Date"
          type="date"
          value={todoForm.dueDate}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2, px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={onCancel}
            color="error"
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            type="submit"
            color="success"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}