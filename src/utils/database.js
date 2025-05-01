import * as SQLite from 'expo-sqlite';

// Create a database instance
const db = SQLite.openDatabase('aarecovery.db');

// Initialize database with necessary tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          sobrietyDate TEXT,
          homeGroup TEXT,
          discoverable INTEGER DEFAULT 0,
          latitude REAL,
          longitude REAL,
          lastSeen TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )`,
        [],
        () => {
          console.log('Users table created successfully');
        },
        (_, error) => {
          console.error('Error creating users table:', error);
          reject(error);
          return false;
        }
      );

      // Create activities table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          userId TEXT,
          type TEXT,
          name TEXT,
          date TEXT,
          duration INTEGER,
          notes TEXT,
          createdAt TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        )`,
        [],
        () => {
          console.log('Activities table created successfully');
        },
        (_, error) => {
          console.error('Error creating activities table:', error);
          reject(error);
          return false;
        }
      );

      // Create spiritual fitness table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS spiritualFitness (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT,
          score INTEGER,
          timeframe INTEGER,
          lastCalculated TEXT,
          activityCount INTEGER,
          activityTypes INTEGER,
          FOREIGN KEY (userId) REFERENCES users (id)
        )`,
        [],
        () => {
          console.log('Spiritual fitness table created successfully');
        },
        (_, error) => {
          console.error('Error creating spiritual fitness table:', error);
          reject(error);
          return false;
        }
      );
      
      // Create calendar reminders table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS calendarReminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          meetingId TEXT,
          meetingName TEXT,
          meetingDay TEXT,
          meetingTime TEXT,
          location TEXT,
          calendarEventId TEXT,
          notificationId TEXT,
          reminderMinutes INTEGER DEFAULT 30,
          isRecurring INTEGER DEFAULT 1,
          createdAt TEXT
        )`,
        [],
        () => {
          console.log('Calendar reminders table created successfully');
        },
        (_, error) => {
          console.error('Error creating calendar reminders table:', error);
          reject(error);
          return false;
        }
      );

      // Create user-defined meetings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS userMeetings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          day TEXT NOT NULL,
          time TEXT NOT NULL,
          location TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          type TEXT,
          notes TEXT,
          isShared INTEGER DEFAULT 0,
          createdAt TEXT
        )`,
        [],
        () => {
          console.log('User meetings table created successfully');
        },
        (_, error) => {
          console.error('Error creating user meetings table:', error);
          reject(error);
          return false;
        }
      );
      
      // Create settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE,
          value TEXT
        )`,
        [],
        () => {
          console.log('Settings table created successfully');
          resolve();
        },
        (_, error) => {
          console.error('Error creating settings table:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// User-related database operations
export const userOperations = {
  // Create a new user or update existing one
  saveUser: (user) => {
    return new Promise((resolve, reject) => {
      const { id, name, email, phone, sobrietyDate, homeGroup, discoverable, latitude, longitude } = user;
      const now = new Date().toISOString();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO users (
            id, name, email, phone, sobrietyDate, homeGroup, discoverable, 
            latitude, longitude, lastSeen, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name || '',
            email || '',
            phone || '',
            sobrietyDate || '',
            homeGroup || '',
            discoverable ? 1 : 0,
            latitude || null,
            longitude || null,
            now,
            user.createdAt || now,
            now
          ],
          (_, result) => {
            resolve(result.insertId);
          },
          (_, error) => {
            console.error('Error saving user:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get current user (the first one for now, can be enhanced later)
  getUser: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const user = rows.item(0);
              // Convert INTEGER to Boolean for discoverable
              user.discoverable = !!user.discoverable;
              resolve(user);
            } else {
              // Return empty user if none exists
              resolve({
                id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                name: '',
                email: '',
                phone: '',
                sobrietyDate: '',
                homeGroup: '',
                discoverable: false,
                createdAt: new Date().toISOString()
              });
            }
          },
          (_, error) => {
            console.error('Error fetching user:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get nearby users
  getNearbyUsers: (latitude, longitude, radius) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT id, name, sobrietyDate, phone, latitude, longitude, lastSeen 
           FROM users 
           WHERE discoverable = 1`,
          [],
          (_, { rows }) => {
            const users = [];
            for (let i = 0; i < rows.length; i++) {
              users.push(rows.item(i));
            }
            
            // Calculate distance for each user and filter by radius
            // This is a simplified version - in a real app, you'd use a more accurate distance calculation
            const nearbyUsers = users.filter(user => {
              if (!user.latitude || !user.longitude) return false;
              
              const distance = calculateDistance(
                latitude,
                longitude,
                user.latitude,
                user.longitude
              );
              
              user.distance = distance;
              return distance <= radius;
            });
            
            resolve(nearbyUsers);
          },
          (_, error) => {
            console.error('Error fetching nearby users:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Update user location
  updateUserLocation: (userId, latitude, longitude) => {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE users SET latitude = ?, longitude = ?, lastSeen = ?, updatedAt = ? WHERE id = ?',
          [latitude, longitude, now, now, userId],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error updating user location:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Update user discoverability
  updateDiscoverability: (userId, discoverable) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE users SET discoverable = ?, updatedAt = ? WHERE id = ?',
          [discoverable ? 1 : 0, new Date().toISOString(), userId],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error updating discoverability:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Activity-related database operations
export const activityOperations = {
  // Save a new activity
  saveActivity: (activity) => {
    return new Promise((resolve, reject) => {
      const { userId, type, name, date, duration, notes } = activity;
      const now = new Date().toISOString();
      const id = activity.id || `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO activities (id, userId, type, name, date, duration, notes, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, userId, type, name, date, duration, notes, now],
          (_, result) => {
            resolve({ id, ...activity, createdAt: now });
          },
          (_, error) => {
            console.error('Error saving activity:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get all activities
  getAllActivities: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM activities ORDER BY date DESC',
          [],
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
            return false;
          }
        );
      });
    });
  },
  
  // Get activities for a specific user
  getUserActivities: (userId) => {
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
            console.error('Error fetching user activities:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get recent activities
  getRecentActivities: (userId, limit = 5) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM activities WHERE userId = ? ORDER BY date DESC LIMIT ?',
          [userId, limit],
          (_, { rows }) => {
            const activities = [];
            for (let i = 0; i < rows.length; i++) {
              activities.push(rows.item(i));
            }
            resolve(activities);
          },
          (_, error) => {
            console.error('Error fetching recent activities:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Delete an activity
  deleteActivity: (activityId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM activities WHERE id = ?',
          [activityId],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting activity:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Spiritual fitness related operations
export const spiritualFitnessOperations = {
  // Calculate and save spiritual fitness
  calculateSpiritualFitness: async (userId, timeframe = 30) => {
    try {
      // Get activities for the user within timeframe
      const activities = await activityOperations.getUserActivities(userId);
      const now = new Date();
      const timeframeCutoff = new Date(now);
      timeframeCutoff.setDate(timeframeCutoff.getDate() - timeframe);
      
      // Filter activities within timeframe
      const relevantActivities = activities.filter(
        activity => new Date(activity.date) >= timeframeCutoff
      );
      
      // Calculate scores based on activity count and variety
      const activityCount = relevantActivities.length;
      const activityTypesSet = new Set(relevantActivities.map(a => a.type));
      const activityTypes = activityTypesSet.size;
      
      // Simple score based on activity count and variety
      const score = Math.min(100, Math.round((activityCount * 5) + (activityTypes * 10)));
      
      // Store the calculation
      const fitnessData = {
        userId,
        score,
        timeframe,
        lastCalculated: now.toISOString(),
        activityCount,
        activityTypes
      };
      
      // Save to database
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `INSERT OR REPLACE INTO spiritualFitness 
             (userId, score, timeframe, lastCalculated, activityCount, activityTypes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, score, timeframe, fitnessData.lastCalculated, activityCount, activityTypes],
            (_, result) => {
              resolve({ id: result.insertId, ...fitnessData });
            },
            (_, error) => {
              console.error('Error saving spiritual fitness:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (error) {
      console.error('Error in calculateSpiritualFitness:', error);
      throw error;
    }
  },
  
  // Get spiritual fitness for a user
  getSpiritualFitness: (userId, timeframe = 30) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM spiritualFitness WHERE userId = ? AND timeframe = ?',
          [userId, timeframe],
          async (_, { rows }) => {
            if (rows.length > 0) {
              const fitnessData = rows.item(0);
              const lastCalculated = new Date(fitnessData.lastCalculated);
              const now = new Date();
              
              // If we have a recent calculation (less than an hour old), return it
              if (now - lastCalculated < 60 * 60 * 1000) {
                resolve(fitnessData);
                return;
              }
            }
            
            // Otherwise calculate a new one
            try {
              const newFitnessData = await spiritualFitnessOperations.calculateSpiritualFitness(userId, timeframe);
              resolve(newFitnessData);
            } catch (error) {
              reject(error);
            }
          },
          (_, error) => {
            console.error('Error fetching spiritual fitness:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Settings-related database operations
export const settingsOperations = {
  // Save a setting
  saveSetting: (key, value) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [key, JSON.stringify(value)],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error saving setting:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get a setting
  getSetting: (key, defaultValue = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT value FROM settings WHERE key = ?',
          [key],
          (_, { rows }) => {
            if (rows.length > 0) {
              try {
                resolve(JSON.parse(rows.item(0).value));
              } catch (e) {
                resolve(defaultValue);
              }
            } else {
              resolve(defaultValue);
            }
          },
          (_, error) => {
            console.error('Error fetching setting:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Delete all settings (for reset)
  clearSettings: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM settings',
          [],
          (_, result) => {
            resolve(result.rowsAffected);
          },
          (_, error) => {
            console.error('Error clearing settings:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Helper function to calculate distance between two coordinates in kilometers using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Helper function to calculate sobriety days
export const calculateSobrietyDays = (sobrietyDate) => {
  if (!sobrietyDate) return 0;
  
  const start = new Date(sobrietyDate);
  const now = new Date();
  
  // Calculate the difference in days
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to calculate sobriety years with decimal places
export const calculateSobrietyYears = (sobrietyDate, decimalPlaces = 2) => {
  if (!sobrietyDate) return 0;
  
  const days = calculateSobrietyDays(sobrietyDate);
  const years = days / 365.25; // Account for leap years
  
  return Number(years.toFixed(decimalPlaces));
};

// Calendar reminders operations
// User-defined meetings operations
export const userMeetingOperations = {
  // Save a meeting
  saveMeeting: (meeting) => {
    return new Promise((resolve, reject) => {
      const {
        name,
        day,
        time,
        location,
        address,
        city,
        state,
        type,
        notes,
        isShared
      } = meeting;
      
      const id = meeting.id || `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO userMeetings (
            id, name, day, time, location, address, city, state, type, notes, isShared, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            name,
            day,
            time,
            location || '',
            address || '',
            city || '',
            state || '',
            type || '',
            notes || '',
            isShared ? 1 : 0,
            meeting.createdAt || now
          ],
          (_, result) => {
            resolve({
              id,
              ...meeting,
              isShared: !!isShared,
              createdAt: meeting.createdAt || now
            });
          },
          (_, error) => {
            console.error('Error saving meeting:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get all user meetings
  getAllMeetings: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM userMeetings ORDER BY day, time',
          [],
          (_, { rows }) => {
            const meetings = [];
            for (let i = 0; i < rows.length; i++) {
              const meeting = rows.item(i);
              // Convert INTEGER to boolean
              meeting.isShared = !!meeting.isShared;
              meetings.push(meeting);
            }
            resolve(meetings);
          },
          (_, error) => {
            console.error('Error fetching meetings:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get a meeting by ID
  getMeetingById: (meetingId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM userMeetings WHERE id = ?',
          [meetingId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const meeting = rows.item(0);
              // Convert INTEGER to boolean
              meeting.isShared = !!meeting.isShared;
              resolve(meeting);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error fetching meeting:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Delete a meeting
  deleteMeeting: (meetingId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM userMeetings WHERE id = ?',
          [meetingId],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting meeting:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Update sharing status
  updateSharingStatus: (meetingId, isShared) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE userMeetings SET isShared = ? WHERE id = ?',
          [isShared ? 1 : 0, meetingId],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error updating sharing status:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get shared meetings
  getSharedMeetings: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM userMeetings WHERE isShared = 1 ORDER BY day, time',
          [],
          (_, { rows }) => {
            const meetings = [];
            for (let i = 0; i < rows.length; i++) {
              const meeting = rows.item(i);
              // Convert INTEGER to boolean
              meeting.isShared = true;
              meetings.push(meeting);
            }
            resolve(meetings);
          },
          (_, error) => {
            console.error('Error fetching shared meetings:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

export const calendarReminderOperations = {
  // Save a calendar reminder
  saveCalendarReminder: (reminder) => {
    return new Promise((resolve, reject) => {
      const {
        meetingId,
        meetingName,
        meetingDay,
        meetingTime,
        location,
        calendarEventId,
        notificationId,
        reminderMinutes = 30,
        isRecurring = true
      } = reminder;
      
      const now = new Date().toISOString();
      
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO calendarReminders (
            meetingId, meetingName, meetingDay, meetingTime, location,
            calendarEventId, notificationId, reminderMinutes, isRecurring, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            meetingId,
            meetingName,
            meetingDay,
            meetingTime,
            location,
            calendarEventId,
            notificationId,
            reminderMinutes,
            isRecurring ? 1 : 0,
            now
          ],
          (_, result) => {
            resolve({
              id: result.insertId,
              ...reminder,
              createdAt: now
            });
          },
          (_, error) => {
            console.error('Error saving calendar reminder:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get all calendar reminders
  getAllCalendarReminders: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM calendarReminders ORDER BY createdAt DESC',
          [],
          (_, { rows }) => {
            const reminders = [];
            for (let i = 0; i < rows.length; i++) {
              const reminder = rows.item(i);
              // Convert INTEGER to boolean
              reminder.isRecurring = !!reminder.isRecurring;
              reminders.push(reminder);
            }
            resolve(reminders);
          },
          (_, error) => {
            console.error('Error fetching calendar reminders:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Get calendar reminder by meeting ID
  getCalendarReminderByMeetingId: (meetingId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM calendarReminders WHERE meetingId = ?',
          [meetingId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const reminder = rows.item(0);
              // Convert INTEGER to boolean
              reminder.isRecurring = !!reminder.isRecurring;
              resolve(reminder);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error fetching calendar reminder:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Update a calendar reminder
  updateCalendarReminder: (id, updates) => {
    return new Promise((resolve, reject) => {
      const {
        calendarEventId,
        notificationId,
        reminderMinutes,
        isRecurring
      } = updates;
      
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE calendarReminders SET 
            calendarEventId = COALESCE(?, calendarEventId),
            notificationId = COALESCE(?, notificationId),
            reminderMinutes = COALESCE(?, reminderMinutes),
            isRecurring = COALESCE(?, isRecurring)
           WHERE id = ?`,
          [
            calendarEventId !== undefined ? calendarEventId : null,
            notificationId !== undefined ? notificationId : null,
            reminderMinutes !== undefined ? reminderMinutes : null,
            isRecurring !== undefined ? (isRecurring ? 1 : 0) : null,
            id
          ],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error updating calendar reminder:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Delete a calendar reminder
  deleteCalendarReminder: (id) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM calendarReminders WHERE id = ?',
          [id],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting calendar reminder:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
};