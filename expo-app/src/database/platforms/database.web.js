/**
 * Web-specific database implementation using localStorage
 * This is a wrapper around the simpler implementation
 */

// Import the simpler database implementation
import * as SimpleDB from './database.web.simple';

// Export all functions from the simple implementation
export const initializeDatabase = SimpleDB.initializeDatabase;
export const executeQuery = SimpleDB.executeQuery;
export const closeDatabase = SimpleDB.closeDatabase;
export const deleteDatabase = SimpleDB.deleteDatabase;