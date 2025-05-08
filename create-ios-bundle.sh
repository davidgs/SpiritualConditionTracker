#!/bin/bash

# Spiritual Condition Tracker - iOS JavaScript Bundle Creation Script
# This script creates a pre-bundled JavaScript file for iOS builds

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== Creating JavaScript Bundle for iOS =====${RESET}"
echo "This script will create a pre-bundled JavaScript file for your iOS build."
echo ""

# Check if we're in the root directory
if [ ! -d "expo-app" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${RESET}"
  exit 1
fi

# Navigate to expo app directory
cd expo-app

# Create the ios/bundle directory if it doesn't exist
if [ ! -d "ios/bundle" ]; then
  if [ ! -d "ios" ]; then
    echo -e "${RED}Error: iOS directory not found. Run prepare-ios-build.sh first.${RESET}"
    exit 1
  fi
  
  echo "Creating ios/bundle directory..."
  mkdir -p ios/bundle
fi

# Create the JavaScript bundle
echo -e "${BOLD}Creating JavaScript bundle for iOS...${RESET}"
echo "This may take a few minutes..."

npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/bundle/main.jsbundle \
  --assets-dest ios/bundle

# Check if bundle creation was successful
if [ ! -f "ios/bundle/main.jsbundle" ]; then
  echo -e "${RED}Error: Bundle creation failed.${RESET}"
  exit 1
fi

echo -e "${GREEN}JavaScript bundle created successfully at ios/bundle/main.jsbundle${RESET}"

# Create a README file with instructions
cat > ios/bundle/README.txt << EOF
This directory contains the pre-bundled JavaScript for the Spiritual Condition Tracker app.

To use this bundle in your Xcode project:

1. Open the Xcode project
2. Add the "bundle" directory to your project (right-click on project > Add Files to "SpiritualConditionTracker")
3. Make sure "Copy items if needed" is checked
4. Select the appropriate target
5. Click "Add"

Then update the AppDelegate.mm file to load the bundled JavaScript:

1. Open AppDelegate.mm
2. Find the method that creates the RCTBridge
3. Replace the jsLocation code with:

  NSURL *jsCodeLocation;
#ifdef DEBUG
  // During development, use the Metro bundler URL
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  // In production, use the pre-bundled file
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"bundle/main" withExtension:@"jsbundle"];
#endif

This will use the Metro bundler in DEBUG mode, but use the pre-bundled JavaScript in RELEASE mode.
EOF

echo -e "${BLUE}Added instructions in ios/bundle/README.txt${RESET}"

# Go back to the root directory
cd ..

echo -e "${BOLD}${GREEN}===== JavaScript Bundle Creation Complete =====${RESET}"
echo ""
echo -e "Next steps:"
echo -e "1. ${BOLD}Open the Xcode workspace:${RESET}"
echo -e "   ${BLUE}open expo-app/ios/SpiritualConditionTracker.xcworkspace${RESET}"
echo ""
echo -e "2. ${BOLD}Add the bundle directory to your project${RESET}"
echo -e "   - In Xcode, right-click on your project"
echo -e "   - Select 'Add Files to \"SpiritualConditionTracker\"'"
echo -e "   - Navigate to and select the 'bundle' folder inside the ios directory"
echo -e "   - Make sure 'Copy items if needed' is checked"
echo -e "   - Click 'Add'"
echo ""
echo -e "3. ${BOLD}Update AppDelegate.mm to use the bundle${RESET}"
echo -e "   - Follow the instructions in ios/bundle/README.txt"
echo ""
echo -e "${YELLOW}Note: This bundle is for RELEASE builds. During development, Metro will still be used.${RESET}"