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
import sponsorDB from '../utils/sponsor-database';

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
  
  // State for edited contact
  const [editedContact, setEditedContact] = useState(contact);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for new action item
  const [newAction, setNewAction] = useState({
    actionItem: '',
    notes: '',
    dueDate: '',
    completed: false
  });
  
  // State for action items
  const [actionItems, setActionItems] = useState([]);
  
  // Update local state when the contact prop changes
  useEffect(() => {
    if (!contact) return;
    setEditedContact(contact);
  }, [contact]);
  
  // Load action items when contact changes
  useEffect(() => {
    if (!contact || !contact.id) return;
    
    setContactDetails(details);
    
    async function loadActionItems() {
      try {
        console.log(`[SponsorContactDetailsPage] Loading action items for contact ID: ${contact.id}`);
        
        // Load action items from the action_items table, not contact_details
        const actionItemsList = await sponsorDB.getActionItemsByContactId(contact.id);
        console.log(`[SponsorContactDetailsPage] Found ${actionItemsList.length} action items for contact`);
        
        setActionItems(actionItemsList);
      } catch (error) {
        console.error('[SponsorContactDetailsPage] Error loading action items:', error);
        setActionItems([]);
      }
    }
    
    loadActionItems();
  }, [contact, details]);
  
  // Handle form changes for new action item
  const handleActionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAction(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new action item
  const handleAddAction = async () => {
    try {
      const actionData = {
        contactId: contact.id,
        actionItem: newAction.actionItem,
        text: newAction.actionItem, // Required field - use same value as actionItem
        notes: newAction.notes || '',
        dueDate: newAction.dueDate || null,
        completed: newAction.completed ? 1 : 0,
        type: 'todo'
      };
      
      console.log('[SponsorContactDetailsPage] Adding new contact detail:', actionData);
      
      const savedDetail = await sponsorDB.addContactDetail(actionData);
      
      // Update local state
      setActionItems(prev => [savedDetail, ...prev]);
      
      // Reset form
      setNewAction({
        actionItem: '',
        notes: '',
        dueDate: '',
        completed: false
      });
      setShowAddActionForm(false);
      
    } catch (error) {
      console.error('[SponsorContactDetailsPage] Error adding action item:', error);
    }
  };
  
  // Toggle action item completion
  const handleToggleComplete = async (actionItem) => {
    try {
      console.log('[SponsorContactDetailsPage] Toggling completion for action item:', actionItem);
      
      const updatedItem = {
        ...actionItem,
        completed: actionItem.completed ? 0 : 1
      };
      
      console.log('[SponsorContactDetailsPage] Updated item data:', updatedItem);
      
      const result = await sponsorDB.updateContactDetail(updatedItem);
      console.log('[SponsorContactDetailsPage] Update result:', result);
      
      if (result) {
        setActionItems(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const updated = prevArray.map(item => 
            item && item.id === actionItem.id ? updatedItem : item
          );
          console.log('[SponsorContactDetailsPage] Updated action items list:', updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('[SponsorContactDetailsPage] Error toggling completion:', error);
    }
  };
  
  // Delete action item
  const handleDeleteAction = async (actionItemId) => {
    try {
      console.log('[SponsorContactDetailsPage] Deleting action item with ID:', actionItemId);
      
      const success = await sponsorDB.deleteContactDetail(actionItemId);
      console.log('[SponsorContactDetailsPage] Delete result:', success);
      
      if (success) {
        setActionItems(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const filtered = prevArray.filter(item => item && item.id !== actionItemId);
          console.log('[SponsorContactDetailsPage] Updated action items after delete:', filtered);
          return filtered;
        });
      }
    } catch (error) {
      console.error('[SponsorContactDetailsPage] Error deleting action item:', error);
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
          
          {/* Contact Details */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                mb: 0.5
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
            
            {contact.note && (
              <Box sx={{ mt: 1.5 }}>
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
      
      {/* Action Items Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
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
            onClick={() => setShowAddActionForm(true)}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Add Action
          </Button>
        </Box>
        
        {/* Add Action Form */}
        {showAddActionForm && (
          <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <TextField
              fullWidth
              label="Action Item"
              name="actionItem"
              value={newAction.actionItem}
              onChange={handleActionChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={newAction.notes}
              onChange={handleActionChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Due Date"
              name="dueDate"
              type="date"
              value={newAction.dueDate}
              onChange={handleActionChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="completed"
                  checked={newAction.completed}
                  onChange={handleActionChange}
                />
              }
              label="Completed"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={handleAddAction}>
                Save
              </Button>
              <Button variant="outlined" onClick={() => setShowAddActionForm(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Action Items List */}
        {actionItems.length > 0 ? (
          <List sx={{ p: 0 }}>
            {actionItems.map((item, index) => (
              <ListItem
                key={item.id || index}
                sx={{
                  p: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: item.completed ? 'action.hover' : 'background.paper'
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'text.secondary' : 'text.primary',
                          fontWeight: item.completed ? 'normal' : 'medium'
                        }}
                      >
                        {item.actionItem || item.text || 'Untitled Action'}
                      </Typography>
                      {item.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.notes}
                        </Typography>
                      )}
                      {item.dueDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Due: {formatDateForDisplay(item.dueDate)}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleComplete(item)}
                        sx={{ color: item.completed ? 'success.main' : 'text.secondary' }}
                      >
                        <i className={`fa-solid ${item.completed ? 'fa-check-circle' : 'fa-circle'}`}></i>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAction(item.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No action items yet. Add one to get started!
          </Typography>
        )}
      </Paper>
      
      {/* Delete Contact Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<i className="fa-solid fa-trash"></i>}
          onClick={() => setShowDeleteConfirm(true)}
          sx={{ textTransform: 'none' }}
        >
          Delete Contact
        </Button>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this contact? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              onDeleteContact(contact.id);
              setShowDeleteConfirm(false);
              onBack();
            }} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}