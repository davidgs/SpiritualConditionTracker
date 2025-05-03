#!/bin/bash

# This script fixes SQLite integration issues in iOS builds

echo "Fixing SQLite integration for iOS build..."

# Step 1: Clean Pods
echo "Step 1: Cleaning Pods..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf DerivedData
rm -rf *.xcworkspace

# Step 2: Update Bridging Header and Podfile
echo "Step 2: Making sure Bridging Header is correct..."
cat > AARecoveryTracker/AARecoveryTracker-Bridging-Header.h << 'EOL'
#ifndef AARecoveryTracker_Bridging_Header_h
#define AARecoveryTracker_Bridging_Header_h

// React Native imports
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>

// Use system SQLite import instead of trying to reference SQLite3 directly
#import <sqlite3.h>

#endif /* AARecoveryTracker_Bridging_Header_h */
EOL

# Step 3: Force SQLite framework linkage in the Xcode project (pbxproj)
echo "Step 3: Updating project.pbxproj..."
# Back up first
cp AARecoveryTracker.xcodeproj/project.pbxproj AARecoveryTracker.xcodeproj/project.pbxproj.backup

# Add libsqlite3.tbd to Frameworks if not present
if ! grep -q "libsqlite3.tbd" AARecoveryTracker.xcodeproj/project.pbxproj; then
  echo "Adding libsqlite3.tbd to frameworks..."
  # This is a complex operation normally requiring PlistBuddy or xcodeproj gem
  # For scripts, we'll need to manually inform the user to add it in Xcode
  echo "NOTE: Please manually add libsqlite3.tbd to your project frameworks in Xcode"
  echo "1. Open AARecoveryTracker.xcworkspace in Xcode"
  echo "2. Select the AARecoveryTracker target"
  echo "3. Go to 'Build Phases' tab"
  echo "4. Expand 'Link Binary With Libraries'"
  echo "5. Click + and search for 'libsqlite3.tbd', then add it"
fi

# Step 4: Install Pods with SQLite and correct search paths
echo "Step 4: Running pod install..."
pod install --verbose

echo "Done! Please open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"
echo ""
echo "If you still encounter SQLite header issues, please follow the manual note above to add libsqlite3.tbd to your Xcode project."