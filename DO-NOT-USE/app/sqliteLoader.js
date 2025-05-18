/**
 * SQLite loader for web applications
 * This file creates a polyfill for the SQLite API in web browsers
 */

// Create a shim for the sqlitePlugin that works in web browsers
if (!window.sqlitePlugin) {
  console.log('Creating SQL.js polyfill for SQLite in web browser');
  
  // Simple localStorage-based implementation for web
  window.openDatabase = function(config) {
    const dbName = config.name || 'defaultDB';
    console.log(`Opening database: ${dbName}`);
    
    // Initialize tables in localStorage if they don't exist
    if (!localStorage.getItem(`${dbName}_tables`)) {
      localStorage.setItem(`${dbName}_tables`, JSON.stringify([]));
    }
    
    return {
      transaction: function(txCallback, errorCallback, successCallback) {
        try {
          // Create a transaction object with executeSql method
          const tx = {
            executeSql: function(query, params, successFn, errorFn) {
              console.log(`Executing SQL: ${query}`);
              console.log('Parameters:', params);
              
              try {
                // Parse the query to determine operation type
                const operation = query.trim().split(' ')[0].toUpperCase();
                
                if (operation === 'CREATE') {
                  // Handle CREATE TABLE IF NOT EXISTS
                  const tableMatch = query.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
                  if (tableMatch && tableMatch[1]) {
                    const tableName = tableMatch[1];
                    
                    // Get existing tables
                    const tables = JSON.parse(localStorage.getItem(`${dbName}_tables`) || '[]');
                    
                    // Add table if it doesn't exist
                    if (!tables.includes(tableName)) {
                      tables.push(tableName);
                      localStorage.setItem(`${dbName}_tables`, JSON.stringify(tables));
                      
                      // Initialize empty table data
                      localStorage.setItem(`${dbName}_${tableName}`, JSON.stringify([]));
                    }
                    
                    // Call success callback with empty result
                    if (successFn) {
                      successFn(tx, { rows: { length: 0, item: () => null } });
                    }
                  }
                } else if (operation === 'INSERT') {
                  // Handle INSERT INTO
                  const tableMatch = query.match(/INSERT INTO (\w+)/i);
                  if (tableMatch && tableMatch[1]) {
                    const tableName = tableMatch[1];
                    
                    // Get table data
                    const tableData = JSON.parse(localStorage.getItem(`${dbName}_${tableName}`) || '[]');
                    
                    // Create new row object
                    const row = {};
                    
                    // Extract column names from query
                    const columnsMatch = query.match(/\(([^)]+)\) VALUES/i);
                    if (columnsMatch && columnsMatch[1]) {
                      const columns = columnsMatch[1].split(',').map(col => col.trim());
                      
                      // Assign values to columns
                      columns.forEach((col, index) => {
                        row[col] = params[index];
                      });
                      
                      // Add row to table
                      tableData.push(row);
                      
                      // Save updated table data
                      localStorage.setItem(`${dbName}_${tableName}`, JSON.stringify(tableData));
                      
                      // Call success callback with result
                      if (successFn) {
                        successFn(tx, { 
                          insertId: tableData.length - 1, 
                          rowsAffected: 1,
                          rows: { length: 0, item: () => null }
                        });
                      }
                    }
                  }
                } else if (operation === 'SELECT') {
                  // Handle SELECT
                  const tableMatch = query.match(/FROM (\w+)/i);
                  if (tableMatch && tableMatch[1]) {
                    const tableName = tableMatch[1];
                    
                    // Get table data
                    const tableData = JSON.parse(localStorage.getItem(`${dbName}_${tableName}`) || '[]');
                    
                    // Filter data if WHERE clause exists
                    let filteredData = tableData;
                    const whereMatch = query.match(/WHERE ([^;]+)/i);
                    if (whereMatch && whereMatch[1]) {
                      const whereParts = whereMatch[1].split('=').map(part => part.trim());
                      if (whereParts.length === 2) {
                        const column = whereParts[0];
                        
                        // Check if we're using a parameter
                        if (whereParts[1] === '?') {
                          const value = params[0];
                          filteredData = tableData.filter(row => row[column] === value);
                        }
                      }
                    }
                    
                    // Create result object
                    const result = {
                      rows: {
                        length: filteredData.length,
                        item: (index) => filteredData[index] || null
                      }
                    };
                    
                    // Call success callback with result
                    if (successFn) {
                      successFn(tx, result);
                    }
                  }
                } else if (operation === 'UPDATE') {
                  // Handle UPDATE
                  const tableMatch = query.match(/UPDATE (\w+)/i);
                  if (tableMatch && tableMatch[1]) {
                    const tableName = tableMatch[1];
                    
                    // Get table data
                    const tableData = JSON.parse(localStorage.getItem(`${dbName}_${tableName}`) || '[]');
                    
                    // Find and update row if WHERE clause exists
                    let rowsAffected = 0;
                    const whereMatch = query.match(/WHERE ([^;]+)/i);
                    if (whereMatch && whereMatch[1]) {
                      const whereParts = whereMatch[1].split('=').map(part => part.trim());
                      if (whereParts.length === 2) {
                        const column = whereParts[0];
                        
                        // Check if we're using a parameter
                        if (whereParts[1] === '?') {
                          const value = params[params.length - 1]; // Last parameter is usually the ID
                          
                          // Extract SET clause
                          const setMatch = query.match(/SET ([^WHERE]+)/i);
                          if (setMatch && setMatch[1]) {
                            const setParts = setMatch[1].split(',').map(part => part.trim());
                            
                            // Update matching rows
                            for (let i = 0; i < tableData.length; i++) {
                              if (tableData[i][column] === value) {
                                // Update columns
                                setParts.forEach((setPart, setIndex) => {
                                  const setColumn = setPart.split('=')[0].trim();
                                  tableData[i][setColumn] = params[setIndex];
                                });
                                
                                rowsAffected++;
                              }
                            }
                            
                            // Save updated table data
                            localStorage.setItem(`${dbName}_${tableName}`, JSON.stringify(tableData));
                          }
                        }
                      }
                    }
                    
                    // Call success callback with result
                    if (successFn) {
                      successFn(tx, { rowsAffected });
                    }
                  }
                } else if (operation === 'DELETE') {
                  // Handle DELETE
                  const tableMatch = query.match(/FROM (\w+)/i);
                  if (tableMatch && tableMatch[1]) {
                    const tableName = tableMatch[1];
                    
                    // Get table data
                    const tableData = JSON.parse(localStorage.getItem(`${dbName}_${tableName}`) || '[]');
                    
                    // Remove row if WHERE clause exists
                    let rowsAffected = 0;
                    const whereMatch = query.match(/WHERE ([^;]+)/i);
                    if (whereMatch && whereMatch[1]) {
                      const whereParts = whereMatch[1].split('=').map(part => part.trim());
                      if (whereParts.length === 2) {
                        const column = whereParts[0];
                        
                        // Check if we're using a parameter
                        if (whereParts[1] === '?') {
                          const value = params[0];
                          
                          // Filter out matching rows
                          const newTableData = tableData.filter(row => row[column] !== value);
                          rowsAffected = tableData.length - newTableData.length;
                          
                          // Save updated table data
                          localStorage.setItem(`${dbName}_${tableName}`, JSON.stringify(newTableData));
                        }
                      }
                    }
                    
                    // Call success callback with result
                    if (successFn) {
                      successFn(tx, { rowsAffected });
                    }
                  }
                }
              } catch (err) {
                console.error('SQL error:', err);
                if (errorFn) {
                  errorFn(tx, err);
                }
              }
            }
          };
          
          // Call transaction callback with our transaction object
          txCallback(tx);
          
          // Call success callback
          if (successCallback) {
            successCallback();
          }
        } catch (err) {
          console.error('Transaction error:', err);
          if (errorCallback) {
            errorCallback(err);
          }
        }
      }
    };
  };
}

// Let the app know SQLite is ready
document.dispatchEvent(new Event('sqliteready'));