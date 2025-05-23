import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  Fab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDateForDisplay } from '../utils/dateUtils';
// Not using UUIDs for database IDs
import SponsorContactTodo from './SponsorContactTodo';

export default function SponsorContactDetailsPage({ 
  contact, 
  details = [], 
  onBack, 
  onSaveDetails, 
  onUpdateContact,
  onDeleteContact,
  onDeleteDetail
}) {
  const theme = useTheme();
  const [contactDetails, setContactDetails] = useState(details);
  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddActionDialog, setShowAddActionDialog] = useState(false);
  
  // Form state for new action item
  const [newAction, setNewAction] = useState({
    actionItem: '',
    notes: '',
    dueDate: '',
    completed: false
  });
  
  // State for todo items
  const [todos, setTodos] = useState([]);
  
  // Load details when they change
  useEffect(() => {
    setContactDetails(details);
    
    // Filter out any todos from the details
    const todoItems = details.filter(item => item.type === 'todo');
    if (todoItems.length > 0) {
      setTodos(todoItems);
    }
  }, [details]);
  
  // Handle form changes for new action item
  const handleActionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAction(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new action item
  const handleAddAction = () => {
    // In SQLite, the ID will be generated automatically with AUTOINCREMENT
    // We'll use a temporary negative ID for the UI state only
    const tempId = -Math.floor(Math.random() * 10000) - 1;
    
    // For UI state we need an ID, but for database we exclude it
    const actionForUI = {
      ...newAction,
      id: tempId, // Temporary negative ID for UI only
      contactId: contact.id,
      completed: newAction.completed ? 1 : 0 // Convert boolean to integer for SQLite
    };
    
    // For database: remove the temporary ID field completely
    const { id, ...actionForDatabase } = actionForUI;
    
    // Add to state (with temporary ID for UI)
    const updatedDetails = [...contactDetails, actionForUI];
    setContactDetails(updatedDetails);
    
    // Save to database (without ID field)
    onSaveDetails({
      ...actionForDatabase,
      contactId: contact.id
    });
    
    // Reset form and hide it
    setNewAction({
      actionItem: '',
      notes: '',
      dueDate: '',
      completed: false
    });
    setShowAddActionForm(false);
  };
  
  // Toggle action item completion
  const handleToggleComplete = (id) => {
    const updatedDetails = contactDetails.map(detail => {
      if (detail.id === id) {
        const updatedDetail = {
          ...detail,
          completed: detail.completed ? 0 : 1 // Toggle between 0 and 1
        };
        // Update in database
        onSaveDetails(updatedDetail);
        return updatedDetail;
      }
      return detail;
    });
    
    setContactDetails(updatedDetails);
  };
  
  // Add new todo item
  const handleAddTodo = (todoItem) => {
    const newTodo = {
      ...todoItem,
      contactId: contact.id,
      type: 'todo',
      completed: todoItem.completed ? 1 : 0  // Convert boolean to integer for SQLite
    };
    
    // Add to state
    setTodos(prev => [...prev, newTodo]);
    
    // Save to database
    onSaveDetails(newTodo);
  };
  
  // Toggle todo completion
  const handleToggleTodo = (todoId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const updatedTodo = {
          ...todo,
          completed: todo.completed ? 0 : 1  // Toggle between 0 and 1
        };
        
        // Save change to database
        onSaveDetails(updatedTodo);
        
        return updatedTodo;
      }
      return todo;
    });
    
    setTodos(updatedTodos);
  };
  
  // Delete todo item
  const handleDeleteTodo = (todoId) => {
    // Filter out the deleted todo
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    
    // Update state
    setTodos(updatedTodos);
    
    // Delete from database using the provided function
    if (onDeleteDetail) {
      onDeleteDetail(todoId);
    } else {
      console.warn('No delete function provided for todos');
    }
  };
  
  // Get contact type label for display
  const getContactTypeLabel = (type) => {
    const typeLabels = {
      'phone': 'Phone Call',
      'in-person': 'In Person',
      'video': 'Video Call',
      'text': 'Text Message',
      'email': 'Email',
      'other': 'Other'
    };
    
    return typeLabels[type] || 'Contact';
  };
  
  // Get icon for contact type
  const getContactTypeIcon = (type) => {
    const typeIcons = {
      'phone': 'fa-phone',
      'in-person': 'fa-people-arrows',
      'video': 'fa-video',
      'text': 'fa-comment-sms',
      'email': 'fa-envelope',
      'other': 'fa-handshake'
    };
    
    return typeIcons[type] || 'fa-handshake';
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
          onClick={onBack}
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
          Sponsor Contact Details
        </Typography>
      </Box>
      
      {/* Contact Summary Card */}
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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 2
        }}>
          {/* Contact Type Icon */}
          <Box sx={{ 
            mt: 0.5,
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <i className={`fa-solid ${getContactTypeIcon(contact.type)} fa-lg`}></i>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            {/* Contact Type and Date */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1
            }}>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: theme.palette.text.primary
                  }}
                >
                  {getContactTypeLabel(contact.type)}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 1
                  }}
                >
                  {formatDateForDisplay(contact.date)}
                </Typography>
              </Box>
              
              {/* Action buttons */}
              <Box>
                <IconButton 
                  size="small"
                  onClick={() => setShowDeleteConfirm(true)}
                  sx={{ color: theme.palette.error.main }}
                >
                  <i className="fa-solid fa-trash"></i>
                </IconButton>
              </Box>
            </Box>
            
            {/* Contact Note */}
            {contact.note && (
              <Box sx={{ mt: 1.5 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 0.5
                  }}
                >
                  Note
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: theme.palette.text.primary,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {contact.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Todo Items Section - New feature */}
      <SponsorContactTodo 
        todos={todos} 
        onAddTodo={handleAddTodo}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
      />
      
      {/* Action Items Section */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            Action Items
          </Typography>
          <Button
            variant="outlined"
            startIcon={<i className="fa-solid fa-plus"></i>}
            onClick={() => setShowAddActionDialog(true)}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Add Action
          </Button>
        </Box>
        
        {/* Action Items List */}
        {contactDetails && contactDetails.length > 0 ? (
          <List sx={{ 
            p: 0,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider'
          }}>
            {contactDetails.map((detail, index) => (
              <React.Fragment key={detail.id}>
                <ListItem
                  sx={{ 
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!detail.completed}
                        onChange={() => handleToggleComplete(detail.id)}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    }
                    label=""
                    sx={{ ml: -1, mr: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ 
                        textDecoration: detail.completed ? 'line-through' : 'none',
                        color: detail.completed ? theme.palette.text.secondary : theme.palette.text.primary,
                        fontWeight: detail.completed ? 'normal' : 'medium'
                      }}
                    >
                      {detail.actionItem}
                    </Typography>
                    
                    {/* Due Date */}
                    {detail.dueDate && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          display: 'block',
                          mt: 0.5,
                          color: theme.palette.text.secondary
                        }}
                      >
                        Due: {formatDateForDisplay(detail.dueDate)}
                      </Typography>
                    )}
                    
                    {/* Notes */}
                    {detail.notes && (
                      <Typography
                        variant="body2"
                        sx={{ 
                          mt: 1,
                          whiteSpace: 'pre-wrap',
                          color: theme.palette.text.secondary
                        }}
                      >
                        {detail.notes}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
                {index < contactDetails.length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center', 
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              No action items yet. Add items your sponsor asked you to complete.
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Add Action Dialog */}
      <Dialog
        open={showAddActionDialog}
        onClose={() => setShowAddActionDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          Add Action Item
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              name="actionItem"
              label="Action Item"
              value={newAction.actionItem}
              onChange={handleActionChange}
              fullWidth
              required
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
            />
            
            <TextField
              name="dueDate"
              label="Due Date"
              type="date"
              value={newAction.dueDate}
              onChange={handleActionChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '56px', 
                  borderRadius: '8px',
                }
              }}
            />
            
            <TextField
              name="notes"
              label="Notes"
              multiline
              rows={3}
              value={newAction.notes}
              onChange={handleActionChange}
              fullWidth
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  name="completed"
                  checked={newAction.completed}
                  onChange={handleActionChange}
                  sx={{ color: theme.palette.primary.main }}
                />
              }
              label="Already Completed"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setShowAddActionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddAction}
            variant="contained" 
            disabled={!newAction.actionItem}
          >
            Add Action
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Contact?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this contact record? This will also delete all associated action items.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onDeleteContact(contact.id);
              setShowDeleteConfirm(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Floating back button */}
      <Fab
        color="primary"
        aria-label="back"
        onClick={onBack}
        sx={{ 
          position: 'fixed',
          bottom: 20,
          right: 20
        }}
      >
        <i className="fa-solid fa-arrow-left"></i>
      </Fab>
    </Box>
  );
}