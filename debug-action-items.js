/**
 * Debug script to check action items in the database
 */

const { CapacitorSQLite } = require('@capacitor-community/sqlite');

const DB_NAME = 'spiritual_condition_tracker.db';

async function debugActionItems() {
  try {
    console.log('Starting action items debug...');
    
    // Initialize SQLite
    const sqlite = CapacitorSQLite;
    await sqlite.createConnection({ database: DB_NAME });
    await sqlite.open({ database: DB_NAME });
    
    // Get all action items
    console.log('\n1. ALL ACTION ITEMS:');
    const actionItemsResult = await sqlite.query({
      database: DB_NAME,
      statement: "SELECT * FROM action_items ORDER BY createdAt DESC",
      values: []
    });
    
    if (actionItemsResult.values && actionItemsResult.values.length > 0) {
      actionItemsResult.values.forEach((item, index) => {
        console.log(`Action Item ${index + 1}:`, {
          id: item.id,
          title: item.title,
          type: item.type,
          contactId: item.contactId,
          sponsorContactId: item.sponsorContactId,
          completed: item.completed,
          deleted: item.deleted
        });
      });
    } else {
      console.log('No action items found');
    }
    
    // Get all sponsor contacts
    console.log('\n2. ALL SPONSOR CONTACTS:');
    const sponsorContactsResult = await sqlite.query({
      database: DB_NAME,
      statement: "SELECT * FROM sponsor_contacts ORDER BY createdAt DESC",
      values: []
    });
    
    if (sponsorContactsResult.values && sponsorContactsResult.values.length > 0) {
      sponsorContactsResult.values.forEach((contact, index) => {
        console.log(`Sponsor Contact ${index + 1}:`, {
          id: contact.id,
          topic: contact.topic,
          note: contact.note,
          date: contact.date
        });
      });
    } else {
      console.log('No sponsor contacts found');
    }
    
    // Check relationships
    console.log('\n3. ACTION ITEM RELATIONSHIPS:');
    const relationshipResult = await sqlite.query({
      database: DB_NAME,
      statement: `
        SELECT 
          ai.id as actionItemId,
          ai.title,
          ai.type,
          ai.contactId,
          ai.sponsorContactId,
          sc.id as contactId,
          sc.topic
        FROM action_items ai
        LEFT JOIN sponsor_contacts sc ON ai.contactId = sc.id
        ORDER BY ai.createdAt DESC
      `,
      values: []
    });
    
    if (relationshipResult.values && relationshipResult.values.length > 0) {
      relationshipResult.values.forEach((item, index) => {
        console.log(`Relationship ${index + 1}:`, {
          actionItemId: item.actionItemId,
          title: item.title,
          type: item.type,
          contactId: item.contactId,
          sponsorContactId: item.sponsorContactId,
          linkedContactId: item.contactId,
          linkedContactTopic: item.topic
        });
      });
    } else {
      console.log('No relationships found');
    }
    
    console.log('\nDebug complete!');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugActionItems();