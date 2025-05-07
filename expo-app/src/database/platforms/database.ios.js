/**
 * iOS-specific SQLite database implementation
 */
import * as FileSystem from 'expo-file-system';
import { openDatabase } from 'expo-sqlite';

// This is a placeholder for the actual SQLite implementation
// When running on iOS, we'll use expo-sqlite directly
let db = null;

export const initializeDatabase = async () => {
  try {
    // Ensure the database directory exists
    const dbDirectory = `${FileSystem.documentDirectory}SQLite`;
    const dirInfo = await FileSystem.getInfoAsync(dbDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dbDirectory, { intermediates: true });
    }

    // Open the database with expo-sqlite
    db = openDatabase('spiritual_condition.db');
    console.log('Database initialized for iOS');
    return true;
  } catch (error) {
    console.error('Error initializing database for iOS:', error);
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
    
    // Delete the file using expo-file-system
    const dbPath = `${FileSystem.documentDirectory}SQLite/spiritual_condition.db`;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbPath);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting database:', error);
    return false;
  }
};