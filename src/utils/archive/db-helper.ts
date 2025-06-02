/**
 * SQLite Database Helper for Capacitor
 * Specifically designed to address the "near SELECT: syntax error" issues
 */

// Default database name
const DB_NAME = 'spiritualTracker.db';

// Class for database operations
class CapacitorSQLiteDB {
  private isInitialized: boolean;
  private plugin: any;
  private connection: any;

  constructor() {
    this.isInitialized = false;
    this.plugin = null;
    this.connection = null;
  }

  /**
   * Initialize the database
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      console.log('[db-helper] Initializing SQLite database...');
      
      // Check if Capacitor is available
      if (!window.Capacitor || !window.Capacitor.Plugins) {
        throw new Error('Capacitor or its plugins are not available');
      }
      
      // Get the SQLite plugin
      this.plugin = window.Capacitor.Plugins.CapacitorSQLite;
      
      if (!this.plugin) {
        throw new Error('CapacitorSQLite plugin is not available');
      }
      
      // Create connection to database
      await this.plugin.createConnection({
        database: DB_NAME,
        encrypted: false,
        mode: 'no-encryption'
      });
      
      // Open database
      await this.plugin.open({ database: DB_NAME });
      
      // Create database schema
      await this.createSchema();
      
      // Setup global access
      window.db = this;
      window.dbInitialized = true;
      this.isInitialized = true;
      
      console.log('[db-helper] Database initialized successfully');
      return true;
    } catch (error) {
      console.error('[db-helper] Error initializing database:', error);
      return false;
    }
  }
  
  /**
   * Create database schema (tables)
   */
  async createSchema() {
    console.log('[db-helper] Creating database schema...');
    
    // Users table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        lastName TEXT,
        phoneNumber TEXT,
        email TEXT,
        sobrietyDate TEXT,
        homeGroups TEXT,
        sponsor_name TEXT,
        sponsor_lastName TEXT,
        sponsor_phone TEXT,
        sponsor_email TEXT,
        sponsor_sobrietyDate TEXT,
        sponsor_notes TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Activities table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        type TEXT,
        duration INTEGER,
        date TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Meetings table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        name TEXT,
        days TEXT,
        time TEXT,
        address TEXT,
        notes TEXT,
        latitude REAL,
        longitude REAL,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Sponsor contacts table - without NOT NULL constraints
    await this.execute(`
      CREATE TABLE IF NOT EXISTS sponsor_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        date TEXT,
        type TEXT,
        note TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);
    
    // Sponsor contact details table - without NOT NULL constraints
    await this.execute(`
      CREATE TABLE IF NOT EXISTS sponsor_contact_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contactId INTEGER,
        actionItem TEXT,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        dueDate TEXT,
        type TEXT,
        createdAt TEXT
      )
    `);
    
    console.log('[db-helper] Database schema created successfully');
  }
  
  /**
   * Execute a SQL statement (CREATE, INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL statement
   * @param {Array} params - Parameters for the statement
   * @returns {Promise<Object>} Query result
   */
  async execute(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('[db-helper] Executing:', sql);
      if (params.length > 0) {
        console.log('[db-helper] With params:', JSON.stringify(params));
      }
      
      const result = await this.plugin.execute({
        database: DB_NAME,
        statements: sql,
        values: params
      });
      
      return result;
    } catch (error) {
      console.error('[db-helper] Error executing SQL:', error);
      throw error;
    }
  }
  
  /**
   * Query the database
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('[db-helper] Querying:', sql);
      if (params.length > 0) {
        console.log('[db-helper] With params:', JSON.stringify(params));
      }
      
      const result = await this.plugin.query({
        database: DB_NAME,
        statement: sql,
        values: params
      });
      
      return result.values || [];
    } catch (error) {
      console.error('[db-helper] Error querying:', error);
      return [];
    }
  }
  
  /**
   * Get all items from a collection
   * @param {string} collection - Collection name (table)
   * @returns {Promise<Array>} All items in the collection
   */
  async getAll(collection) {
    return await this.query(`SELECT * FROM ${collection}`);
  }
  
  /**
   * Get item by ID
   * @param {string} collection - Collection name (table)
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Found item or null
   */
  async getById(collection, id) {
    const results = await this.query(
      `SELECT * FROM ${collection} WHERE id = ?`,
      [id]
    );
    
    return results.length > 0 ? results[0] : null;
  }
  
  /**
   * Add item to collection
   * @param {string} collection - Collection name (table)
   * @param {Object} item - Item to add
   * @returns {Promise<Object>} Added item
   */
  async add(collection, item) {
    // Generate ID if not provided
    if (!item.id) {
      item.id = `${collection}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    // Add timestamps
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    if (!item.updatedAt) {
      item.updatedAt = new Date().toISOString();
    }
    
    // Build SQL statement dynamically
    const keys = Object.keys(item);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    const values = keys.map(key => item[key]);
    
    await this.execute(
      `INSERT INTO ${collection} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    return item;
  }
  
  /**
   * Update item in collection
   * @param {string} collection - Collection name (table)
   * @param {string} id - Item ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated item
   */
  async update(collection, id, updates) {
    // Add updated timestamp
    updates.updatedAt = new Date().toISOString();
    
    // Build SQL statement dynamically
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates);
    values.push(id); // Add ID for WHERE clause
    
    await this.execute(
      `UPDATE ${collection} SET ${setClause} WHERE id = ?`,
      values
    );
    
    // Return updated item
    return { id, ...updates };
  }
  
  /**
   * Calculate spiritual fitness score
   * @returns {Promise<number>} Fitness score
   */
  async calculateSpiritualFitness() {
    try {
      const activities = await this.getAll('activities');
      
      // Default score
      let score = 5;
      
      if (activities.length > 0) {
        // Define time period (30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        // Filter for recent activities
        const recentActivities = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate >= thirtyDaysAgo && activityDate <= now;
        });
        
        console.log('Found', recentActivities.length, 'activities in the last 30 days');
        
        // Add points based on activity count (2 points per activity, max 40)
        const activityPoints = Math.min(40, recentActivities.length * 2);
        
        // Track unique days with activities for consistency calculation
        const activityDays = new Set();
        recentActivities.forEach(activity => {
          if (activity.date) {
            const dayKey = new Date(activity.date).toISOString().split('T')[0];
            activityDays.add(dayKey);
          }
        });
        
        const daysWithActivities = activityDays.size;
        
        // Calculate consistency points (up to 40 points)
        const consistencyPercentage = daysWithActivities / 30;
        const consistencyPoints = Math.round(consistencyPercentage * 40);
        
        // Calculate final score (capped at 100)
        score = Math.min(100, score + activityPoints + consistencyPoints);
        
        console.log('Spiritual fitness calculation details:', {
          baseScore: 5,
          activityPoints,
          consistencyPoints,
          finalScore: score
        });
      }
      
      return score;
    } catch (error) {
      console.error('Error calculating spiritual fitness:', error);
      return 5; // Default score on error
    }
  }
  
  /**
   * Calculate spiritual fitness with timeframe
   * @param {number} days - Number of days to consider
   * @returns {Promise<number>} Fitness score
   */
  async calculateSpiritualFitnessWithTimeframe(days = 30) {
    return await this.calculateSpiritualFitness();
  }
}

// Export instance
const db = new CapacitorSQLiteDB();
export default db;