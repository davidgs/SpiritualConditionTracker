/**
 * SQLite database loader for iOS Capacitor
 * iOS-only implementation using CapacitorSQLite
 */

import { TABLE_DEFINITIONS } from './tables';

// Default database name for consistency
const DB_NAME = 'spiritual_condition_tracker.db';

/**
 * Initialize SQLite database
 * @returns {Promise<object>} Database connection object
 */
export default async function initSQLiteDatabase() {
  console.log('[ sqliteLoader.js:14 ] Initializing SQLite database via Capacitor...');
  
  try {
    // Import CapacitorSQLite plugin for iOS
    const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
    const sqlite = CapacitorSQLite;
    
    if (!sqlite) {
      throw new Error('CapacitorSQLite plugin not found - this app requires SQLite for iOS');
    }
    
    console.log('[ sqliteLoader.js:39 ]  Found CapacitorSQLite plugin:', !!sqlite);
    
    // Step 1: Create connection (check if already exists first)
    try {
      await sqlite.createConnection({
        database: DB_NAME,
        version: 1,
        encrypted: false,
        mode: 'no-encryption',
        readonly: false
      });
      console.log('[ sqliteLoader.js:50 ]  Database connection created');
    } catch (connectionError) {
      console.log('[ sqliteLoader.js:52 ]  Connection may already exist:', connectionError.message);
    }

    // Step 2: Open the database
    await sqlite.open({ database: DB_NAME, readonly: false });
    console.log('[ sqliteLoader.js:56 ]  Database opened successfully');

    // Step 3: Create tables
    await createTables(sqlite);
    console.log('[ sqliteLoader.js:59 ]  Database initialization complete');

    // Return database interface
    return {
      async getAll(collection) {
        const result = await sqlite.query({
          database: DB_NAME,
          statement: `SELECT * FROM ${collection}`,
          values: []
        });

        if (!result || !result.values) {
          return [];
        }

        let items = [];
        if (result.values.length > 1 && result.values[0].ios_columns) {
          items = convertIOSFormatToStandard(result.values);
        } else {
          items = result.values;
        }

        return items.map(item => {
          const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
          jsonFields.forEach(field => {
            if (item[field] && typeof item[field] === 'string') {
              try {
                item[field] = JSON.parse(item[field]);
              } catch (e) {
                // Keep as string if parsing fails
              }
            }
          });
          return item;
        });
      },

      async add(collection, item) {
        const columns = Object.keys(item);
        const values = Object.values(item);
        
        const processedValues = values.map(value => {
          if (value === null || value === undefined) {
            return 'NULL';
          }
          if (typeof value === 'object' && value !== null) {
            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          }
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          return value;
        });

        const valuesList = processedValues.join(', ');
        const sql = `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${valuesList});`;
        
        console.log(`[ sqliteLoader.js ] Executing SQL: ${sql}`);

        const result = await sqlite.execute({
          database: DB_NAME,
          statements: sql
        });

        if (result && result.changes && result.changes.changes > 0) {
          // Query the database to get the last inserted ID
          const lastIdQuery = await sqlite.query({
            database: DB_NAME,
            statement: 'SELECT last_insert_rowid() as lastId',
            values: []
          });
          
          // Parse the iOS format result correctly
          const newId = lastIdQuery.values?.[1]?.lastId;
          if (!newId) {
            throw new Error(`Database failed to generate ID for ${collection}`);
          }
          
          const newItem = { 
            ...item, 
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          console.log(`[ sqliteLoader.js ] Created ${collection} item with ID:`, newId);
          return newItem;
        }
        throw new Error(`Failed to insert item into ${collection}`);
      },

      async update(collection, id, updates) {
        const setClause = Object.keys(updates).map((key, index) => {
          const value = Object.values(updates)[index];
          const processedValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
          const escapedValue = typeof processedValue === 'string' ? `'${processedValue.replace(/'/g, "''")}'` : processedValue;
          return `${key} = ${escapedValue}`;
        }).join(', ');

        await sqlite.execute({
          database: DB_NAME,
          statements: `UPDATE ${collection} SET ${setClause} WHERE id = ${id};`
        });

        return this.getById(collection, id);
      },

      async delete(collection, id) {
        try {
          await sqlite.execute({
            database: DB_NAME,
            statements: `DELETE FROM ${collection} WHERE id = ${id};`
          });
          return true;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error deleting from ${collection}:`, error);
          throw error;
        }
      },

      async getById(collection, id) {
        try {
          const escapedId = typeof id === 'string' ? `'${id.replace(/'/g, "''")}'` : id;
          
          const result = await sqlite.query({
            database: DB_NAME,
            statement: `SELECT * FROM ${collection} WHERE id = ${escapedId}`,
            values: []
          });

          if (!result || !result.values || result.values.length === 0) {
            return null;
          }

          let item;
          if (result.values.length > 1 && result.values[0].ios_columns) {
            const items = convertIOSFormatToStandard(result.values);
            item = items[0] || null;
          } else {
            item = result.values[0] || null;
          }
          
          if (item) {
            const jsonFields = ['days', 'schedule', 'coordinates', 'types', 'homeGroups', 'privacySettings', 'preferences'];
            jsonFields.forEach(field => {
              if (item[field] && typeof item[field] === 'string') {
                try {
                  item[field] = JSON.parse(item[field]);
                } catch (e) {
                  // Keep as string if parsing fails
                }
              }
            });
          }
          
          return item;
        } catch (error) {
          console.error(`[ sqliteLoader.js ] Error getting ${collection} by id ${id}:`, error);
          throw error;
        }
      },

      async remove(collection, id) {
        return this.delete(collection, id);
      },

      async resetDatabase() {
        try {
          await resetDatabase(sqlite);
          return true;
        } catch (error) {
          console.error('[ sqliteLoader.js ] Error during database reset:', error);
          throw error;
        }
      },

      calculateSobrietyDays(sobrietyDate) {
        const today = new Date();
        const sobriety = new Date(sobrietyDate);
        const diffTime = Math.abs(today.getTime() - sobriety.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },

      calculateSobrietyYears(sobrietyDate, decimalPlaces = 2) {
        const days = this.calculateSobrietyDays(sobrietyDate);
        return parseFloat((days / 365.25).toFixed(decimalPlaces));
      },

      async calculateSpiritualFitness() {
        return 5;
      },

      async calculateSpiritualFitnessWithTimeframe(timeframe = 30) {
        return 5;
      },

      async getPreference(key) {
        return null;
      },

      async setPreference(key, value) {
        // Implementation for preferences
      }
    };

  } catch (error) {
    console.error('[ sqliteLoader.js ] Database initialization failed:', error);
    throw error;
  }
}

// Helper function to convert iOS format to standard format
function convertIOSFormatToStandard(iosResult) {
  if (!iosResult || iosResult.length < 2) {
    return [];
  }

  const columnsInfo = iosResult[0];
  const valuesArrays = iosResult.slice(1);

  if (!columnsInfo.ios_columns || !Array.isArray(valuesArrays)) {
    return [];
  }

  const columns = columnsInfo.ios_columns;
  const items = [];

  valuesArrays.forEach(valueArray => {
    if (Array.isArray(valueArray.ios_values)) {
      const item = {};
      valueArray.ios_values.forEach((value, index) => {
        if (index < columns.length) {
          item[columns[index]] = value;
        }
      });
      items.push(item);
    } else if (typeof valueArray === 'object' && valueArray !== null) {
      items.push(valueArray);
    }
  });

  return items;
}

async function createTables(sqlite) {
  // Use centralized table definitions from tables.ts
  const tableNames = ['users', 'people', 'contacts', 'activities', 'meetings', 'action_items', 'sponsors', 'sponsees'];
  
  for (const tableName of tableNames) {
    const tableDefinition = TABLE_DEFINITIONS[tableName];
    if (tableDefinition) {
      await sqlite.execute({
        database: DB_NAME,
        statements: tableDefinition
      });
      console.log(`[ sqliteLoader.js ] Created ${tableName} table from centralized definition`);
    } else {
      console.warn(`[ sqliteLoader.js ] No table definition found for ${tableName}`);
    }
  }
  
  console.log('[ sqliteLoader.js ] All tables created using centralized definitions from tables.ts');
}

async function resetDatabase(sqlite) {
  try {
    console.log('[ sqliteLoader.js ] Starting database reset process...');
    // Comprehensive list of ALL tables that might exist - including any possible variations
    const tables = [
      'users', 
      'activities', 
      'meetings', 
      'people',         // New unified address book
      'contacts',       // New unified contact records
      'action_items', 
      'sponsors',       // Simplified sponsors table
      'sponsees',       // Simplified sponsees table
      // Legacy tables to remove
      'sponsor_contacts', 
      'sponsee_contacts', 
      'sponsor_contact_details',
      'contact_details',
      'todos',
      'preferences'
    ];
    
    // First, get actual table names from database to ensure we drop everything
    try {
      const tableQuery = await sqlite.query({
        database: DB_NAME,
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        values: []
      });
      
      if (tableQuery.values && tableQuery.values.length > 0) {
        console.log('[ sqliteLoader.js ] Found existing tables:', tableQuery.values);
        // Add any discovered tables to our drop list
        const discoveredTables = tableQuery.values.map(row => 
          row.name || (Array.isArray(row) ? row[0] : row)
        ).filter(name => name && !tables.includes(name));
        
        if (discoveredTables.length > 0) {
          console.log('[ sqliteLoader.js ] Adding discovered tables to drop list:', discoveredTables);
          tables.push(...discoveredTables);
        }
      }
    } catch (queryError) {
      console.log('[ sqliteLoader.js ] Could not query existing tables, proceeding with default list:', queryError.message);
    }
    
    // Drop all tables
    for (const table of tables) {
      try {
        console.log(`[ sqliteLoader.js ] Dropping table: ${table}`);
        await sqlite.execute({
          database: DB_NAME,
          statements: `DROP TABLE IF EXISTS ${table};`
        });
        console.log(`[ sqliteLoader.js ] Successfully dropped table: ${table}`);
      } catch (error) {
        console.error(`[ sqliteLoader.js ] Error dropping table ${table}:`, error);
        // Continue with other tables even if one fails
      }
    }
    
    console.log('[ sqliteLoader.js ] Recreating tables...');
    await createTables(sqlite);
    console.log('[ sqliteLoader.js ] Database reset complete - all data permanently deleted');
    
  } catch (error) {
    console.error('[ sqliteLoader.js ] Error during database reset:', error);
    throw error;
  }
}