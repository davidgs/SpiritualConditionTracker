import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import { useAppData } from '../contexts/AppDataContext';
import { ActionItem } from '../types/database';
import ActionItemComponent from './shared/ActionItem';
import { ActionItemService, ActionItemWithStatus } from '../utils/actionItemService';

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
  const [actionItems, setActionItems] = useState<ActionItemWithStatus[]>([]);

  // Strategy 1: Use ActionItemService to get action items from activities that reference master action_items table
  useEffect(() => {
    console.log(`[ActionItemsList] Loading action items for contact ${contactId}, sponsor: ${sponsorId}, sponsee: ${sponseeId}`);
    
    // Use ActionItemService to filter and extract action items for this contact
    const contactActionItems = ActionItemService.getActionItemsFromActivities(
      state.activities,
      contactId,
      sponsorId,
      sponseeId
    );
    
    console.log(`[ActionItemsList] Found ${contactActionItems.length} action items for contact ${contactId}`);
    setActionItems(contactActionItems);
    
  }, [contactId, refreshKey, sponsorId, sponseeId, personType, state.activities]);

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
      
      // Reload action items to reflect changes
      const updatedItems = actionItems.map(item => 
        item.id === actionItemId ? { ...item, ...updates } : item
      );
      setActionItems(updatedItems);
      
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
      
      // Remove from local state
      setActionItems(actionItems.filter(item => item.id !== actionItemId));
      
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