/**
 * Specialized database module for sponsor-related operations
 * Updated to use the new DatabaseService architecture
 */

import DatabaseService from '../services/DatabaseService';
import { SponsorContact, ActionItem, ContactDetail } from '../types/database';
import { associateActionItemWithContact } from './action-items';

/**
 * Get all sponsor contacts (single user app)
 */
export async function getSponsorContacts(): Promise<SponsorContact[]> {
  try {
    const databaseService = DatabaseService.getInstance();
    
  //  console.log('[ sponsor-database ] Querying all sponsor contacts');
    
    // Use DatabaseService to get all sponsor contacts
    const allContacts = await databaseService.getAllSponsorContacts();
    
  //  console.log('[ sponsor-database ] Raw database response:', allContacts);
  //  console.log('[ sponsor-database ] Number of total contacts in database:', allContacts.length);
    
  //  console.log(`[ sponsor-database ] Found ${allContacts.length} sponsor contacts`);
    return allContacts;
  } catch (error) {
    console.error('[ sponsor-database ] Error getting sponsor contacts:', error);
    return [];
  }
}

/**
 * Add a new sponsor contact with action items
 */
export async function addSponsorContact(contactData: Omit<SponsorContact, 'id' | 'createdAt' | 'updatedAt'>, actionItems: any[] = []): Promise<SponsorContact> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsor-database ] Adding sponsor contact:', contactData);
    console.log('[ sponsor-database ] With action items:', actionItems);
    
    const savedContact = await databaseService.addSponsorContact(contactData);
    
    console.log('[ sponsor-database ] Sponsor contact saved with ID:', savedContact.id);
    
    // Also create an activity entry so it appears in the Dashboard
    try {
      const activityData = {
        type: 'sponsor-contact' as const,
        date: contactData.date,
        notes: `${contactData.note || ''} [Contact: ${contactData.type}]`,
        location: contactData.type,
        duration: undefined
      };
      
      await databaseService.addActivity(activityData);
      console.log('[ sponsor-database ] Activity entry created for sponsor contact');
    } catch (activityError) {
      console.warn('[ sponsor-database ] Failed to create activity entry:', activityError);
      // Don't throw - the contact was still saved successfully
    }
    
    // Save action items using proper join table structure
    if (actionItems && actionItems.length > 0) {
      try {
        for (const actionItem of actionItems) {
          // Save the action item with direct relationship to contact
          const actionItemData = {
            title: actionItem.title,
            text: actionItem.text || actionItem.title,
            notes: actionItem.notes || '',
            dueDate: actionItem.dueDate || contactData.date,
            completed: (actionItem.completed ? 1 : 0) as 0 | 1,
            type: 'sponsor_action_item' as const, // Correct type for Activities List filter
            sponsorContactId: savedContact.id, // Direct relationship
            contactId: savedContact.id // Legacy field for compatibility - this is what the filter checks
          };
          
          console.log('[ sponsor-database ] Saving action item with sponsorContactId:', actionItemData);
          const savedActionItem = await databaseService.addActionItem(actionItemData);
          
          // Also create the association in the join table for backward compatibility
          console.log('[ sponsor-database ] Creating association between contact', savedContact.id, 'and action item', savedActionItem.id);
          await associateActionItemWithContact(savedContact.id, savedActionItem.id);
        }
        console.log(`[ sponsor-database ] Successfully saved ${actionItems.length} action items with proper associations`);
      } catch (actionItemError) {
        console.error('[ sponsor-database ] Error saving action items:', actionItemError);
        // Don't throw - the contact was still saved successfully
      }
    }
    
    return savedContact;
  } catch (error) {
    console.error('[ sponsor-database ] Error adding sponsor contact:', error);
    throw error;
  }
}

/**
 * Get contact details for a specific contact
 */
export async function getContactDetails(contactId: number): Promise<ContactDetail[]> {
  try {
    const databaseService = DatabaseService.getInstance();
    
  //  console.log('[ sponsor-database ] Getting contact details for contactId:', contactId);
    
    const allDetails = await databaseService.getAllContactDetails();
    const contactDetails = allDetails.filter(detail => detail.contactId === contactId);
    
  //  console.log(`[ sponsor-database ] Found ${contactDetails.length} contact details`);
    return contactDetails;
  } catch (error) {
    console.error('[ sponsor-database ] Error getting contact details:', error);
    return [];
  }
}

/**
 * Add contact detail (action item)
 */
export async function addContactDetail(detailData: Omit<ContactDetail, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactDetail> {
  try {
    const databaseService = DatabaseService.getInstance();
    
  //  console.log('[ sponsor-database ] Adding contact detail:', detailData);
    
    const savedDetail = await databaseService.addContactDetail(detailData);
    
  //  console.log('[ sponsor-database ] Contact detail saved with ID:', savedDetail.id);
    return savedDetail;
  } catch (error) {
    console.error('[ sponsor-database ] Error adding contact detail:', error);
    throw error;
  }
}

/**
 * Add action item
 */
export async function addActionItem(itemData: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>, contactId?: number): Promise<ActionItem> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsor-database ] Adding action item:', itemData);
    
    const savedItem = await databaseService.addActionItem(itemData);
    
    console.log('[ sponsor-database ] Action item saved with ID:', savedItem.id);
    return savedItem;
  } catch (error) {
    console.error('[ sponsor-database ] Error adding action item:', error);
    throw error;
  }
}

/**
 * Update contact detail
 */
export async function updateContactDetail(detailData: Partial<ContactDetail> & { id: number }): Promise<ContactDetail | null> {
  try {
    const databaseService = DatabaseService.getInstance();
    
  //  console.log('[ sponsor-database ] Updating contact detail:', detailData.id);
    
    const { id, ...updateData } = detailData;
    const updatedDetail = await databaseService.updateContactDetail(id, updateData);
    
    console.log('[ sponsor-database ] Contact detail updated');
    return updatedDetail;
  } catch (error) {
    console.error('[ sponsor-database ] Error updating contact detail:', error);
    return null;
  }
}

/**
 * Delete sponsor contact
 */
export async function deleteSponsorContact(contactId: number): Promise<boolean> {
  try {
    const databaseService = DatabaseService.getInstance();
    
  //  console.log('[ sponsor-database ] Deleting sponsor contact:', contactId);
    
    // First delete associated contact details
    const details = await getContactDetails(contactId);
    for (const detail of details) {
      await databaseService.deleteContactDetail(detail.id);
    }
    
    // Then delete the contact itself
    const success = await databaseService.deleteSponsorContact(contactId);
    
  //  console.log('[ sponsor-database ] Sponsor contact deleted:', success);
    return success;
  } catch (error) {
    console.error('[ sponsor-database ] Error deleting sponsor contact:', error);
    return false;
  }
}

/**
 * Delete contact detail
 */
export async function deleteContactDetail(detailId: number): Promise<boolean> {
  try {
    const databaseService = DatabaseService.getInstance();
    
  //  console.log('[ sponsor-database ] Deleting contact detail:', detailId);
    
    const success = await databaseService.deleteContactDetail(detailId);
    
  //  console.log('[ sponsor-database ] Contact detail deleted:', success);
    return success;
  } catch (error) {
    console.error('[ sponsor-database ] Error deleting contact detail:', error);
    return false;
  }
}

// Export as default object for compatibility
const sponsorDB = {
  getSponsorContacts,
  addSponsorContact,
  getContactDetails,
  addContactDetail,
  addActionItem,
  updateContactDetail,
  deleteSponsorContact,
  deleteContactDetail,
  getActionItemsByContactId
};

/**
 * Get action items for a specific contact using proper join table
 */
export async function getActionItemsByContactId(contactId: string | number): Promise<ActionItem[]> {
  try {
    console.log(`[ sponsor-database ] Loading action items for contact ID: ${contactId}`);
    
    // Use the existing action-items utility function that handles the join table properly
    const { getActionItemsForContact } = await import('./action-items');
    const actionItems = await getActionItemsForContact(contactId);
    
    console.log(`[ sponsor-database ] Found ${actionItems.length} action items for contact ${contactId}`);
    
    return actionItems;
  } catch (error) {
    console.error('[ sponsor-database ] Error getting action items for contact:', error);
    return [];
  }
}

export default sponsorDB;