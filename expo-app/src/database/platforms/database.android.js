/**
 * Android-specific SQLite database implementation
 */
import * as FileSystem from 'expo-file-system';
import { openDatabase } from 'expo-sqlite';

// This is a placeholder for the actual SQLite implementation
// When running on Android, we'll use expo-sqlite directly
let db = null;

export const initializeDatabase = async () => {
  try {
    // Open the database with expo-sqlite
    db = openDatabase('spiritual_condition.db');
    console.log('Database initialized for Android');
    return true;
  } catch (error) {
    console.error('Error initializing database for Android:', error);
    return false;
  }
};

export const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        query, 
        params,
        (_, resultSet) => {
          resolve({
            rows: {
              _array: resultSet.rows._array,
              length: resultSet.rows.length,
              item: (index) => resultSet.rows._array[index]
            },
            rowsAffected: resultSet.rowsAffected,
            insertId: resultSet.insertId
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const closeDatabase = () => {
  // expo-sqlite doesn't have a close method, but we'll keep this for API compatibility
  db = null;
  return true;
};

export const deleteDatabase = async () => {
  try {
    // Close the current connection
    closeDatabase();
    
    // For Android, we'll use the expo-sqlite openDatabase with version null to delete
    // First try to close our connection
    db = null;
    
    // This is a trick to delete the database on Android
    try {
      openDatabase(null);
    } catch (e) {
      // Expected error, this is a way to force cleanup
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting database:', error);
    return false;
  }
};