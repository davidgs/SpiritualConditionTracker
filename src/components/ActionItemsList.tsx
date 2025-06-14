import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useAppData } from '../contexts/AppDataContext';
import { ActionItem } from '../types/database';
import ActionItemComponent from './shared/ActionItem';

interface ActionItemsListProps {
  contactId: number;
  theme: any;
  refreshKey: number;
  sponsorId?: number;
  sponseeId?: number;
  personType?: 'sponsor' | 'sponsee';
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  contactId,
  theme,
  refreshKey,
  sponsorId,
  sponseeId,
  personType
}) => {
  const { state, updateActionItem } = useAppData();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Extract action items for this contact from shared state
  useEffect(() => {
    const actionItemActivities = state.activities.filter(activity => {
      const activityType = activity.type as string;
      const isActionItemType = activityType === 'action-item' || 
                               activityType === 'sponsor_action_item' || 
                               activityType === 'sponsee_action_item';
      
      const hasActionItemData = activity.actionItemData;
      const isForThisContact = hasActionItemData && 
                               (activity.actionItemData.contactId === contactId || 
                                activity.actionItemData.sponsorContactId === contactId);
      
      // Additional filtering for sponsor/sponsee specific action items
      if (personType && hasActionItemData) {
        if (personType === 'sponsor' && sponsorId) {
          const belongsToSponsor = (activity.actionItemData as any).sponsorId === sponsorId;
          return isActionItemType && hasActionItemData && isForThisContact && belongsToSponsor;
        } else if (personType === 'sponsee' && sponseeId) {
          const belongsToSponsee = (activity.actionItemData as any).sponseeId === sponseeId;
          return isActionItemType && hasActionItemData && isForThisContact && belongsToSponsee;
        }
      }
      
      return isActionItemType && hasActionItemData && isForThisContact;
    });
    
    const contactActionItems = actionItemActivities
      .map(activity => activity.actionItemData)
      .filter(Boolean) as ActionItem[];
    
    console.log(`[ActionItemsList] ContactId ${contactId}: Found ${actionItemActivities.length} activities, ${contactActionItems.length} action items`);
    if (actionItemActivities.length > 0) {
      console.log(`[ActionItemsList] Activities for contact ${contactId}:`, actionItemActivities);
    }
    
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
        <ActionItemComponent
          key={actionItem.id}
          actionItem={actionItem}
          onToggleComplete={handleToggle}
          onDelete={handleDelete}
          variant="compact"
        />
      ))}
    </Box>
  );
};