/**
 * Test Data Generator for Sponsor/Sponsee System
 * Creates comprehensive test data using actual app data paths
 */

import DatabaseService from '../services/DatabaseService';

export interface TestDataResults {
  userProfileUpdated: boolean;
  meetingsCreated: number;
  activitiesCreated: number;
  sponsorsCreated: number;
  sponseesCreated: number;
  sponsorContactsCreated: number;
  sponseeContactsCreated: number;
  actionItemsCreated: number;
}

export async function createTestData(appDataContext: any): Promise<TestDataResults> {
  const { updateUser, addActivity, addMeeting, addActionItem, state } = appDataContext;
  const userId = state.currentUserId;
  const databaseService = DatabaseService.getInstance();
  
  const results: TestDataResults = {
    userProfileUpdated: false,
    meetingsCreated: 0,
    activitiesCreated: 0,
    sponsorsCreated: 0,
    sponseesCreated: 0,
    sponsorContactsCreated: 0,
    sponseeContactsCreated: 0,
    actionItemsCreated: 0
  };

  try {
    console.log('[ testDataGenerator ] Starting comprehensive test data creation using real app data paths...');
    
    // Step 1: Update user profile using actual updateUser function (same as Profile.tsx)
    await createUserProfileData(updateUser, results);
    
    // Step 2: Create diverse meetings using actual addMeeting function
    await createTestMeetings(addMeeting, results);
    
    // Step 3: Create various activity types using actual addActivity function
    await createTestActivities(addActivity, userId, results);

    // Step 4: Create sponsors and sponsees using DatabaseService (like the real app does)
    await createTestSponsorsAndSponsees(databaseService, userId, results);

    console.log('[ testDataGenerator ] Test data creation completed:', results);
    return results;

  } catch (error) {
    console.error('[ testDataGenerator ] Error creating test data:', error);
    throw error;
  }
}

// Create user profile data using the same pattern as Profile.tsx
async function createUserProfileData(updateUser: any, results: TestDataResults) {
  try {
    console.log('[ testDataGenerator ] Creating user profile data using actual updateUser function...');
    
    // Use the exact same structure as Profile.tsx
    const updates = {
      name: "David",
      lastName: "Simmons", 
      phoneNumber: "+1-919-555-0123",
      email: "david.simmons@email.com",
      sobrietyDate: "2022-01-15", // Store as string, not Date object
      homeGroups: ["Triangle Group", "Sunrise Meeting"],
      privacySettings: {
        shareLastName: true
      },
      preferences: {
        use24HourFormat: false
      }
    };
    
    const updatedUser = await updateUser(updates);
    if (updatedUser) {
      results.userProfileUpdated = true;
      console.log('[ testDataGenerator ] User profile updated successfully');
    }
  } catch (error) {
    console.error('[ testDataGenerator ] Error creating user profile:', error);
  }
}

// Create test meetings using actual addMeeting function
async function createTestMeetings(addMeeting: any, results: TestDataResults) {
  try {
    console.log('[ testDataGenerator ] Creating test meetings using actual addMeeting function...');
    
    const testMeetings = [
      {
        name: "Big Book Study",
        time: "18:00",
        types: ["Big Book", "Closed"],
        days: ["Monday", "Wednesday", "Friday"],
        address: "123 Recovery St, Raleigh, NC 27601",
        city: "Raleigh",
        state: "NC",
        zipCode: "27601",
        locationName: "First Presbyterian Church",
        onlineUrl: "",
        schedule: "Weekly",
        homeGroup: true
      },
      {
        name: "Online Unity Meeting",
        time: "19:30",
        types: ["Discussion", "Online"],
        days: ["Tuesday", "Thursday"],
        address: "",
        city: "",
        state: "",
        zipCode: "",
        locationName: "Zoom Meeting",
        onlineUrl: "https://zoom.us/j/123456789",
        schedule: "Weekly",
        homeGroup: false
      },
      {
        name: "Morning Meditation",
        time: "07:00",
        types: ["Meditation", "Open"],
        days: ["Saturday"],
        address: "456 Serenity Ave, Durham, NC 27707",
        city: "Durham",
        state: "NC",
        zipCode: "27707",
        locationName: "Unity Center",
        onlineUrl: "",
        schedule: "Weekly",
        homeGroup: false
      }
    ];
    
    for (const meeting of testMeetings) {
      const savedMeeting = await addMeeting(meeting);
      if (savedMeeting) {
        results.meetingsCreated++;
        console.log(`[ testDataGenerator ] Created meeting: ${meeting.name}`);
      }
    }
  } catch (error) {
    console.error('[ testDataGenerator ] Error creating meetings:', error);
  }
}

// Create test activities using actual addActivity function
async function createTestActivities(addActivity: any, userId: any, results: TestDataResults) {
  try {
    console.log('[ testDataGenerator ] Creating test activities using actual addActivity function...');
    
    const testActivities = [
      {
        userId: userId.toString(),
        type: "prayer",
        duration: 10,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        notes: "Morning prayers and gratitude"
      },
      {
        userId: userId.toString(),
        type: "meditation",
        duration: 15,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        notes: "Quiet reflection on Step 3"
      },
      {
        userId: userId.toString(),
        type: "literature",
        duration: 30,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        notes: "Big Book Chapter 5 - How It Works"
      },
      {
        userId: userId.toString(),
        type: "meeting",
        duration: 60,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        notes: "Big Book Study - great discussion on resentments"
      },
      {
        userId: userId.toString(),
        type: "service",
        duration: 45,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        notes: "Setup chairs for meeting"
      },
      {
        userId: userId.toString(),
        type: "call",
        duration: 20,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        notes: "Called sponsee Alex - discussed Step 4 work"
      }
    ];
    
    for (const activity of testActivities) {
      const savedActivity = await addActivity(activity);
      if (savedActivity) {
        results.activitiesCreated++;
        console.log(`[ testDataGenerator ] Created activity: ${activity.type} - ${activity.notes}`);
      }
    }
  } catch (error) {
    console.error('[ testDataGenerator ] Error creating activities:', error);
  }
}

// Create sponsors and sponsees using DatabaseService (like the real app)
async function createTestSponsorsAndSponsees(databaseService: any, userId: any, results: TestDataResults) {
  try {
    console.log('[ testDataGenerator ] Creating sponsors and sponsees using DatabaseService...');
    
    // Create test sponsors using same pattern as real app
    const testSponsors = [
      {
        userId: userId.toString(),
        name: 'John',
        lastName: 'Smith',
        phoneNumber: '555-0101',
        email: 'john.smith@email.com',
        sobrietyDate: '2015-03-15',
        notes: 'Great sponsor with 10+ years experience'
      },
      {
        userId: userId.toString(),
        name: 'Mary',
        lastName: 'Johnson',
        phoneNumber: '555-0102',
        email: 'mary.j@email.com',
        sobrietyDate: '2012-08-22',
        notes: 'Very supportive and knowledgeable'
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
        notes: 'New sponsee, very motivated'
      },
      {
        userId: userId.toString(),
        name: 'Sarah',
        lastName: 'Davis',
        phoneNumber: '555-0202',
        email: 'sarah.d@email.com',
        sobrietyDate: '2023-11-05',
        notes: 'Working on Step 4'
      }
    ];

    // Create sponsors
    const savedSponsors = [];
    for (const sponsor of testSponsors) {
      const savedSponsor = await databaseService.add('sponsors', sponsor);
      if (savedSponsor) {
        savedSponsors.push(savedSponsor);
        results.sponsorsCreated++;
        console.log(`[ testDataGenerator ] Created sponsor: ${sponsor.name} ${sponsor.lastName}`);
      }
    }

    // Create sponsees
    const savedSponsees = [];
    for (const sponsee of testSponsees) {
      const savedSponsee = await databaseService.add('sponsees', sponsee);
      if (savedSponsee) {
        savedSponsees.push(savedSponsee);
        results.sponseesCreated++;
        console.log(`[ testDataGenerator ] Created sponsee: ${sponsee.name} ${sponsee.lastName}`);
      }
    }

    // Create sponsor contacts and action items
    for (const sponsor of savedSponsors) {
      await createSponsorTestContacts(databaseService, sponsor, userId, results);
    }

    // Create sponsee contacts and action items
    for (const sponsee of savedSponsees) {
      await createSponseeTestContacts(databaseService, sponsee, userId, results);
    }
    
  } catch (error) {
    console.error('[ testDataGenerator ] Error creating sponsors/sponsees:', error);
  }
}

async function createSponsorTestContacts(databaseService: any, sponsor: any, userId: number | string, results: TestDataResults) {
  
  console.log(`[ testDataGenerator ] Creating contacts for sponsor with ID: ${sponsor.id}`);
  
  // Contact with action item
  const contactWithAction = {
    userId: userId.toString(),
    sponsorId: sponsor.id, // Use the sponsor ID directly
    type: 'call',
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
    note: `Discussed my progress on Step ${Math.floor(Math.random() * 12) + 1}. Very helpful conversation about maintaining gratitude.`,
    topic: 'Step Work & Gratitude',
    duration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedContactWithAction = await databaseService.add('sponsor_contacts', contactWithAction);
  if (savedContactWithAction) {
    results.sponsorContactsCreated++;
    const contactId = (savedContactWithAction as any).id;
    
    console.log(`[ testDataGenerator ] Created sponsor contact with ID: ${contactId}`);
    
    // Do NOT create activity record for sponsor contact
    // Sponsor contacts should be stored ONLY in sponsor_contacts table
    // The AppDataContext will handle displaying them in the Activity List
    
    // Create action item linked to this specific contact
    const actionItem = {
      title: 'Practice daily meditation',
      text: 'Practice daily meditation for 10 minutes',
      notes: 'Focus on gratitude and serenity prayer',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      completed: 0,
      type: 'sponsor_action_item',
      sponsorContactId: contactId,
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

  // Contact without action item
  const contactWithoutAction = {
    userId: userId.toString(),
    sponsorId: sponsor.id,
    type: 'meeting',
    date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 2 weeks
    note: 'Quick check-in after the meeting. Feeling good about my recovery progress.',
    topic: 'Post-Meeting Check-in',
    duration: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedContactWithoutAction = await databaseService.add('sponsor_contacts', contactWithoutAction);
  if (savedContactWithoutAction) {
    results.sponsorContactsCreated++;
    
    // Do NOT create activity record for sponsor contact
    // Sponsor contacts should be stored ONLY in sponsor_contacts table
    // The AppDataContext will handle displaying them in the Activity List
  }
}

async function createSponseeTestContacts(databaseService: any, sponsee: any, userId: number | string, results: TestDataResults) {
  
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
    
    // Do NOT create activity record for sponsee contact
    // Sponsee contacts should be stored ONLY in sponsee_contacts table
    // They should NOT appear in the Activity List per requirements
    
    // Create action item linked to this specific sponsee contact
    const actionItem = {
      title: 'Complete Step 4 inventory',
      text: 'Work on personal inventory list',
      notes: 'Focus on resentments and fears',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      completed: 0,
      type: 'sponsee_action_item',
      sponseeContactId: (savedContactWithAction as any).id,
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
    
    // Do NOT create activity record for sponsee contact
    // Sponsee contacts should be stored ONLY in sponsee_contacts table
    // They should NOT appear in the Activity List per requirements
  }
}

export default { createTestData };