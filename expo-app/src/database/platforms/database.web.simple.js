/**
 * Simplified database implementation for web platform
 * Uses localStorage exclusively for reliability
 */

// Keys for localStorage
const DB_PREFIX = 'aa_recovery_';
const TABLE_KEYS = {
  USER_SETTINGS: `${DB_PREFIX}user_settings`,
  MEETINGS: `${DB_PREFIX}meetings`,
  ACTIVITY_LOG: `${DB_PREFIX}activity_log`,
  CONTACTS: `${DB_PREFIX}contacts`,
  MESSAGES: `${DB_PREFIX}messages`
};

// Default data
const DEFAULT_USER_SETTINGS = {
  id: 1,
  sobriety_date: new Date().toISOString().split('T')[0], // Today's date
  name: '',
  home_group: '',
  sponsor_id: null,
  dark_mode: 0,
  reminder_minutes: 30,
  last_backup: null
};

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise((resolve) => {
    try {
      console.log('Initializing web database with localStorage');
      
      // Initialize tables if they don't exist
      if (!localStorage.getItem(TABLE_KEYS.USER_SETTINGS)) {
        localStorage.setItem(TABLE_KEYS.USER_SETTINGS, JSON.stringify([DEFAULT_USER_SETTINGS]));
      }
      
      if (!localStorage.getItem(TABLE_KEYS.MEETINGS)) {
        localStorage.setItem(TABLE_KEYS.MEETINGS, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(TABLE_KEYS.ACTIVITY_LOG)) {
        localStorage.setItem(TABLE_KEYS.ACTIVITY_LOG, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(TABLE_KEYS.CONTACTS)) {
        localStorage.setItem(TABLE_KEYS.CONTACTS, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(TABLE_KEYS.MESSAGES)) {
        localStorage.setItem(TABLE_KEYS.MESSAGES, JSON.stringify([]));
      }
      
      console.log('Database initialized successfully');
      resolve(true);
    } catch (error) {
      console.error('Error initializing database:', error);
      // Still resolve to prevent app from crashing
      resolve(false);
    }
  });
};

// Get table name from SQL query
const getTableName = (query) => {
  query = query.toLowerCase();
  
  if (query.includes('user_settings')) return TABLE_KEYS.USER_SETTINGS;
  if (query.includes('meetings')) return TABLE_KEYS.MEETINGS;
  if (query.includes('activity_log')) return TABLE_KEYS.ACTIVITY_LOG;
  if (query.includes('contacts')) return TABLE_KEYS.CONTACTS;
  if (query.includes('messages')) return TABLE_KEYS.MESSAGES;
  
  return null;
};

// Parse SQL WHERE clause
const parseWhereClause = (whereClause, params) => {
  if (!whereClause) return () => true;
  
  // Replace params in where clause
  let processedWhere = whereClause;
  if (params && params.length > 0) {
    // Replace ? placeholders
    if (processedWhere.includes('?')) {
      params.forEach(param => {
        processedWhere = processedWhere.replace('?', typeof param === 'string' ? `'${param}'` : param);
      });
    } 
    // Replace $1, $2, etc.
    else {
      params.forEach((param, index) => {
        processedWhere = processedWhere.replace(`$${index + 1}`, typeof param === 'string' ? `'${param}'` : param);
      });
    }
  }
  
  return (record) => {
    try {
      // Simple id = value matching
      if (processedWhere.includes('id = ')) {
        const id = processedWhere.split('id = ')[1].trim();
        const numId = parseInt(id.replace(/['"]/g, ''));
        return record.id === numId;
      }
      
      // Other field matching
      const conditions = processedWhere.split(' and ');
      return conditions.every(condition => {
        const parts = condition.trim().split('=');
        if (parts.length !== 2) return true;
        
        const field = parts[0].trim();
        let value = parts[1].trim();
        
        // Remove quotes from string values
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        
        return record[field] == value; // Use loose equality for type coercion
      });
    } catch (e) {
      console.error('Error parsing where clause:', e);
      return true; // Include record if we can't evaluate the condition
    }
  };
};

// Execute SQL-like query on localStorage
export const executeQuery = (query, params = []) => {
  return new Promise((resolve) => {
    try {
      console.log('Executing query:', query, params);
      
      // CREATE TABLE - just ignore, tables are pre-created
      if (query.toLowerCase().startsWith('create table')) {
        resolve({ rowsAffected: 0 });
        return;
      }
      
      // INSERT
      if (query.toLowerCase().startsWith('insert into')) {
        const tableName = getTableName(query);
        if (!tableName) {
          console.error('Unknown table in query:', query);
          resolve({ rowsAffected: 0 });
          return;
        }
        
        try {
          // Parse column names and values
          const matches = query.match(/\(([^)]+)\) values\s*\(([^)]+)\)/i);
          if (!matches) {
            console.error('Could not parse INSERT statement:', query);
            resolve({ rowsAffected: 0 });
            return;
          }
          
          const columns = matches[1].split(',').map(col => col.trim());
          let values = matches[2].split(',').map(val => val.trim());
          
          // Replace placeholders if any
          if (params && params.length > 0) {
            values = values.map(val => {
              if (val === '?') {
                return params.shift();
              }
              return val;
            });
          }
          
          // Create record object
          const record = {};
          columns.forEach((col, index) => {
            let value = values[index];
            
            // Remove quotes from string values
            if (typeof value === 'string' && 
                ((value.startsWith("'") && value.endsWith("'")) || 
                 (value.startsWith('"') && value.endsWith('"')))) {
              value = value.substring(1, value.length - 1);
            }
            
            // Convert to number if possible
            if (typeof value === 'string' && !isNaN(value)) {
              value = Number(value);
            }
            
            record[col] = value;
          });
          
          // Get existing data
          const existingData = JSON.parse(localStorage.getItem(tableName) || '[]');
          
          // Set id if not present
          if (!record.id) {
            if (tableName === TABLE_KEYS.USER_SETTINGS) {
              record.id = 1;
            } else {
              record.id = Date.now() + Math.floor(Math.random() * 1000);
            }
          }
          
          // Add new record
          existingData.push(record);
          
          // Save back to localStorage
          localStorage.setItem(tableName, JSON.stringify(existingData));
          
          resolve({ rowsAffected: 1, insertId: record.id });
        } catch (e) {
          console.error('Error in INSERT:', e);
          resolve({ rowsAffected: 0 });
        }
        return;
      }
      
      // SELECT
      if (query.toLowerCase().startsWith('select')) {
        const tableName = getTableName(query);
        if (!tableName) {
          console.error('Unknown table in query:', query);
          resolve({ rows: { _array: [], length: 0, item: () => null } });
          return;
        }
        
        try {
          // Get data from localStorage
          const data = JSON.parse(localStorage.getItem(tableName) || '[]');
          
          // Special case for fitness calculation query
          if (query.toLowerCase().includes('group by activity_type')) {
            console.log('Handling special GROUP BY query for spiritual fitness calculation');
            
            // Extract date filter from WHERE clause if present
            let filteredData = data;
            if (query.toLowerCase().includes('where date >=')) {
              const dateStr = params[0];
              filteredData = data.filter(item => item.date >= dateStr);
            }
            
            // Group by activity_type
            const grouped = {};
            filteredData.forEach(item => {
              const type = item.activity_type;
              if (!grouped[type]) {
                grouped[type] = {
                  activity_type: type,
                  count: 0,
                  total_duration: 0
                };
              }
              grouped[type].count++;
              grouped[type].total_duration += (item.duration || 0);
            });
            
            // Convert to array
            const results = Object.values(grouped);
            
            resolve({
              rows: {
                _array: results,
                length: results.length,
                item: (index) => (index >= 0 && index < results.length) ? results[index] : null
              }
            });
            return;
          }
          
          // Regular SELECT query
          // Extract WHERE clause
          const whereMatch = query.match(/where\s+(.*?)(?:order by|group by|limit|$)/i);
          const whereClause = whereMatch ? whereMatch[1].trim() : null;
          
          // Filter data if needed
          let results = data;
          if (whereClause) {
            const filterFn = parseWhereClause(whereClause, params);
            results = data.filter(filterFn);
          }
          
          resolve({
            rows: {
              _array: results,
              length: results.length,
              item: (index) => (index >= 0 && index < results.length) ? results[index] : null
            }
          });
        } catch (e) {
          console.error('Error in SELECT:', e);
          resolve({ rows: { _array: [], length: 0, item: () => null } });
        }
        return;
      }
      
      // UPDATE
      if (query.toLowerCase().startsWith('update')) {
        const tableName = getTableName(query);
        if (!tableName) {
          console.error('Unknown table in query:', query);
          resolve({ rowsAffected: 0 });
          return;
        }
        
        try {
          // Extract SET and WHERE clauses
          const setMatch = query.match(/set\s+(.*?)(?:where|$)/i);
          const whereMatch = query.match(/where\s+(.*?)$/i);
          
          if (!setMatch) {
            console.error('Could not parse SET clause:', query);
            resolve({ rowsAffected: 0 });
            return;
          }
          
          // Parse SET clause
          const setClauses = setMatch[1].split(',').map(c => c.trim());
          const updates = {};
          
          setClauses.forEach(clause => {
            const parts = clause.split('=');
            if (parts.length !== 2) return;
            
            const field = parts[0].trim();
            let value = parts[1].trim();
            
            // Replace placeholders
            if (value === '?' && params.length > 0) {
              value = params.shift();
            }
            
            // Remove quotes
            if (typeof value === 'string' && 
                ((value.startsWith("'") && value.endsWith("'")) || 
                 (value.startsWith('"') && value.endsWith('"')))) {
              value = value.substring(1, value.length - 1);
            }
            
            updates[field] = value;
          });
          
          // Get existing data
          const data = JSON.parse(localStorage.getItem(tableName) || '[]');
          
          // Filter records to update
          const whereClause = whereMatch ? whereMatch[1] : null;
          const filterFn = parseWhereClause(whereClause, params);
          
          // Update matching records
          let count = 0;
          const updated = data.map(record => {
            if (filterFn(record)) {
              count++;
              return { ...record, ...updates };
            }
            return record;
          });
          
          // Save back to localStorage
          localStorage.setItem(tableName, JSON.stringify(updated));
          
          resolve({ rowsAffected: count });
        } catch (e) {
          console.error('Error in UPDATE:', e);
          resolve({ rowsAffected: 0 });
        }
        return;
      }
      
      // DELETE
      if (query.toLowerCase().startsWith('delete')) {
        const tableName = getTableName(query);
        if (!tableName) {
          console.error('Unknown table in query:', query);
          resolve({ rowsAffected: 0 });
          return;
        }
        
        try {
          // Extract WHERE clause
          const whereMatch = query.match(/where\s+(.*?)$/i);
          const whereClause = whereMatch ? whereMatch[1] : null;
          
          // Get existing data
          const data = JSON.parse(localStorage.getItem(tableName) || '[]');
          
          // Filter records to keep (inverse of where clause)
          const filterFn = parseWhereClause(whereClause, params);
          const originalLength = data.length;
          const filtered = data.filter(record => !filterFn(record));
          
          // Save back to localStorage
          localStorage.setItem(tableName, JSON.stringify(filtered));
          
          resolve({ rowsAffected: originalLength - filtered.length });
        } catch (e) {
          console.error('Error in DELETE:', e);
          resolve({ rowsAffected: 0 });
        }
        return;
      }
      
      // DROP TABLE - clear the data for the table
      if (query.toLowerCase().startsWith('drop table')) {
        const tableName = getTableName(query);
        if (!tableName) {
          console.error('Unknown table in query:', query);
          resolve({ rowsAffected: 0 });
          return;
        }
        
        try {
          // Clear the table but keep the key
          localStorage.setItem(tableName, JSON.stringify([]));
          resolve({ rowsAffected: 0 });
        } catch (e) {
          console.error('Error in DROP TABLE:', e);
          resolve({ rowsAffected: 0 });
        }
        return;
      }
      
      // Unrecognized query
      console.warn('Unrecognized query type:', query);
      resolve({ rowsAffected: 0 });
    } catch (error) {
      console.error('General error executing query:', error);
      resolve({ rowsAffected: 0, rows: { _array: [], length: 0, item: () => null } });
    }
  });
};

// Close database (no-op for localStorage)
export const closeDatabase = () => {
  console.log('Close database called (no-op for web)');
  return true;
};

// Delete database
export const deleteDatabase = () => {
  return new Promise((resolve) => {
    try {
      console.log('Deleting database');
      Object.values(TABLE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      resolve(true);
    } catch (error) {
      console.error('Error deleting database:', error);
      resolve(false);
    }
  });
};