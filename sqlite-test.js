/**
 * Simple diagnostic tool to test SQLite functionality directly
 * This will help determine why we're having constraint failures
 */

console.log('== SQLite Diagnostic Test Tool ==');

// Check if we have Capacitor available
if (!window.Capacitor) {
  console.error('Error: Capacitor not available in this environment');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Capacitor not available</div>';
  throw new Error('Capacitor not available');
}

// Get platform info
const platform = window.Capacitor.getPlatform();
console.log(`Platform detected: ${platform}`);

// Check for SQLite plugin
const sqlitePlugin = window.Capacitor?.Plugins?.CapacitorSQLite;
if (!sqlitePlugin) {
  console.error('Error: CapacitorSQLite plugin not available');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: CapacitorSQLite plugin not available</div>';
  throw new Error('CapacitorSQLite plugin not available');
}

console.log('CapacitorSQLite plugin found');

// Database name used throughout app
const DB_NAME = 'spiritualTracker.db';

// Function to create a fresh test table
async function createTestTable() {
  try {
    // First make sure we have a connection
    await sqlitePlugin.createConnection({
      database: DB_NAME,
      encrypted: false,
      mode: 'no-encryption'
    });
    
    // Open the database
    await sqlitePlugin.open({ database: DB_NAME });
    
    console.log('Connected to database successfully');
    
    // Drop test table if exists
    await sqlitePlugin.execute({
      database: DB_NAME,
      statements: 'DROP TABLE IF EXISTS test_activities'
    });
    
    console.log('Dropped existing test table');
    
    // Create a simple test table with just id and type
    await sqlitePlugin.execute({
      database: DB_NAME,
      statements: `
        CREATE TABLE IF NOT EXISTS test_activities (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL
        )
      `
    });
    
    console.log('Created simple test table with NOT NULL constraint');
    
    return true;
  } catch (error) {
    console.error('Error creating test table:', error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error.message || JSON.stringify(error)}</div>`;
    return false;
  }
}

// Function to try inserting a record
async function testInsert() {
  try {
    // Insert with id and type specified
    const id = 'test_' + Date.now();
    const type = 'prayer';
    
    // First attempt: use parameter binding
    try {
      await sqlitePlugin.execute({
        database: DB_NAME,
        statements: 'INSERT INTO test_activities (id, type) VALUES (?, ?)',
        values: [id, type]
      });
      
      console.log('✅ Insert test successful using parameter binding!');
      
      // Print all records
      const result = await sqlitePlugin.query({
        database: DB_NAME,
        statement: 'SELECT * FROM test_activities',
        values: []
      });
      
      console.log('Records in test table:', result.values);
      document.body.innerHTML += `<div style="color: green; padding: 20px;">Successfully inserted record with type: ${type}</div>`;
      
      return true;
    } catch (bindingError) {
      console.error('Error with parameter binding insert:', bindingError);
      
      // Second attempt: try direct value insertion
      try {
        await sqlitePlugin.execute({
          database: DB_NAME,
          statements: `INSERT INTO test_activities (id, type) VALUES ('${id}_2', 'prayer')`
        });
        
        console.log('✅ Insert test successful using direct values!');
        return true;
      } catch (directError) {
        console.error('Error with direct value insert:', directError);
        document.body.innerHTML += `<div style="color: red; padding: 20px;">Both insert methods failed. See console for details.</div>`;
        return false;
      }
    }
  } catch (error) {
    console.error('Error in test insert:', error);
    document.body.innerHTML += `<div style="color: red; padding: 20px;">Error in test insert: ${error.message || JSON.stringify(error)}</div>`;
    return false;
  }
}

// Main test function
async function runDiagnostics() {
  document.body.innerHTML = '<h1>SQLite Test Tool</h1><div id="results"></div>';
  
  try {
    const tableCreated = await createTestTable();
    if (tableCreated) {
      const insertWorked = await testInsert();
      
      if (insertWorked) {
        document.body.innerHTML += `
          <div style="margin-top: 20px; padding: 10px; background: #e6ffe6; border: 1px solid green;">
            <h3>Diagnostics complete!</h3>
            <p>The test was successful, which means the SQLite plugin can insert records properly.</p>
            <p>The problem in the app might be related to how values are being passed or how the schema is defined.</p>
          </div>
        `;
      } else {
        document.body.innerHTML += `
          <div style="margin-top: 20px; padding: 10px; background: #ffe6e6; border: 1px solid red;">
            <h3>Insert Test Failed</h3>
            <p>There appears to be a fundamental issue with the SQLite plugin on this platform.</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error running diagnostics:', error);
    document.body.innerHTML += `
      <div style="margin-top: 20px; padding: 10px; background: #ffe6e6; border: 1px solid red;">
        <h3>Diagnostic Error</h3>
        <p>${error.message || JSON.stringify(error)}</p>
      </div>
    `;
  }
}

// Run tests when page loads
window.onload = runDiagnostics;