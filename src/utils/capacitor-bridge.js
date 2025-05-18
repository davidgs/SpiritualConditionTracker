/**
 * Capacitor SQLite Bridge
 * 
 * This module provides a bridge between your application and Capacitor SQLite
 * that works with the current package versions.
 */

// Check if Capacitor and CapacitorSQLite are available
const checkCapacitorAvailability = () => {
  try {
    // First, check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Then check if Capacitor exists
    if (!window.Capacitor) {
      console.log('Capacitor not available, using fallback storage');
      return false;
    }
    
    // Check if the SQLite plugin is available
    if (!window.Capacitor.isPluginAvailable('CapacitorSQLite')) {
      console.log('CapacitorSQLite plugin not available, using fallback storage');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Capacitor availability:', error);
    return false;
  }
};

// Create a SQLite connection with Capacitor
const initCapacitorSQLite = async (dbName = 'spiritual-tracker') => {
  try {
    if (!checkCapacitorAvailability()) {
      return null;
    }
    
    // Get the plugin reference
    const { CapacitorSQLite } = window.Capacitor.Plugins;
    
    // Create the connection
    await CapacitorSQLite.createConnection({
      database: dbName,
      encrypted: false,
      mode: 'no-encryption',
      version: 1
    });
    
    // Open the connection
    await CapacitorSQLite.open({ database: dbName });
    
    return {
      database: dbName,
      plugin: CapacitorSQLite,
      
      async execute(statement, values = []) {
        try {
          return await CapacitorSQLite.execute({
            database: dbName,
            statement,
            values
          });
        } catch (error) {
          console.error('Error executing SQLite statement:', error);
          throw error;
        }
      },
      
      async executeSet(statements = []) {
        try {
          const formattedStatements = statements.map(stmt => ({
            statement: stmt.statement,
            values: stmt.values || []
          }));
          
          return await CapacitorSQLite.executeSet({
            database: dbName,
            statements: { statements: formattedStatements }
          });
        } catch (error) {
          console.error('Error executing SQLite statement set:', error);
          throw error;
        }
      },
      
      async query(statement, values = []) {
        try {
          return await CapacitorSQLite.query({
            database: dbName,
            statement,
            values
          });
        } catch (error) {
          console.error('Error querying SQLite:', error);
          throw error;
        }
      },
      
      async close() {
        try {
          return await CapacitorSQLite.close({ database: dbName });
        } catch (error) {
          console.error('Error closing SQLite connection:', error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Error initializing CapacitorSQLite:', error);
    throw error;
  }
};

// Create tables needed for our application
const setupDatabase = async (sqlite) => {
  if (!sqlite) return false;
  
  try {
    // Create tables with a single transaction for better performance
    await sqlite.executeSet([
      {
        statement: `
          CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            duration INTEGER,
            notes TEXT,
            createdAt TEXT
          )
        `
      },
      {
        statement: `
          CREATE TABLE IF NOT EXISTS meetings (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            location TEXT,
            type TEXT NOT NULL,
            notes TEXT,
            shared BOOLEAN,
            createdAt TEXT
          )
        `
      },
      {
        statement: `
          CREATE TABLE IF NOT EXISTS profile (
            id TEXT PRIMARY KEY,
            name TEXT,
            sobrietyDate TEXT,
            homeGroup TEXT,
            sponsor TEXT,
            sponsorPhone TEXT,
            lastUpdated TEXT
          )
        `
      },
      {
        statement: `
          CREATE TABLE IF NOT EXISTS preferences (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `
      }
    ]);
    
    return true;
  } catch (error) {
    console.error('Error setting up database tables:', error);
    return false;
  }
};

// Initialize database and prepare for use
const initDatabase = async () => {
  try {
    let sqlite = null;
    
    // Attempt to initialize Capacitor SQLite
    if (checkCapacitorAvailability()) {
      sqlite = await initCapacitorSQLite();
      
      if (sqlite) {
        console.log('Using Capacitor SQLite for storage');
        
        // Setup database schema
        const success = await setupDatabase(sqlite);
        
        if (success) {
          console.log('Capacitor SQLite database initialized successfully');
          return sqlite;
        }
      }
    }
    
    // If we reach here, Capacitor SQLite initialization failed
    console.log('Falling back to browser storage');
    return null;
  } catch (error) {
    console.error('Database initialization error:', error);
    return null;
  }
};

export {
  initDatabase,
  checkCapacitorAvailability
};