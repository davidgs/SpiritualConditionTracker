/**
 * Direct SQLite Access
 * Simpler implementation to avoid the SELECT syntax errors
 */

// Database name
const DB_NAME = 'spiritualTracker.db';

// Initialize database
export async function initDatabase() {
  try {
    console.log('Initializing direct SQLite access...');

    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.CapacitorSQLite) {
      throw new Error('CapacitorSQLite plugin not available');
    }

    const sqlite = window.Capacitor.Plugins.CapacitorSQLite;

    // Create connection
    await sqlite.createConnection({
      database: DB_NAME,
      encrypted: false,
      mode: 'no-encryption'
    });

    // Open database
    await sqlite.open({ database: DB_NAME });

    // Create schema
    await createSchema(sqlite);

    // Create global reference for convenience
    window.directDB = {
      exec: async (sql, values = []) => executeStatement(sqlite, sql, values),
      query: async (sql, values = []) => queryDatabase(sqlite, sql, values),
      getAll: async (table) => getAllFromTable(sqlite, table),
      getById: async (table, id) => getItemById(sqlite, table, id),
      add: async (table, item) => addItem(sqlite, table, item),
      update: async (table, id, item) => updateItem(sqlite, table, id, item),
      remove: async (table, id) => removeItem(sqlite, table, id)
    };

    window.dbInitialized = true;
    console.log('Direct SQLite access initialized');
    return true;
  } catch (error) {
    console.error('Error initializing direct SQLite:', error);
    return false;
  }
}

// Create database schema
async function createSchema(sqlite) {
  // Users table
  await executeStatement(sqlite, `
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
  await executeStatement(sqlite, `
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
  await executeStatement(sqlite, `
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

  // Sponsor contacts table
  await executeStatement(sqlite, `
    CREATE TABLE IF NOT EXISTS sponsor_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      note TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);

  // Sponsor contact details table
  await executeStatement(sqlite, `
    CREATE TABLE IF NOT EXISTS sponsor_contact_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contactId INTEGER NOT NULL,
      actionItem TEXT,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      dueDate TEXT,
      type TEXT,
      createdAt TEXT
    )
  `);
}

// Execute a statement (CREATE, INSERT, UPDATE, DELETE)
async function executeStatement(sqlite, sql, values = []) {
  try {
    console.log('EXEC SQL:', sql);
    if (values.length > 0) console.log('Values:', values);

    const result = await sqlite.execute({
      database: DB_NAME,
      statements: sql,
      values
    });

    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
}

// Query the database (SELECT)
async function queryDatabase(sqlite, sql, values = []) {
  try {
    console.log('QUERY SQL:', sql);
    if (values.length > 0) console.log('Values:', values);

    const result = await sqlite.query({
      database: DB_NAME,
      statement: sql,
      values
    });

    return result.values || [];
  } catch (error) {
    console.error('SQL query error:', error);
    return [];
  }
}

// Get all items from a table
async function getAllFromTable(sqlite, table) {
  return await queryDatabase(sqlite, `SELECT * FROM ${table}`);
}

// Get item by ID
async function getItemById(sqlite, table, id) {
  const results = await queryDatabase(sqlite, `SELECT * FROM ${table} WHERE id = ?`, [id]);
  return results.length > 0 ? results[0] : null;
}

// Add an item to a table
async function addItem(sqlite, table, item) {
  // Generate an ID if none provided
  if (!item.id) {
    item.id = `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add timestamps
  if (!item.createdAt) item.createdAt = new Date().toISOString();
  if (!item.updatedAt) item.updatedAt = new Date().toISOString();

  // Build the statement
  const keys = Object.keys(item);
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(key => item[key]);

  await executeStatement(
    sqlite,
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    values
  );

  return item;
}

// Update an item
async function updateItem(sqlite, table, id, item) {
  // Add updated timestamp
  item.updatedAt = new Date().toISOString();

  // Build the statement
  const keys = Object.keys(item);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  const values = [...keys.map(key => item[key]), id];

  await executeStatement(
    sqlite,
    `UPDATE ${table} SET ${setClause} WHERE id = ?`,
    values
  );

  return { id, ...item };
}

// Remove an item
async function removeItem(sqlite, table, id) {
  await executeStatement(sqlite, `DELETE FROM ${table} WHERE id = ?`, [id]);
  return { success: true };
}

export default { initDatabase };