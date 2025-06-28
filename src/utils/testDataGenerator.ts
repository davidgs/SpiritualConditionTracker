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
  meetingsCreated: number;
}

export async function createTestData(userId: number | string): Promise<TestDataResults> {
  try {
    console.log('[ testDataGenerator ] Starting test data creation for user:', userId);
    
    const databaseService = DatabaseService.getInstance();
    
    const results: TestDataResults = {
      sponsorsCreated: 0,
      sponseesCreated: 0,
      sponsorContactsCreated: 0,
      sponseeContactsCreated: 0,
      actionItemsCreated: 0,
      meetingsCreated: 0
    };

    // Create test meetings first
    const aToFMeeting = {
      name: "Arch to Freedom",
      days: ["monday"],
      time: "18:00",
      schedule: [{
        day: "monday",
        time: "18:00",
        format: "literature",
        locationType: "in_person",
        access: "open"
      }],
      types: [],
      address: "100 Hughes St, Apex, NC, 27502",
      locationName: "Apex United Methodist Church",
      streetAddress: "100 Hughes St",
      city: "Apex",
      state: "NC",
      zipCode: "27502",
      coordinates: null,
      isHomeGroup: true,
      onlineUrl: "", 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const tia = {
      name: "There Is A Solution",
      days: ["tuesday", "thursday"],
      time: "19:00",
      schedule: [
        {
          day: "tuesday",
          time: "19:00",
          format: "beginners",
          locationType: "in_person",
          access: "open"
        },
        {
          day: "thursday",
          time: "19:00",
          format: "discussion",
          locationType: "in_person",
          access: "closed"
        }
      ],
      types: [],
      address: "7000 Tryon Rd., Cary, NC, 27518",
      locationName: "Macedonia United Methodist Church",
      streetAddress: "7000 Tryon Rd.",
      city: "Cary",
      state: "NC",
      zipCode: "27518",
      coordinates: null,
      isHomeGroup: true,
      onlineUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create meetings
    const savedMeeting1 = await databaseService.add('meetings', aToFMeeting);
    const savedMeeting2 = await databaseService.add('meetings', tia);
    
    if (savedMeeting1) results.meetingsCreated++;
    if (savedMeeting2) results.meetingsCreated++;
    
    console.log('[ testDataGenerator ] Created meetings:', results.meetingsCreated);

    // Create test sponsors
    const testSponsors = [
      {
        userId: userId.toString(),
        name: 'John',
        lastName: 'Smith',
        phoneNumber: '919-555-0101',
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
        phoneNumber: '919-555-0102',
        email: 'mary.j@email.com',
        sobrietyDate: '2012-08-22',
        notes: 'Very supportive and knowledgeable',
        sponsorType: 'sponsor',
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
        console.log('[ testDataGenerator ] Created sponsor:', sponsor.name, sponsor.lastName);
      }
    }

    // Create test sponsees 
    const testSponsees = [
      {
        userId: userId.toString(),
        name: 'Alex',
        lastName: 'Wilson',
        phoneNumber: '919-555-0201',
        email: 'alex.wilson@email.com',
        sobrietyDate: '2023-06-10',
        notes: 'New sponsee, very motivated',
        sponseeType: 'sponsee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Create sponsees
    const savedSponsees = [];
    for (const sponsee of testSponsees) {
      const savedSponsee = await databaseService.add('sponsees', sponsee);
      if (savedSponsee) {
        savedSponsees.push(savedSponsee);
        results.sponseesCreated++;
        console.log('[ testDataGenerator ] Created sponsee:', sponsee.name, sponsee.lastName);
      }
    }

    // Create sponsor contacts (only these will appear in Activity List)
    for (const sponsor of savedSponsors) {
      await createSponsorTestContacts(sponsor, userId, results);
    }

    // Skip sponsee contacts per requirements (they should not appear in Activity List)
    console.log('[ testDataGenerator ] Skipping sponsee contact creation - not shown in Activity List per requirements');

    console.log('[ testDataGenerator ] Test data creation completed:', results);
    return results;

  } catch (error) {
    console.error('[ testDataGenerator ] Error creating test data:', error);
    console.error('[ testDataGenerator ] Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('[ testDataGenerator ] Error message:', error instanceof Error ? error.message : JSON.stringify(error));
    throw error;
  }
}

async function createSponsorTestContacts(sponsor: any, userId: number | string, results: TestDataResults) {
  try {
    const databaseService = DatabaseService.getInstance();
    console.log('[ testDataGenerator ] Creating contacts for sponsor:', sponsor.name);

    // Contact with action item - fixed date to avoid duplicates
    const contactWithAction = {
      userId: userId.toString(),
      sponsorId: sponsor.id,
      type: 'call',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      note: 'Discussed my progress on Step 7. Very helpful conversation about maintaining gratitude.',
      topic: 'Step Work & Gratitude', 
      duration: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedContactWithAction = await databaseService.add('sponsor_contacts', contactWithAction);
    if (savedContactWithAction) {
      results.sponsorContactsCreated++;
      
      // Create associated action item (matching actual database schema with ALTER TABLE additions)
      const actionItem = {
        title: 'Practice daily meditation',
        text: 'Practice daily meditation',
        notes: 'Start each day with 10 minutes of quiet meditation to center myself',
        completed: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 1 week
        type: 'action',
        sponsorContactId: (savedContactWithAction as any).id, // Link to the sponsor contact
        sponsorId: sponsor.id, // Added via ALTER TABLE
        sponsorName: `${sponsor.name} ${sponsor.lastName.charAt(0)}.`, // Added via ALTER TABLE
        contactId: (savedContactWithAction as any).id, // Added via ALTER TABLE
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedActionItem = await databaseService.add('action_items', actionItem);
      if (savedActionItem) {
        results.actionItemsCreated++;
        console.log('[ testDataGenerator ] Created action item for sponsor contact');
      }
    }

    // Contact without action item - fixed date to avoid duplicates
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
      console.log('[ testDataGenerator ] Created sponsor contact without action item');
    }

  } catch (error) {
    console.error('[ testDataGenerator ] Error creating sponsor contacts:', error);
    throw error;
  }
}

export default { createTestData };