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
import DatabaseService from '../services/DatabaseService';

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
  const { updateActionItem, addActivity } = useAppData();
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
        
        const databaseServiceInstance = DatabaseService.getInstance();
        
        // First, check if we need to migrate old action items from sponsor_contact_details
        await migrateOldActionItems(databaseServiceInstance);
        
        // Load action items from the main action_items table using DatabaseService
        const allActionItems = await databaseServiceInstance.getAll('action_items');
        
        // Filter to show only action items related to this contact (we'll use notes or title to match)
        // For now, load all action items since we're consolidating to one table
        const actionItemsList = allActionItems || [];
        console.log(`[SponsorContactDetailsPage] Found ${actionItemsList.length} total action items`);
        
        setActionItems(actionItemsList);
      } catch (error) {
        console.error('[SponsorContactDetailsPage] Error loading action items:', error);
        setActionItems([]);
      }
    }
    
    async function migrateOldActionItems(databaseServiceInstance) {
      try {
        // Check if we have any action items in the main table already
        const existingActionItems = await databaseServiceInstance.getAll('action_items');
        if (existingActionItems && existingActionItems.length > 0) {
          console.log('[SponsorContactDetailsPage] Migration already completed, found existing action items');
          return;
        }
        
        // Get old action items from sponsor_contact_details
        const oldActionItems = await databaseServiceInstance.getAll('sponsor_contact_details');
        console.log('[SponsorContactDetailsPage] Found old contact details for migration:', oldActionItems?.length || 0);
        
        if (!oldActionItems || oldActionItems.length === 0) {
          return;
        }
        
        // Migrate each old action item to the main table
        for (const oldItem of oldActionItems) {
          if (oldItem.actionItem) {
            const newActionItem = {
              title: oldItem.actionItem,
              text: oldItem.text || oldItem.actionItem,
              notes: oldItem.notes || '',
              dueDate: oldItem.dueDate || null,
              completed: oldItem.completed || 0,
              deleted: oldItem.deleted || 0,
              type: 'action-item',
              createdAt: oldItem.createdAt || new Date().toISOString(),
              updatedAt: oldItem.updatedAt || new Date().toISOString()
            };
            
            console.log('[SponsorContactDetailsPage] Migrating action item:', newActionItem.title);
            await databaseServiceInstance.add('action_items', newActionItem);
          }
        }
        
        console.log('[SponsorContactDetailsPage] Migration completed');
      } catch (migrationError) {
        console.error('[SponsorContactDetailsPage] Migration error:', migrationError);
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
  
  // Add new action item to main action_items table only
  const handleAddAction = async () => {
    try {
      console.log('[SponsorContactDetailsPage] Adding new action item:', newAction);
      
      // Create the action item in the main action_items table only
      const databaseServiceInstance = DatabaseService.getInstance();
      const mainActionItem = {
        title: newAction.actionItem,
        text: newAction.actionItem,
        notes: newAction.notes || '',
        dueDate: newAction.dueDate || null,
        completed: newAction.completed ? 1 : 0,
        deleted: 0,
        type: 'action-item',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('[SponsorContactDetailsPage] Creating in main action_items table:', mainActionItem);
      const savedMainItem = await databaseServiceInstance.add('action_items', mainActionItem);
      console.log('[SponsorContactDetailsPage] Saved main item:', savedMainItem);
      
      // Refresh the action items list to show the new item
      const allActionItems = await databaseServiceInstance.getAll('action_items');
      setActionItems(allActionItems || []);
      
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
        // Refresh the action items list from the main database
        const databaseServiceInstance = DatabaseService.getInstance();
        const allActionItems = await databaseServiceInstance.getAll('action_items');
        setActionItems(allActionItems || []);
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
        // Refresh the action items list from the main database
        const databaseServiceInstance = DatabaseService.getInstance();
        const allActionItems = await databaseServiceInstance.getAll('action_items');
        setActionItems(allActionItems || []);
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