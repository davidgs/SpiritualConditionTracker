#!/bin/bash

# Prepare iOS Build Script for Spiritual Condition Tracker
# This script prepares a clean iOS build for Xcode

echo "========================================"
echo "Preparing iOS build for Xcode"
echo "========================================"

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
    echo "You can open the Xcode project at: $PROJECT_ROOT/expo-app/ios/SpiritualConditionTracker.xcworkspace"
    exit 0
  fi
fi

# Install dependencies if needed
if [ ! -d "$PROJECT_ROOT/expo-app/node_modules" ]; then
  echo "Installing node modules..."
  npm install
fi

# Make sure SQLite and other native modules are properly linked
echo "Ensuring all native modules are properly linked..."
npx react-native-asset

# Create missing react-native.config.js if it doesn't exist
if [ ! -f "$PROJECT_ROOT/expo-app/react-native.config.js" ]; then
  echo "Creating react-native.config.js..."
  cat > "$PROJECT_ROOT/expo-app/react-native.config.js" << 'EOF'
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
};
EOF
fi

# Fix for SQLite configuration
echo "Applying SQLite configuration fix..."
node "$PROJECT_ROOT/fix-sqlite-config.js"

# Create the iOS project
echo "Creating iOS project..."
npx expo prebuild --platform ios --clean

if [ ! -d "$PROJECT_ROOT/expo-app/ios" ]; then
  echo "Error: Failed to create iOS directory!"
  exit 1
fi

# Install iOS dependencies with pod
echo "Installing pods..."
cd "$PROJECT_ROOT/expo-app/ios" && pod install

echo "========================================"
echo "iOS build ready for Xcode!"
echo "========================================"
echo "Open the following workspace in Xcode:"
echo "$PROJECT_ROOT/expo-app/ios/SpiritualConditionTracker.xcworkspace"
echo
echo "Important notes:"
echo "1. Make sure you have the correct team selected in Xcode"
echo "2. Verify signing & capabilities are properly configured"
echo "3. Ensure SQLite implementation works on iOS (uses native code)"
echo "========================================"