import { useCallback } from 'react';
import DatabaseService from '../services/DatabaseService';

interface UsePersonDeleteProps {
  personType: 'sponsor' | 'sponsee';
  onSuccess: () => void;
}

export const usePersonDelete = ({ personType, onSuccess }: UsePersonDeleteProps) => {
  const databaseService = DatabaseService.getInstance();

  const deletePerson = useCallback(async (personId: string | number) => {
    if (!personId) {
      console.error(`No ${personType} ID provided for deletion`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${personType}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Determine the correct contact table based on person type
      const contactTable = personType === 'sponsor' ? 'sponsor_contacts' : 'sponsee_contacts';
      const personTable = personType === 'sponsor' ? 'sponsors' : 'sponsees';
      const foreignKey = personType === 'sponsor' ? 'sponsorId' : 'sponseeId';

      // Delete related contacts first
      const contacts = await databaseService.getAll(contactTable);
      const relatedContacts = contacts.filter(c => c[foreignKey] === personId);
      
      for (const contact of relatedContacts) {
        await databaseService.remove(contactTable, contact.id);
      }
      
      // Delete the person
      await databaseService.remove(personTable, personId);
      
      // Call success callback to refresh data
      onSuccess();
      
    } catch (error) {
      console.error(`Failed to delete ${personType}:`, error);
      alert(`Failed to delete ${personType}`);
    }
  }, [personType, onSuccess, databaseService]);

  return { deletePerson };
};