/**
 * SQLite Database Loader
 * This initializes SQLite for use in the browser with WebSQL fallback
 */

// Check if we're running in a Capacitor environment
const isCapacitor = typeof window !== 'undefined' && 
                    window.Capacitor !== undefined && 
                    window.Capacitor.isPluginAvailable !== undefined;

// Initialize SQLite database
function initSQLiteDatabase() {
  console.log('Initializing SQLite database for Capacitor...');
  
  // If we're in a Capacitor environment, try to use native SQLite
  if (isCapacitor && window.Capacitor.isPluginAvailable('CapacitorSQLite')) {
    console.log('Using native SQLite with Capacitor');
    return initCapacitorSQLite();
  } else {
    console.log('Using WebSQL implementation for browser');
    return initWebSQL();
  }
}

// Initialize SQLite with Capacitor
async function initCapacitorSQLite() {
  try {
    // Make sure we're accessing the plugin correctly
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.CapacitorSQLite) {
      console.error('CapacitorSQLite plugin not properly available');
      return initWebSQL();
    }
    
    const capacitorSQLite = window.Capacitor.Plugins.CapacitorSQLite;
    
    // Check the platform
    const platform = window.Capacitor.getPlatform();
    console.log(`Running on platform: ${platform}`);
    
    try {
      // Try to see if the plugin is really ready (fixes UNIMPLEMENTED error)
      const isAvailable = await capacitorSQLite.isAvailable();
      console.log(`SQLite availability check: ${isAvailable}`);
      
      if (!isAvailable) {
        console.warn('CapacitorSQLite reports not available, falling back to WebSQL');
        return initWebSQL();
      }
    } catch (e) {
      // If isAvailable itself is UNIMPLEMENTED, continue anyway
      console.warn(`SQLite availability check error: ${e.message || JSON.stringify(e)}`);
    }
    
    // Create a connection to the database
    console.log('Creating connection to database: defaultDB');
    
    await capacitorSQLite.createConnection({
      database: 'defaultDB',
      encrypted: false,
      mode: 'no-encryption',
      version: 1
    });
    
    // Open the database
    console.log('Opening database: defaultDB');
    await capacitorSQLite.open({ database: 'defaultDB' });
    
    // Create tables
    await setupTables(capacitorSQLite);
    
    // Set up global database object
    setupGlobalDB(capacitorSQLite);
    
    console.log('Capacitor SQLite setup complete');
    return capacitorSQLite;
  } catch (error) {
    console.error('Error initializing Capacitor SQLite:', error);
    console.log('Falling back to WebSQL');
    return initWebSQL();
  }
}

// Set up tables for SQLite
async function setupTables(sqlite) {
  try {
    // Create users table
    console.log('Executing SQL: CREATE TABLE IF NOT EXISTS users (\n      id TEXT PRIMARY KEY,\n      name TEXT,\n      lastName TEXT,\n      phoneNumber TEXT,\n      email TEXT,\n      sobrietyDate TEXT,\n      homeGroups TEXT,\n      privacySettings TEXT,\n      preferences TEXT,\n      sponsor TEXT,\n      sponsees TEXT,\n      messagingKeys TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )');
    await sqlite.execute({
      database: 'defaultDB',
      statement: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      email TEXT,
      sobrietyDate TEXT,
      homeGroups TEXT,
      privacySettings TEXT,
      preferences TEXT,
      sponsor TEXT,
      sponsees TEXT,
      messagingKeys TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
      values: []
    });
    
    // Create activities table
    console.log('Executing SQL: CREATE TABLE IF NOT EXISTS activities (\n      id TEXT PRIMARY KEY,\n      type TEXT NOT NULL,\n      duration INTEGER,\n      date TEXT,\n      notes TEXT,\n      meeting TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )');
    await sqlite.execute({
      database: 'defaultDB',
      statement: `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      duration INTEGER,
      date TEXT,
      notes TEXT,
      meeting TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
      values: []
    });
    
    // Create meetings table
    console.log('Executing SQL: CREATE TABLE IF NOT EXISTS meetings (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      days TEXT,\n      time TEXT,\n      schedule TEXT,\n      address TEXT,\n      locationName TEXT,\n      streetAddress TEXT,\n      city TEXT,\n      state TEXT,\n      zipCode TEXT,\n      coordinates TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )');
    await sqlite.execute({
      database: 'defaultDB',
      statement: `CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      days TEXT,
      time TEXT,
      schedule TEXT,
      address TEXT,
      locationName TEXT,
      streetAddress TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      coordinates TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
      values: []
    });
    
    // Create messages table
    console.log('Executing SQL: CREATE TABLE IF NOT EXISTS messages (\n      id TEXT PRIMARY KEY,\n      senderId TEXT,\n      recipientId TEXT,\n      content TEXT,\n      encrypted INTEGER,\n      timestamp TEXT,\n      read INTEGER\n    )');
    await sqlite.execute({
      database: 'defaultDB',
      statement: `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT,
      recipientId TEXT,
      content TEXT,
      encrypted INTEGER,
      timestamp TEXT,
      read INTEGER
    )`,
      values: []
    });
    
    // Create preferences table
    console.log('Executing SQL: CREATE TABLE IF NOT EXISTS preferences (\n      id TEXT PRIMARY KEY,\n      value TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )');
    await sqlite.execute({
      database: 'defaultDB',
      statement: `CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      value TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
      values: []
    });
    
    console.log('All database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Initialize with WebSQL
function initWebSQL() {
  try {
    const db = openDatabase(
      'defaultDB',
      '1.0',
      'Spiritual Condition Tracker Database',
      5 * 1024 * 1024 // 5MB
    );
    
    db.transaction(function(tx) {
      // Create users table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          lastName TEXT,
          phoneNumber TEXT,
          email TEXT,
          sobrietyDate TEXT,
          homeGroups TEXT,
          privacySettings TEXT,
          preferences TEXT,
          sponsor TEXT,
          sponsees TEXT,
          messagingKeys TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      // Create activities table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          duration INTEGER,
          date TEXT,
          notes TEXT,
          meeting TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      // Create meetings table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS meetings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          days TEXT,
          time TEXT,
          schedule TEXT,
          address TEXT,
          locationName TEXT,
          streetAddress TEXT,
          city TEXT,
          state TEXT,
          zipCode TEXT,
          coordinates TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      // Create messages table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          senderId TEXT,
          recipientId TEXT,
          content TEXT,
          encrypted INTEGER,
          timestamp TEXT,
          read INTEGER
        )
      `);
      
      // Create preferences table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS preferences (
          id TEXT PRIMARY KEY,
          value TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
    }, function(error) {
      console.error('Transaction error: ' + error.message);
    }, function() {
      console.log('Tables created successfully');
    });
    
    setupWebSQLGlobalDB(db);
    return db;
  } catch (error) {
    console.error('Error initializing WebSQL:', error);
    return null;
  }
}

// Set up global database for WebSQL
function setupWebSQLGlobalDB(db) {
  // Create a global Database object to mimic the original API
  window.Database = {
    // General operations
    getAll: function(collection) {
      return new Promise((resolve, reject) => {
        db.transaction(function(tx) {
          tx.executeSql(`SELECT * FROM ${collection}`, [], function(tx, results) {
            const items = [];
            for (let i = 0; i < results.rows.length; i++) {
              items.push(results.rows.item(i));
            }
            resolve(items);
          }, function(tx, error) {
            console.error(`Error getting all from ${collection}:`, error);
            reject(error);
          });
        });
      });
    },
    
    getById: function(collection, id) {
      return new Promise((resolve, reject) => {
        db.transaction(function(tx) {
          tx.executeSql(`SELECT * FROM ${collection} WHERE id = ?`, [id], function(tx, results) {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0));
            } else {
              resolve(null);
            }
          }, function(tx, error) {
            console.error(`Error getting by ID from ${collection}:`, error);
            reject(error);
          });
        });
      });
    },
    
    add: function(collection, item) {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(item);
        const values = keys.map(key => item[key]);
        const placeholders = keys.map(() => '?').join(',');
        
        db.transaction(function(tx) {
          tx.executeSql(
            `INSERT INTO ${collection} (${keys.join(',')}) VALUES (${placeholders})`,
            values,
            function(tx, results) {
              resolve(item);
            },
            function(tx, error) {
              console.error(`Error adding to ${collection}:`, error);
              reject(error);
            }
          );
        });
      });
    },
    
    update: function(collection, id, updates) {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(updates);
        const values = keys.map(key => updates[key]);
        const setClause = keys.map(key => `${key} = ?`).join(',');
        
        // Add ID to values array
        values.push(id);
        
        db.transaction(function(tx) {
          tx.executeSql(
            `UPDATE ${collection} SET ${setClause} WHERE id = ?`,
            values,
            function(tx, results) {
              if (results.rowsAffected > 0) {
                resolve({ ...updates, id });
              } else {
                resolve(null);
              }
            },
            function(tx, error) {
              console.error(`Error updating ${collection}:`, error);
              reject(error);
            }
          );
        });
      });
    },
    
    remove: function(collection, id) {
      return new Promise((resolve, reject) => {
        db.transaction(function(tx) {
          tx.executeSql(
            `DELETE FROM ${collection} WHERE id = ?`,
            [id],
            function(tx, results) {
              resolve(results.rowsAffected > 0);
            },
            function(tx, error) {
              console.error(`Error removing from ${collection}:`, error);
              reject(error);
            }
          );
        });
      });
    },
    
    query: function(collection, predicate) {
      return new Promise((resolve, reject) => {
        this.getAll(collection)
          .then(items => {
            const filteredItems = items.filter(predicate);
            resolve(filteredItems);
          })
          .catch(reject);
      });
    },
    
    // Specific operations
    calculateDistance: function(lat1, lon1, lat2, lon2) {
      // Implementation of distance calculation
      const R = 3963.0; // radius of Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return distance;
    },
    
    calculateSobrietyDays: function(sobrietyDate) {
      const sobDate = new Date(sobrietyDate);
      const today = new Date();
      const diff = today - sobDate;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    
    calculateSobrietyYears: function(sobrietyDate, decimalPlaces = 2) {
      const sobDate = new Date(sobrietyDate);
      const today = new Date();
      const diff = today - sobDate;
      const years = diff / (1000 * 60 * 60 * 24 * 365.25);
      return parseFloat(years.toFixed(decimalPlaces));
    },
    
    getPreference: function(key) {
      return new Promise((resolve, reject) => {
        db.transaction(function(tx) {
          tx.executeSql(`SELECT value FROM preferences WHERE id = ?`, [key], function(tx, results) {
            if (results.rows.length > 0) {
              try {
                const value = JSON.parse(results.rows.item(0).value);
                resolve(value);
              } catch (e) {
                resolve(results.rows.item(0).value);
              }
            } else {
              resolve(null);
            }
          }, function(tx, error) {
            console.error(`Error getting preference ${key}:`, error);
            reject(error);
          });
        });
      });
    },
    
    setPreference: function(key, value) {
      return new Promise((resolve, reject) => {
        const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const now = new Date().toISOString();
        
        db.transaction(function(tx) {
          tx.executeSql(`SELECT * FROM preferences WHERE id = ?`, [key], function(tx, results) {
            if (results.rows.length > 0) {
              tx.executeSql(
                `UPDATE preferences SET value = ?, updatedAt = ? WHERE id = ?`,
                [jsonValue, now, key],
                function(tx, results) {
                  console.log(`Updated item in preferences with ID: ${key}`);
                  resolve();
                },
                function(tx, error) {
                  console.error(`Error updating preference ${key}:`, error);
                  reject(error);
                }
              );
            } else {
              tx.executeSql(
                `INSERT INTO preferences (id, value, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
                [key, jsonValue, now, now],
                function(tx, results) {
                  console.log(`Added item to preferences with ID: ${key}`);
                  resolve();
                },
                function(tx, error) {
                  console.error(`Error setting preference ${key}:`, error);
                  reject(error);
                }
              );
            }
          });
        });
      });
    },
    
    calculateSpiritualFitness: function() {
      return new Promise((resolve, reject) => {
        try {
          this.calculateSpiritualFitnessWithTimeframe(30)
            .then(resolve)
            .catch(error => {
              console.warn('Error in standard fitness calculation:', error);
              // Default to 5 instead of 20 on error
              resolve(window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5);
            });
        } catch (error) {
          console.error('Error using original calculation method:', error);
          console.warn('No spiritual fitness calculation methods available');
          // Default to 5 instead of 20
          resolve(window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5);
        }
      });
    },
    
    calculateSpiritualFitnessWithTimeframe: function(timeframe = 30) {
      return new Promise((resolve, reject) => {
        // Get activities from the last n days
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - timeframe);
        
        // Get all activities
        this.getAll('activities')
          .then(activities => {
            console.log('Using fallback calculation with activities:', activities);
            
            // Check if we have any activities
            if (!activities || activities.length === 0) {
              console.log('No activities found in database');
              // Default to 5 instead of 20
              resolve(window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5);
              return;
            }
            
            // Filter activities within the timeframe
            const filteredActivities = activities.filter(activity => {
              const activityDate = new Date(activity.date);
              return activityDate >= pastDate && activityDate <= today;
            });
            
            console.log(`Found ${filteredActivities.length} activities in the ${timeframe}-day timeframe`);
            
            // Calculate metrics
            // 1. Days with at least one activity
            const activityDays = new Set();
            filteredActivities.forEach(activity => {
              activityDays.add(activity.date);
            });
            
            const daysWithActivities = activityDays.size;
            const daysPercentage = Math.round((daysWithActivities / timeframe) * 100);
            
            // 2. Base score from activity count
            const activityBase = Math.min(40, Math.ceil(filteredActivities.length / 3));
            
            // 3. Consistency bonus (up to 40 points)
            const consistencyPoints = Math.round((daysPercentage / 100) * 40);
            
            // 4. Variety bonus (up to 20 points)
            const activityTypes = new Set();
            filteredActivities.forEach(activity => {
              activityTypes.add(activity.type);
            });
            
            const varietyBonus = Math.min(20, activityTypes.size * 4);
            
            // Calculate final score (cap at 100)
            const finalScore = Math.min(100, activityBase + consistencyPoints + varietyBonus);
            
            console.log(`${timeframe}-day calculation details:`, {
              timeframe,
              daysWithActivities,
              daysPercentage,
              activityBase,
              consistencyPoints,
              varietyBonus,
              finalScore
            });
            
            resolve(finalScore);
          })
          .catch(error => {
            console.error('Error getting activities:', error);
            // Default to 5 instead of 20
            resolve(window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5);
          });
      });
    },
    
    // Operations for specific entities
    userOperations: {
      // User-specific operations would go here
    },
    
    activityOperations: {
      // Activity-specific operations would go here
    },
    
    meetingOperations: {
      // Meeting-specific operations would go here
    },
    
    spiritualFitnessOperations: {
      calculateSpiritualFitness: function(timeframe = 30) {
        console.log('Using original Database.spiritualFitnessOperations with timeframe:', timeframe);
        return window.Database.calculateSpiritualFitnessWithTimeframe(timeframe);
      }
    },
    
    utils: {
      // Utility functions would go here
    }
  };
  
  console.log('Global Database object created with these operations:', Object.keys(window.Database));
  
  // Initialize the database
  window.db = window.Database;
  console.log('SQLite database initialized successfully');
}

// Set up global database for Capacitor SQLite
function setupGlobalDB(sqlite) {
  console.log('Setting up global db object with all necessary functions');
  
  // Similar to above, but implementation details would differ for Capacitor SQLite
  // This would be a more complex implementation handling the Capacitor SQLite API
  
  // For this example, we'll use a simplified version
  window.Database = {
    // Basic operations
    getAll: async function(collection) {
      try {
        const result = await sqlite.query({
          database: 'defaultDB',
          statement: `SELECT * FROM ${collection}`,
          values: []
        });
        return result.values || [];
      } catch (error) {
        console.error(`Error getting all from ${collection}:`, error);
        return [];
      }
    },
    
    getById: async function(collection, id) {
      try {
        const result = await sqlite.query({
          database: 'defaultDB',
          statement: `SELECT * FROM ${collection} WHERE id = ?`,
          values: [id]
        });
        return (result.values && result.values.length > 0) ? result.values[0] : null;
      } catch (error) {
        console.error(`Error getting by ID from ${collection}:`, error);
        return null;
      }
    },
    
    add: async function(collection, item) {
      try {
        const keys = Object.keys(item);
        const values = keys.map(key => item[key]);
        const placeholders = keys.map(() => '?').join(',');
        
        await sqlite.execute({
          database: 'defaultDB',
          statement: `INSERT INTO ${collection} (${keys.join(',')}) VALUES (${placeholders})`,
          values: values
        });
        
        return item;
      } catch (error) {
        console.error(`Error adding to ${collection}:`, error);
        throw error;
      }
    },
    
    update: async function(collection, id, updates) {
      try {
        const keys = Object.keys(updates);
        const values = keys.map(key => updates[key]);
        const setClause = keys.map(key => `${key} = ?`).join(',');
        
        // Add ID to values array
        values.push(id);
        
        const result = await sqlite.execute({
          database: 'defaultDB',
          statement: `UPDATE ${collection} SET ${setClause} WHERE id = ?`,
          values: values
        });
        
        return (result.changes && result.changes.changes > 0) ? { ...updates, id } : null;
      } catch (error) {
        console.error(`Error updating ${collection}:`, error);
        throw error;
      }
    },
    
    remove: async function(collection, id) {
      try {
        const result = await sqlite.execute({
          database: 'defaultDB',
          statement: `DELETE FROM ${collection} WHERE id = ?`,
          values: [id]
        });
        
        return (result.changes && result.changes.changes > 0);
      } catch (error) {
        console.error(`Error removing from ${collection}:`, error);
        throw error;
      }
    },
    
    query: async function(collection, predicate) {
      try {
        const items = await this.getAll(collection);
        return items.filter(predicate);
      } catch (error) {
        console.error(`Error querying ${collection}:`, error);
        return [];
      }
    },
    
    // Helper functions
    calculateDistance: function(lat1, lon1, lat2, lon2) {
      // Implementation of distance calculation (same as WebSQL version)
      const R = 3963.0; // radius of Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return distance;
    },
    
    calculateSobrietyDays: function(sobrietyDate) {
      const sobDate = new Date(sobrietyDate);
      const today = new Date();
      const diff = today - sobDate;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    
    calculateSobrietyYears: function(sobrietyDate, decimalPlaces = 2) {
      const sobDate = new Date(sobrietyDate);
      const today = new Date();
      const diff = today - sobDate;
      const years = diff / (1000 * 60 * 60 * 24 * 365.25);
      return parseFloat(years.toFixed(decimalPlaces));
    },
    
    getPreference: async function(key) {
      try {
        console.log('Executing SQL: SELECT * FROM preferences WHERE id = ?');
        console.log('Parameters:', [key]);
        
        const result = await sqlite.query({
          database: 'defaultDB',
          statement: `SELECT * FROM preferences WHERE id = ?`,
          values: [key]
        });
        
        if (result.values && result.values.length > 0) {
          try {
            const value = JSON.parse(result.values[0].value);
            return value;
          } catch (e) {
            return result.values[0].value;
          }
        }
        return null;
      } catch (error) {
        console.error(`Error getting preference ${key}:`, error);
        return null;
      }
    },
    
    setPreference: async function(key, value) {
      try {
        const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const now = new Date().toISOString();
        
        // Check if preference exists
        const existsResult = await sqlite.query({
          database: 'defaultDB',
          statement: `SELECT * FROM preferences WHERE id = ?`,
          values: [key]
        });
        
        if (existsResult.values && existsResult.values.length > 0) {
          // Update existing preference
          console.log('Executing SQL: UPDATE preferences SET value = ?, updatedAt = ? WHERE id = ?');
          console.log('Parameters:', [jsonValue, now, key]);
          
          await sqlite.execute({
            database: 'defaultDB',
            statement: `UPDATE preferences SET value = ?, updatedAt = ? WHERE id = ?`,
            values: [jsonValue, now, key]
          });
          
          console.log(`Updated item in preferences with ID: ${key}`);
        } else {
          // Insert new preference
          console.log('Executing SQL: INSERT INTO preferences (id, value, createdAt, updatedAt) VALUES (?, ?, ?, ?)');
          console.log('Parameters:', [key, jsonValue, now, now]);
          
          await sqlite.execute({
            database: 'defaultDB',
            statement: `INSERT INTO preferences (id, value, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
            values: [key, jsonValue, now, now]
          });
          
          console.log(`Added item to preferences with ID: ${key}`);
        }
      } catch (error) {
        console.error(`Error setting preference ${key}:`, error);
        throw error;
      }
    },
    
    calculateSpiritualFitness: async function() {
      try {
        console.log('Calculating spiritual fitness with activities:', await this.getAll('activities'));
        const score = await this.calculateSpiritualFitnessWithTimeframe(30);
        console.log('Spiritual fitness score calculated:', score);
        return score;
      } catch (error) {
        console.error('Error using original calculation method:', error);
        console.warn('No spiritual fitness calculation methods available');
        // Default to 5 instead of 20
        return window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5;
      }
    },
    
    calculateSpiritualFitnessWithTimeframe: async function(timeframe = 30) {
      try {
        // Get activities from the last n days
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - timeframe);
        
        // Format dates to match SQLite format
        const todayStr = today.toISOString().split('T')[0];
        const pastDateStr = pastDate.toISOString().split('T')[0];
        
        // Get all activities
        const activities = await this.getAll('activities');
        
        // Check if we have any activities
        if (!activities || activities.length === 0) {
          console.log('No activities found in database');
          // Default to 5 instead of 20
          return window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5;
        }
        
        // Filter activities within the timeframe
        const filteredActivities = activities.filter(activity => {
          const activityDate = activity.date;
          return activityDate >= pastDateStr && activityDate <= todayStr;
        });
        
        console.log(`Found ${filteredActivities.length} activities in the ${timeframe}-day timeframe`);
        
        // Calculate metrics
        // 1. Days with at least one activity
        const activityDays = new Set();
        filteredActivities.forEach(activity => {
          activityDays.add(activity.date);
        });
        
        const daysWithActivities = activityDays.size;
        const daysPercentage = Math.round((daysWithActivities / timeframe) * 100);
        
        // 2. Base score from activity count
        const activityBase = Math.min(40, Math.ceil(filteredActivities.length / 3));
        
        // 3. Consistency bonus (up to 40 points)
        const consistencyPoints = Math.round((daysPercentage / 100) * 40);
        
        // 4. Variety bonus (up to 20 points)
        const activityTypes = new Set();
        filteredActivities.forEach(activity => {
          activityTypes.add(activity.type);
        });
        
        const varietyBonus = Math.min(20, activityTypes.size * 4);
        
        // Calculate final score (cap at 100)
        const finalScore = Math.min(100, activityBase + consistencyPoints + varietyBonus);
        
        console.log(`${timeframe}-day calculation details:`, {
          timeframe,
          daysWithActivities,
          daysPercentage,
          activityBase,
          consistencyPoints,
          varietyBonus,
          finalScore
        });
        
        return finalScore;
      } catch (error) {
        console.error('Error calculating spiritual fitness:', error);
        // Default to 5 instead of 20
        return window.DEFAULT_SPIRITUAL_FITNESS_SCORE || 5;
      }
    },
    
    // Database operations by entity
    userOperations: {
      // User-specific operations would go here
    },
    
    activityOperations: {
      // Activity-specific operations would go here
    },
    
    meetingOperations: {
      // Meeting-specific operations would go here
    },
    
    spiritualFitnessOperations: {
      calculateSpiritualFitness: function(timeframe = 30) {
        console.log('Using original Database.spiritualFitnessOperations with timeframe:', timeframe);
        return window.Database.calculateSpiritualFitnessWithTimeframe(timeframe);
      }
    },
    
    utils: {
      // Utility functions would go here
    }
  };
  
  console.log('Global db object created with these functions:', [
    'getAll', 'getById', 'add', 'update', 'remove', 'query',
    'calculateDistance', 'calculateSobrietyDays', 'calculateSobrietyYears',
    'getPreference', 'setPreference', 'calculateSpiritualFitness',
    'calculateSpiritualFitnessWithTimeframe', 'hasLocalStorageData', 'migrateFromLocalStorage'
  ]);
  
  // Add check for localStorage data
  window.Database.hasLocalStorageData = function() {
    return false; // Simplified for this implementation
  };
  
  // Add migration from localStorage
  window.Database.migrateFromLocalStorage = async function() {
    return false; // Simplified for this implementation
  };
  
  console.log('Global Database object created with these operations:', [
    'userOperations', 'activityOperations', 'meetingOperations',
    'spiritualFitnessOperations', 'utils'
  ]);
  
  // Initialize the database
  window.db = window.Database;
  console.log('SQLite database initialized successfully for Capacitor');
}

// Initialize the database on load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing database for native app with Capacitor...');
  initSQLiteDatabase();
});