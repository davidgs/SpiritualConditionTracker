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
  echo "Installing node modules with dependency conflict handling..."
  # Create .npmrc to handle peer dependency conflicts
  echo "legacy-peer-deps=true" > .npmrc
  npm install --legacy-peer-deps
  
  # If that fails, try with force
  if [ $? -ne 0 ]; then
    echo "Initial install failed, trying with --force..."
    npm install --force
  fi
else
  echo "Node modules already installed. Checking React/React Native compatibility..."
  # Check if React and React Native versions are compatible
  REACT_NATIVE_VERSION=$(grep -o '"react-native": *"[^"]*"' package.json | cut -d'"' -f4)
  REACT_VERSION=$(grep -o '"react": *"[^"]*"' package.json | cut -d'"' -f4)
  
  echo "Found React Native version: $REACT_NATIVE_VERSION"
  echo "Found React version: $REACT_VERSION"
  
  # If using React Native 0.79+ and React is not 19+, we need to update React
  if [[ "$REACT_NATIVE_VERSION" == *"0.79"* ]] && [[ "$REACT_VERSION" != *"19"* ]]; then
    echo "Detected incompatible React/React Native versions."
    echo "React Native 0.79+ requires React 19+."
    
    read -p "Do you want to update React to match React Native requirements? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Creating backup of package.json..."
      cp package.json package.json.bak
      
      # Update React version
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS sed
        sed -i '' 's/"react": *"[^"]*"/"react": "^19.0.0"/' package.json
        sed -i '' 's/"react-dom": *"[^"]*"/"react-dom": "^19.0.0"/' package.json
      else
        # GNU sed
        sed -i 's/"react": *"[^"]*"/"react": "^19.0.0"/' package.json
        sed -i 's/"react-dom": *"[^"]*"/"react-dom": "^19.0.0"/' package.json
      fi
      
      echo "Updated package.json with React 19. Reinstalling dependencies..."
      echo "legacy-peer-deps=true" > .npmrc
      npm install --legacy-peer-deps
      
      if [ $? -ne 0 ]; then
        echo "Dependency installation failed. Restoring backup..."
        cp package.json.bak package.json
        npm install
        echo "WARNING: React/React Native version conflict remains unresolved."
        echo "You may need to manually resolve dependency conflicts."
      else
        echo "Successfully updated React to be compatible with React Native."
      fi
    else
      echo "Continuing with current versions. This may cause prebuild issues."
    fi
  fi
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

# Ensure CocoaPods is properly installed
echo "Checking CocoaPods installation..."
if ! command -v pod &> /dev/null; then
  echo "CocoaPods not found. Installing CocoaPods..."
  sudo gem install cocoapods
fi

# Find the app name from app.json first, we'll need it for the Podfile
APP_NAME=$(grep -o '"name": *"[^"]*"' "$PROJECT_ROOT/expo-app/app.json" | head -1 | cut -d'"' -f4)
if [ -z "$APP_NAME" ]; then
  APP_NAME="SpiritualConditionTracker" # Fallback name
fi

# Convert to a valid target name (remove spaces, special chars)
XCODE_TARGET_NAME=$(echo "$APP_NAME" | sed 's/[^a-zA-Z0-9]//g')
echo "Using Xcode target name: $XCODE_TARGET_NAME"

# Check if Podfile exists
echo "Checking for Podfile..."
cd "$PROJECT_ROOT/expo-app/ios"
if [ ! -f "Podfile" ]; then
  echo "Podfile not found. Creating a minimal Podfile..."
  # We need to avoid using heredoc EOF to properly expand variables
  echo 'require_relative "../node_modules/react-native/scripts/react_native_pods"' > Podfile
  echo 'require_relative "../node_modules/@react-native-community/cli-platform-ios/native_modules"' >> Podfile
  echo '' >> Podfile
  echo 'platform :ios, min_ios_version_supported' >> Podfile
  echo 'prepare_react_native_project!' >> Podfile
  echo '' >> Podfile
  echo '# If you are using a `react-native-flipper` your iOS build will fail when `NO_FLIPPER=1` is set.' >> Podfile
  echo '# because `react-native-flipper` depends on (FlipperKit,...) that will be excluded' >> Podfile
  echo '#' >> Podfile
  echo '# To fix this you can also exclude `react-native-flipper` using a `react-native.config.js`' >> Podfile
  echo '# ```js' >> Podfile
  echo '# module.exports = {' >> Podfile
  echo '#   dependencies: {' >> Podfile
  echo '#     ...(process.env.NO_FLIPPER ? { "react-native-flipper": { platforms: { ios: null } } } : {}),' >> Podfile
  echo '# ```' >> Podfile
  echo 'flipper_config = ENV["NO_FLIPPER"] == "1" ? FlipperConfiguration.disabled : FlipperConfiguration.enabled' >> Podfile
  echo '' >> Podfile
  echo 'linkage = ENV["USE_FRAMEWORKS"]' >> Podfile
  echo 'if linkage != nil' >> Podfile
  echo '  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green' >> Podfile
  echo '  use_frameworks! :linkage => linkage.to_sym' >> Podfile
  echo 'end' >> Podfile
  echo '' >> Podfile
  echo "target '$XCODE_TARGET_NAME' do" >> Podfile
  echo '  config = use_native_modules!' >> Podfile
  echo '' >> Podfile
  echo '  # Flags change depending on the env values.' >> Podfile
  echo '  flags = get_default_flags()' >> Podfile
  echo '' >> Podfile
  echo '  use_react_native!(' >> Podfile
  echo '    :path => config[:reactNativePath],' >> Podfile
  echo '    # Hermes is now enabled by default. Disable by setting this flag to false.' >> Podfile
  echo '    :hermes_enabled => flags[:hermes_enabled],' >> Podfile
  echo '    :fabric_enabled => flags[:fabric_enabled],' >> Podfile
  echo '    # Enables Flipper.' >> Podfile
  echo '    #' >> Podfile
  echo '    # Note that if you have use_frameworks! enabled, Flipper will not work and' >> Podfile
  echo '    # you should disable the next line.' >> Podfile
  echo '    :flipper_configuration => flipper_config,' >> Podfile
  echo '    # An absolute path to your application root.' >> Podfile
  echo '    :app_path => "#{Pod::Config.instance.installation_root}/.."' >> Podfile
  echo '  )' >> Podfile
  echo '' >> Podfile
  echo "  # SQLite specific pod" >> Podfile
  echo "  pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'" >> Podfile
  echo '' >> Podfile
  echo '  # Post install processing for SQLite compatibility' >> Podfile
  echo '  post_install do |installer|' >> Podfile
  echo '    installer.pods_project.targets.each do |target|' >> Podfile
  echo '      target.build_configurations.each do |config|' >> Podfile
  echo "        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'" >> Podfile
  echo '        ' >> Podfile
  echo "        # SQLite-specific settings" >> Podfile
  echo "        if target.name == 'react-native-sqlite-storage'" >> Podfile
  echo "          config.build_settings['CLANG_WARN_STRICT_PROTOTYPES'] = 'NO'" >> Podfile
  echo "          config.build_settings['HEADER_SEARCH_PATHS'] = '$(inherited) \"\${PODS_ROOT}/Headers/Public\" \"\${PODS_ROOT}/Headers/Public/React-hermes\"'" >> Podfile
  echo '        end' >> Podfile
  echo '      end' >> Podfile
  echo '    end' >> Podfile
  echo '    ' >> Podfile
  echo '    # Additional code signing fix' >> Podfile
  echo '    installer.pods_project.build_configurations.each do |config|' >> Podfile
  echo '      config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"' >> Podfile
  echo '    end' >> Podfile
  echo '  end' >> Podfile
  echo 'end' >> Podfile
  
  echo "Created new Podfile with SQLite configuration"
fi

# Manually run pod install in the iOS directory to ensure dependencies are in sync
echo "Running pod install to synchronize dependencies..."
pod install

# Create a JavaScript bundle directly to embed in the iOS app
echo "Creating a JavaScript bundle for embedding in the iOS app..."
cd "$PROJECT_ROOT/expo-app"

# Create assets directory if it doesn't exist
mkdir -p ios/assets

# Bundle the JavaScript code
echo "Building JavaScript bundle with Metro..."
npx react-native bundle --entry-file=index.js --platform=ios --dev=false --bundle-output=ios/assets/main.jsbundle --assets-dest=ios/assets

# Add code to use the embedded bundle in AppDelegate.m
APPDELEGATE_PATH=$(find "$PROJECT_ROOT/expo-app/ios" -name "AppDelegate.m" | head -1)
if [ -f "$APPDELEGATE_PATH" ]; then
  echo "Found AppDelegate.m at $APPDELEGATE_PATH"
  
  # Check if we need to update the AppDelegate
  if ! grep -q "jsCodeLocation = \[\[NSBundle mainBundle\] URLForResource:@\"main\" withExtension:@\"jsbundle\"\];" "$APPDELEGATE_PATH"; then
    echo "Updating AppDelegate.m to use embedded JavaScript bundle..."
    # Make a backup first
    cp "$APPDELEGATE_PATH" "${APPDELEGATE_PATH}.bak"
    
    # Replace the jsCodeLocation line - handle macOS sed differently
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS sed requires a suffix with -i
      sed -i '' -e 's|jsCodeLocation = \[\[RCTBundleURLProvider sharedSettings\] jsBundleURLForBundleRoot:@"index"];|// Use this for release builds\n  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];\n  \n  // Use this for debugging\n  // jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];|g' "$APPDELEGATE_PATH"
    else
      # Linux sed works without a suffix
      sed -i -e 's|jsCodeLocation = \[\[RCTBundleURLProvider sharedSettings\] jsBundleURLForBundleRoot:@"index"];|// Use this for release builds\n  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];\n  \n  // Use this for debugging\n  // jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];|g' "$APPDELEGATE_PATH"
    fi
    
    echo "AppDelegate.m updated to use embedded bundle"
  else
    echo "AppDelegate.m already configured to use embedded bundle"
  fi
else
  echo "Warning: Could not find AppDelegate.m"
fi

# After prebuild is done, prepare the iOS project for Xcode
echo "Running 'npx expo run:ios' to prepare the build for Xcode..."
echo "Note: This won't actually launch the simulator, just prepare the project for Xcode."

# Ensure the jsbundle is included in the Xcode project
echo "Checking for main.jsbundle in Xcode project..."
if [ -f "$PROJECT_ROOT/expo-app/ios/assets/main.jsbundle" ]; then
  # Check if the project has a reference to the jsbundle
  PBXPROJ_PATH=$(find "$PROJECT_ROOT/expo-app/ios" -name "project.pbxproj" | head -1)
  if [ -f "$PBXPROJ_PATH" ]; then
    if ! grep -q "main.jsbundle" "$PBXPROJ_PATH"; then
      echo "WARNING: main.jsbundle is not referenced in the Xcode project."
      echo "You will need to manually add the bundle to your Xcode project:"
      echo "1. Open Xcode and the workspace"
      echo "2. Right-click on your project in the Project Navigator"
      echo "3. Select 'Add Files to \"YourProject\"...'"
      echo "4. Navigate to ios/assets/ and select main.jsbundle"
      echo "5. Make sure 'Copy items if needed' is checked"
      echo "6. Click Add"
    else
      echo "main.jsbundle is already referenced in the Xcode project."
    fi
  else
    echo "WARNING: Could not find project.pbxproj file."
  fi
else
  echo "WARNING: main.jsbundle was not generated. This may cause runtime errors."
fi

# Create a simple script for users to manually add the bundle if needed
cat > "$PROJECT_ROOT/add-bundle-to-xcode.sh" << 'EOF'
#!/bin/bash
echo "This script will help you manually add the JavaScript bundle to your Xcode project."
echo "Please run this script AFTER opening your Xcode project."
echo ""

# Find the app directory
APP_DIR=$(find . -type d -name "ios" | head -1)
if [ -z "$APP_DIR" ]; then
  echo "Error: Could not find iOS directory."
  exit 1
fi

# Check if the bundle exists
if [ ! -f "$APP_DIR/assets/main.jsbundle" ]; then
  echo "Error: main.jsbundle not found in $APP_DIR/assets/"
  echo "Creating the assets directory and generating the bundle..."
  mkdir -p "$APP_DIR/assets"
  
  # Build the bundle
  npx react-native bundle --entry-file=index.js --platform=ios --dev=false --bundle-output="$APP_DIR/assets/main.jsbundle" --assets-dest="$APP_DIR/assets"
  
  if [ $? -ne 0 ]; then
    echo "Failed to generate bundle. Please check the error message above."
    exit 1
  fi
fi

echo "Bundle generated at: $APP_DIR/assets/main.jsbundle"
echo ""
echo "Please follow these steps in Xcode:"
echo "1. Right-click on your project in the Project Navigator"
echo "2. Select 'Add Files to [YourProject]...'"
echo "3. Navigate to $APP_DIR/assets/ and select main.jsbundle"
echo "4. Make sure 'Copy items if needed' is checked"
echo "5. Click Add"
echo ""
echo "After adding the bundle, make sure AppDelegate.m is configured to use it:"
echo "Find the line with 'jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@\"index\"];'"
echo "Replace it with: jsCodeLocation = [[NSBundle mainBundle] URLForResource:@\"main\" withExtension:@\"jsbundle\"];"
echo ""
echo "Then build and run the project again."
EOF

chmod +x "$PROJECT_ROOT/add-bundle-to-xcode.sh"
echo "Created helper script: add-bundle-to-xcode.sh"

# Run the bundled build with the generated assets
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

# Copy the updated assets to iOS resources
echo "Copying updated assets to iOS resources..."
if [ -f "$PROJECT_ROOT/expo-app/assets/original-logo.jpg" ]; then
  # Run the asset copy script if it exists
  if [ -f "$PROJECT_ROOT/copy-assets-to-native.sh" ]; then
    echo "Running asset copy script..."
    "$PROJECT_ROOT/copy-assets-to-native.sh"
  else
    # Manual copy if the script doesn't exist
    echo "Manually copying assets..."
    
    # Find the app name directory
    APP_NAME=$(grep -o '"name": *"[^"]*"' "$PROJECT_ROOT/expo-app/app.json" | head -1 | cut -d'"' -f4)
    if [ -z "$APP_NAME" ]; then
      APP_NAME="SpiritualConditionTracker" # Fallback name
    fi
    
    # Create Images.xcassets if needed
    XCASSETS_DIR="$PROJECT_ROOT/expo-app/ios/$APP_NAME/Images.xcassets"
    if [ ! -d "$XCASSETS_DIR" ]; then
      echo "Creating Images.xcassets directory..."
      mkdir -p "$XCASSETS_DIR"
    fi
    
    # Copy the logo
    echo "Copying logo.jpg to iOS resources..."
    cp "$PROJECT_ROOT/expo-app/assets/original-logo.jpg" "$PROJECT_ROOT/expo-app/ios/$APP_NAME/logo.jpg"
    
    # Create AppIcon.appiconset if needed
    APPICON_DIR="$XCASSETS_DIR/AppIcon.appiconset"
    if [ ! -d "$APPICON_DIR" ]; then
      echo "Creating AppIcon.appiconset directory..."
      mkdir -p "$APPICON_DIR"
    fi
    
    # Copy the icon if it exists
    if [ -f "$PROJECT_ROOT/expo-app/assets/icon.png" ]; then
      echo "Copying icon.png to AppIcon.appiconset..."
      cp "$PROJECT_ROOT/expo-app/assets/icon.png" "$APPICON_DIR/icon.png"
    fi
  fi
else
  echo "Original logo not found, skipping asset copy."
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
JavaScript Bundle: $(ls -la "$PROJECT_ROOT/expo-app/ios/assets/main.jsbundle" 2>/dev/null || echo "Not found!")
AppDelegate.m configuration: $(grep -q "URLForResource:@\"main\" withExtension:@\"jsbundle\"" "$APPDELEGATE_PATH" && echo "Configured to use embedded bundle" || echo "Using RCTBundleURLProvider")

Next steps:
1. Open the Xcode workspace at: $WORKSPACE_PATH
2. Select your team in Signing & Capabilities
3. Run the app on a simulator or device

Troubleshooting:
If you get 'No script URL provided' error:
- Make sure the JavaScript bundle was generated in ios/assets/main.jsbundle
- Verify AppDelegate.m is configured to use the embedded bundle
- Check that the bundle is included in the Xcode project (Add files to project if needed)

For other issues:
- Check the console logs in Xcode for more specific error messages
- Make sure all native dependencies are properly linked
- Verify that the SQLite storage module is properly configured
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