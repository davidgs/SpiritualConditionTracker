/**
 * Test script to validate action items database schema fixes
 */

// Simple test to check if the database schema updates work
async function testActionItemsSchema() {
  console.log('Testing action items database schema...');
  
  try {
    // Import the action items functions
    const { addActionItem, getActionItemsForContact } = await import('./src/utils/action-items.ts');
    
    // Test data
    const testActionItem = {
      contactId: 1,
      title: 'Test Action Item',
      text: 'This is a test action item',
      notes: 'Test notes',
      dueDate: '2025-06-04',
      completed: 0,
      type: 'todo'
    };
    
    console.log('Adding test action item...');
    const result = await addActionItem(testActionItem);
    console.log('Add result:', result);
    
    if (result && result.id) {
      console.log('SUCCESS: Action item added with ID:', result.id);
      
      // Test retrieving action items for contact
      console.log('Retrieving action items for contact 1...');
      const items = await getActionItemsForContact(1);
      console.log('Retrieved items:', items);
      
      if (items && items.length > 0) {
        console.log('SUCCESS: Retrieved', items.length, 'action items for contact');
      } else {
        console.log('WARNING: No action items found for contact');
      }
    } else {
      console.log('ERROR: Failed to add action item');
    }
    
  } catch (error) {
    console.error('TEST FAILED:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testActionItemsSchema();