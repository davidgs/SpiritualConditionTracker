#!/bin/bash

# Spiritual Condition Tracker - iOS Build Preparation Script
# This script prepares the Expo project for iOS native build with Xcode
# It includes fixes for React dependency version conflicts and AppDelegate configuration

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== Spiritual Condition Tracker iOS Build Preparation =====${RESET}"
echo "This script will prepare your project for iOS native build using Xcode."
echo ""

# Check if we're in the root directory
if [ ! -d "expo-app" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${RESET}"
  exit 1
fi

# Function to check command existence
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is required but not installed.${RESET}"
    echo "Please install $1 and try again."
    exit 1
  fi
}

# Check for required tools
check_command node
check_command npm
check_command npx

# Create a log function to track progress
log() {
  echo -e "${BOLD}[$(date +"%H:%M:%S")]${RESET} $1"
}

# Fix dependency versions
fix_dependency_versions() {
  log "${BLUE}Checking React dependency versions...${RESET}"
  
  # Get current React Native version
  RN_VERSION=$(grep -o '"react-native": "[^"]*"' package.json | cut -d'"' -f4)
  log "React Native version: $RN_VERSION"
  
  # Check if React version is compatible
  REACT_VERSION=$(grep -o '"react": "[^"]*"' package.json | cut -d'"' -f4)
  log "Current React version: $REACT_VERSION"
  
  # For React Native 0.79.x, we need React 19.0.0
  if [[ $RN_VERSION == "0.79."* && $REACT_VERSION != "19.0.0" ]]; then
    log "${YELLOW}React version mismatch detected. Updating to React 19.0.0...${RESET}"
    npm install react@19.0.0 react-dom@19.0.0 --save
    
    # Verify the update
    REACT_VERSION=$(grep -o '"react": "[^"]*"' package.json | cut -d'"' -f4)
    log "${GREEN}React updated to version: $REACT_VERSION${RESET}"
  else
    log "${GREEN}React version is compatible with React Native.${RESET}"
  fi
  
  # Check for react-native-paper and react-native-paper-dates
  if ! grep -q '"react-native-paper":' package.json; then
    log "${YELLOW}Installing react-native-paper...${RESET}"
    npm install react-native-paper --save
  fi
  
  if ! grep -q '"react-native-paper-dates":' package.json; then
    log "${YELLOW}Installing react-native-paper-dates...${RESET}"
    npm install react-native-paper-dates --save
  fi
  
  # Clean npm cache and node_modules if needed
  log "Cleaning npm cache..."
  npm cache clean --force
  
  # Clear metro bundler cache
  if [ -d "node_modules/.cache" ]; then
    log "Clearing Metro bundler cache..."
    rm -rf node_modules/.cache
  fi
}

# Fix AppDelegate to use the embedded JavaScript bundle
fix_app_delegate() {
  log "${BLUE}Preparing to fix AppDelegate for bundled JavaScript...${RESET}"
  
  # Create assets directory if it doesn't exist
  mkdir -p ios/assets
  
  # Generate the JavaScript bundle
  log "Generating JavaScript bundle for iOS..."
  npx react-native bundle --entry-file=index.js --platform=ios --dev=false --bundle-output=ios/assets/main.jsbundle --assets-dest=ios/assets
  
  # Find the AppDelegate file (could be .m or .mm)
  if [ -f "ios/SpiritualConditionTracker/AppDelegate.mm" ]; then
    APPDELEGATE_PATH="ios/SpiritualConditionTracker/AppDelegate.mm"
  elif [ -f "ios/SpiritualConditionTracker/AppDelegate.m" ]; then
    APPDELEGATE_PATH="ios/SpiritualConditionTracker/AppDelegate.m"
  else
    # Try to find it if the project name is different
    APPDELEGATE_PATH=$(find ios -name "AppDelegate.mm" | head -1)
    if [ -z "$APPDELEGATE_PATH" ]; then
      APPDELEGATE_PATH=$(find ios -name "AppDelegate.m" | head -1)
    fi
    
    if [ -z "$APPDELEGATE_PATH" ]; then
      log "${RED}Error: Could not find AppDelegate.m or AppDelegate.mm${RESET}"
      return 1
    fi
  fi
  
  log "Found AppDelegate at: $APPDELEGATE_PATH"
  
  # Check if AppDelegate is already configured for bundled JS
  if grep -q "URLForResource:@\"main\" withExtension:@\"jsbundle\"" "$APPDELEGATE_PATH"; then
    log "${GREEN}AppDelegate is already configured to use embedded bundle.${RESET}"
  else
    # Make a backup of AppDelegate
    cp "$APPDELEGATE_PATH" "${APPDELEGATE_PATH}.bak"
    log "Created backup of AppDelegate at ${APPDELEGATE_PATH}.bak"
    
    # Check which AppDelegate format we're dealing with
    if grep -q "sourceURLForBridge:" "$APPDELEGATE_PATH"; then
      log "Detected modern AppDelegate with sourceURLForBridge method"
      
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
    
    log "${GREEN}Modified AppDelegate to use embedded JavaScript bundle.${RESET}"
  fi
  
  # Check if the bundle is already referenced in the Xcode project
  PBXPROJ_PATH=$(find "ios" -name "project.pbxproj" | head -1)
  if [ -f "$PBXPROJ_PATH" ]; then
    if grep -q "main.jsbundle" "$PBXPROJ_PATH"; then
      log "${GREEN}JavaScript bundle is already referenced in the Xcode project.${RESET}"
    else
      log "${YELLOW}NOTE: The JavaScript bundle is not referenced in your Xcode project.${RESET}"
      log "${YELLOW}You'll need to manually add it to your Xcode project.${RESET}"
    fi
  else
    log "${YELLOW}Warning: Could not find project.pbxproj file.${RESET}"
  fi
}

# Check if we need to clean existing iOS directory
if [ -d "expo-app/ios" ]; then
  echo -e "${YELLOW}Existing iOS build directory detected.${RESET}"
  read -p "Do you want to clean it and create a fresh build? (y/n): " clean_ios
  if [[ $clean_ios == "y" || $clean_ios == "Y" ]]; then
    echo "Cleaning iOS directory..."
    rm -rf expo-app/ios
    echo -e "${GREEN}iOS directory cleaned.${RESET}"
  else
    echo "Keeping existing iOS directory."
  fi
fi

# Navigate to expo app directory
cd expo-app

# Check and install node dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Node modules not found. Installing dependencies...${RESET}"
  npm install
else
  echo -e "${GREEN}Node modules already installed.${RESET}"
fi

# Fix dependency versions before building
fix_dependency_versions

# Fix SQLite configuration
echo "Applying SQLite configuration fix..."
if [ -f "../fix-sqlite-config.js" ]; then
  node ../fix-sqlite-config.js
  echo -e "${GREEN}SQLite configuration fixed.${RESET}"
else
  echo -e "${YELLOW}Warning: fix-sqlite-config.js not found, skipping SQLite configuration.${RESET}"
fi

# Create fresh prebuild
echo -e "${BOLD}Creating fresh iOS build with Expo...${RESET}"
echo "This may take a few minutes..."
npx expo prebuild --platform ios --clean

# Check if prebuild was successful
if [ ! -d "ios" ]; then
  echo -e "${RED}Error: Prebuild failed. iOS directory not created.${RESET}"
  echo "Check the error messages above and fix any issues."
  exit 1
fi

echo -e "${GREEN}iOS build directory created successfully.${RESET}"

# Fix AppDelegate for bundled JavaScript
fix_app_delegate

# Install CocoaPods dependencies
echo "Installing CocoaPods dependencies..."
cd ios
pod install

# Check pod install result
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: CocoaPods installation failed.${RESET}"
  echo "Try running 'pod install' manually in the ios directory."
  exit 1
fi

echo -e "${GREEN}CocoaPods dependencies installed successfully.${RESET}"
cd ..

# Copy fonts if needed
echo "Ensuring fonts are properly set up..."
if [ ! -d "assets/fonts" ]; then
  mkdir -p assets/fonts
fi

# Return to project root
cd ..

echo -e "${BOLD}${GREEN}===== iOS Build Preparation Complete =====${RESET}"
echo ""
echo -e "Next steps:"
echo -e "1. ${BOLD}Open the Xcode workspace:${RESET}"
echo -e "   ${BLUE}open expo-app/ios/SpiritualConditionTracker.xcworkspace${RESET}"
echo ""
echo -e "2. ${BOLD}Configure signing in Xcode:${RESET}"
echo -e "   - Select the main project target"
echo -e "   - Go to Signing & Capabilities tab"
echo -e "   - Select your team"
echo -e "   - Ensure 'Automatically manage signing' is checked"
echo ""
echo -e "3. ${BOLD}Build and run on a simulator or device${RESET}"
echo ""
echo -e "${YELLOW}Note: If you encounter any issues, refer to ios-xcode-guide.md${RESET}"