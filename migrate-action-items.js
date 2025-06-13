/**
 * Migration script to consolidate action items into one table
 * Moves all action items from sponsor_contact_details to main action_items table
 */

import { getSQLite } from './src/utils/sqliteLoader.js';

const DB_NAME = 'spiritual_condition_tracker.db';

async function migrateActionItems() {
  try {
    console.log('Starting action items migration...');
    
    const sqlite = getSQLite();
    
    // Get all action items from sponsor_contact_details table
    const oldActionItems = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT * FROM sponsor_contact_details WHERE type = ? OR actionItem IS NOT NULL',
      values: ['todo']
    });
    
    console.log('Found old action items:', oldActionItems.values?.length || 0);
    
    if (!oldActionItems.values || oldActionItems.values.length === 0) {
      console.log('No action items to migrate');
      return;
    }
    
    // Process each old action item
    for (const item of oldActionItems.values) {
      try {
        // Handle iOS format if needed
        const actionItemData = item.ios_columns ? oldActionItems.values[oldActionItems.values.indexOf(item) + 1] : item;
        
        if (!actionItemData.actionItem) {
          console.log('Skipping item without actionItem text:', actionItemData.id);
          continue;
        }
        
        // Insert into main action_items table
        const insertResult = await sqlite.execute({
          database: DB_NAME,
          statements: 'INSERT INTO action_items (title, text, notes, dueDate, completed, deleted, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          values: [
            actionItemData.actionItem, // title
            actionItemData.text || actionItemData.actionItem, // text
            actionItemData.notes || '', // notes
            actionItemData.dueDate, // dueDate
            actionItemData.completed || 0, // completed
            actionItemData.deleted || 0, // deleted
            'action-item', // type
            actionItemData.createdAt || new Date().toISOString(), // createdAt
            actionItemData.updatedAt || new Date().toISOString() // updatedAt
          ]
        });
        
        console.log('Migrated action item:', actionItemData.actionItem, 'to ID:', insertResult.changes?.lastId);
        
      } catch (itemError) {
        console.error('Error migrating individual item:', itemError);
      }
    }
    
    console.log('Migration completed successfully');
    
    // Verify migration
    const newActionItems = await sqlite.query({
      database: DB_NAME,
      statement: 'SELECT COUNT(*) as count FROM action_items'
    });
    
    console.log('Total action items in main table after migration:', newActionItems.values?.[0]?.count || 0);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateActionItems();