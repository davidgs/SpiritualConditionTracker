/**
 * Capacitor SQLite Helper
 * Simplified helper for working with SQLite in Capacitor
 */

// Constants
const DB_NAME = 'spiritualTracker.db';

// SQLite Helper Class
class CapacitorSQLiteHelper {
  constructor() {
    this.db = null;
    this.plugin = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the database
   */
  async initialize() {
    try {
      console.log('Initializing Capacitor SQLite helper...');
      
      // Check if Capacitor is available
      if (!window.Capacitor || !window.Capacitor.Plugins) {
        console.error('Capacitor not available');
        return false;
      }
      
      // Get the SQLite plugin
      this.plugin = window.Capacitor.Plugins.CapacitorSQLite;
      if (!this.plugin) {
        console.error('CapacitorSQLite plugin not available');
        return false;
      }
      
      // Create connection
      await this.plugin.createConnection({ database: DB_NAME });
      
      // Open database
      await this.plugin.open({ database: DB_NAME });
      
      // Create tables if they don't exist
      await this.createTables();
      
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      return false;
    }
  }
  
  /**
   * Create database tables
   */
  async createTables() {
    // Create users table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        lastName TEXT,
        phoneNumber TEXT,
        email TEXT,
        sobrietyDate TEXT,
        homeGroups TEXT,
        privacySettings TEXT,
        preferences TEXT,
        
        /* Sponsor info properly structured */
        sponsor_name TEXT,
        sponsor_lastName TEXT,
        sponsor_phone TEXT,
        sponsor_email TEXT,
        sponsor_sobrietyDate TEXT,
        sponsor_notes TEXT,
        
        messagingKeys TEXT,
        profileImageUri TEXT,
        language TEXT,
        dateFormat TEXT,
        timeFormat TEXT,
        distanceUnit TEXT,
        themePreference TEXT,
        notificationSettings TEXT,
        locationPermission INTEGER,
        contactPermission INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Create activities table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'prayer',
        duration INTEGER DEFAULT 0,
        date TEXT,
        notes TEXT DEFAULT '',
        literatureTitle TEXT DEFAULT '',
        literatureType TEXT DEFAULT '',
        meetingName TEXT DEFAULT '',
        callPerson TEXT DEFAULT '',
        servicePerson TEXT DEFAULT '',
        location TEXT DEFAULT '',
        mood TEXT DEFAULT '',
        gratitude TEXT DEFAULT '',
        steps TEXT DEFAULT '',
        sponsor TEXT DEFAULT '',
        attendees TEXT DEFAULT '',
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Create meetings table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'Unnamed Meeting',
        days TEXT,
        time TEXT,
        schedule TEXT,
        address TEXT,
        locationName TEXT,
        streetAddress TEXT,
        city TEXT,
        state TEXT,
        zipCode TEXT,
        country TEXT,
        online INTEGER,
        onlineUrl TEXT,
        phoneNumber TEXT,
        meetingCode TEXT,
        notes TEXT,
        latitude REAL,
        longitude REAL,
        types TEXT,
        format TEXT,
        accessibility TEXT,
        languages TEXT,
        isHomeGroup INTEGER,
        isTemporarilyClosed INTEGER,
        contactName TEXT,
        contactEmail TEXT,
        contactPhone TEXT,
        attendance TEXT,
        lastAttended TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        coordinates TEXT
      )
    `);
    
    // Create sponsor_contacts table - without NOT NULL constraints
    await this.execute(`
      CREATE TABLE IF NOT EXISTS sponsor_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        date TEXT,
        type TEXT,
        note TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Create sponsor_contact_details table - without NOT NULL constraints
    await this.execute(`
      CREATE TABLE IF NOT EXISTS sponsor_contact_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contactId INTEGER,
        actionItem TEXT,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        dueDate TEXT,
        type TEXT,
        text TEXT,
        createdAt TEXT
      )
    `);
    
    console.log('Database tables created successfully');
  }
  
  /**
   * Execute a non-query SQL statement (CREATE, INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL statement
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Result object
   */
  async execute(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('Executing SQL:', sql);
      if (params.length > 0) {
        console.log('With params:', params);
      }
      
      const result = await this.plugin.execute({
        database: DB_NAME,
        statements: sql,
        values: params
      });
      
      return result;
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }
  
  /**
   * Run a query that returns results
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} - Query results
   */
  async query(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('Running query:', sql);
      if (params.length > 0) {
        console.log('With params:', params);
      }
      
      const result = await this.plugin.query({
        database: DB_NAME,
        statement: sql,
        values: params
      });
      
      return result.values || [];
    } catch (error) {
      console.error('Error running query:', error);
      return [];
    }
  }
  
  /**
   * Insert data into a table
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} - Result object
   */
  async insert(table, data) {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      
      return await this.execute(sql, values);
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Update data in a table
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Result object
   */
  async update(table, id, data) {
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      
      // Add ID to values
      values.push(id);
      
      const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
      
      return await this.execute(sql, values);
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a record from a table
   * @param {string} table - Table name
   * @param {number|string} id - Record ID
   * @returns {Promise<Object>} - Result object
   */
  async delete(table, id) {
    try {
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      return await this.execute(sql, [id]);
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Find records by a field value
   * @param {string} table - Table name
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise<Array>} - Query results
   */
  async findBy(table, field, value) {
    try {
      const sql = `SELECT * FROM ${table} WHERE ${field} = ?`;
      return await this.query(sql, [value]);
    } catch (error) {
      console.error(`Error finding records in ${table}:`, error);
      return [];
    }
  }
  
  /**
   * Find all records in a table
   * @param {string} table - Table name
   * @returns {Promise<Array>} - Query results
   */
  async findAll(table) {
    try {
      const sql = `SELECT * FROM ${table}`;
      return await this.query(sql);
    } catch (error) {
      console.error(`Error finding all records in ${table}:`, error);
      return [];
    }
  }
}

// Create singleton instance
const sqliteHelper = new CapacitorSQLiteHelper();

// Export the helper
export default sqliteHelper;