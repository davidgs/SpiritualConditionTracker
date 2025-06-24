import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton
} from '@mui/material';
import { useAppData } from '../contexts/AppDataContext';
import { formatDateForDisplay } from '../utils/formatDate';
import { ActionItem } from './shared/ActionItem';
import { ActionItemsList } from './ActionItemsList';

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
  const { updateActionItem, addActionItem, addActivity, loadActivities, state } = useAppData();
  const [contactDetails, setContactDetails] = useState(details);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // State for edited contact
  const [editedContact, setEditedContact] = useState(contact);
  const [isEditing, setIsEditing] = useState(false);
  
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
        // Force refresh of activities to get latest action items
        await loadActivities();
      } catch (error) {
        console.error('[SponsorContactDetailsPage] Error refreshing activities:', error);
      }
    }
    
    loadActionItems();
  }, [contact, details, loadActivities]);

  // Toggle action item completion using shared AppDataContext
  const handleToggleComplete = async (actionItemId) => {
    try {
      console.log('[SponsorContactDetailsPage] Toggling completion for action item ID:', actionItemId);
      
      // Get current action item from activities
      const actionItemActivity = state.activities.find(activity => 
        activity.type === 'action-item' && 
        activity.actionItemData && 
        Number(activity.actionItemData.id) === Number(actionItemId)
      );
      
      if (!actionItemActivity?.actionItemData) {
        console.error('[SponsorContactDetailsPage] Action item not found in activities:', actionItemId);
        return;
      }
      
      const currentItem = actionItemActivity.actionItemData;
      const newCompletedStatus = currentItem.completed === 1 ? 0 : 1;
      
      // Use the shared AppDataContext method to ensure synchronization
      const updatedItem = await updateActionItem(actionItemId, {
        completed: newCompletedStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[SponsorContactDetailsPage] Toggled completion via AppDataContext:', updatedItem);
      
      // No need for manual refresh - AppDataContext handles this automatically
    } catch (error) {
      console.error('[SponsorContactDetailsPage] Error toggling action item:', error);
    }
  };
  
  // Soft delete action item using shared AppDataContext method
  const handleDeleteAction = async (actionItemId) => {
    try {
      console.log('[SponsorContactDetailsPage] Soft deleting action item with ID:', actionItemId);
      
      // Get current action item from activities
      const actionItemActivity = state.activities.find(activity => 
        activity.type === 'action-item' && 
        activity.actionItemData && 
        Number(activity.actionItemData.id) === Number(actionItemId)
      );
      
      if (!actionItemActivity?.actionItemData) {
        console.error('[SponsorContactDetailsPage] Action item not found in activities:', actionItemId);
        return;
      }
      
      const currentItem = actionItemActivity.actionItemData;
      const newDeletedStatus = currentItem.deleted ? 0 : 1;
      
      // Use the shared AppDataContext method to ensure synchronization
      const updatedItem = await updateActionItem(actionItemId, {
        deleted: newDeletedStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log('[SponsorContactDetailsPage] Soft deleted item via AppDataContext:', updatedItem);
      
      // No need for manual refresh - AppDataContext UPDATE_ACTIVITY handles this automatically
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
      'phone': 'fa-solid fa-phone',
      'in-person': 'fa-solid fa-user-group',
      'video': 'fa-solid fa-video',
      'text': 'fa-solid fa-comment',
      'email': 'fa-solid fa-envelope',
      'other': 'fa-solid fa-comment-dots'
    };
    return typeIcons[type] || 'fa-solid fa-comment-dots';
  };

  if (!contact) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Contact not found</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Back to Contacts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={onBack}
          sx={{
            mr: 2,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '20',
            }
          }}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }}>
          Contact Details
        </Typography>
      </Box>

      {/* Contact History */}
      {contactDetails && contactDetails.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Contact History ({contactDetails.length})
          </Typography>
          
          {contactDetails.map((detail, index) => (
            <Paper
              key={detail.id || index}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className={getContactTypeIcon(detail.type)} style={{ 
                    color: theme.palette.primary.main,
                    fontSize: '1.1rem'
                  }}></i>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {getContactTypeLabel(detail.type)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {formatDateForDisplay(detail.date)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteDetail(detail.id)}
                    sx={{ 
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.error.main,
                        backgroundColor: theme.palette.error.light + '20',
                      }
                    }}
                  >
                    <i className="fa-solid fa-pencil text-xs"></i>
                  </IconButton>
                </Box>
              </Box>
              
              {detail.topic && (
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Topic: {detail.topic}
                </Typography>
              )}
              
              {detail.duration && (
                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Duration: {detail.duration} minutes
                </Typography>
              )}
              
              {detail.note && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {detail.note}
                  </Typography>
                </Box>
              )}

              {/* Action Items within contact card - using ActionItemsList */}
              <ActionItemsList 
                contactId={detail.id} 
                theme={theme}
                refreshKey={state.activities.length}
              />
            </Paper>
          ))}
        </Box>
      )}

      {/* Contact Information */}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {contact.name} {contact.lastName}
            </Typography>
            
            {contact.phoneNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <i className="fa-solid fa-phone" style={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.9rem'
                }}></i>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {contact.phoneNumber}
                </Typography>
              </Box>
            )}
            
            {contact.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <i className="fa-solid fa-envelope" style={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.9rem'
                }}></i>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {contact.email}
                </Typography>
              </Box>
            )}
            
            {contact.sobrietyDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <i className="fa-solid fa-calendar" style={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.9rem'
                }}></i>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Sobriety Date: {formatDateForDisplay(contact.sobrietyDate)}
                </Typography>
              </Box>
            )}
            
            {contact.note && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Notes:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {contact.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
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