/**
 * Test Data Generator for Sponsor/Sponsee System
 * Creates comprehensive test data using proper app data pathways
 */

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
    console.log('[ testDataGenerator ] Using proper app data pathways');
    
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
    console.log('[ testDataGenerator ] Results:', {
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