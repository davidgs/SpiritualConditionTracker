/**
 * Test Data Generator for Sponsor/Sponsee System
 * Creates comprehensive test data for contacts and action items
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

export async function createTestData(userId: number | string): Promise<TestDataResults> {
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
    console.log('[ testDataGenerator ] Starting comprehensive test data creation...');
    
    // Step 1: Update user profile with comprehensive data
    await createUserProfileData(userId, results);
    
    // Step 2: Create diverse meetings
    await createTestMeetings(userId, results);
    
    // Step 3: Create various activity types
    await createTestActivities(userId, results);

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

    // Create sponsee contacts and action items
    for (const sponsee of savedSponsees) {
      await createSponseeTestContacts(sponsee, userId, results);
    }

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
    
    // Create activity record for sponsor contact
    const contactActivity = {
      userId: userId,
      type: 'sponsor-contact',
      date: contactWithAction.date,
      notes: contactWithAction.note,
      duration: contactWithAction.duration,
      personCalled: `${sponsor.name} ${sponsor.lastName}`,
      sponsorContactId: contactId,
      sponsorId: sponsor.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await databaseService.add('activities', contactActivity);
    
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
    
    // Create activity record for sponsor contact
    const contactActivity = {
      userId: userId,
      type: 'sponsor-contact',
      date: contactWithoutAction.date,
      notes: contactWithoutAction.note,
      duration: contactWithoutAction.duration,
      personCalled: `${sponsor.name} ${sponsor.lastName}`,
      sponsorContactId: (savedContactWithoutAction as any).id,
      sponsorId: sponsor.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await databaseService.add('activities', contactActivity);
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
    
    // Create activity record for sponsee contact
    const contactActivity = {
      userId: userId,
      type: 'sponsee-contact',
      date: contactWithAction.date,
      notes: contactWithAction.note,
      duration: contactWithAction.duration,
      personCalled: `${sponsee.name} ${sponsee.lastName}`,
      sponseeContactId: (savedContactWithAction as any).id,
      sponseeId: sponsee.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await databaseService.add('activities', contactActivity);
    
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
    
    // Create activity record for sponsee contact
    const contactActivity = {
      userId: userId,
      type: 'sponsee-contact',
      date: contactWithoutAction.date,
      notes: contactWithoutAction.note,
      personCalled: `${sponsee.name} ${sponsee.lastName}`,
      sponseeContactId: (savedContactWithoutAction as any).id,
      sponseeId: sponsee.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await databaseService.add('activities', contactActivity);
  }
}

// Create comprehensive user profile data
async function createUserProfileData(userId: number | string, results: TestDataResults) {
  const databaseService = DatabaseService.getInstance();
  
  console.log('[ testDataGenerator ] Creating user profile data...');
  
  try {
    // Get existing user or create one
    let user = await databaseService.getById('users', parseInt(userId.toString()));
    
    const profileData = {
      name: 'David',
      lastName: 'Thompson',
      phoneNumber: '+1 (555) 123-4567',
      email: 'david.thompson@email.com',
      sobrietyDate: '2020-06-15', // About 5 years sober
      homeGroups: JSON.stringify(['Serenity Circle AA']),
      preferences: JSON.stringify({
        emergencyContactName: 'Sarah Thompson',
        emergencyContactPhone: '+1 (555) 987-6543',
        allowMessages: true
      }),
      privacySettings: JSON.stringify({
        shareLastName: true
      }),
      updatedAt: new Date().toISOString()
    };
    
    if (user) {
      // Update existing user
      await databaseService.update('users', parseInt(userId.toString()), profileData);
      console.log('[ testDataGenerator ] Updated existing user profile');
    } else {
      // Create new user
      const newUser = {
        id: parseInt(userId.toString()),
        userId: userId.toString(),
        ...profileData,
        createdAt: new Date().toISOString()
      };
      await databaseService.add('users', newUser);
      console.log('[ testDataGenerator ] Created new user profile');
    }
    
    results.userProfileUpdated = true;
  } catch (error) {
    console.error('[ testDataGenerator ] Error creating user profile:', error);
  }
}

// Create diverse test meetings
async function createTestMeetings(userId: number | string, results: TestDataResults) {
  const databaseService = DatabaseService.getInstance();
  
  console.log('[ testDataGenerator ] Creating test meetings...');
  
  const testMeetings = [
    {
      name: 'Big Book Study',
      days: 'Monday,Wednesday',
      time: '19:00',
      schedule: 'weekly',
      types: 'Big Book Study',
      address: '123 Recovery St, Hope City, HC 12345',
      city: 'Hope City',
      state: 'HC',
      zipCode: '12345',
      locationName: 'St. Mary\'s Church',
      notes: 'Focuses on reading and discussing the Big Book chapter by chapter. Wheelchair accessible.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: 'Saturday Morning Serenity',
      days: 'Saturday',
      time: '09:00',
      schedule: 'weekly',
      types: 'Open Discussion',
      address: '456 Serenity Ave, Peace Town, PT 67890',
      city: 'Peace Town',
      state: 'PT',
      zipCode: '67890',
      locationName: 'Community Center',
      notes: 'Great way to start the weekend with fellowship and sharing. Wheelchair accessible, Parking available.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: 'Online Unity Group',
      days: 'Tuesday,Thursday,Sunday',
      time: '20:00',
      schedule: 'weekly',
      types: 'Online Meeting',
      onlineUrl: 'https://zoom.us/j/1234567890',
      notes: 'Perfect for busy schedules or when traveling. Meeting ID: 123 456 7890, Password: unity2024',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: 'Gratitude & Meditation',
      days: 'Friday',
      time: '18:30',
      schedule: 'weekly',
      types: 'Meditation',
      address: '789 Mindful Way, Zen Village, ZV 11223',
      city: 'Zen Village', 
      state: 'ZV',
      zipCode: '11223',
      locationName: 'Peaceful Path Center',
      notes: 'Combines AA principles with guided meditation practice. Quiet environment, cushions provided.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      name: 'Young People in Recovery',
      days: 'Sunday',
      time: '16:00',
      schedule: 'weekly',
      types: 'Young People',
      address: '321 Youth Center Dr, New Hope, NH 44556',
      city: 'New Hope',
      state: 'NH', 
      zipCode: '44556',
      locationName: 'Youth Activity Center',
      notes: 'For people under 35, very welcoming and energetic group. Youth-friendly space, snacks provided.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  for (const meeting of testMeetings) {
    try {
      const savedMeeting = await databaseService.add('meetings', meeting);
      if (savedMeeting) {
        results.meetingsCreated++;
        console.log(`[ testDataGenerator ] Created meeting: ${meeting.name}`);
      }
    } catch (error) {
      console.error(`[ testDataGenerator ] Error creating meeting ${meeting.name}:`, error);
    }
  }
}

// Create diverse test activities
async function createTestActivities(userId: number | string, results: TestDataResults) {
  const databaseService = DatabaseService.getInstance();
  
  console.log('[ testDataGenerator ] Creating test activities...');
  
  const activityTypes = [
    {
      type: 'prayer',
      activities: [
        {
          notes: 'Morning meditation and serenity prayer',
          duration: 15,
          daysAgo: 0
        },
        {
          notes: 'Evening gratitude prayer',
          duration: 10,
          daysAgo: 1
        },
        {
          notes: 'Step 11 prayer and meditation',
          duration: 20,
          daysAgo: 2
        }
      ]
    },
    {
      type: 'meeting',
      activities: [
        {
          notes: 'Big Book Study - Chapter 4: We Agnostics',
          duration: 90,
          daysAgo: 1,
          meetingName: 'Big Book Study'
        },
        {
          notes: 'Saturday Morning Serenity - Shared about gratitude',
          duration: 60,
          daysAgo: 2,
          meetingName: 'Saturday Morning Serenity'
        },
        {
          notes: 'Online Unity Group - Step work discussion',
          duration: 75,
          daysAgo: 3,
          meetingName: 'Online Unity Group'
        },
        {
          notes: 'Young People meeting - Topic: Dealing with stress',
          duration: 60,
          daysAgo: 4,
          meetingName: 'Young People in Recovery'
        }
      ]
    },
    {
      type: 'reading',
      activities: [
        {
          notes: 'Daily Reflections - June 25th reading',
          duration: 10,
          daysAgo: 0
        },
        {
          notes: 'Big Book - Pages 83-88, Step 4 inventory work',
          duration: 45,
          daysAgo: 1
        },
        {
          notes: 'As Bill Sees It - Random page reading',
          duration: 15,
          daysAgo: 3
        }
      ]
    },
    {
      type: 'service',
      activities: [
        {
          notes: 'Set up chairs for Saturday meeting',
          duration: 30,
          daysAgo: 2
        },
        {
          notes: 'Greeted newcomers at Big Book Study',
          duration: 15,
          daysAgo: 1
        },
        {
          notes: 'Made coffee for Sunday meeting',
          duration: 20,
          daysAgo: 4
        }
      ]
    },
    {
      type: 'exercise',
      activities: [
        {
          notes: 'Morning jog - cleared my head and felt grateful',
          duration: 30,
          daysAgo: 0
        },
        {
          notes: 'Gym workout - used exercise to manage stress',
          duration: 60,
          daysAgo: 1
        },
        {
          notes: 'Walk in nature - practiced mindfulness',
          duration: 45,
          daysAgo: 3
        }
      ]
    },
    {
      type: 'journaling',
      activities: [
        {
          notes: 'Gratitude list - wrote 10 things I\'m grateful for',
          duration: 20,
          daysAgo: 0
        },
        {
          notes: 'Step 4 inventory work - continued resentment list',
          duration: 60,
          daysAgo: 2
        },
        {
          notes: 'Daily inventory - reviewed day and made amends plan',
          duration: 15,
          daysAgo: 1
        }
      ]
    }
  ];
  
  for (const activityGroup of activityTypes) {
    for (const activity of activityGroup.activities) {
      try {
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - activity.daysAgo);
        
        const activityData = {
          userId: userId.toString(),
          type: activityGroup.type,
          date: activityDate.toISOString().split('T')[0],
          notes: activity.notes,
          duration: activity.duration,
          meetingName: activity.meetingName || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const savedActivity = await databaseService.add('activities', activityData);
        if (savedActivity) {
          results.activitiesCreated++;
          console.log(`[ testDataGenerator ] Created ${activityGroup.type} activity: ${activity.notes.substring(0, 30)}...`);
        }
      } catch (error) {
        console.error(`[ testDataGenerator ] Error creating activity:`, error);
      }
    }
  }
}

export default { createTestData };