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
