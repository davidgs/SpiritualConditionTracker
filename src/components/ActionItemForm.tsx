import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ActionItemFormData } from '../types/database';

interface ActionItemFormProps {
  onSubmit: (actionItem: ActionItemFormData) => void;
  onCancel: () => void;
  initialData?: ActionItemFormData;
}

export default function ActionItemForm({ onSubmit, onCancel, initialData }: ActionItemFormProps) {
  const theme = useTheme();
  
  const [formData, setFormData] = useState<ActionItemFormData>({
    id: initialData?.id || 0,
    title: initialData?.title || '',
    text: initialData?.text || '',
    notes: initialData?.notes || '',
    dueDate: initialData?.dueDate || '',
    completed: initialData?.completed || false,
    type: 'todo' as const
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      completed: e.target.checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ActionItemForm.tsx: 53 handleSubmit] Submitting action item:', formData)
    
    if (!formData.title.trim()) {
      alert('Please enter a title for the action item');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box 
      sx={{ 
        p: 2, 
        border: `1px solid ${theme.palette.divider}`, 
        borderRadius: 1, 
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
        {initialData ? 'Edit Action Item' : 'New Action Item'}
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="What needs to be done?"
        required
        sx={{ 
          '& .MuiInputBase-root': { 
            height: '56px', 
            borderRadius: '8px',
            mb: 2
          }
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="text"
        label="Description"
        multiline
        rows={2}
        value={formData.text}
        onChange={handleChange}
        placeholder="Additional details about this action item"
        sx={{ mb: 2 }}
      />

      {/* <TextField
        fullWidth
        margin="normal"
        name="notes"
        label="Notes"
        multiline
        rows={2}
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any additional notes"
        sx={{ mb: 2 }}
      />
*/}
      <TextField
        fullWidth
        margin="normal"
        name="dueDate"
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ 
          '& .MuiInputBase-root': { 
            height: '56px', 
            borderRadius: '8px',
            mb: 2
          }
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.completed}
            onChange={handleCheckboxChange}
            sx={{ color: theme.palette.primary.main }}
          />
        }
        label="Mark as completed"
        sx={{ mb: 2, color: theme.palette.text.primary }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
        >
          {initialData ? 'Update' : 'Save'} 
        </Button>
      </Box>
    </Box>
  );
}