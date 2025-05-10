#!/bin/bash
# Script to fix "No script URL provided" error in iOS React Native apps
# This creates and embeds a JavaScript bundle in the iOS app

echo "=========================================================="
echo "React Native iOS 'No script URL provided' Error Fix"
echo "=========================================================="
echo "This script will:"
echo "1. Create a JavaScript bundle for your React Native app"
echo "2. Configure your AppDelegate.m to use the embedded bundle"
echo "3. Provide instructions for adding the bundle to your Xcode project"
echo ""

# Find the app directory
PROJECT_ROOT=$(pwd)
echo "Searching for React Native project..."

# Identify if we're in an Expo project or plain React Native project
if [ -f "app.json" ]; then
  echo "Found app.json - this appears to be an Expo project"
  # Check if expo-app directory exists (our custom structure)
  if [ -d "expo-app" ]; then
    echo "Found expo-app directory - using custom project structure"
    APP_DIR="$PROJECT_ROOT/expo-app"
  else
    APP_DIR="$PROJECT_ROOT"
  fi
elif [ -f "package.json" ]; then
  echo "Found package.json - using current directory as project root"
  APP_DIR="$PROJECT_ROOT"
else
  # Search for package.json or app.json in subdirectories
  PACKAGE_JSON_DIR=$(find . -name "package.json" -not -path "*/node_modules/*" | head -1 | xargs dirname 2>/dev/null)
  if [ ! -z "$PACKAGE_JSON_DIR" ]; then
    echo "Found package.json in $PACKAGE_JSON_DIR - using this as project root"
    APP_DIR="$PROJECT_ROOT/$PACKAGE_JSON_DIR"
  else
    echo "Error: Could not find package.json or app.json in this directory or subdirectories."
    echo "Please run this script from your React Native project root directory."
    exit 1
  fi
fi

echo "Using project directory: $APP_DIR"

# Check if iOS directory exists
IOS_DIR="$APP_DIR/ios"
if [ ! -d "$IOS_DIR" ]; then
  echo "Error: iOS directory not found at $IOS_DIR"
  echo "This script requires the iOS project to be generated."
  echo "If using Expo, run 'npx expo prebuild --platform ios' first."
  exit 1
fi

echo "Found iOS directory at: $IOS_DIR"

# Create assets directory for the bundle
ASSETS_DIR="$IOS_DIR/assets"
mkdir -p "$ASSETS_DIR"
echo "Created assets directory at: $ASSETS_DIR"

# Generate the JavaScript bundle
echo "Generating JavaScript bundle (this may take a minute)..."
cd "$APP_DIR"
npx react-native bundle --entry-file=index.js --platform=ios --dev=false --bundle-output="$ASSETS_DIR/main.jsbundle" --assets-dest="$ASSETS_DIR"

if [ $? -ne 0 ]; then
  echo "Error: Failed to generate JavaScript bundle."
  echo "Make sure react-native-cli is installed and your project is properly configured."
  exit 1
fi

echo "Successfully generated JavaScript bundle at: $ASSETS_DIR/main.jsbundle"

# Find AppDelegate.m or AppDelegate.mm
APPDELEGATE_PATH=$(find "$IOS_DIR" -name "AppDelegate.m" -o -name "AppDelegate.mm" | head -1)

if [ -z "$APPDELEGATE_PATH" ]; then
  echo "Error: Could not find AppDelegate.m or AppDelegate.mm in the iOS project."
  echo "Make sure the iOS project is properly generated."
  exit 1
fi

echo "Found AppDelegate at: $APPDELEGATE_PATH"

# Check if AppDelegate is already configured for bundled JS
if grep -q "URLForResource:@\"main\" withExtension:@\"jsbundle\"" "$APPDELEGATE_PATH"; then
  echo "AppDelegate is already configured to use embedded bundle."
else
  # Make a backup of AppDelegate
  cp "$APPDELEGATE_PATH" "${APPDELEGATE_PATH}.bak"
  echo "Created backup of AppDelegate at ${APPDELEGATE_PATH}.bak"
  
  # Check which AppDelegate format we're dealing with
  if grep -q "sourceURLForBridge:" "$APPDELEGATE_PATH"; then
    echo "Detected modern AppDelegate with sourceURLForBridge method"
    
    # Modern format with sourceURLForBridge method
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS sed requires a suffix with -i
      sed -i '' -e 's|return \[\[RCTBundleURLProvider sharedSettings\] jsBundleURLForBundleRoot:@"index"\];|#if DEBUG\n    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];\n#else\n    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];\n#endif|g' "$APPDELEGATE_PATH"
    else
      # Linux sed works without a suffix
      sed -i -e 's|return \[\[RCTBundleURLProvider sharedSettings\] jsBundleURLForBundleRoot:@"index"\];|#if DEBUG\n    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];\n#else\n    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];\n#endif|g' "$APPDELEGATE_PATH"
    fi
  else
    # Legacy format with jsCodeLocation
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS sed requires a suffix with -i
      sed -i '' -e 's|jsCodeLocation = \[\[RCTBundleURLProvider sharedSettings\] jsBundleURLForBundleRoot:@"index"\];|// Use this for release builds\n  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];\n  \n  // Use this for debugging\n  // jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];|g' "$APPDELEGATE_PATH"
    else
      # Linux sed works without a suffix
      sed -i -e 's|jsCodeLocation = \[\[RCTBundleURLProvider sharedSettings\] jsBundleURLForBundleRoot:@"index"\];|// Use this for release builds\n  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];\n  \n  // Use this for debugging\n  // jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];|g' "$APPDELEGATE_PATH"
    fi
  fi
  
  echo "Modified AppDelegate to use embedded JavaScript bundle."
fi

# Check if a .xcworkspace file exists
WORKSPACE_PATH=$(find "$IOS_DIR" -name "*.xcworkspace" | head -1)
if [ -z "$WORKSPACE_PATH" ]; then
  echo "Warning: Could not find Xcode workspace file."
else
  echo "Found Xcode workspace at: $WORKSPACE_PATH"
fi

# Check if the bundle is already referenced in the Xcode project
PBXPROJ_PATH=$(find "$IOS_DIR" -name "project.pbxproj" | head -1)
if [ -f "$PBXPROJ_PATH" ]; then
  if grep -q "main.jsbundle" "$PBXPROJ_PATH"; then
    echo "JavaScript bundle is already referenced in the Xcode project."
  else
    echo "NOTE: The JavaScript bundle is not referenced in your Xcode project."
    echo "You need to manually add it to your Xcode project:"
  fi
else
  echo "Warning: Could not find project.pbxproj file."
  echo "You'll need to manually add the bundle to your Xcode project:"
fi

echo ""
echo "=========================================================="
echo "NEXT STEPS:"
echo "=========================================================="
echo "1. Open your iOS project in Xcode:"
if [ ! -z "$WORKSPACE_PATH" ]; then
  echo "   open \"$WORKSPACE_PATH\""
fi
echo ""
echo "2. Add the JavaScript bundle to your Xcode project:"
echo "   a. Right-click on your project in the Project Navigator"
echo "   b. Select 'Add Files to \"YourProject\"...'"
echo "   c. Navigate to: $ASSETS_DIR"
echo "   d. Select main.jsbundle"
echo "   e. Make sure 'Copy items if needed' is checked"
echo "   f. Click Add"
echo ""
echo "3. Build and run your app in Xcode"
echo ""
echo "If you still encounter issues, check the console logs in Xcode for specific error messages."
echo "=========================================================="