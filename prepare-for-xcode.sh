#!/bin/bash

# =============================================================================
# Comprehensive iOS Preparation Script for Spiritual Condition Tracker
# This single script handles all aspects of preparing the app for Xcode build
# =============================================================================

echo "=========================================================="
echo "Spiritual Condition Tracker - iOS Build Preparation Script"
echo "=========================================================="

# Ensure we're in the project root
cd $(dirname "$0")
PROJECT_ROOT=$(pwd)
echo "Project root: $PROJECT_ROOT"

# Ensure expo app exists
if [ ! -d "$PROJECT_ROOT/expo-app" ]; then
  echo "Error: expo-app directory not found!"
  exit 1
fi

# Go to the Expo app directory
cd "$PROJECT_ROOT/expo-app"
echo "Entered expo-app directory"

# Check if the required tools are installed
if ! command -v npx &> /dev/null; then
  echo "Error: npx is not installed. Please install Node.js and npm."
  exit 1
fi

# Check if the ios directory already exists and ask to remove it
if [ -d "$PROJECT_ROOT/expo-app/ios" ]; then
  echo "iOS directory already exists."
  read -p "Do you want to remove it and create a fresh build? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing existing iOS directory..."
    rm -rf "$PROJECT_ROOT/expo-app/ios"
  else
    echo "Using existing iOS directory."
  fi
fi

# Install dependencies if needed
if [ ! -d "$PROJECT_ROOT/expo-app/node_modules" ]; then
  echo "Installing node modules..."
  npm install
fi

# Making sure SQLite is properly installed
echo "Checking and fixing SQLite dependencies in package.json..."
if ! grep -q "react-native-sqlite-storage" package.json; then
  echo "Installing react-native-sqlite-storage..."
  npm install --save react-native-sqlite-storage
else
  echo "react-native-sqlite-storage is already installed."
fi

# Fix SQLite configuration
echo "Applying SQLite configuration fixes..."
# Create fix-sqlite-config.js inline if it doesn't exist
if [ ! -f "$PROJECT_ROOT/fix-sqlite-config.js" ]; then
  echo "Creating SQLite configuration fix script..."
  cat > "$PROJECT_ROOT/fix-sqlite-config.js" << 'EOF'
/**
 * This script fixes the react-native-sqlite-storage configuration warnings
 * by updating the dependency.platforms.ios.project format in the package.json
 */

const fs = require('fs');
const path = require('path');

// Path to the react-native-sqlite-storage package.json
const sqlitePackagePath = path.join(
  __dirname,
  'node_modules',
  'react-native-sqlite-storage',
  'package.json'
);

console.log(`Checking SQLite configuration at: ${sqlitePackagePath}`);

// Check if the file exists
if (!fs.existsSync(sqlitePackagePath)) {
  console.error('Error: react-native-sqlite-storage package.json not found!');
  process.exit(1);
}

// Read the package.json file
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(sqlitePackagePath, 'utf8'));
  console.log('Successfully read package.json');
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Check if the dependency configuration exists
if (
  packageJson.dependency &&
  packageJson.dependency.platforms &&
  packageJson.dependency.platforms.ios &&
  packageJson.dependency.platforms.ios.project
) {
  console.log('Found problematic configuration, fixing...');
  
  // Fix the configuration format
  // The warning is about the format of "dependency.platforms.ios.project"
  // Let's remove it and use the standard format
  delete packageJson.dependency.platforms.ios.project;
  
  // Add the correct podspec path
  packageJson.dependency.platforms.ios.podspecPath = 'platforms/ios/react-native-sqlite-storage.podspec';
  
  // Write the updated package.json back to the file
  try {
    fs.writeFileSync(sqlitePackagePath, JSON.stringify(packageJson, null, 2));
    console.log('Successfully updated package.json!');
  } catch (error) {
    console.error('Error writing package.json:', error);
    process.exit(1);
  }
} else {
  console.log('No problematic configuration found, nothing to fix.');
}

console.log('SQLite configuration check complete.');
EOF
fi

# Run the SQLite fix script
node "$PROJECT_ROOT/fix-sqlite-config.js"

# Create iOS-specific database implementation
echo "Creating iOS-specific database implementation..."
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

# Create react-native.config.js if it doesn't exist
if [ ! -f "react-native.config.js" ]; then
  echo "Creating react-native.config.js..."
  cat > "react-native.config.js" << 'EOF'
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
};
EOF
fi

# Make sure all assets are properly linked
echo "Linking assets..."
npx react-native-asset

# Create the iOS project
echo "Creating iOS project..."
npx expo prebuild --platform ios --clean

if [ ! -d "$PROJECT_ROOT/expo-app/ios" ]; then
  echo "Error: Failed to create iOS directory!"
  exit 1
fi

# Modify the Podfile with our SQLite configurations if needed
echo "Checking Podfile for SQLite configuration..."
cd "$PROJECT_ROOT/expo-app"

# Return to project root after Podfile modification
cd "$PROJECT_ROOT/expo-app"

# Use the recommended Expo method to install iOS dependencies and build
echo "Installing iOS dependencies using recommended Expo method..."
echo "This step may take several minutes..."

# Run the Expo iOS build command
npx expo prebuild --platform ios --clean || {
  echo "Error: Failed to run 'npx expo prebuild'. Trying with --no-install option..."
  npx expo prebuild --platform ios --clean --no-install
}

# Verify the iOS directory was created
if [ ! -d "$PROJECT_ROOT/expo-app/ios" ]; then
  echo "Error: iOS directory was not created after running 'npx expo prebuild'"
  exit 1
fi

# After prebuild is done, prepare the iOS project for Xcode
echo "Running 'npx expo run:ios' to prepare the build for Xcode..."
echo "Note: This won't actually launch the simulator, just prepare the project for Xcode."

# Use the --no-install flag to avoid installing pods again (already done in prebuild)
cd "$PROJECT_ROOT/expo-app"
npx expo run:ios --configuration Release --no-install --no-build

# Validate the build
echo "Validating build configuration..."

# Find the workspace file (name could vary based on the app's slug)
WORKSPACE_PATH=$(find "$PROJECT_ROOT/expo-app/ios" -name "*.xcworkspace" 2>/dev/null | head -n 1)

if [ -z "$WORKSPACE_PATH" ]; then
  echo "Error: Xcode workspace not found!"
  echo "Looking in directories..."
  ls -la "$PROJECT_ROOT/expo-app"
  echo "iOS directory contents:"
  ls -la "$PROJECT_ROOT/expo-app/ios" 2>/dev/null || echo "iOS directory not found"
  
  echo ""
  echo "This could be because:"
  echo "1. The prebuild process did not complete successfully"
  echo "2. The app slug in app.json does not match the expected name"
  echo "3. The iOS platform files were not generated correctly"
  
  # Show app slug from app.json to help diagnose
  APP_SLUG=$(grep -o '"slug": *"[^"]*"' "$PROJECT_ROOT/expo-app/app.json" | cut -d'"' -f4)
  if [ ! -z "$APP_SLUG" ]; then
    echo "App slug from app.json: $APP_SLUG"
    echo "Expected workspace might be: $PROJECT_ROOT/expo-app/ios/$APP_SLUG.xcworkspace"
    
    # Check if workspace exists with app slug
    if [ -f "$PROJECT_ROOT/expo-app/ios/$APP_SLUG.xcworkspace" ]; then
      echo "Found workspace with app slug!"
      WORKSPACE_PATH="$PROJECT_ROOT/expo-app/ios/$APP_SLUG.xcworkspace"
    fi
  fi
  
  if [ -z "$WORKSPACE_PATH" ]; then
    # Still not found, exit with error
    echo "Could not find Xcode workspace. Please check the iOS build process."
    exit 1
  fi
fi

echo "Found Xcode workspace at: $WORKSPACE_PATH"

# Find the app name from app.json
APP_NAME=$(grep -o '"name": *"[^"]*"' "$PROJECT_ROOT/expo-app/app.json" | head -1 | cut -d'"' -f4)
if [ -z "$APP_NAME" ]; then
  APP_NAME="SpiritualConditionTracker" # Fallback name
fi

# Update Info.plist path based on app name
INFO_PLIST="$PROJECT_ROOT/expo-app/ios/$APP_NAME/Info.plist"
if [ ! -f "$INFO_PLIST" ]; then
  # Try to find Info.plist if not at the expected location
  INFO_PLIST=$(find "$PROJECT_ROOT/expo-app/ios" -name "Info.plist" | head -1)
fi

# Check if Info.plist has required keys
if [ -f "$INFO_PLIST" ]; then
  echo "Checking Info.plist at $INFO_PLIST..."
  
  # This simple check just makes sure the file exists and is readable
  if ! grep -q "CFBundleIdentifier" "$INFO_PLIST"; then
    echo "Warning: Info.plist may be missing important configuration!"
  else
    echo "Info.plist looks good"
  fi
else
  echo "Warning: Info.plist not found at expected location!"
fi

# Generate a quick validation report
echo "Creating build validation report..."
cat > "$PROJECT_ROOT/ios-build-validation.txt" << EOF
iOS Build Validation Report
Date: $(date)

Project Directory: $PROJECT_ROOT/expo-app/ios
Xcode Workspace: $(ls -la "$WORKSPACE_PATH" 2>/dev/null || echo "Not found!")
Podfile: $(ls -la "$PROJECT_ROOT/expo-app/ios/Podfile" 2>/dev/null || echo "Not found!")
Info.plist: $(ls -la "$INFO_PLIST" 2>/dev/null || echo "Not found!")
App Name: $APP_NAME

React Native SQLite Storage: $(grep -q "react-native-sqlite-storage" "$PROJECT_ROOT/expo-app/package.json" && echo "Installed" || echo "Not installed!")
Platform-specific SQLite implementation: $(ls -la "$PROJECT_ROOT/expo-app/src/database/platforms/database.ios.js" 2>/dev/null || echo "Not found!")

Next steps:
1. Open the Xcode workspace at: $WORKSPACE_PATH
2. Select your team in Signing & Capabilities
3. Run the app on a simulator or device
EOF

echo "=========================================================="
echo "iOS build preparation complete!"
echo "=========================================================="
echo "Open the following workspace in Xcode:"
echo "$WORKSPACE_PATH"
echo
echo "Important notes:"
echo "1. Make sure you have the correct team selected in Xcode"
echo "2. Verify signing & capabilities are properly configured"
echo "3. Check the validation report at: $PROJECT_ROOT/ios-build-validation.txt"
echo "=========================================================="