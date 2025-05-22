import { Capacitor } from '@capacitor/core';

export class SQLiteService {
  constructor() {
    this.platform = Capacitor.getPlatform();
    this.sqlitePlugin = Capacitor.isPluginAvailable('CapacitorSQLite') ? 
                        Capacitor.Plugins.CapacitorSQLite : null;
    this.native = this.platform === 'ios' || this.platform === 'android';
    this.dbName = 'spiritual_condition_tracker';
    this.initialized = false;
  }

  async initialize() {
    if (!this.sqlitePlugin) {
      console.error('CapacitorSQLite plugin not available');
      return false;
    }

    try {
      console.log(`Opening database with Capacitor SQLite...`);
      
      // Create a connection
      await this.sqlitePlugin.createConnection({
        database: this.dbName,
        encrypted: false,
        mode: 'no-encryption',
        version: 1
      });
      
      // Open the database
      await this.sqlitePlugin.open({ database: this.dbName });
      
      // Create tables
      await this.createTables();
      
      this.initialized = true;
      console.log("SQLite database initialized successfully on", this.platform);
      return true;
    } catch (error) {
      console.error("Error initializing database:", error);
      return false;
    }
  }

  async createTables() {
    // Define your table creation statements
    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        sobrietyDate TEXT,
        spiritualFitness INTEGER DEFAULT 5
      )`,
      `CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        userId TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        location TEXT,
        userId TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sponsor_contacts (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        note TEXT,
        userId TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS sponsor_contact_details (
        id TEXT PRIMARY KEY,
        contactId TEXT NOT NULL,
        actionItem TEXT,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        dueDate TEXT,
        FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id)
      )`
    ];
    
    // Execute each statement
    for (const statement of statements) {
      await this.sqlitePlugin.execute({
        database: this.dbName,
        statement,
        values: []
      });
    }
  }

  // Add other methods for working with the database
  async query(statement, values = []) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const result = await this.sqlitePlugin.query({
        database: this.dbName,
        statement,
        values
      });
      return result.values || [];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
  
  async execute(statement, values = []) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      return await this.sqlitePlugin.execute({
        database: this.dbName,
        statement,
        values
      });
    } catch (error) {
      console.error('Error executing statement:', error);
      throw error;
    }
  }
  
  // Helper methods for common operations
  async getAll(tableName) {
    return this.query(`SELECT * FROM ${tableName}`);
  }
  
  async getById(tableName, id) {
    const result = await this.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    return result.length > 0 ? result[0] : null;
  }
  
  async insert(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    return this.execute(
      `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
      values
    );
  }
  
  async update(tableName, id, data) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    return this.execute(
      `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
      values
    );
  }
  
  async delete(tableName, id) {
    return this.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
  }
  
  async setPreference(key, value) {
    // Store value as a string
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Check if preference exists
    const existing = await this.query(`SELECT * FROM preferences WHERE key = ?`, [key]);
    
    if (existing.length > 0) {
      return this.execute(`UPDATE preferences SET value = ? WHERE key = ?`, [stringValue, key]);
    } else {
      return this.execute(`INSERT INTO preferences (key, value) VALUES (?, ?)`, [key, stringValue]);
    }
  }
  
  async getPreference(key, defaultValue = null) {
    try {
      const result = await this.query(`SELECT value FROM preferences WHERE key = ?`, [key]);
      
      if (result.length === 0) {
        return defaultValue;
      }
      
      const value = result[0].value;
      
      // Try to parse as JSON if it looks like a JSON object or array
      if ((value.startsWith('{') && value.endsWith('}')) || 
          (value.startsWith('[') && value.endsWith(']'))) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      
      return value;
    } catch (error) {
      console.error('Error getting preference:', error);
      return defaultValue;
    }
  }
}

// Create a singleton instance
const sqliteService = new SQLiteService();
export default sqliteService;