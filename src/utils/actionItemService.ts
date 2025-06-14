/**
 * Action Item Service - Strategy 1 Implementation
 * Manages relationships between activities table (activity log) and action_items table (master data)
 */

import databaseService from '../services/DatabaseService';

export interface ActionItemWithStatus {
  id: number;
  title: string;
  text: string;
  notes: string;
  dueDate: string;
  completed: 0 | 1;
  deleted: 0 | 1;
  type: string;
  contactId: number;
  sponsorId?: number;
  sponsorName?: string;
  sponseeId?: number;
  sponseeName?: string;
  createdAt: string;
  updatedAt: string;
}

export class ActionItemService {
  /**
   * Get action items for a specific contact with current status from master table
   */
  async getActionItemsForContact(contactId: number, sponsorId?: number, sponseeId?: number): Promise<ActionItemWithStatus[]> {
    try {
      // Query action_items table directly for master data
      const allActionItems = await databaseService.getAll('action_items');
      
      return allActionItems.filter(item => {
        // Filter by contact ID
        if (item.contactId !== contactId) return false;
        
        // Filter by sponsor/sponsee if specified
        if (sponsorId && item.sponsorId !== sponsorId) return false;
        if (sponseeId && item.sponseeId !== sponseeId) return false;
        
        // Exclude deleted items
        if (item.deleted === 1) return false;
        
        return true;
      });
    } catch (error) {
      console.error('[ActionItemService] Error getting action items for contact:', error);
      return [];
    }
  }

  /**
   * Update action item status in master table
   */
  async updateActionItemStatus(actionItemId: number, updates: { completed?: 0 | 1; deleted?: 0 | 1 }): Promise<boolean> {
    try {
      await databaseService.update('action_items', actionItemId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`[ActionItemService] Updated action item ${actionItemId} status:`, updates);
      return true;
    } catch (error) {
      console.error('[ActionItemService] Error updating action item status:', error);
      return false;
    }
  }

  /**
   * Get action item details by ID from master table
   */
  async getActionItemById(actionItemId: number): Promise<ActionItemWithStatus | null> {
    try {
      const actionItem = await databaseService.getById('action_items', actionItemId);
      return actionItem as ActionItemWithStatus | null;
    } catch (error) {
      console.error('[ActionItemService] Error getting action item by ID:', error);
      return null;
    }
  }

  /**
   * Get activities that reference action items (for Activity Log display)
   */
  async getActionItemActivities(userId: string): Promise<any[]> {
    try {
      const activities = await databaseService.getAll('activities');
      
      // Filter for action item activities for this user
      const actionItemActivities = activities.filter(activity => 
        activity.userId === userId && 
        activity.actionItemId && 
        (activity.type === 'sponsor_action_item')
      );

      // Enrich with action item data from master table
      const enrichedActivities = await Promise.all(
        actionItemActivities.map(async (activity) => {
          const actionItem = await this.getActionItemById(activity.actionItemId);
          return {
            ...activity,
            actionItemData: actionItem
          };
        })
      );

      return enrichedActivities.filter(activity => activity.actionItemData !== null);
    } catch (error) {
      console.error('[ActionItemService] Error getting action item activities:', error);
      return [];
    }
  }

  /**
   * Delete action item (soft delete in master table)
   */
  async deleteActionItem(actionItemId: number): Promise<boolean> {
    try {
      await this.updateActionItemStatus(actionItemId, { deleted: 1 });
      console.log(`[ActionItemService] Soft deleted action item ${actionItemId}`);
      return true;
    } catch (error) {
      console.error('[ActionItemService] Error deleting action item:', error);
      return false;
    }
  }
}

export const actionItemService = new ActionItemService();