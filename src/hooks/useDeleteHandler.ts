import { useCallback } from 'react';
import DatabaseService from '../services/DatabaseService';

interface DeleteHandlerConfig {
  entityType: 'sponsor' | 'sponsee';
  entityTable: string;
  contactTable: string;
  foreignKey: string;
  onSuccess: () => void;
}

export const useDeleteHandler = (config: DeleteHandlerConfig) => {
  const databaseService = DatabaseService.getInstance();

  const handleDelete = useCallback(async (id: string | number) => {
    if (!id) {
      console.error(`No ${config.entityType} ID provided for deletion`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${config.entityType}?`)) {
      return;
    }

    try {
      // Delete related contacts first
      const contacts = await databaseService.getAll(config.contactTable);
      const relatedContacts = contacts.filter(c => c[config.foreignKey] === id);
      
      for (const contact of relatedContacts) {
        await databaseService.remove(config.contactTable, contact.id);
      }
      
      // Delete the main entity
      await databaseService.remove(config.entityTable, id);
      
      // Refresh data
      config.onSuccess();
      
    } catch (error) {
      console.error(`Failed to delete ${config.entityType}:`, error);
      alert(`Failed to delete ${config.entityType}`);
    }
  }, [config, databaseService]);

  return handleDelete;
};