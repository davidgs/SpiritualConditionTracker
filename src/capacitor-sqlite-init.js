/**
 * Capacitor SQLite Initialization
 * This file properly initializes SQLite for use with Capacitor
 */

// Initialize SQLite for Capacitor
async function initCapacitorSQLite() {
  try {
    console.log('Initializing Capacitor SQLite...');
    
    // Check if we're running in a Capacitor environment
    const isCapacitor = typeof window !== 'undefined' && 
                        window.Capacitor !== undefined && 
                        window.Capacitor.isPluginAvailable !== undefined;
    
    if (!isCapacitor) {
      console.log('Not running in Capacitor environment, using WebSQL fallback');
      return setupWebSQLFallback();
    }
    
    // Check if SQLite plugin is available
    if (!window.Capacitor.isPluginAvailable('CapacitorSQLite')) {
      console.log('CapacitorSQLite plugin not available, using WebSQL fallback');
      return setupWebSQLFallback();
    }
    
    // Get the SQLite plugin
    const sqlite = window.Capacitor.Plugins.CapacitorSQLite;
    console.log('Found CapacitorSQLite plugin');
    
    // Set up a connection
    const db = await sqlite.createConnection({ 
      database: 'spiritual_condition_tracker', 
      encrypted: false,
      mode: 'no-encryption',
      version: 1
    });
    
    // Open the connection
    await sqlite.open({ database: 'spiritual_condition_tracker' });
    
    // Set up tables if needed
    await setupTables(sqlite);
    
    // Make the connection available globally
    window.sqliteConnection = sqlite;
    
    console.log('Capacitor SQLite initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Capacitor SQLite:', error);
    console.log('Falling back to WebSQL implementation');
    return setupWebSQLFallback();
  }
}

// Set up WebSQL as a fallback
function setupWebSQLFallback() {
  console.log('Setting up WebSQL fallback');
  
  // Create database
  const db = window.openDatabase(
    'spiritual_condition_tracker',
    '1.0',
    'Spiritual Condition Tracker Database',
    5 * 1024 * 1024 // 5MB
  );
  
  // Set up basic structure
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
    console.error('Error setting up database schema:', error);
  }, function() {
    console.log('Database schema setup successfully');
  });
  
  // Store the database instance globally
  window.sqliteConnection = db;
  
  return true;
}

// Set up tables for Capacitor SQLite
async function setupTables(sqlite) {
  // Define table creation statements
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
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
    
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      duration INTEGER,
      date TEXT,
      notes TEXT,
      meeting TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    
    `CREATE TABLE IF NOT EXISTS meetings (
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
    
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT,
      recipientId TEXT,
      content TEXT,
      encrypted INTEGER,
      timestamp TEXT,
      read INTEGER
    )`,
    
    `CREATE TABLE IF NOT EXISTS preferences (
      id TEXT PRIMARY KEY,
      value TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`
  ];
  
  // Execute each statement
  for (const statement of statements) {
    await sqlite.execute({
      database: 'spiritual_condition_tracker',
      statement,
      values: []
    });
  }
  
  console.log('Tables created successfully');
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Initialize SQLite after a small delay to ensure Capacitor is ready
    setTimeout(() => {
      initCapacitorSQLite().then(() => {
        console.log('SQLite initialization complete');
      }).catch(err => {
        console.error('SQLite initialization failed:', err);
      });
    }, 500);
  });
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initCapacitorSQLite
  };
}