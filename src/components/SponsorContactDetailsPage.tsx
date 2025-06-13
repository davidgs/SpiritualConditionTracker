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
import ActionItem from './shared/ActionItem';
import { useAppData } from '../contexts/AppDataContext';

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
  const { updateActionItem } = useAppData();
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
        completed: newAction.completed ? 1 as const : 0 as const,
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
  
  // Toggle action item completion using shared AppDataContext method
  const handleToggleComplete = async (actionItemId) => {
    try {
      console.log('[SponsorContactDetailsPage] Toggling completion for action item ID:', actionItemId);
      
      // Find the item in the current state
      const currentItem = actionItems.find(item => item.id === actionItemId);
      if (!currentItem) {
        console.error('[SponsorContactDetailsPage] Action item not found:', actionItemId);
        return;
      }
      
      // Use the shared AppDataContext method to ensure synchronization
      const newCompletedStatus = currentItem.completed ? 0 : 1;
      const updatedItem = await updateActionItem(actionItemId, {
        completed: newCompletedStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[SponsorContactDetailsPage] Updated item via AppDataContext:', updatedItem);
      
      if (updatedItem) {
        // Update local state to reflect the change immediately
        setActionItems(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const updated = prevArray.map(item => 
            item && item.id === actionItemId ? { ...item, completed: newCompletedStatus } : item
          );
          console.log('[SponsorContactDetailsPage] Updated local action items list:', updated);
          return updated;
        });
        
        // Also update the sponsor contact detail in the local database for consistency
        try {
          const updatedContactDetail = {
            ...currentItem,
            completed: newCompletedStatus
          };
          await sponsorDB.updateContactDetail(updatedContactDetail);
        } catch (contactDetailError) {
          console.warn('[SponsorContactDetailsPage] Failed to update contact detail, but action item was updated:', contactDetailError);
        }
      }
    } catch (error) {
      console.error('[SponsorContactDetailsPage] Error toggling completion:', error);
    }
  };
  
  // Soft delete action item using shared AppDataContext method
  const handleDeleteAction = async (actionItemId) => {
    try {
      console.log('[SponsorContactDetailsPage] Soft deleting action item with ID:', actionItemId);
      
      // Find the item in the current state
      const currentItem = actionItems.find(item => item.id === actionItemId);
      if (!currentItem) {
        console.error('[SponsorContactDetailsPage] Action item not found:', actionItemId);
        return;
      }
      
      // Use the shared AppDataContext method to ensure synchronization
      const newDeletedStatus = currentItem.deleted ? 0 : 1;
      const updatedItem = await updateActionItem(actionItemId, {
        deleted: newDeletedStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[SponsorContactDetailsPage] Soft deleted item via AppDataContext:', updatedItem);
      
      if (updatedItem) {
        // Update local state to reflect the change immediately
        setActionItems(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const updated = prevArray.map(item => 
            item && item.id === actionItemId ? { ...item, deleted: newDeletedStatus } : item
          );
          console.log('[SponsorContactDetailsPage] Updated local action items after soft delete:', updated);
          return updated;
        });
        
        // Also update the sponsor contact detail in the local database for consistency
        try {
          const updatedContactDetail = {
            ...currentItem,
            deleted: newDeletedStatus
          };
          await sponsorDB.updateContactDetail(updatedContactDetail);
        } catch (contactDetailError) {
          console.warn('[SponsorContactDetailsPage] Failed to update contact detail, but action item was updated:', contactDetailError);
        }
      }
    } catch (error) {
      console.error('[SponsorContactDetailsPage] Error soft deleting action item:', error);
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
        
        {/* Add Action Form - Compact Style */}
        {showAddActionForm && (
          <Box sx={{ 
            mb: 2, 
            p: 1.5, 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 1,
            backgroundColor: theme.palette.background.paper
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                label="What needs to be done"
                name="actionItem"
                value={newAction.actionItem}
                onChange={handleActionChange}
                size="small"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Notes (optional)"
                name="notes"
                value={newAction.notes}
                onChange={handleActionChange}
                size="small"
                variant="outlined"
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button 
                  variant="contained" 
                  onClick={handleAddAction}
                  size="small"
                  disabled={!newAction.actionItem.trim()}
                >
                  Add
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowAddActionForm(false)}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Action Items List */}
        {actionItems.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {actionItems.map((item, index) => (
              <ActionItem
                key={item.id || index}
                actionItem={{
                  id: item.id,
                  title: item.title || item.actionItem || item.text || 'Untitled Action',
                  notes: item.notes,
                  completed: item.completed,
                  deleted: item.deleted,
                  dueDate: item.dueDate,
                  createdAt: item.createdAt
                }}
                variant="compact"
                showDate={false}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteAction}
              />
            ))}
          </Box>
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