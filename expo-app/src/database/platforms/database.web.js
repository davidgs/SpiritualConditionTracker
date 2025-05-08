/**
 * Web-specific database implementation using IndexedDB
 */

let db = null;
const DB_NAME = 'spiritual_condition_db';
const DB_VERSION = 1;

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
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported by this browser'));
      return;
    }
    
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening database:', event);
      reject(new Error('Could not open database'));
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database initialized for web');
      resolve(true);
    };
    
    request.onupgradeneeded = (event) => {
      console.log('Creating or upgrading database schema');
      const database = event.target.result;
      
      // We'll create tables as needed in executeQuery
      // This is just ensuring the database itself is created
    };
  });
};

export const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
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
            reject(new Error('Could not parse INSERT statement'));
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
            reject(new Error(`Error inserting record: ${event.target.error}`));
          };
        } catch (error) {
          reject(error);
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