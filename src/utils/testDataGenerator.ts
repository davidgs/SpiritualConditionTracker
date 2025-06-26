/**
 * Test Data Generator for Sponsor/Sponsee System
 * Creates comprehensive test data for contacts and action items
 */

import DatabaseService from '../services/DatabaseService';

export interface TestDataResults {
  sponsorsCreated: number;
  sponseesCreated: number;
  sponsorContactsCreated: number;
  sponseeContactsCreated: number;
  actionItemsCreated: number;
}

export async function createTestData(userId: number | string): Promise<TestDataResults> {
  const databaseService = DatabaseService.getInstance();
  
  const results: TestDataResults = {
    sponsorsCreated: 0,
    sponseesCreated: 0,
    sponsorContactsCreated: 0,
    sponseeContactsCreated: 0,
    actionItemsCreated: 0
  };

  try {
    console.log('[ testDataGenerator ] Starting test data creation...');

    // Create test sponsors
    const testSponsors = [
      {
        userId: userId.toString(),
        name: 'John',
        lastName: 'Smith',
        phoneNumber: '555-0101',
        email: 'john.smith@email.com',
        sobrietyDate: '2015-03-15',
        notes: 'Great sponsor with 10+ years experience',
        sponsorType: 'sponsor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: userId.toString(),
        name: 'Mary',
        lastName: 'Johnson',
        phoneNumber: '555-0102',
        email: 'mary.j@email.com',
        sobrietyDate: '2012-08-22',
        notes: 'Very supportive and knowledgeable',
        sponsorType: 'sponsor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Create test sponsees
    const testSponsees = [
      {
        userId: userId.toString(),
        name: 'Alex',
        lastName: 'Wilson',
        phoneNumber: '555-0201',
        email: 'alex.wilson@email.com',
        sobrietyDate: '2023-06-10',
        notes: 'New sponsee, very motivated',
        sponseeType: 'sponsee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: userId.toString(),
        name: 'Sarah',
        lastName: 'Davis',
        phoneNumber: '555-0202',
        email: 'sarah.d@email.com',
        sobrietyDate: '2023-11-05',
        notes: 'Working on Step 4',
        sponseeType: 'sponsee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Create sponsors
    const savedSponsors = [];
    for (const sponsor of testSponsors) {
      const savedSponsor = await databaseService.add('sponsors', sponsor);
      if (savedSponsor) {
        savedSponsors.push(savedSponsor);
        results.sponsorsCreated++;
        console.log(`[ testDataGenerator ] Created sponsor: ${sponsor.name} ${sponsor.lastName} with ID: ${(savedSponsor as any).id}`);
      }
    }

    // Create sponsees
    const savedSponsees = [];
    for (const sponsee of testSponsees) {
      const savedSponsee = await databaseService.add('sponsees', sponsee);
      if (savedSponsee) {
        savedSponsees.push(savedSponsee);
        results.sponseesCreated++;
        console.log(`[ testDataGenerator ] Created sponsee: ${sponsee.name} ${sponsee.lastName} with ID: ${(savedSponsee as any).id}`);
      }
    }

    // Create sponsor contacts and action items
    for (const sponsor of savedSponsors) {
      await createSponsorTestContacts(sponsor, userId, results);
    }

    // Do NOT create sponsee contacts for now - they should not appear in Activity List
    // TODO: Implement sponsee contact functionality when requirements are clarified
    console.log('[ testDataGenerator ] Skipping sponsee contact creation - not shown in Activity List per requirements');

    console.log('[ testDataGenerator ] Test data creation completed:', results);
    return results;

  } catch (error) {
    console.error('[ testDataGenerator ] Error creating test data:', error);
    throw error;
  }
}

async function createSponsorTestContacts(sponsor: any, userId: number | string, results: TestDataResults) {
  const databaseService = DatabaseService.getInstance();
  
  console.log(`[ testDataGenerator ] Creating contacts for sponsor with ID: ${sponsor.id}`);
  
  // Contact with action item - use fixed recent dates to avoid duplicates
  const contactWithAction = {
    userId: userId.toString(),
    sponsorId: sponsor.id,
    type: 'call',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    note: `Discussed my progress on Step 7. Very helpful conversation about maintaining gratitude.`,
    topic: 'Step Work & Gratitude',
    duration: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedContactWithAction = await databaseService.add('sponsor_contacts', contactWithAction);
  if (savedContactWithAction) {
    results.sponsorContactsCreated++;
    const contactId = (savedContactWithAction as any).id;
    
    console.log(`[ testDataGenerator ] Created sponsor contact with ID: ${contactId}`);
    
    // Do NOT create activity records for sponsor contacts
    // Sponsor contacts appear in Activity List through the AppDataContext transformation
    // Creating activities here causes duplicates
    
    // Create action item linked to this specific contact
    const actionItem = {
      title: 'Practice daily meditation',
      text: 'Practice daily meditation for 10 minutes',
      notes: 'Focus on gratitude and serenity prayer',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      completed: 0,
      type: 'sponsor_action_item',
      sponsorContactId: contactId,
      contactId: contactId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`[ testDataGenerator ] Creating sponsor action item: ${actionItem.title}`);
    
    const savedActionItem = await databaseService.add('action_items', actionItem);
    if (savedActionItem) {
      results.actionItemsCreated++;
      
      // DO NOT create activity records for action items
      // Action items exist independently in action_items table
    }
  }

  // Contact without action item - use fixed date to avoid duplicates
  const contactWithoutAction = {
    userId: userId.toString(),
    sponsorId: sponsor.id,
    type: 'meeting',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    note: 'Quick check-in after the meeting. Feeling good about my recovery progress.',
    topic: 'Post-Meeting Check-in',
    duration: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedContactWithoutAction = await databaseService.add('sponsor_contacts', contactWithoutAction);
  if (savedContactWithoutAction) {
    results.sponsorContactsCreated++;
    
    // Do NOT create activity records for sponsor contacts
    // Sponsor contacts appear in Activity List through the AppDataContext transformation
  }
}

async function createSponseeTestContacts(sponsee: any, userId: number | string, results: TestDataResults) {
  const databaseService = DatabaseService.getInstance();
  
  console.log(`[ testDataGenerator ] Creating contacts for sponsee with ID: ${sponsee.id}`);
  
  // Contact with action item
  const contactWithAction = {
    userId: userId.toString(),
    sponseeId: sponsee.id,
    type: 'call',
    date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 5 days
    note: `Helped ${sponsee.name} work through Step ${Math.floor(Math.random() * 8) + 1}. Good progress being made.`,
    topic: 'Step Work Guidance',
    duration: Math.floor(Math.random() * 40) + 20, // 20-60 minutes
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedContactWithAction = await databaseService.add('sponsee_contacts', contactWithAction);
  if (savedContactWithAction) {
    results.sponseeContactsCreated++;
    
    // Do NOT create activity records for sponsee contacts
    // Sponsee contacts should not appear in Activity List per requirements
    
    // Create action item linked to this specific sponsee contact
    const actionItem = {
      title: 'Complete Step 4 inventory',
      text: 'Work on personal inventory list',
      notes: 'Focus on resentments and fears',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      completed: 0,
      type: 'sponsee_action_item',
      sponseeContactId: (savedContactWithAction as any).id,
      contactId: (savedContactWithAction as any).id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const savedActionItem = await databaseService.add('action_items', actionItem);
    if (savedActionItem) {
      results.actionItemsCreated++;
      
      // Note: Do NOT create activity record for sponsee action items
      // They should not appear in the Activity Log per requirements
    }
  }

  // Contact without action item
  const contactWithoutAction = {
    userId: userId.toString(),
    sponseeId: sponsee.id,
    type: 'text',
    date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 10 days
    note: `${sponsee.name} reached out for encouragement. Provided support and reminded them of their progress.`,
    topic: 'Encouragement & Support',
    duration: null, // Text messages don't have duration
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedContactWithoutAction = await databaseService.add('sponsee_contacts', contactWithoutAction);
  if (savedContactWithoutAction) {
    results.sponseeContactsCreated++;
    
    // Do NOT create activity records for sponsee contacts
    // Sponsee contacts should not appear in Activity List per requirements
  }
}

export default { createTestData };