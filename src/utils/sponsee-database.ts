/**
 * Specialized database module for sponsee-related operations
 * Mirrors the sponsor-database functionality for sponsees
 */

import DatabaseService from '../services/DatabaseService';
import { SponsorContact, ActionItem, ContactDetail } from '../types/database';
import { associateActionItemWithContact } from './action-items';

// Define sponsee-specific interfaces
export interface SponseeContact extends Omit<SponsorContact, 'userId'> {
  sponseeId: number;
}

export interface Sponsee {
  id: number;
  userId: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sobrietyDate: string;
  notes: string;
  sponseeType: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Get all sponsees
 */
export async function getSponsees(): Promise<Sponsee[]> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Querying all sponsees');
    
    const allSponsees = await databaseService.getAll('sponsees');
    
    console.log('[ sponsee-database ] Raw database response:', allSponsees);
    console.log('[ sponsee-database ] Number of total sponsees in database:', allSponsees.length);
    
    return allSponsees as Sponsee[];
  } catch (error) {
    console.error('[ sponsee-database ] Error getting sponsees:', error);
    return [];
  }
}

/**
 * Add a new sponsee
 */
export async function addSponsee(sponseeData: Omit<Sponsee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sponsee> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Adding new sponsee:', sponseeData);
    
    const newSponsee = await databaseService.add('sponsees', {
      ...sponseeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('[ sponsee-database ] Sponsee added with ID:', newSponsee.id);
    return newSponsee as Sponsee;
  } catch (error) {
    console.error('[ sponsee-database ] Error adding sponsee:', error);
    throw error;
  }
}

/**
 * Update an existing sponsee
 */
export async function updateSponsee(sponseeId: number, updates: Partial<Sponsee>): Promise<Sponsee | null> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Updating sponsee:', sponseeId, updates);
    
    const updatedSponsee = await databaseService.update('sponsees', sponseeId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return updatedSponsee as Sponsee | null;
  } catch (error) {
    console.error('[ sponsee-database ] Error updating sponsee:', error);
    return null;
  }
}

/**
 * Delete a sponsee
 */
export async function deleteSponsee(sponseeId: number): Promise<boolean> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Deleting sponsee:', sponseeId);
    
    // Delete all related sponsee contacts first
    const allContacts = await getSponseeContacts(sponseeId);
    for (const contact of allContacts) {
      await deleteSponseeContact(contact.id);
    }
    
    const result = await databaseService.remove('sponsees', sponseeId);
    
    console.log('[ sponsee-database ] Sponsee deleted successfully');
    return result;
  } catch (error) {
    console.error('[ sponsee-database ] Error deleting sponsee:', error);
    return false;
  }
}

/**
 * Get all sponsee contacts for a specific sponsee
 */
export async function getSponseeContacts(sponseeId?: number): Promise<SponseeContact[]> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Querying sponsee contacts for sponseeId:', sponseeId);
    
    const allContacts = await databaseService.getAll('sponsee_contacts');
    
    // Filter by sponseeId if provided
    const filteredContacts = sponseeId 
      ? allContacts.filter(contact => contact.sponseeId === sponseeId)
      : allContacts;
    
    console.log(`[ sponsee-database ] Found ${filteredContacts.length} sponsee contacts`);
    return filteredContacts as SponseeContact[];
  } catch (error) {
    console.error('[ sponsee-database ] Error getting sponsee contacts:', error);
    return [];
  }
}

/**
 * Add a new sponsee contact
 */
export async function addSponseeContact(contactData: Omit<SponseeContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<SponseeContact> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Adding sponsee contact:', contactData);
    
    const contact = await databaseService.add('sponsee_contacts', {
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('[ sponsee-database ] Sponsee contact added with ID:', contact.id);
    return contact as SponseeContact;
  } catch (error) {
    console.error('[ sponsee-database ] Error adding sponsee contact:', error);
    throw error;
  }
}

/**
 * Delete a sponsee contact
 */
export async function deleteSponseeContact(contactId: number): Promise<boolean> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Deleting sponsee contact:', contactId);
    
    // Delete all related action items first
    const actionItems = await getActionItemsByContactId(contactId);
    for (const item of actionItems) {
      await databaseService.remove('action_items', item.id);
    }
    
    const result = await databaseService.remove('sponsee_contacts', contactId);
    
    console.log('[ sponsee-database ] Sponsee contact deleted successfully');
    return result;
  } catch (error) {
    console.error('[ sponsee-database ] Error deleting sponsee contact:', error);
    return false;
  }
}

/**
 * Add an action item linked to a sponsee contact
 */
export async function addActionItem(actionItemData: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>, contactId: number): Promise<ActionItem> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsee-database ] Adding action item for contact:', contactId, actionItemData);
    
    const actionItem = await databaseService.add('action_items', {
      ...actionItemData,
      contactId: contactId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('[ sponsee-database ] Action item added with ID:', actionItem.id);
    return actionItem as ActionItem;
  } catch (error) {
    console.error('[ sponsee-database ] Error adding action item:', error);
    throw error;
  }
}

/**
 * Get action items for a specific sponsee contact
 */
export async function getActionItemsByContactId(contactId: string | number): Promise<ActionItem[]> {
  try {
    console.log(`[ sponsee-database ] Loading action items for contact ID: ${contactId}`);
    
    const { getActionItemsForContact } = await import('./action-items');
    const actionItems = await getActionItemsForContact(contactId);
    
    console.log(`[ sponsee-database ] Found ${actionItems.length} action items for contact ${contactId}`);
    
    return actionItems;
  } catch (error) {
    console.error('[ sponsee-database ] Error getting action items for contact:', error);
    return [];
  }
}

/**
 * Get contact details (for backward compatibility)
 */
export async function getContactDetails(contactId: number): Promise<ContactDetail[]> {
  try {
    console.log('[ sponsee-database ] Getting contact details for:', contactId);
    
    // Convert action items to contact details format
    const actionItems = await getActionItemsByContactId(contactId);
    
    const details: ContactDetail[] = actionItems.map(item => ({
      id: item.id,
      contactId: contactId,
      actionItem: item.title,
      completed: item.completed,
      notes: item.notes || '',
      dueDate: item.dueDate,
      type: item.type,
      text: item.text || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    console.log(`[ sponsee-database ] Converted ${actionItems.length} action items to contact details`);
    return details;
  } catch (error) {
    console.error('[ sponsee-database ] Error getting contact details:', error);
    return [];
  }
}

const sponseeDB = {
  getSponsees,
  addSponsee,
  updateSponsee,
  deleteSponsee,
  getSponseeContacts,
  addSponseeContact,
  deleteSponseeContact,
  addActionItem,
  getActionItemsByContactId,
  getContactDetails
};

export default sponseeDB;