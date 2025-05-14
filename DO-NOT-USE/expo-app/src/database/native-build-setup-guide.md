# Native Build Setup Guide for AA Recovery Tracker

This guide will walk you through setting up the AA Recovery Tracker app as a fully standalone native React Native application that can be built in Xcode without any backend server dependencies.

## Key Requirements

- Fully standalone native React Native app
- Build directly with Xcode
- No backend server dependencies
- Local SQLite database for storage

## 1. Prepare Project Structure

First, let's ensure we have a clean and organized project structure:

```bash
# Create a clean project directory if needed
mkdir -p AARecoveryTracker
cd AARecoveryTracker

# Initialize git repository if not already done
git init
```

## 2. Setup React Native with Native iOS Build

```bash
# Install React Native CLI globally if needed
npm install -g react-native-cli

# Initialize a new React Native project (skip if project already exists)
npx react-native init AARecoveryTracker --version 0.72.0

# If project already exists, run this inside your project:
npm install
```

## 3. Configure for Offline-First, No Backend Dependencies

Replace or create the config file to ensure offline-first functionality:

```javascript
// src/config/appConfig.js
export const APP_CONFIG = {
  // Set to true for standalone mode with no server dependencies
  standaloneMode: true,
  
  // Local SQLite database configuration
  database: {
    name: 'aarecovery.db',
    location: 'default',
    version: 1
  },
  
  // Default settings
  defaults: {
    syncFrequency: 0, // 0 = no sync (offline only)
    notificationLeadTime: 30, // minutes
    sobrietyDateTracking: true,
    privacyMode: true
  }
};
```

## 4. Setup SQLite for Local Storage

Install React Native SQLite:

```bash
npm install --save react-native-sqlite-storage
```

Configure iOS to use SQLite:

```bash
cd ios
pod install
cd ..
```

## 5. Clean Native iOS Build Configuration

Create a fresh, clean Podfile:

```ruby
# ios/Podfile
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, min_ios_version_supported
prepare_react_native_project!

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'AARecoveryTracker' do
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => flags[:hermes_enabled],
    :fabric_enabled => flags[:fabric_enabled],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # Add the SQLite pod for local database
  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
  
  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
  end
end
```

## 6. Configure App for Standalone Mode

Ensure the app can function completely offline by modifying the main data access layer:

```javascript
// src/services/dataService.js
import SQLite from 'react-native-sqlite-storage';
import { APP_CONFIG } from '../config/appConfig';

// Enable SQLite Promises
SQLite.enablePromise(true);

// Database connection
let database = null;

// Initialize database
export const initDatabase = async () => {
  if (database) {
    console.log('Database already initialized');
    return database;
  }
  
  try {
    database = await SQLite.openDatabase({
      name: APP_CONFIG.database.name,
      location: APP_CONFIG.database.location,
    });
    
    console.log('Database initialized successfully');
    
    // Create tables if they don't exist
    await createTables(database);
    
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create database tables
const createTables = async (db) => {
  // Create users table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      sobrietyDate TEXT,
      profileImageUri TEXT,
      settings TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
  
  // Create activities table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      date TEXT,
      duration INTEGER,
      notes TEXT,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);
  
  // Create meetings table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      name TEXT,
      location TEXT,
      day TEXT,
      time TEXT,
      type TEXT,
      notes TEXT,
      isShared INTEGER,
      createdBy TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);
  
  console.log('Database tables created successfully');
};

// User operations
export const userOperations = {
  // Functions for user CRUD operations
};

// Activity operations
export const activityOperations = {
  // Functions for activity CRUD operations
};

// Meeting operations
export const meetingOperations = {
  // Functions for meeting CRUD operations
};
```

## 7. Build and Run in Xcode

Now that everything is configured for a standalone native build:

```bash
# Make sure iOS dependencies are installed
cd ios
pod install --repo-update
cd ..

# Open the Xcode workspace
open ios/AARecoveryTracker.xcworkspace
```

In Xcode:
1. Select your target device or simulator
2. Click the Run button (▶️) to build and run the app

## 8. Troubleshooting Native Build Issues

### Xcode Project Issues

If you encounter issues with the Xcode project file:

```bash
# Recreate the iOS project files
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install --repo-update
```

### Unable to Find React Native

If Xcode can't find React Native:

```bash
# Verify node_modules is properly installed
npm install

# Reinstall pods with explicit path
cd ios
pod install --repo-update
```

### SQLite Integration Issues

If SQLite isn't working properly:

```bash
# Make sure SQLite is properly linked
cd ios
pod deintegrate
pod install --repo-update
```

## Summary

This configuration creates a completely standalone React Native application that:
1. Uses SQLite for local storage instead of a server
2. Runs natively in Xcode
3. Has no backend server dependencies
4. Stores all user data locally on the device