/**
 * Test Data Generator for Sponsor/Sponsee System
 * Creates comprehensive test data using DatabaseService directly
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

interface AppDataFunctions {
  addMeeting: (meeting: any) => Promise<any>;
  addActivity: (activity: any) => Promise<any>;
}

export async function createTestData(userId: number | string, appDataFunctions: AppDataFunctions): Promise<TestDataResults> {
  try {
    console.log('[ testDataGenerator ] Starting test data creation for user:', userId);
    console.log('[ testDataGenerator ] Using DatabaseService directly for sponsors/sponsees');
    
    const databaseService = DatabaseService.getInstance();
    const results: TestDataResults = {
      sponsorsCreated: 0,
      sponseesCreated: 0,
      sponsorContactsCreated: 0,
      sponseeContactsCreated: 0,
      actionItemsCreated: 0,
      meetingsCreated: 0
    };

    // Create test meetings using app data pathways
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
      onlineUrl: ""
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
      onlineUrl: ""
    };

    // Create meetings using proper app data pathway
    console.log('[ testDataGenerator ] Creating meetings through app data functions...');
    const savedMeeting1 = await appDataFunctions.addMeeting(aToFMeeting);
    const savedMeeting2 = await appDataFunctions.addMeeting(tia);
    
    if (savedMeeting1) {
      results.meetingsCreated++;
      console.log('[ testDataGenerator ] Created meeting:', aToFMeeting.name);
    }
    if (savedMeeting2) {
      results.meetingsCreated++;
      console.log('[ testDataGenerator ] Created meeting:', tia.name);
    }
    
    console.log('[ testDataGenerator ] Total meetings created:', results.meetingsCreated);

    // Create test sponsors
    console.log('[ testDataGenerator ] Creating sponsors through app data functions...');
    const sponsors = [
      {
        userId: userId.toString(),
        name: 'John',
        lastName: 'Smith',
        phoneNumber: '+1 (919) 555-0123',
        email: 'john.smith@email.com',
        sobrietyDate: '2018-03-15',
        notes: 'My primary sponsor, very helpful with step work',
        sponsorType: 'sponsor'
      },
      {
        userId: userId.toString(),
        name: 'Sarah',
        lastName: 'Johnson',
        phoneNumber: '+1 (919) 555-0456',
        email: 'sarah.j@email.com',
        sobrietyDate: '2015-07-22',
        notes: 'Great listener, helps with literature study',
        sponsorType: 'sponsor'
      }
    ];

    let createdSponsors = [];
    for (const sponsor of sponsors) {
      const savedSponsor = await databaseService.addSponsor(sponsor);
      if (savedSponsor) {
        results.sponsorsCreated++;
        createdSponsors.push(savedSponsor);
        console.log('[ testDataGenerator ] Created sponsor:', sponsor.name, sponsor.lastName);
      }
    }

    // Create test sponsees
    console.log('[ testDataGenerator ] Creating sponsees through app data functions...');
    const sponsees = [
      {
        userId: userId.toString(),
        name: 'Mike',
        lastName: 'Wilson',
        phoneNumber: '+1 (919) 555-0789',
        email: 'mike.w@email.com',
        sobrietyDate: '2023-01-10',
        notes: 'Working on step 4, making good progress',
        sponseeType: 'sponsee'
      },
      {
        userId: userId.toString(),
        name: 'Jennifer',
        lastName: 'Davis',
        phoneNumber: '+1 (919) 555-0321',
        email: 'jen.davis@email.com',
        sobrietyDate: '2023-09-05',
        notes: 'New to the program, eager to learn',
        sponseeType: 'sponsee'
      }
    ];

    let createdSponsees = [];
    for (const sponsee of sponsees) {
      const savedSponsee = await databaseService.addSponsee(sponsee);
      if (savedSponsee) {
        results.sponseesCreated++;
        createdSponsees.push(savedSponsee);
        console.log('[ testDataGenerator ] Created sponsee:', sponsee.name, sponsee.lastName);
      }
    }

    // Create sponsor contacts
    if (createdSponsors.length > 0) {
      console.log('[ testDataGenerator ] Creating sponsor contacts...');
      const sponsorContacts = [
        {
          userId: userId.toString(),
          sponsorId: createdSponsors[0].id,
          type: 'call',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          note: 'Discussed step 5 work and amends list',
          topic: 'Step Work',
          duration: 30
        },
        {
          userId: userId.toString(),
          sponsorId: createdSponsors[0].id,
          type: 'meeting',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          note: 'Met at coffee shop to review progress',
          topic: 'Progress Review',
          duration: 60
        }
      ];

      for (const contact of sponsorContacts) {
        const savedContact = await databaseService.addSponsorContact(contact);
        if (savedContact) {
          results.sponsorContactsCreated++;
          console.log('[ testDataGenerator ] Created sponsor contact with topic:', contact.topic);
        }
      }
    }

    // Create sponsee contacts
    if (createdSponsees.length > 0) {
      console.log('[ testDataGenerator ] Creating sponsee contacts...');
      const sponseeContacts = [
        {
          userId: userId.toString(),
          sponseeId: createdSponsees[0].id,
          type: 'call',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          note: 'Checked in on daily routine and step 3 work',
          topic: 'Daily Check-in',
          duration: 20
        },
        {
          userId: userId.toString(),
          sponseeId: createdSponsees[1].id,
          type: 'text',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          note: 'Sent encouragement and meeting suggestions',
          topic: 'Support',
          duration: 5
        }
      ];

      for (const contact of sponseeContacts) {
        const savedContact = await databaseService.addSponseeContact(contact);
        if (savedContact) {
          results.sponseeContactsCreated++;
          console.log('[ testDataGenerator ] Created sponsee contact with topic:', contact.topic);
        }
      }
    }

    // Create sponsor contacts with action items using the proper app workflow
    console.log('[ testDataGenerator ] Creating sponsor contacts with action items...');
    
    if (createdSponsors.length > 0) {
      // Import the proper contact creation function that handles action items
      const { addSponsorContact } = await import('./sponsor-database');
      
      // Create sponsor contact with action items attached (like the real app does)
      const contactWithActionItems = {
        userId: userId,
        sponsorId: createdSponsors[0].id,
        type: 'call',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        note: 'Discussed step work and assigned tasks',
        topic: 'Step Work Assignment',
        duration: 45
      };
      
      const actionItemsForContact = [
        {
          title: 'Complete step 4 inventory',
          text: 'Finish writing moral inventory as discussed',
          notes: 'Focus on resentments and fears section',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          type: 'todo'
        },
        {
          title: 'Read pages 85-88 in Big Book',
          text: 'Study the amends section thoroughly',
          notes: 'Take notes on what resonates',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          type: 'todo'
        }
      ];
      
      try {
        // Use the actual app's sponsor contact creation method that properly handles action items
        const savedContactWithActions = await addSponsorContact(contactWithActionItems, actionItemsForContact);
        if (savedContactWithActions) {
          results.sponsorContactsCreated++;
          results.actionItemsCreated += actionItemsForContact.length;
          console.log('[ testDataGenerator ] Created sponsor contact with action items via proper app workflow');
        }
      } catch (error) {
        console.error('[ testDataGenerator ] Error creating sponsor contact with action items:', error);
      }
    }

    // Create some test activities using app data pathway
    const testActivities = [
      {
        userId: userId.toString(),
        type: 'prayer',
        title: 'Morning Prayer',
        text: 'Morning Prayer',
        notes: 'Started the day with gratitude and reflection',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        duration: 10,
        completed: 1
      },
      {
        userId: userId.toString(),
        type: 'meditation',
        title: 'Evening Meditation',
        text: 'Evening Meditation',
        notes: '15 minutes of quiet reflection before bed',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        duration: 15,
        completed: 1
      },
      {
        userId: userId.toString(),
        type: 'literature',
        title: 'Big Book Reading',
        text: 'Big Book Reading',
        notes: 'Read pages 85-88 about making amends',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        duration: 20,
        completed: 1
      }
    ];

    // Create activities using app data pathway
    console.log('[ testDataGenerator ] Creating activities through app data functions...');
    let activitiesCreated = 0;
    for (const activity of testActivities) {
      const savedActivity = await appDataFunctions.addActivity(activity);
      if (savedActivity) {
        activitiesCreated++;
        console.log('[ testDataGenerator ] Created activity:', activity.title);
      }
    }

    console.log('[ testDataGenerator ] Test data creation completed successfully!');
    console.log('[ testDataGenerator ] Complete Results:', {
      sponsorsCreated: results.sponsorsCreated,
      sponseesCreated: results.sponseesCreated,
      sponsorContactsCreated: results.sponsorContactsCreated,
      sponseeContactsCreated: results.sponseeContactsCreated,
      actionItemsCreated: results.actionItemsCreated,
      meetingsCreated: results.meetingsCreated,
      activitiesCreated: activitiesCreated
    });

    return results;

  } catch (error) {
    console.error('[ testDataGenerator ] Error creating test data:', error);
    console.error('[ testDataGenerator ] Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('[ testDataGenerator ] Error message:', error instanceof Error ? error.message : JSON.stringify(error));
    throw error;
  }
}

export default { createTestData };