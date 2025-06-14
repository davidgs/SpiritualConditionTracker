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

  // Simple query: Get action items for this contact from global state
  useEffect(() => {
    console.log(`[ActionItemsList] Loading action items for contact ${contactId}, type: ${personType}`);
    
    // Filter action items from the centralized state
    const filteredItems = state.actionItems?.filter(item => {
      // Exclude deleted items first
      if (item.deleted === 1) return false;
      
      // Check contact association based on person type
      if (personType === 'sponsor' && item.sponsorContactId === contactId) {
        return true;
      }
      if (personType === 'sponsee' && item.sponseeContactId === contactId) {
        return true;
      }
      // Legacy support for old contactId field
      if (item.contactId === contactId) {
        return true;
      }
      
      return false;
    }) || [];
    
    console.log(`[ActionItemsList] Found ${filteredItems.length} action items for contact ${contactId}`);
    setActionItems(filteredItems);
    
  }, [contactId, refreshKey, personType, state.actionItems]);

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