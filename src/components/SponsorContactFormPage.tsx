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
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContactType, ContactFormData, ActionItemFormData, SponsorContactFormProps } from '../types/database';
import ActionItemForm from './ActionItemForm';

export default function SponsorContactFormPage({ open, userId, onSubmit, onClose, initialData, details = [] }: SponsorContactFormProps) {
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
  
  // Update form state when initial data changes - but only run once on mount
  useEffect(() => {
    if (initialData) {
      // Format date for input with strict typing
      const formattedData: ContactFormData = {
        type: (initialData.type || 'phone') as ContactType,
        date: initialData.date ? 
          new Date(initialData.date).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        note: initialData.note || ''
      };
      setContactData(formattedData);
      
      // Convert legacy details to ActionItemFormData if any
      const todoItems: ActionItemFormData[] = details
        .filter(item => item.type === 'todo')
        .map(item => ({
          id: item.id,
          title: item.actionItem,
          text: item.text || item.actionItem,
          notes: item.notes,
          dueDate: item.dueDate,
          completed: item.completed === 1,
          type: 'todo' as const
        }));
      
      if (todoItems.length > 0) {
        setTodos(todoItems);
      }
    }
  }, []);
  
  // Handle field changes with strict typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: ContactType | string } }): void => {
    const { name, value } = e.target;
    // console.log(`[SponsorContactFormPage.tsx: handleChange] Field changed: ${name} = ${value}`);
    
    // TypeScript ensures we can only set valid contact types
    if (name === 'type' && typeof value === 'string') {
      const contactType = value as ContactType;
      setContactData(prev => ({
        ...prev,
        type: contactType
      }));
    } else {
      setContactData(prev => ({
        ...prev,
        [name]: value as string
      }));
    }
    console.log('[SponsorContactFormPage.tsx:87 handleChange] Updated contactData:', contactData);
  };
  
  // Add new todo item
  const handleAddTodo = (todoItem: ActionItemFormData): void => {
    console.log('[SponsorContactFormPage.tsx: handleAddTodo : 92] Adding todo item:', todoItem);
    
    // Create a clean ActionItemFormData object
    const newTodo: ActionItemFormData = {
      id: todoItem.id || -Math.floor(Math.random() * 10000) - 1, // Temporary negative ID for UI
      title: todoItem.title,
      text: todoItem.text,
      notes: todoItem.notes,
      dueDate: todoItem.dueDate,
      completed: Boolean(todoItem.completed),
      type: todoItem.type
    };
    console.log('[SponsorContactFormPage.tsx: handleAddTodo : 104] New todo object:', newTodo);
    setTodos(prev => [...prev, newTodo]);
    setShowInput(false);
  };

  // Toggle todo completion
  const handleToggleTodo = (todoId: number): void => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  // Delete todo item
  const handleDeleteTodo = (todoId: number): void => {
    console.log('[SponsorContactFormPage.tsx: 120 handleDeleteTodo] Deleting todo at id:', todoId);
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('[SponsorContactFormPage.tsx: 127 handleSubmit] Submitting contact with data:', contactData);
    console.log('[SponsorContactFormPage.tsx: 128 handleSubmit] Submitting todos:', todos);
    
    // Validate required fields
    if (!contactData.note.trim()) {
      alert('Please add a note about the contact');
      return;
    }
    
    // Submit the contact and todos with userId
    const contactWithUserId = {
      ...contactData,
      userId: userId
    };
    onSubmit(contactWithUserId, todos);
  };

  // Contact type options
  const contactTypes: { value: ContactType; label: string }[] = [
    { value: 'phone', label: 'Phone Call' },
    { value: 'in-person', label: 'In Person' },
    { value: 'video', label: 'Video Call' },
    { value: 'text', label: 'Text Message' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2
        }
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          padding: 3
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.primary }}>
          {initialData ? 'Edit Contact' : 'New Sponsor Contact'}
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Contact Type</InputLabel>
          <Select
            name="type"
            value={contactData.type}
            onChange={handleChange}
            label="Contact Type"
            required
          >
            {contactTypes.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          name="date"
          label="Date"
          type="date"
          value={contactData.date}
          onChange={handleChange}
          sx={{ 
            '& .MuiInputBase-root': { 
              height: '56px', 
              borderRadius: '8px',
            }
          }}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          name="note"
          label="Notes about the contact"
          multiline
          rows={4}
          value={contactData.note}
          onChange={handleChange}
          placeholder="What did you discuss? How did it go?"
          required
        />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Action Items
          </Typography>
          
          {todos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {todos.map((todo) => (
                <Paper
                  key={todo.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    backgroundColor: todo.completed 
                      ? theme.palette.action.selected 
                      : theme.palette.background.paper
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? theme.palette.text.secondary : theme.palette.text.primary
                        }}
                      >
                        {todo.title}
                      </Typography>
                      {todo.text && (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {todo.text}
                        </Typography>
                      )}
                      {todo.dueDate && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => handleToggleTodo(todo.id!)}
                        sx={{ mr: 1 }}
                      >
                        {todo.completed ? 'Undo' : 'Complete'}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTodo(todo.id!)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {showInput ? (
            <ActionItemForm
              onSubmit={handleAddTodo}
              onCancel={() => setShowInput(false)}
            />
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowInput(true)}
              fullWidth
              sx={{ mb: 2 }}
            >
              Add Action Item
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={onClose}
            disabled={showInput}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            color="success"
            disabled={showInput}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}