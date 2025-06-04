/**
 * Database Preferences Fix Utility
 * Repairs corrupted user preferences in the database
 */

export async function fixCorruptedPreferences() {
  try {
    if (!window.db) {
      throw new Error('Database not initialized');
    }

    // Get all users
    const users = await window.db.getAll('users');
    console.log('Found users to fix:', users.length);

    for (const user of users) {
      try {
        // Check if preferences is corrupted (string with individual characters)
        let needsUpdate = false;
        let fixedPreferences = {
          use24HourFormat: false,
          darkMode: false,
          theme: 'default'
        };

        if (user.preferences) {
          if (typeof user.preferences === 'string') {
            try {
              const parsed = JSON.parse(user.preferences);
              // Check if it's the corrupted format (has numeric keys)
              if (parsed && typeof parsed === 'object' && '0' in parsed) {
                console.log('Found corrupted preferences for user:', user.id);
                needsUpdate = true;
              } else if (parsed && typeof parsed === 'object') {
                // Valid preferences object, preserve existing values
                fixedPreferences = {
                  use24HourFormat: parsed.use24HourFormat || false,
                  darkMode: parsed.darkMode || false,
                  theme: parsed.theme || 'default'
                };
              }
            } catch (e) {
              // Couldn't parse, needs fixing
              needsUpdate = true;
            }
          } else if (typeof user.preferences === 'object') {
            // Already an object, just ensure all fields exist
            fixedPreferences = {
              use24HourFormat: user.preferences.use24HourFormat || false,
              darkMode: user.preferences.darkMode || false,
              theme: user.preferences.theme || 'default'
            };
          }
        } else {
          // No preferences, set defaults
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log(`Fixing preferences for user ${user.id}:`, fixedPreferences);
          
          await window.db.update('users', user.id, {
            preferences: fixedPreferences
          });
          
          console.log(`Successfully fixed preferences for user ${user.id}`);
        }
      } catch (error) {
        console.error(`Failed to fix preferences for user ${user.id}:`, error);
      }
    }

    console.log('Preferences fix complete');
    return true;
  } catch (error) {
    console.error('Failed to fix database preferences:', error);
    return false;
  }
}