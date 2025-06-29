/**
 * Test Data Generator for Unified People + Contacts Architecture
 * Creates sample data for the new people, contacts, sponsors, and sponsees tables
 */

import DatabaseService from '../services/DatabaseService';
import { InsertPerson, InsertContact, InsertSponsor, InsertSponsee, InsertActionItem, InsertActivity } from '../types/database';

export async function createUnifiedTestData(): Promise<void> {
  const databaseService = DatabaseService.getInstance();
  
  console.log('[ unifiedTestDataGenerator ] Starting unified test data creation...');

  try {
    // 1. Create people in address book
    console.log('[ unifiedTestDataGenerator ] Creating people in address book...');
    
    // Sponsor people
    const sponsorPerson = await databaseService.addPerson({
      userId: 'default_user',
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '+1-555-0123',
      email: 'john.smith@email.com',
      sobrietyDate: '2018-03-15',
      homeGroup: 'Downtown AA',
      notes: 'Great sponsor, very supportive',
      relationship: 'sponsor',
      isActive: 1
    } as InsertPerson);

    const sponsorPerson2 = await databaseService.addPerson({
      userId: 'default_user',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phoneNumber: '+1-555-0124',
      email: 'sarah.j@email.com',
      sobrietyDate: '2015-07-22',
      homeGroup: 'Serenity Group',
      notes: 'Former sponsor, still great friend',
      relationship: 'sponsor',
      isActive: 1
    } as InsertPerson);

    // Sponsee people
    const sponseePerson = await databaseService.addPerson({
      userId: 'default_user',
      firstName: 'Mike',
      lastName: 'Wilson',
      phoneNumber: '+1-555-0125',
      email: 'mike.w@email.com',
      sobrietyDate: '2023-01-10',
      homeGroup: 'Hope Group',
      notes: 'New sponsee, eager to learn',
      relationship: 'sponsee',
      isActive: 1
    } as InsertPerson);

    const sponseePerson2 = await databaseService.addPerson({
      userId: 'default_user',
      firstName: 'Lisa',
      lastName: 'Davis',
      phoneNumber: '+1-555-0126',
      email: 'lisa.davis@email.com',
      sobrietyDate: '2022-09-05',
      homeGroup: 'New Life Group',
      notes: 'Working Step 4, very committed',
      relationship: 'sponsee',
      isActive: 1
    } as InsertPerson);

    // AA member people
    const memberPerson = await databaseService.addPerson({
      userId: 'default_user',
      firstName: 'David',
      lastName: 'Brown',
      phoneNumber: '+1-555-0127',
      email: 'david.brown@email.com',
      sobrietyDate: '2019-11-12',
      homeGroup: 'Morning Group',
      notes: 'Home group secretary, helpful friend',
      relationship: 'member',
      isActive: 1
    } as InsertPerson);

    const friendPerson = await databaseService.addPerson({
      userId: 'default_user',
      firstName: 'Emily',
      lastName: 'Taylor',
      phoneNumber: '+1-555-0128',
      email: 'emily.t@email.com',
      sobrietyDate: '2020-04-18',
      homeGroup: 'Sisters in Sobriety',
      notes: 'Close recovery friend',
      relationship: 'friend',
      isActive: 1
    } as InsertPerson);

    console.log('[ unifiedTestDataGenerator ] Created people:', [
      sponsorPerson, sponsorPerson2, sponseePerson, sponseePerson2, memberPerson, friendPerson
    ]);

    // 2. Create sponsor/sponsee relationships
    console.log('[ unifiedTestDataGenerator ] Creating sponsor/sponsee relationships...');
    
    const sponsor1 = await databaseService.addSponsor({
      userId: 'default_user',
      personId: sponsorPerson.id,
      startDate: '2024-01-15',
      status: 'active',
      notes: 'Current sponsor, meeting weekly'
    } as InsertSponsor);

    const formerSponsor = await databaseService.addSponsor({
      userId: 'default_user',
      personId: sponsorPerson2.id,
      startDate: '2023-06-01',
      status: 'former',
      notes: 'Former sponsor, moved to different city'
    } as InsertSponsor);

    const sponsee1 = await databaseService.addSponsee({
      userId: 'default_user',
      personId: sponseePerson.id,
      startDate: '2024-02-01',
      status: 'active',
      notes: 'Working through Step 3'
    } as InsertSponsee);

    const sponsee2 = await databaseService.addSponsee({
      userId: 'default_user',
      personId: sponseePerson2.id,
      startDate: '2023-12-15',
      status: 'active',
      notes: 'Working Step 4 inventory'
    } as InsertSponsee);

    console.log('[ unifiedTestDataGenerator ] Created relationships:', {
      sponsors: [sponsor1, formerSponsor],
      sponsees: [sponsee1, sponsee2]
    });

    // 3. Create contact records
    console.log('[ unifiedTestDataGenerator ] Creating contact records...');
    
    const contacts = [
      // Sponsor contacts
      {
        userId: 'default_user',
        personId: sponsorPerson.id,
        contactType: 'call',
        date: '2024-12-28',
        note: 'Weekly check-in call, discussed Step 4 progress',
        topic: 'Step Work',
        duration: 30
      },
      {
        userId: 'default_user',
        personId: sponsorPerson.id,
        contactType: 'coffee',
        date: '2024-12-25',
        note: 'Holiday coffee meeting, discussed gratitude',
        topic: 'Holiday Recovery',
        duration: 60,
        location: 'Downtown Cafe'
      },
      // Sponsee contacts
      {
        userId: 'default_user',
        personId: sponseePerson.id,
        contactType: 'call',
        date: '2024-12-27',
        note: 'Helped with Step 3 prayer and commitment',
        topic: 'Step 3',
        duration: 45
      },
      {
        userId: 'default_user',
        personId: sponseePerson2.id,
        contactType: 'meeting',
        date: '2024-12-26',
        note: 'Met at home group, discussed Step 4 fearless inventory',
        topic: 'Step 4',
        duration: 20,
        location: 'New Life Group'
      },
      // AA member contacts
      {
        userId: 'default_user',
        personId: memberPerson.id,
        contactType: 'text',
        date: '2024-12-29',
        note: 'Exchanged encouragement texts about daily practice',
        topic: 'Daily Recovery',
        duration: 5
      },
      {
        userId: 'default_user',
        personId: friendPerson.id,
        contactType: 'coffee',
        date: '2024-12-24',
        note: 'Recovery friendship coffee, shared experience',
        topic: 'Fellowship',
        duration: 90,
        location: 'Recovery Cafe'
      }
    ];

    const createdContacts = [];
    for (const contact of contacts) {
      const createdContact = await databaseService.addContact(contact as InsertContact);
      createdContacts.push(createdContact);
    }

    console.log('[ unifiedTestDataGenerator ] Created contacts:', createdContacts.length);

    // 4. Create action items linked to contacts and people
    console.log('[ unifiedTestDataGenerator ] Creating action items...');
    
    const actionItems = [
      {
        title: 'Complete Step 4 inventory by next week',
        text: 'Work on Step 4 fearless moral inventory',
        notes: 'Focus on resentments first, then fears',
        type: 'action',
        contactId: createdContacts[2].id, // Linked to sponsee call
        personId: sponseePerson.id,
        completed: 0
      },
      {
        title: 'Read pages 86-88 in Big Book',
        text: 'Study Step 4 instructions',
        notes: 'Prepare for inventory discussion',
        type: 'action',
        contactId: createdContacts[3].id, // Linked to sponsee meeting
        personId: sponseePerson2.id,
        completed: 0
      },
      {
        title: 'Call sponsor this week',
        text: 'Weekly sponsor check-in',
        notes: 'Discuss Step 5 preparation',
        type: 'action',
        personId: sponsorPerson.id, // Direct person link
        completed: 0,
        dueDate: '2025-01-05'
      },
      {
        title: 'Attend home group meeting',
        text: 'Regular home group attendance',
        notes: 'Thursday 7pm meeting',
        type: 'action',
        personId: memberPerson.id,
        completed: 1
      }
    ];

    const createdActionItems = [];
    for (const actionItem of actionItems) {
      const createdActionItem = await databaseService.addActionItem(actionItem as InsertActionItem);
      createdActionItems.push(createdActionItem);
    }

    console.log('[ unifiedTestDataGenerator ] Created action items:', createdActionItems.length);

    // 5. Create some spiritual activities
    console.log('[ unifiedTestDataGenerator ] Creating spiritual activities...');
    
    const activities = [
      {
        userId: 'default_user',
        type: 'prayer',
        title: 'Morning Prayer',
        date: '2024-12-29',
        notes: 'Third Step prayer and gratitude',
        duration: 10
      },
      {
        userId: 'default_user',
        type: 'meditation',
        title: 'Daily Meditation',
        date: '2024-12-29',
        notes: '11th Step meditation practice',
        duration: 20
      },
      {
        userId: 'default_user',
        type: 'literature',
        title: 'Daily Reflections',
        date: '2024-12-28',
        notes: 'December 28th reading on gratitude',
        duration: 15,
        literatureTitle: 'Daily Reflections'
      },
      {
        userId: 'default_user',
        type: 'meeting',
        title: 'Home Group Meeting',
        date: '2024-12-26',
        notes: 'Shared on Step 3 experience',
        duration: 90,
        meetingName: 'Downtown AA',
        wasShare: 1,
        wasChair: 0,
        wasSpeaker: 0
      }
    ];

    const createdActivities = [];
    for (const activity of activities) {
      const createdActivity = await databaseService.addActivity(activity as InsertActivity);
      createdActivities.push(createdActivity);
    }

    console.log('[ unifiedTestDataGenerator ] Created activities:', createdActivities.length);

    console.log('[ unifiedTestDataGenerator ] ✅ Unified test data creation complete!');
    console.log('[ unifiedTestDataGenerator ] Summary:');
    console.log(`  - People: 6 (2 sponsors, 2 sponsees, 2 members)`);
    console.log(`  - Sponsor relationships: 2 (1 active, 1 former)`);
    console.log(`  - Sponsee relationships: 2 (both active)`);
    console.log(`  - Contact records: ${createdContacts.length}`);
    console.log(`  - Action items: ${createdActionItems.length}`);
    console.log(`  - Activities: ${createdActivities.length}`);

  } catch (error) {
    console.error('[ unifiedTestDataGenerator ] Error creating test data:', error);
    throw error;
  }
}