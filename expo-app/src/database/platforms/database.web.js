/**
 * Web-specific database implementation using IndexedDB with localStorage fallback
 */

let db = null;
const DB_NAME = 'spiritual_condition_db';
const DB_VERSION = 1;
let isUsingLocalStorage = false; // Track if we're using localStorage fallback

// Handle localStorage queries directly
const handleLocalStorageQuery = (query, params, resolve, reject) => {
  try {
    // Parse the SQL query to determine operation
    const { operation, tableName, whereClause } = parseSQL(query);
    
    // Replace parameter placeholders
    let processedQuery = query;
    if (params.length > 0) {
      if (query.includes('?')) {
        params.forEach(param => {
          processedQuery = processedQuery.replace('?', typeof param === 'string' ? `'${param}'` : param);
        });
      } else {
        params.forEach((param, index) => {
          const paramPlaceholder = `$${index + 1}`;
          processedQuery = processedQuery.replace(
            paramPlaceholder, 
            typeof param === 'string' ? `'${param}'` : param
          );
        });
      }
    }
    
    switch(operation) {
      case 'createTable':
        // For localStorage, we just ensure the key exists
        const key = `db_${tableName}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([]));
        }
        resolve({ rowsAffected: 0 });
        break;
        
      case 'insert':
        try {
          // Extract column names and values from the query
          const columnsMatch = processedQuery.match(/\(([^)]+)\) values\s*\(([^)]+)\)/i);
          
          if (!columnsMatch) {
            console.error('Could not parse INSERT statement:', processedQuery);
            resolve({ rowsAffected: 0, insertId: null });
            return;
          }
          
          const columns = columnsMatch[1].split(',').map(col => col.trim());
          const values = columnsMatch[2].split(',').map(val => {
            val = val.trim();
            // Remove quotes from strings
            if ((val.startsWith("'") && val.endsWith("'")) || 
                (val.startsWith('"') && val.endsWith('"'))) {
              return val.substring(1, val.length - 1);
            }
            // Convert to number if numeric
            return isNaN(val) ? val : Number(val);
          });
          
          const record = {};
          columns.forEach((column, index) => {
            record[column] = values[index];
          });
          
          // Get existing data
          let tableData = [];
          const existingData = localStorage.getItem(`db_${tableName}`);
          if (existingData) {
            tableData = JSON.parse(existingData);
          }
          
          // Add id if not present
          if (!record.id && tableName === 'user_settings') {
            record.id = 1; // user_settings always has id 1
          } else if (!record.id) {
            record.id = Date.now() + Math.floor(Math.random() * 1000);
          }
          
          tableData.push(record);
          localStorage.setItem(`db_${tableName}`, JSON.stringify(tableData));
          
          resolve({
            rowsAffected: 1,
            insertId: record.id
          });
        } catch (error) {
          console.error('Error in localStorage INSERT:', error);
          resolve({ rowsAffected: 0, insertId: null });
        }
        break;
        
      case 'select':
        try {
          // Get data from localStorage
          const rawData = localStorage.getItem(`db_${tableName}`);
          let results = rawData ? JSON.parse(rawData) : [];
          
          // Filter by WHERE clause if present
          if (whereClause) {
            const whereConditions = whereClause.split('and').map(condition => condition.trim());
            
            results = results.filter(record => {
              return whereConditions.every(condition => {
                // Handle equality conditions (e.g., "column = value")
                const equalityMatch = condition.match(/(\w+)\s*=\s*(['"]?)(.*?)\2$/);
                if (equalityMatch) {
                  const [, column, , value] = equalityMatch;
                  return record[column] == value; // Using == for type coercion
                }
                return true; // Default to keeping the record if we can't parse the condition
              });
            });
          }
          
          resolve({
            rows: {
              _array: results,
              length: results.length,
              item: (index) => results[index] || null
            }
          });
        } catch (error) {
          console.error('Error in localStorage SELECT:', error);
          resolve({
            rows: {
              _array: [],
              length: 0,
              item: () => null
            }
          });
        }
        break;
        
      case 'update':
      case 'delete':
      case 'dropTable':
        // These operations are not fully implemented in localStorage mode
        console.warn(`Operation ${operation} not fully implemented in localStorage mode`);
        resolve({ rowsAffected: 0 });
        break;
        
      default:
        console.warn('Unsupported SQL operation in localStorage mode:', operation);
        resolve({ rowsAffected: 0 });
    }
  } catch (error) {
    console.error('Error handling localStorage query:', error);
    // Even in error cases, resolve rather than reject to prevent app crashes
    resolve({ 
      rowsAffected: 0,
      rows: { _array: [], length: 0, item: () => null }
    });
  }
};

// Initialize localStorage tables structure if not present
const initLocalStorageTables = () => {
  try {
    console.log('Initializing localStorage tables structure');
    const tables = ['user_settings', 'meetings', 'activity_log', 'contacts', 'messages'];
    
    tables.forEach(tableName => {
      const storageKey = `db_${tableName}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing localStorage tables:', error);
    return false;
  }
};

// Convert SQL queries to IndexedDB operations (very basic implementation)
// This is a simplified version that won't handle complex SQL
const parseSQL = (sql) => {
  sql = sql.trim().toLowerCase();
  
  // CREATE TABLE
  if (sql.startsWith('create table')) {
    const tableName = sql.match(/create table (\w+)/i)[1];
    return { operation: 'createTable', tableName };
  }
  
  // INSERT
  if (sql.startsWith('insert into')) {
    const tableName = sql.match(/insert into (\w+)/i)[1];
    return { operation: 'insert', tableName };
  }
  
  // SELECT
  if (sql.startsWith('select')) {
    const fromMatch = sql.match(/from (\w+)/i);
    if (!fromMatch) return { operation: 'unknown' };
    
    const tableName = fromMatch[1];
    
    // Check for WHERE clause
    const whereMatch = sql.match(/where (.*?)(?:order by|group by|limit|$)/i);
    const whereClause = whereMatch ? whereMatch[1].trim() : null;
    
    return { operation: 'select', tableName, whereClause };
  }
  
  // UPDATE
  if (sql.startsWith('update')) {
    const tableName = sql.match(/update (\w+)/i)[1];
    return { operation: 'update', tableName };
  }
  
  // DELETE
  if (sql.startsWith('delete from')) {
    const tableName = sql.match(/delete from (\w+)/i)[1];
    return { operation: 'delete', tableName };
  }
  
  // DROP TABLE
  if (sql.startsWith('drop table')) {
    const tableName = sql.match(/drop table (\w+)/i)[1];
    return { operation: 'dropTable', tableName };
  }
  
  return { operation: 'unknown' };
};

export const initializeDatabase = () => {
  return new Promise((resolve) => {
    try {
      // Check if localStorage is working reliably
      try {
        const testKey = 'db_test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (testValue !== 'test') {
          console.error('localStorage is not working reliably');
          // We'll still try IndexedDB below
        }
      } catch (localStorageError) {
        console.error('localStorage test failed:', localStorageError);
        // We'll still try IndexedDB below
      }
      
      // Start by force-enabling localStorage for reliability
      console.log('Falling back to localStorage');
      isUsingLocalStorage = true;
      initLocalStorageTables(); // Initialize localStorage structure
      resolve(true);
      return;
      
      // The code below is commented out but kept for future use if needed
      /*
      if (!window.indexedDB) {
        console.error('IndexedDB not supported by this browser, using localStorage fallback');
        isUsingLocalStorage = true;
        initLocalStorageTables();
        resolve(true);
        return;
      }
      
      let dbOpenRequest;
      try {
        dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
      } catch (openError) {
        console.error('Error creating IndexedDB open request:', openError);
        isUsingLocalStorage = true;
        initLocalStorageTables();
        resolve(true);
        return;
      }
      
      // Set a timeout in case IndexedDB is taking too long
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB initialization timed out, using localStorage fallback');
        isUsingLocalStorage = true;
        initLocalStorageTables();
        resolve(true);
      }, 3000); // Reduced timeout to 3 seconds for better UX
      
      dbOpenRequest.onerror = (event) => {
        console.error('Error opening database:', event);
        clearTimeout(timeoutId);
        isUsingLocalStorage = true;
        initLocalStorageTables();
        resolve(true);
      };
      
      dbOpenRequest.onsuccess = (event) => {
        try {
          clearTimeout(timeoutId);
          db = event.target.result;
          console.log('Database initialized for web');
          resolve(true);
        } catch (txError) {
          console.log('Database connection error:', txError);
          isUsingLocalStorage = true;
          initLocalStorageTables();
          resolve(true);
        }
      };
      
      dbOpenRequest.onupgradeneeded = (event) => {
        console.log('Creating or upgrading database schema');
        try {
          const database = event.target.result;
          
          // Create object stores for our tables
          const tables = [
            'user_settings',
            'meetings',
            'activity_log',
            'contacts',
            'messages'
          ];
          
          tables.forEach(tableName => {
            if (!database.objectStoreNames.contains(tableName)) {
              database.createObjectStore(tableName, { keyPath: 'id', autoIncrement: true });
            }
          });
        } catch (upgradeError) {
          console.error('Error in onupgradeneeded:', upgradeError);
          // Don't reject, we'll fall back to localStorage in the error handler
        }
      };
      */
    } catch (generalError) {
      console.error('General error in initializeDatabase:', generalError);
      isUsingLocalStorage = true;
      initLocalStorageTables();
      resolve(true);
    }
  });
};

export const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    // Always log the query for debugging
    console.log("Executing SQL:", query, params);
    
    // Check if we're using localStorage fallback
    if (isUsingLocalStorage) {
      console.log("Falling back to localStorage");
      return handleLocalStorageQuery(query, params, resolve, reject);
    }
    
    if (!db) {
      console.error('Database not initialized, switching to localStorage fallback');
      isUsingLocalStorage = true;
      return handleLocalStorageQuery(query, params, resolve, reject);
    }
    
    // Replace parameter placeholders (? or $1, $2, etc.)
    let processedQuery = query;
    if (params.length > 0) {
      if (query.includes('?')) {
        // Replace ? style parameters
        params.forEach(param => {
          processedQuery = processedQuery.replace('?', typeof param === 'string' ? `'${param}'` : param);
        });
      } else {
        // Replace $1, $2 style parameters
        params.forEach((param, index) => {
          const paramPlaceholder = `$${index + 1}`;
          processedQuery = processedQuery.replace(
            paramPlaceholder, 
            typeof param === 'string' ? `'${param}'` : param
          );
        });
      }
    }
    
    const { operation, tableName, whereClause } = parseSQL(processedQuery);
    
    if (operation === 'unknown') {
      console.warn('Unsupported SQL operation:', query);
      reject(new Error(`Unsupported SQL operation: ${query}`));
      return;
    }
    
    // Handle different operations
    switch (operation) {
      case 'createTable':
        try {
          console.log(`Created table if needed: ${tableName}`);
          // For web version, just acknowledge the table creation
          // Tables will be created on demand in other operations
          resolve({ rowsAffected: 0, rows: { length: 0, _array: [], item: () => null } });
        } catch (error) {
          console.error('Error in createTable:', error);
          // Don't reject, just log and continue
          resolve({ rowsAffected: 0, rows: { length: 0, _array: [], item: () => null } });
        }
        break;
        
      case 'insert':
        try {
          // Extract column names and values from the query
          // This is a very basic parser and might not work for all cases
          const columnsMatch = processedQuery.match(/\(([^)]+)\) values\s*\(([^)]+)\)/i);
          
          if (!columnsMatch) {
            console.error('Could not parse INSERT statement:', processedQuery);
            resolve({ rowsAffected: 0, insertId: null });
            return;
          }
          
          const columns = columnsMatch[1].split(',').map(col => col.trim());
          const values = columnsMatch[2].split(',').map(val => {
            val = val.trim();
            // Remove quotes from strings
            if ((val.startsWith("'") && val.endsWith("'")) || 
                (val.startsWith('"') && val.endsWith('"'))) {
              return val.substring(1, val.length - 1);
            }
            // Convert to number if numeric
            return isNaN(val) ? val : Number(val);
          });
          
          const record = {};
          columns.forEach((column, index) => {
            record[column] = values[index];
          });
          
          // Check if table exists
          if (!db.objectStoreNames.contains(tableName)) {
            console.log(`Table ${tableName} doesn't exist yet, storing in localStorage`);
            // Store in localStorage as fallback
            try {
              // Get existing data or initialize
              let tableData = [];
              try {
                const existingData = localStorage.getItem(`db_${tableName}`);
                if (existingData) {
                  tableData = JSON.parse(existingData);
                }
              } catch (e) {
                console.error('Error reading from localStorage:', e);
              }
              
              // Add new record
              if (!record.id && tableName.includes('user_settings')) {
                record.id = 1; // Ensure user_settings has id 1
              } else if (!record.id) {
                record.id = Date.now() + Math.floor(Math.random() * 1000);
              }
              
              tableData.push(record);
              
              // Save back to localStorage
              localStorage.setItem(`db_${tableName}`, JSON.stringify(tableData));
              
              resolve({
                rowsAffected: 1,
                insertId: record.id
              });
            } catch (lsError) {
              console.error('Error using localStorage fallback:', lsError);
              resolve({ rowsAffected: 0, insertId: null });
            }
            return;
          }
          
          // Normal IndexedDB flow if table exists
          try {
            const transaction = db.transaction([tableName], 'readwrite');
            const objectStore = transaction.objectStore(tableName);
            const request = objectStore.add(record);
            
            request.onsuccess = (event) => {
              resolve({
                rowsAffected: 1,
                insertId: event.target.result
              });
            };
            
            request.onerror = (event) => {
              console.error(`Error inserting record:`, event.target.error);
              // Try localStorage as fallback
              try {
                let tableData = [];
                const existingData = localStorage.getItem(`db_${tableName}`);
                if (existingData) {
                  tableData = JSON.parse(existingData);
                }
                
                if (!record.id) {
                  record.id = Date.now() + Math.floor(Math.random() * 1000);
                }
                
                tableData.push(record);
                localStorage.setItem(`db_${tableName}`, JSON.stringify(tableData));
                
                resolve({
                  rowsAffected: 1,
                  insertId: record.id
                });
              } catch (lsError) {
                console.error('Error using localStorage fallback:', lsError);
                resolve({ rowsAffected: 0, insertId: null });
              }
            };
          } catch (txError) {
            console.error('Transaction error:', txError);
            resolve({ rowsAffected: 0, insertId: null });
          }
        } catch (error) {
          console.error('General error in INSERT:', error);
          resolve({ rowsAffected: 0, insertId: null });
        }
        break;
        
      case 'select':
        try {
          // Check if table exists in objectStoreNames
          if (!db.objectStoreNames.contains(tableName)) {
            // Table doesn't exist yet, return empty result set
            console.log(`SELECT: Table ${tableName} doesn't exist yet, returning empty result set`);
            resolve({
              rows: {
                _array: [],
                length: 0,
                item: () => null
              }
            });
            return;
          }

          try {
            const transaction = db.transaction([tableName], 'readonly');
            const objectStore = transaction.objectStore(tableName);
            const request = objectStore.getAll();
            
            request.onsuccess = (event) => {
              const results = event.target.result || [];
              
              // Very basic WHERE filtering - this will only work for simple cases
              let filteredResults = results;
              if (whereClause) {
                // This is a very simplistic parser and will only handle basic conditions
                const whereConditions = whereClause.split('and').map(condition => condition.trim());
                
                filteredResults = results.filter(record => {
                  return whereConditions.every(condition => {
                    // Handle equality conditions (e.g., "column = value")
                    const equalityMatch = condition.match(/(\w+)\s*=\s*(['"]?)(.*?)\2$/);
                    if (equalityMatch) {
                      const [, column, , value] = equalityMatch;
                      return record[column] == value; // Using == for type coercion
                    }
                    
                    // Add more condition types as needed
                    
                    return true; // Default to keeping the record if we can't parse the condition
                  });
                });
              }
              
              resolve({
                rows: {
                  _array: filteredResults,
                  length: filteredResults.length,
                  item: (index) => filteredResults[index] || null
                }
              });
            };
            
            request.onerror = (event) => {
              console.error(`Error selecting records from ${tableName}:`, event.target.error);
              // Return empty result set instead of rejecting to avoid app crashes
              resolve({
                rows: {
                  _array: [],
                  length: 0,
                  item: () => null
                }
              });
            };
          } catch (txError) {
            console.error(`Transaction error for ${tableName}:`, txError);
            // Return empty result set
            resolve({
              rows: {
                _array: [],
                length: 0,
                item: () => null
              }
            });
          }
        } catch (error) {
          console.error(`General error in SELECT for ${tableName}:`, error);
          // Return empty result set instead of rejecting
          resolve({
            rows: {
              _array: [],
              length: 0,
              item: () => null
            }
          });
        }
        break;
        
      case 'update':
        try {
          // This is a very basic implementation that doesn't properly parse SQL
          // In a real implementation, you would need to properly parse SET and WHERE clauses
          console.warn('UPDATE operation is not fully implemented in the web adapter');
          resolve({ rowsAffected: 0 });
        } catch (error) {
          reject(error);
        }
        break;
        
      case 'delete':
        try {
          // This is a very basic implementation that doesn't properly parse SQL
          // In a real implementation, you would need to properly parse WHERE clauses
          console.warn('DELETE operation is not fully implemented in the web adapter');
          resolve({ rowsAffected: 0 });
        } catch (error) {
          reject(error);
        }
        break;
        
      case 'dropTable':
        try {
          if (db.objectStoreNames.contains(tableName)) {
            // We can't delete object stores outside of onupgradeneeded
            // So we need to close and reopen the database with a new version
            const currentVersion = db.version;
            db.close();
            
            const request = window.indexedDB.open(DB_NAME, currentVersion + 1);
            
            request.onupgradeneeded = (event) => {
              const database = event.target.result;
              database.deleteObjectStore(tableName);
              console.log(`Dropped table ${tableName}`);
            };
            
            request.onsuccess = (event) => {
              db = event.target.result;
              resolve({ rowsAffected: 0 });
            };
            
            request.onerror = (event) => {
              reject(new Error(`Error dropping table: ${event.target.error}`));
            };
          } else {
            // Table doesn't exist
            resolve({ rowsAffected: 0 });
          }
        } catch (error) {
          reject(error);
        }
        break;
        
      default:
        reject(new Error(`Unsupported operation: ${operation}`));
    }
  });
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
  return true;
};

export const deleteDatabase = () => {
  return new Promise((resolve, reject) => {
    closeDatabase();
    
    const request = window.indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      console.log('Database deleted successfully');
      resolve(true);
    };
    
    request.onerror = (event) => {
      console.error('Error deleting database:', event);
      reject(new Error('Could not delete database'));
    };
  });
};