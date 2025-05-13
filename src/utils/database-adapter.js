/**
 * Platform-specific database adapter for Spiritual Condition Tracker
 * 
 * This module dynamically imports the appropriate database implementation
 * based on the current platform (web or native)
 */

import { Platform } from 'react-native';
import * as localDatabase from './local-database';

// Determine if we are on web
const isWebPlatform = Platform.OS === 'web';

// Select the appropriate database implementation
const database = isWebPlatform ? localDatabase : require('./database');

// Export the database interface
export default database;