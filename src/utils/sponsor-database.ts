/**
 * Specialized database module for sponsor-related operations
 * Updated to use the new DatabaseService architecture
 */

import DatabaseService from '../services/DatabaseService';
import { SponsorContact, ActionItem, ContactDetail } from '../types/database';

/**
 * Get all sponsor contacts for a user using DatabaseService
 */
export async function getSponsorContacts(userId: string): Promise<SponsorContact[]> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsor-database ] Querying sponsor contacts with userId:', userId);
    
    // Use DatabaseService to get all sponsor contacts
    const allContacts = await databaseService.getAll<SponsorContact>('sponsor_contacts');
    
    // Filter by userId if provided (ensure both are strings for comparison)
    const userContacts = allContacts;
      // .filter(contact => String(contact.userId) === String(userId));
    
    console.log(`[ sponsor-database ] Found ${userContacts.length} sponsor contacts for user ${userId}`);
    return userContacts;
  } catch (error) {
    console.error('[ sponsor-database ] Error getting sponsor contacts:', error);
    return [];
  }
}

/**
 * Add a new sponsor contact
 */
export async function addSponsorContact(contactData: Omit<SponsorContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<SponsorContact> {
  try {
    const databaseService = DatabaseService.getInstance();
    
    console.log('[ sponsor-database ] Adding sponsor contact:', contactData);
    
    const savedContact = await databaseService.add<SponsorContact>('sponsor_contacts', contactData);
    
    console.log('[ sponsor-database ] Sponsor contact saved with ID:', savedContact.id);
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
    
    console.log('[ sponsor-database ] Getting contact details for contactId:', contactId);
    
    const allDetails = await databaseService.getAll<ContactDetail>('contact_details');
    const contactDetails = allDetails.filter(detail => detail.contactId === contactId);
    
    console.log(`[ sponsor-database ] Found ${contactDetails.length} contact details`);
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
    
    console.log('[ sponsor-database ] Adding contact detail:', detailData);
    
    const savedDetail = await databaseService.add<ContactDetail>('contact_details', detailData);
    
    console.log('[ sponsor-database ] Contact detail saved with ID:', savedDetail.id);
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
    
    const savedItem = await databaseService.add<ActionItem>('action_items', itemData);
    
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
    
    console.log('[ sponsor-database ] Updating contact detail:', detailData.id);
    
    const { id, ...updateData } = detailData;
    const updatedDetail = await databaseService.update<ContactDetail>('contact_details', id, updateData);
    
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
    
    console.log('[ sponsor-database ] Deleting sponsor contact:', contactId);
    
    // First delete associated contact details
    const details = await getContactDetails(contactId);
    for (const detail of details) {
      await databaseService.remove('contact_details', detail.id);
    }
    
    // Then delete the contact itself
    const success = await databaseService.remove('sponsor_contacts', contactId);
    
    console.log('[ sponsor-database ] Sponsor contact deleted:', success);
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
    
    console.log('[ sponsor-database ] Deleting contact detail:', detailId);
    
    const success = await databaseService.remove('contact_details', detailId);
    
    console.log('[ sponsor-database ] Contact detail deleted:', success);
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
  deleteContactDetail
};

export default sponsorDB;