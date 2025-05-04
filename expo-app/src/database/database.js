import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Database implementation (platform-specific)
let db;
let isWebDb = false;

// Platform-specific database handling
if (Platform.OS === 'web') {
  // Web-specific storage using IndexedDB
  isWebDb = true;
  
  // Initialize IndexedDB for web platform
  const webDb = {
    data: {
      users: [],
      activities: [],
      meetings: [],
      spiritual_fitness: []
    },
    
    transaction: function(callback) {
      // Simulate transaction for web environment
      const tx = {
        executeSql: (query, params, successCallback, errorCallback) => {
          try {
            // Simple query parsing to handle basic operations
            if (query.includes('CREATE TABLE')) {
              // Table creation - do nothing as tables are already "created" in memory
              if (successCallback) {
                successCallback(tx, { rows: { length: 0 }});
              }
            } else if (query.includes('INSERT INTO')) {
              // Handle insert operations
              const tableMatch = query.match(/INSERT INTO (\w+)/);
              if (tableMatch && tableMatch[1]) {
                const tableName = tableMatch[1];
                
                // Create a new object with appropriate properties based on the table
                let newItem = { id: params[0] }; // Assuming first param is always ID
                
                // Add remaining properties based on table
                if (tableName === 'users') {
                  newItem = {
                    ...newItem,
                    firstName: params[1],
                    lastName: params[2],
                    sobrietyDate: params[3],
                    homeGroup: params[4],
                    sponsorName: params[5],
                    sponsorPhone: params[6],
                    privacySettings: params[7],
                    notificationSettings: params[8]
                  };
                } else if (tableName === 'activities') {
                  newItem = {
                    ...newItem,
                    userId: params[1],
                    type: params[2],
                    date: params[3],
                    duration: params[4],
                    notes: params[5]
                  };
                } else if (tableName === 'meetings') {
                  newItem = {
                    ...newItem,
                    userId: params[1],
                    name: params[2],
                    location: params[3],
                    day: params[4],
                    time: params[5],
                    type: params[6],
                    notes: params[7],
                    isShared: params[8]
                  };
                } else if (tableName === 'spiritual_fitness') {
                  newItem = {
                    ...newItem,
                    userId: params[0],
                    overall: params[1],
                    prayer: params[2],
                    meetings: params[3],
                    literature: params[4],
                    service: params[5],
                    sponsorship: params[6],
                    timestamp: params[7]
                  };
                }
                
                // Add item to the appropriate collection
                webDb.data[tableName].push(newItem);
                
                // Save to localStorage
                try {
                  localStorage.setItem('aa_recovery_' + tableName, JSON.stringify(webDb.data[tableName]));
                } catch (e) {
                  console.warn('Failed to save to localStorage:', e);
                }
                
                if (successCallback) {
                  successCallback(tx, { insertId: newItem.id, rowsAffected: 1 });
                }
              }
            } else if (query.includes('SELECT')) {
              // Handle select operations
              const tableMatch = query.match(/FROM (\w+)/);
              const whereMatch = query.match(/WHERE (\w+) = \?/);
              const orderMatch = query.match(/ORDER BY ([\w\s,]+)/);
              const limitMatch = query.match(/LIMIT (\d+)/);
              
              if (tableMatch && tableMatch[1]) {
                const tableName = tableMatch[1];
                let results = [...webDb.data[tableName]];
                
                // Apply where clause if exists
                if (whereMatch && whereMatch[1] && params.length > 0) {
                  const fieldName = whereMatch[1];
                  const value = params[0];
                  results = results.filter(item => item[fieldName] == value);
                }
                
                // Apply order if needed (simplified)
                if (orderMatch && orderMatch[1]) {
                  const orderField = orderMatch[1].split(' ')[0];
                  results.sort((a, b) => {
                    if (a[orderField] < b[orderField]) return -1;
                    if (a[orderField] > b[orderField]) return 1;
                    return 0;
                  });
                  
                  // Handle DESC if specified
                  if (orderMatch[1].includes('DESC')) {
                    results.reverse();
                  }
                }
                
                // Apply limit if exists
                if (limitMatch && limitMatch[1]) {
                  const limit = parseInt(limitMatch[1]);
                  results = results.slice(0, limit);
                }
                
                if (successCallback) {
                  successCallback(tx, { 
                    rows: {
                      length: results.length,
                      item: (index) => results[index],
                      _array: results
                    }
                  });
                }
              }
            } else if (query.includes('UPDATE')) {
              // Handle update operations
              const tableMatch = query.match(/UPDATE (\w+)/);
              const whereMatch = query.match(/WHERE id = \?/);
              
              if (tableMatch && tableMatch[1] && whereMatch && params.length > 0) {
                const tableName = tableMatch[1];
                const idValue = params[params.length - 1]; // ID should be the last parameter for WHERE clause
                
                // Find and update the item
                const itemIndex = webDb.data[tableName].findIndex(item => item.id === idValue);
                if (itemIndex !== -1) {
                  // Update fields based on table type
                  if (tableName === 'users') {
                    webDb.data[tableName][itemIndex] = {
                      ...webDb.data[tableName][itemIndex],
                      firstName: params[0],
                      lastName: params[1],
                      sobrietyDate: params[2],
                      homeGroup: params[3],
                      sponsorName: params[4],
                      sponsorPhone: params[5],
                      privacySettings: params[6],
                      notificationSettings: params[7]
                    };
                  }
                  
                  // Save to localStorage
                  try {
                    localStorage.setItem('aa_recovery_' + tableName, JSON.stringify(webDb.data[tableName]));
                  } catch (e) {
                    console.warn('Failed to save to localStorage:', e);
                  }
                  
                  if (successCallback) {
                    successCallback(tx, { rowsAffected: 1 });
                  }
                } else {
                  if (successCallback) {
                    successCallback(tx, { rowsAffected: 0 });
                  }
                }
              }
            } else if (query.includes('DELETE')) {
              // Handle delete operations
              const tableMatch = query.match(/FROM (\w+)/);
              const whereMatch = query.match(/WHERE (\w+) = \?/);
              
              if (tableMatch && tableMatch[1] && whereMatch && whereMatch[1] && params.length > 0) {
                const tableName = tableMatch[1];
                const fieldName = whereMatch[1];
                const value = params[0];
                
                // Find and remove the item
                const initialLength = webDb.data[tableName].length;
                webDb.data[tableName] = webDb.data[tableName].filter(item => item[fieldName] !== value);
                const rowsAffected = initialLength - webDb.data[tableName].length;
                
                // Save to localStorage
                try {
                  localStorage.setItem('aa_recovery_' + tableName, JSON.stringify(webDb.data[tableName]));
                } catch (e) {
                  console.warn('Failed to save to localStorage:', e);
                }
                
                if (successCallback) {
                  successCallback(tx, { rowsAffected });
                }
              }
            }
          } catch (error) {
            console.error('Web DB Error:', error);
            if (errorCallback) {
              errorCallback(tx, error);
            }
          }
        }
      };
      
      // Load data from localStorage
      try {
        webDb.data.users = JSON.parse(localStorage.getItem('aa_recovery_users')) || [];
        webDb.data.activities = JSON.parse(localStorage.getItem('aa_recovery_activities')) || [];
        webDb.data.meetings = JSON.parse(localStorage.getItem('aa_recovery_meetings')) || [];
        webDb.data.spiritual_fitness = JSON.parse(localStorage.getItem('aa_recovery_spiritual_fitness')) || [];
      } catch (e) {
        console.warn('Failed to load from localStorage:', e);
      }
      
      callback(tx);
    }
  };
  
  db = webDb;
} else {
  // Native mobile environment - use SQLite
  db = SQLite.openDatabase('aa_recovery.db');
}

/**
 * Initialize the database tables
 */
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          firstName TEXT,
          lastName TEXT,
          sobrietyDate TEXT,
          homeGroup TEXT,
          sponsorName TEXT,
          sponsorPhone TEXT,
          privacySettings TEXT,
          notificationSettings TEXT,
          profileData TEXT
        )`,
        [],
        () => { console.log('Users table created or already exists'); },
        (_, error) => { console.error('Error creating users table:', error); reject(error); }
      );
      
      // Create activities table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          userId TEXT,
          type TEXT,
          date TEXT,
          duration INTEGER,
          notes TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        )`,
        [],
        () => { console.log('Activities table created or already exists'); },
        (_, error) => { console.error('Error creating activities table:', error); reject(error); }
      );
      
      // Create meetings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS meetings (
          id TEXT PRIMARY KEY,
          userId TEXT,
          name TEXT,
          location TEXT,
          day TEXT,
          time TEXT,
          type TEXT,
          notes TEXT,
          isShared INTEGER,
          FOREIGN KEY (userId) REFERENCES users (id)
        )`,
        [],
        () => { console.log('Meetings table created or already exists'); },
        (_, error) => { console.error('Error creating meetings table:', error); reject(error); }
      );
      
      // Create spiritual fitness table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS spiritual_fitness (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT,
          overall REAL,
          prayer REAL,
          meetings REAL,
          literature REAL,
          service REAL,
          sponsorship REAL,
          timestamp TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        )`,
        [],
        () => { 
          console.log('Spiritual fitness table created or already exists');
          resolve();
        },
        (_, error) => { console.error('Error creating spiritual fitness table:', error); reject(error); }
      );
    });
  });
};

/**
 * Get user data from database
 */
export const getUserData = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            const user = rows.item(0);
            // Parse JSON fields
            user.privacySettings = user.privacySettings ? JSON.parse(user.privacySettings) : {};
            user.notificationSettings = user.notificationSettings ? JSON.parse(user.notificationSettings) : {};
            user.recentActivities = [];
            
            // Get recent activities for this user
            tx.executeSql(
              'SELECT * FROM activities WHERE userId = ? ORDER BY date DESC LIMIT 5',
              [user.id],
              (_, { rows: activityRows }) => {
                const activities = [];
                for (let i = 0; i < activityRows.length; i++) {
                  activities.push(activityRows.item(i));
                }
                user.recentActivities = activities;
                resolve(user);
              },
              (_, error) => {
                console.error('Error fetching recent activities:', error);
                resolve(user); // Still resolve with user even if activities fail
              }
            );
          } else {
            resolve(null); // No user found
          }
        },
        (_, error) => {
          console.error('Error fetching user data:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Update user data in database
 */
export const updateUserData = (user) => {
  return new Promise((resolve, reject) => {
    // Convert objects to JSON strings for storage
    const privacySettings = user.privacySettings ? JSON.stringify(user.privacySettings) : null;
    const notificationSettings = user.notificationSettings ? JSON.stringify(user.notificationSettings) : null;
    
    db.transaction(tx => {
      // Check if user exists
      tx.executeSql(
        'SELECT id FROM users WHERE id = ?',
        [user.id],
        (_, { rows }) => {
          if (rows.length > 0) {
            // Update existing user
            tx.executeSql(
              `UPDATE users SET 
                firstName = ?, 
                lastName = ?, 
                sobrietyDate = ?, 
                homeGroup = ?, 
                sponsorName = ?, 
                sponsorPhone = ?, 
                privacySettings = ?, 
                notificationSettings = ?
                WHERE id = ?`,
              [
                user.firstName,
                user.lastName,
                user.sobrietyDate,
                user.homeGroup,
                user.sponsorName,
                user.sponsorPhone,
                privacySettings,
                notificationSettings,
                user.id
              ],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  resolve(user);
                } else {
                  reject(new Error('User update failed'));
                }
              },
              (_, error) => {
                console.error('Error updating user:', error);
                reject(error);
              }
            );
          } else {
            // Insert new user
            tx.executeSql(
              `INSERT INTO users (
                id, 
                firstName, 
                lastName, 
                sobrietyDate, 
                homeGroup, 
                sponsorName, 
                sponsorPhone, 
                privacySettings, 
                notificationSettings
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                user.id,
                user.firstName,
                user.lastName,
                user.sobrietyDate,
                user.homeGroup,
                user.sponsorName,
                user.sponsorPhone,
                privacySettings,
                notificationSettings
              ],
              () => {
                resolve(user);
              },
              (_, error) => {
                console.error('Error inserting user:', error);
                reject(error);
              }
            );
          }
        },
        (_, error) => {
          console.error('Error checking user existence:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Get all activities for a user
 */
export const getUserActivities = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM activities WHERE userId = ? ORDER BY date DESC',
        [userId],
        (_, { rows }) => {
          const activities = [];
          for (let i = 0; i < rows.length; i++) {
            activities.push(rows.item(i));
          }
          resolve(activities);
        },
        (_, error) => {
          console.error('Error fetching activities:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Add a new activity
 */
export const addUserActivity = (activity) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO activities (
          id, 
          userId, 
          type, 
          date, 
          duration, 
          notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          activity.id,
          activity.userId,
          activity.type,
          activity.date,
          activity.duration,
          activity.notes
        ],
        () => {
          resolve(activity);
        },
        (_, error) => {
          console.error('Error adding activity:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Delete an activity
 */
export const deleteUserActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM activities WHERE id = ?',
        [activityId],
        (_, { rowsAffected }) => {
          resolve(rowsAffected > 0);
        },
        (_, error) => {
          console.error('Error deleting activity:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Get all meetings for a user
 */
export const getUserMeetings = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM meetings WHERE userId = ? ORDER BY day, time',
        [userId],
        (_, { rows }) => {
          const meetings = [];
          for (let i = 0; i < rows.length; i++) {
            meetings.push(rows.item(i));
          }
          resolve(meetings);
        },
        (_, error) => {
          console.error('Error fetching meetings:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Add a new meeting
 */
export const addUserMeeting = (meeting) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO meetings (
          id, 
          userId, 
          name, 
          location, 
          day, 
          time, 
          type, 
          notes, 
          isShared
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          meeting.id,
          meeting.userId,
          meeting.name,
          meeting.location,
          meeting.day,
          meeting.time,
          meeting.type,
          meeting.notes || '',
          meeting.isShared ? 1 : 0
        ],
        () => {
          resolve(meeting);
        },
        (_, error) => {
          console.error('Error adding meeting:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Get spiritual fitness data for a user
 */
export const getUserSpiritualFitness = (userId = '1') => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM spiritual_fitness WHERE userId = ? ORDER BY timestamp DESC LIMIT 1',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error fetching spiritual fitness:', error);
          reject(error);
        }
      );
    });
  });
};

/**
 * Update spiritual fitness data
 */
export const updateUserSpiritualFitness = (fitness, userId = '1') => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO spiritual_fitness (
          userId, 
          overall, 
          prayer, 
          meetings, 
          literature, 
          service, 
          sponsorship, 
          timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          fitness.overall,
          fitness.prayer,
          fitness.meetings,
          fitness.literature,
          fitness.service,
          fitness.sponsorship,
          fitness.timestamp || new Date().toISOString()
        ],
        () => {
          resolve(fitness);
        },
        (_, error) => {
          console.error('Error updating spiritual fitness:', error);
          reject(error);
        }
      );
    });
  });
};