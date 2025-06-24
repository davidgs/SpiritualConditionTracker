/**
 * Action Item Service - Strategy 1 Implementation
 * Manages relationships between activities table (activity log) and action_items table (master data)
 * 
 * Architecture:
 * - action_items table: Single source of truth for all action item master data
 * - activities table: References action items via actionItemId for activity logging
 * - Contact associations: sponsorId/sponseeId foreign keys link to specific people
 */

import { ActionItem, Activity } from '../types/database';

export interface ActionItemWithStatus extends ActionItem {
  sponsorName?: string;
  sponseeName?: string;
}

export class ActionItemService {
  /**
   * Get all action items from activities that reference the master action_items table
   */
  static getActionItemsFromActivities(activities: Activity[], contactId?: number, sponsorId?: number, sponseeId?: number): ActionItemWithStatus[] {
    // Filter activities that have action item references
    const actionItemActivities = activities.filter(activity => {
      const activityType = activity.type as string;
      const isActionItemType = activityType === 'action-item' || 
                               activityType === 'sponsor_action_item' || 
                               activityType === 'sponsee_action_item';
      
      const hasActionItemData = activity.actionItemData;
      
      if (!isActionItemType || !hasActionItemData) return false;
      
      // Filter by contact if specified
      if (contactId && activity.actionItemData.contactId !== contactId) return false;
      
      // Filter by sponsor/sponsee if specified
      if (sponsorId && (activity.actionItemData as any).sponsorId !== sponsorId) return false;
      if (sponseeId && (activity.actionItemData as any).sponseeId !== sponseeId) return false;
      
      // Exclude deleted items
      if (activity.actionItemData.deleted === 1) return false;
      
      return true;
    });
    
    // Extract unique action items (activities may reference same action item multiple times)
    const uniqueActionItems = new Map<number, ActionItemWithStatus>();
    
    actionItemActivities.forEach(activity => {
      if (activity.actionItemData && !uniqueActionItems.has(activity.actionItemData.id)) {
        uniqueActionItems.set(activity.actionItemData.id, activity.actionItemData as ActionItemWithStatus);
      }
    });
    
    return Array.from(uniqueActionItems.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  /**
   * Create activity record that references an action item from master table
   */
  static createActionItemActivity(actionItemId: number, userId: string | number, activityType: 'action-item' | 'sponsor_action_item' | 'sponsee_action_item' = 'action-item'): Partial<Activity> {
    return {
      userId: userId.toString(),
      type: activityType as any,
      date: new Date().toISOString().split('T')[0],
      actionItemId,
      notes: `Action item reference created`,
      duration: 0
    };
  }

  /**
   * Filter action items by completion status
   */
  static filterByStatus(actionItems: ActionItemWithStatus[], completed?: boolean): ActionItemWithStatus[] {
    if (completed === undefined) return actionItems;
    
    return actionItems.filter(item => 
      completed ? item.completed === 1 : item.completed === 0
    );
  }

  /**
   * Get action items for spiritual fitness calculation
   */
  static getActionItemsForSpiritualFitness(activities: Activity[], timeframeDays: number): ActionItemWithStatus[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
    
    return this.getActionItemsFromActivities(activities).filter(item => {
      const itemDate = new Date(item.createdAt || 0);
      return itemDate >= cutoffDate;
    });
  }
}

export const actionItemService = ActionItemService;