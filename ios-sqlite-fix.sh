#!/bin/bash

# iOS SQLite Fix Script for Spiritual Condition Tracker
# This script fixes common SQLite issues for iOS builds

echo "=========================================="
echo "iOS SQLite Compatibility Fix Script"
echo "=========================================="

# Ensure we're in the project root
cd $(dirname "$0")
PROJECT_ROOT=$(pwd)
echo "Project root: $PROJECT_ROOT"

# Check if the iOS directory exists
if [ ! -d "$PROJECT_ROOT/expo-app/ios" ]; then
  echo "Error: iOS directory not found. Run prepare-ios-build.sh first."
  exit 1
fi

# Go to the Expo app directory
cd "$PROJECT_ROOT/expo-app"

# 1. Fix SQLite dependencies in package.json
echo "Checking and fixing SQLite dependencies in package.json..."

# Check if react-native-sqlite-storage is installed
if ! grep -q "react-native-sqlite-storage" package.json; then
  echo "Installing react-native-sqlite-storage..."
  npm install --save react-native-sqlite-storage
else
  echo "react-native-sqlite-storage is already installed."
fi

# 2. Check and fix the SQLite configuration
echo "Applying SQLite configuration fix..."
node "$PROJECT_ROOT/fix-sqlite-config.js"

# 3. Create or update the iOS-specific database implementation
echo "Updating iOS-specific database implementation..."

# Create the platform-specific directory if it doesn't exist
mkdir -p src/database/platforms

# Create the iOS-specific database implementation
cat > src/database/platforms/database.ios.js << 'EOF'
/**
 * iOS-specific database implementation
 * This file contains iOS-specific SQLite initialization
 */

import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';

// Enable SQLite debugging in development
SQLite.DEBUG(process.env.NODE_ENV === 'development');

// Prevent native crash on close
SQLite.enablePromise(true);

// Set database configuration for iOS
const DATABASE_NAME = 'spiritualcondition.db';
const DATABASE_LOCATION = 'Library/LocalDatabase';

/**
 * Initialize the database connection
 * @returns {Promise<SQLite.SQLiteDatabase>} Database connection object
 */
export async function openDatabase() {
  console.log('[iOS] Opening database connection to', DATABASE_NAME);
  
  try {
    const db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: DATABASE_LOCATION,
      createFromLocation: 1
    });
    
    console.log('[iOS] Database connection successful');
    return db;
  } catch (error) {
    console.error('[iOS] Error opening database:', error.message);
    throw error;
  }
}

/**
 * Close the database connection
 * @param {SQLite.SQLiteDatabase} db Database connection to close
 * @returns {Promise<void>}
 */
export async function closeDatabase(db) {
  if (db) {
    console.log('[iOS] Closing database connection');
    try {
      await db.close();
      console.log('[iOS] Database connection closed successfully');
    } catch (error) {
      console.error('[iOS] Error closing database:', error.message);
    }
  }
}

/**
 * Create a table if it doesn't exist
 * @param {SQLite.SQLiteDatabase} db Database connection
 * @param {string} tableName Name of the table to create
 * @param {string} tableSchema SQL schema for the table
 * @returns {Promise<void>}
 */
export async function createTable(db, tableName, tableSchema) {
  console.log(`[iOS] Creating table if not exists: ${tableName}`);
  
  try {
    await db.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (${tableSchema})`);
    console.log(`[iOS] Table ${tableName} created or already exists`);
  } catch (error) {
    console.error(`[iOS] Error creating table ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Platform-specific database utilities
 */
export const platformUtils = {
  // iOS-specific function to check if a table exists
  tableExists: async (db, tableName) => {
    try {
      const [results] = await db.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName]
      );
      
      return results.rows.length > 0;
    } catch (error) {
      console.error(`[iOS] Error checking if table ${tableName} exists:`, error.message);
      throw error;
    }
  },
  
  // iOS-specific vacuum function to optimize database
  vacuumDatabase: async (db) => {
    try {
      await db.executeSql('VACUUM');
      console.log('[iOS] Database vacuumed successfully');
    } catch (error) {
      console.error('[iOS] Error vacuuming database:', error.message);
    }
  },
  
  // iOS-specific backup function
  backupDatabase: async () => {
    // iOS backup implementation would go here
    console.log('[iOS] Database backup not implemented on iOS yet');
  },
};
EOF

echo "Created iOS-specific database implementation"

# 4. Create an iOS podfile post-install hook for SQLite
echo "Adding SQLite pod configuration..."

# Go to the iOS directory
cd ios

# Check if Podfile exists
if [ ! -f "Podfile" ]; then
  echo "Error: Podfile not found. Run prepare-ios-build.sh first."
  exit 1
fi

# Backup Podfile
cp Podfile Podfile.bak

# Add post-install hook if it doesn't exist
if ! grep -q "post_install do |installer|" Podfile; then
  echo "Adding post_install hook to Podfile..."
  
  # Append post_install configuration
  cat >> Podfile << 'EOF'

# Post install processing for SQLite compatibility
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
      
      # SQLite-specific settings
      if target.name == 'react-native-sqlite-storage'
        config.build_settings['CLANG_WARN_STRICT_PROTOTYPES'] = 'NO'
        config.build_settings['HEADER_SEARCH_PATHS'] = '$(inherited) "${PODS_ROOT}/Headers/Public" "${PODS_ROOT}/Headers/Public/React-hermes"'
      end
    end
  end
end
EOF

  echo "Updated Podfile with SQLite configuration"
  
  # Run pod install again
  echo "Running 'pod install' to apply changes..."
  pod install
else
  echo "Podfile already has post_install hook, skipping modification."
fi

echo "=========================================="
echo "iOS SQLite fixes applied!"
echo "=========================================="
echo "Important notes:"
echo "1. Make sure to run the app on an iOS simulator or device to test SQLite"
echo "2. Check app logs for any SQLite-related errors"
echo "3. If issues persist, try cleaning the build and rebuilding"
echo "=========================================="