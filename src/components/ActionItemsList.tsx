import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  IconButton
} from '@mui/material';
import DatabaseService from '../services/DatabaseService';

interface ActionItem {
  id: number;
  title: string;
  text?: string;
  notes?: string;
  completed: number;
  contactId: number;
  dueDate?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

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
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Load action items for this contact
  useEffect(() => {
    const loadActionItems = async () => {
      if (contactId) {
        try {
          const databaseService = DatabaseService.getInstance();
          const allActionItems = await databaseService.getAll('action_items');
          const actionItemsArray = Array.isArray(allActionItems) ? allActionItems : [];
          const contactActionItems = actionItemsArray.filter(item => 
            item && (item.contactId === contactId || item.sponsorContactId === contactId)
          );
          setActionItems(contactActionItems);
        } catch (error) {
          console.error('Error loading action items for contact:', error);
          setActionItems([]);
        }
      }
    };
    loadActionItems();
  }, [contactId, refreshKey]);

  // Toggle action item completion
  const handleToggle = async (actionItemId: number) => {
    try {
      const databaseService = DatabaseService.getInstance();
      
      const allActionItems = await databaseService.getAll('action_items');
      const actionItem = allActionItems.find(item => item.id === actionItemId);
      
      if (!actionItem) {
        console.error('Action item not found for ID:', actionItemId);
        return;
      }
      
      const updatedActionItem = {
        ...actionItem,
        completed: actionItem.completed === 1 ? 0 : 1,
        updatedAt: new Date().toISOString()
      };
      
      await databaseService.update('action_items', actionItemId, updatedActionItem);
      
      // Update local state immediately for responsive UI
      setActionItems(prev => 
        prev.map(item => 
          item.id === actionItemId 
            ? { ...item, completed: updatedActionItem.completed }
            : item
        )
      );
      
    } catch (error) {
      console.error('Error toggling action item:', error);
    }
  };

  // Delete action item
  const handleDelete = async (actionItemId: number) => {
    try {
      const databaseService = DatabaseService.getInstance();
      await databaseService.remove('action_items', actionItemId);
      
      // Update local state immediately
      setActionItems(prev => prev.filter(item => item.id !== actionItemId));
      
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