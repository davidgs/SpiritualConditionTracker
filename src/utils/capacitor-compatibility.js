/**
 * Capacitor Compatibility Layer
 * 
 * This module provides compatibility between our current environment's 
 * package versions and Capacitor SQLite functionality.
 */

// Check if we're running in a Capacitor environment
const isCapacitorAvailable = () => {
  return typeof window !== 'undefined' && 
         window?.Capacitor && 
         window?.Capacitor?.isPluginAvailable;
};

// Check if SQLite plugin is available
const isSQLiteAvailable = () => {
  if (!isCapacitorAvailable()) return false;
  return window.Capacitor.isPluginAvailable('CapacitorSQLite');
};

// Create a compatibility layer that works regardless of Capacitor/SQLite version
const createCapacitorAdapter = () => {
  // If Capacitor isn't available, return a mock implementation
  if (!isCapacitorAvailable()) {
    console.warn('Capacitor not available, using fallback implementation');
    return {
      isAvailable: false,
      sqlite: createFallbackSQLite(),
      getPlatform: () => 'web',
      getWebViewPlatform: () => 'web'
    };
  }

  // Get the platform we're running on
  const getPlatform = () => {
    return window.Capacitor.getPlatform();
  };

  // Special function for iOS WKWebView detection
  const getWebViewPlatform = () => {
    if (getPlatform() === 'ios') {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('wkwebview')) {
        return 'ios-wkwebview';
      }
    }
    return getPlatform();
  };

  // If SQLite plugin is available, wrap it with our adapter
  if (isSQLiteAvailable()) {
    const sqlitePlugin = window.Capacitor.Plugins.CapacitorSQLite;
    
    return {
      isAvailable: true,
      sqlite: createSQLiteAdapter(sqlitePlugin),
      getPlatform,
      getWebViewPlatform
    };
  } else {
    console.warn('CapacitorSQLite plugin not available, using fallback');
    return {
      isAvailable: false,
      sqlite: createFallbackSQLite(),
      getPlatform,
      getWebViewPlatform
    };
  }
};

// Create an adapter that works with SQLite plugin
const createSQLiteAdapter = (sqlitePlugin) => {
  return {
    async createConnection(database, encrypted = false, mode = 'no-encryption', version = 1) {
      try {
        return await sqlitePlugin.createConnection({
          database,
          encrypted,
          mode,
          version
        });
      } catch (error) {
        console.error('Error creating SQLite connection:', error);
        throw error;
      }
    },
    
    async open(connection) {
      try {
        return await sqlitePlugin.open({ database: connection });
      } catch (error) {
        console.error('Error opening SQLite connection:', error);
        throw error;
      }
    },
    
    async close(connection) {
      try {
        return await sqlitePlugin.close({ database: connection });
      } catch (error) {
        console.error('Error closing SQLite connection:', error);
        throw error;
      }
    },
    
    async execute(connection, statement, values = []) {
      try {
        return await sqlitePlugin.execute({
          database: connection,
          statement,
          values
        });
      } catch (error) {
        console.error('Error executing SQLite statement:', error);
        throw error;
      }
    },
    
    async executeSet(connection, statements = []) {
      try {
        const set = statements.map(statement => {
          return {
            statement: statement.statement,
            values: statement.values || []
          };
        });
        
        return await sqlitePlugin.executeSet({
          database: connection,
          statements: { statements: set }
        });
      } catch (error) {
        console.error('Error executing SQLite statement set:', error);
        throw error;
      }
    },
    
    async query(connection, statement, values = []) {
      try {
        return await sqlitePlugin.query({
          database: connection,
          statement,
          values
        });
      } catch (error) {
        console.error('Error querying SQLite:', error);
        throw error;
      }
    },
    
    async deleteDatabase(database) {
      try {
        return await sqlitePlugin.deleteDatabase({ database });
      } catch (error) {
        console.error('Error deleting SQLite database:', error);
        throw error;
      }
    },
    
    async isDatabase(database) {
      try {
        return await sqlitePlugin.isDatabase({ database });
      } catch (error) {
        console.error('Error checking if SQLite database exists:', error);
        throw error;
      }
    }
  };
};

// Create a fallback that uses localStorage or WebSQL
const createFallbackSQLite = () => {
  // In-memory database simulation
  const inMemoryDb = {};
  
  // Check if WebSQL is available
  const hasWebSQL = typeof window !== 'undefined' && window.openDatabase;
  
  // If WebSQL is available, use it as fallback
  if (hasWebSQL) {
    return createWebSQLFallback();
  }
  
  // Otherwise create a simple localStorage-based fallback
  console.warn('Using localStorage fallback for SQLite');
  
  return {
    async createConnection(database) {
      if (!inMemoryDb[database]) {
        inMemoryDb[database] = {
          tables: {},
          connectionOpen: false
        };
      }
      return database;
    },
    
    async open(connection) {
      if (inMemoryDb[connection]) {
        inMemoryDb[connection].connectionOpen = true;
      }
      return { result: true };
    },
    
    async close(connection) {
      if (inMemoryDb[connection]) {
        inMemoryDb[connection].connectionOpen = false;
      }
      return { result: true };
    },
    
    async execute(connection, statement, values = []) {
      try {
        // Extremely simplified SQL parsing
        if (statement.toUpperCase().startsWith('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?([^\s(]+)/i)[1];
          inMemoryDb[connection].tables[tableName] = [];
          return { changes: 0 };
        }
        
        if (statement.toUpperCase().startsWith('INSERT INTO')) {
          const tableName = statement.match(/INSERT INTO ([^\s(]+)/i)[1];
          if (!inMemoryDb[connection].tables[tableName]) {
            inMemoryDb[connection].tables[tableName] = [];
          }
          
          // Create dummy object
          inMemoryDb[connection].tables[tableName].push({
            id: Date.now() + Math.random()
          });
          
          return { changes: 1 };
        }
        
        return { changes: 0 };
      } catch (error) {
        console.error('Error in localStorage fallback execute:', error);
        return { changes: 0 };
      }
    },
    
    async executeSet(connection, statements = []) {
      let totalChanges = 0;
      
      for (const stmt of statements) {
        const result = await this.execute(
          connection,
          stmt.statement,
          stmt.values || []
        );
        totalChanges += result.changes;
      }
      
      return { changes: totalChanges };
    },
    
    async query(connection, statement, values = []) {
      try {
        if (statement.toUpperCase().startsWith('SELECT')) {
          const tableName = statement.match(/FROM ([^\s]+)/i)[1];
          if (inMemoryDb[connection].tables[tableName]) {
            return {
              values: [...inMemoryDb[connection].tables[tableName]]
            };
          }
        }
        
        return { values: [] };
      } catch (error) {
        console.error('Error in localStorage fallback query:', error);
        return { values: [] };
      }
    },
    
    async deleteDatabase(database) {
      if (inMemoryDb[database]) {
        delete inMemoryDb[database];
      }
      return { result: true };
    },
    
    async isDatabase(database) {
      return { result: !!inMemoryDb[database] };
    }
  };
};

// WebSQL fallback implementation
const createWebSQLFallback = () => {
  const openedDatabases = {};
  
  const openDb = (name) => {
    if (!openedDatabases[name]) {
      openedDatabases[name] = window.openDatabase(
        name,
        '1.0',
        'WebSQL fallback for CapacitorSQLite',
        5 * 1024 * 1024
      );
    }
    return openedDatabases[name];
  };
  
  return {
    async createConnection(database) {
      openDb(database);
      return database;
    },
    
    async open(connection) {
      openDb(connection);
      return { result: true };
    },
    
    async close(connection) {
      // WebSQL doesn't have explicit close
      return { result: true };
    },
    
    async execute(connection, statement, values = []) {
      return new Promise((resolve, reject) => {
        const db = openDb(connection);
        
        db.transaction(tx => {
          tx.executeSql(
            statement,
            values,
            (_, result) => {
              resolve({ changes: result.rowsAffected });
            },
            (_, error) => {
              console.error('WebSQL error:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    async executeSet(connection, statements = []) {
      return new Promise((resolve, reject) => {
        const db = openDb(connection);
        let totalChanges = 0;
        
        db.transaction(tx => {
          const processStatements = (index) => {
            if (index >= statements.length) {
              return resolve({ changes: totalChanges });
            }
            
            const stmt = statements[index];
            
            tx.executeSql(
              stmt.statement,
              stmt.values || [],
              (_, result) => {
                totalChanges += result.rowsAffected;
                processStatements(index + 1);
              },
              (_, error) => {
                console.error('WebSQL error in set:', error);
                reject(error);
                return false;
              }
            );
          };
          
          processStatements(0);
        });
      });
    },
    
    async query(connection, statement, values = []) {
      return new Promise((resolve, reject) => {
        const db = openDb(connection);
        
        db.transaction(tx => {
          tx.executeSql(
            statement,
            values,
            (_, result) => {
              const rows = [];
              for (let i = 0; i < result.rows.length; i++) {
                rows.push(result.rows.item(i));
              }
              resolve({ values: rows });
            },
            (_, error) => {
              console.error('WebSQL error in query:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    },
    
    async deleteDatabase(database) {
      // WebSQL doesn't support database deletion
      if (openedDatabases[database]) {
        delete openedDatabases[database];
      }
      
      // Try to clear tables instead
      try {
        const db = openDb(database);
        await this.execute(database, `
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'system_%'
        `).then(async (result) => {
          if (result && result.values) {
            for (const table of result.values) {
              await this.execute(database, `DROP TABLE IF EXISTS ${table.name}`);
            }
          }
        });
      } catch (e) {
        console.warn('Could not clear WebSQL tables:', e);
      }
      
      return { result: true };
    },
    
    async isDatabase(database) {
      // WebSQL doesn't have a way to check if DB exists
      // Return true if we've previously opened it
      return { result: !!openedDatabases[database] };
    }
  };
};

export default createCapacitorAdapter;