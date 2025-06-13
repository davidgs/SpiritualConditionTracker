import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  IconButton
} from '@mui/material';
import { useAppData } from '../contexts/AppDataContext';
import { ActionItem } from '../types/database';

interface ActionItemsListProps {
  contactId: number;
  theme: any;
  refreshKey: number;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  contactId,
  theme,
  refreshKey
}) => {
  const { state, updateActionItem } = useAppData();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Extract action items for this contact from shared state
  useEffect(() => {
    const actionItemActivities = state.activities.filter(activity => 
      activity.type === 'action-item' && 
      activity.actionItemData &&
      (activity.actionItemData.contactId === contactId || activity.actionItemData.sponsorContactId === contactId)
    );
    
    const contactActionItems = actionItemActivities
      .map(activity => activity.actionItemData)
      .filter(Boolean) as ActionItem[];
    
    setActionItems(contactActionItems);
  }, [contactId, state.activities, refreshKey]);

  // Toggle action item completion using shared AppDataContext
  const handleToggle = async (actionItemId: number) => {
    try {
      const actionItem = actionItems.find(item => item.id === actionItemId);
      if (!actionItem) {
        console.error('Action item not found for ID:', actionItemId);
        return;
      }
      
      const updates = {
        completed: (actionItem.completed === 1 ? 0 : 1) as 0 | 1,
        updatedAt: new Date().toISOString()
      };
      
      // Use AppDataContext update function for consistency
      await updateActionItem(actionItemId, updates);
      
    } catch (error) {
      console.error('Error toggling action item:', error);
    }
  };

  // Delete action item using shared AppDataContext
  const handleDelete = async (actionItemId: number) => {
    try {
      // Mark as deleted instead of removing
      await updateActionItem(actionItemId, { 
        deleted: 1,
        updatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error deleting action item:', error);
    }
  };

  if (!actionItems || actionItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
        Action Items
      </Typography>
      
      {actionItems.map((actionItem) => (
        <Box 
          key={actionItem.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 0.5,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            flex: 1 
          }}>
            <Checkbox
              checked={actionItem.completed === 1}
              onChange={(e) => {
                e.stopPropagation();
                handleToggle(actionItem.id);
              }}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&.Mui-checked': {
                  color: theme.palette.success.main,
                }
              }}
            />
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: actionItem.completed === 1 ? theme.palette.success.main : theme.palette.text.primary,
                fontWeight: actionItem.completed === 1 ? 500 : 400
              }}
            >
              {actionItem.title}
            </Typography>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(actionItem.id);
            }}
            sx={{ 
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.light + '20',
              }
            }}
          >
            <i className="fa-solid fa-times text-xs"></i>
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};