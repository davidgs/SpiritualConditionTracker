/**
 * Database migration utility to help migrate from localStorage to SQLite
 */

// Check if we have data in localStorage
export function hasLocalStorageData() {
  return (
    localStorage.getItem('user') ||
    localStorage.getItem('activities') ||
    localStorage.getItem('meetings') ||
    localStorage.getItem('messages')
  );
}

// Migrate data from localStorage to SQLite database
export async function migrateFromLocalStorage(db) {
  console.log("[ databaseMigration.js ] Starting migration from localStorage to SQLite...");
  
  try {
    // Migrate user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      console.log("[ databaseMigration.js ] Migrating user data...");
      await db.add('users', userData);
    }
    
    // Migrate activities
    const activitiesData = JSON.parse(localStorage.getItem('activities') || '[]');
    if (activitiesData.length > 0) {
      console.log(`[ databaseMigration.js ] Migrating ${activitiesData.length} activities...`);
      for (const activity of activitiesData) {
        await db.add('activities', activity);
      }
    }
    
    // Migrate meetings
    const meetingsData = JSON.parse(localStorage.getItem('meetings') || '[]');
    if (meetingsData.length > 0) {
      console.log(`[ databaseMigration.js ] Migrating ${meetingsData.length} meetings...`);
      for (const meeting of meetingsData) {
        await db.add('meetings', meeting);
      }
    }
    
    // Migrate messages
    const messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
    if (messagesData.length > 0) {
      console.log(`[ databaseMigration.js ] Migrating ${messagesData.length} messages...`);
      for (const message of messagesData) {
        await db.add('messages', message);
      }
    }
    
    console.log("[ databaseMigration.js ] Migration completed successfully!");
    
    // Optionally clear localStorage after successful migration
    // (uncomment this if you want to clear after migration)
    // localStorage.clear();
    
    return true;
  } catch (error) {
    console.error("[ databaseMigration.js ] Error during migration:", error);
    return false;
  }
}