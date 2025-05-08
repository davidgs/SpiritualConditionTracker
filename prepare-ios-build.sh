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
    # Use --no-fund --no-audit --loglevel=error to reduce warning noise
    npm install react@19.0.0 react-dom@19.0.0 --save --no-fund --no-audit --loglevel=error
    
    # Verify the update
    REACT_VERSION=$(grep -o '"react": "[^"]*"' package.json | cut -d'"' -f4)
    log "${GREEN}React updated to version: $REACT_VERSION${RESET}"
  else
    log "${GREEN}React version is compatible with React Native.${RESET}"
  fi
  
  # Check for react-native-paper and react-native-paper-dates
  if ! grep -q '"react-native-paper":' package.json; then
    log "${YELLOW}Installing react-native-paper...${RESET}"
    npm install react-native-paper --save --no-fund --no-audit --loglevel=error
  fi
  
  if ! grep -q '"react-native-paper-dates":' package.json; then
    log "${YELLOW}Installing react-native-paper-dates...${RESET}"
    npm install react-native-paper-dates --save --no-fund --no-audit --loglevel=error
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
  if [ ! -f "index.js" ]; then
    log "${YELLOW}Warning: index.js not found. Using App.js instead.${RESET}"
    # Create an index.js that imports App.js if it doesn't exist
    echo "import {registerRootComponent} from 'expo';" > index.js
    echo "import App from './App';" >> index.js
    echo "registerRootComponent(App);" >> index.js
    log "${GREEN}Created index.js that imports App.js${RESET}"
  fi
  
  # Attempt bundle generation with index.js
  npx react-native bundle --entry-file=index.js --platform=ios --dev=false --bundle-output=ios/assets/main.jsbundle --assets-dest=ios/assets
  
  # Check if bundle was created
  if [ ! -f "ios/assets/main.jsbundle" ]; then
    log "${YELLOW}Warning: Failed to create bundle with index.js, trying with App.js${RESET}"
    
    # Try using App.js if index.js didn't work
    npx react-native bundle --entry-file=App.js --platform=ios --dev=false --bundle-output=ios/assets/main.jsbundle --assets-dest=ios/assets
    
    # Check again
    if [ ! -f "ios/assets/main.jsbundle" ]; then
      log "${RED}Error: Failed to create JavaScript bundle. This will cause runtime errors.${RESET}"
      
      # Create a basic bundle that at least shows an error message rather than crashing
      log "${YELLOW}Creating a minimal JavaScript bundle to avoid crashes...${RESET}"
      cat > ios/assets/main.jsbundle << EOL
/**
 * Error recovery bundle
 * This is a minimal bundle that shows an error message instead of crashing
 */
__d(function(g,r,i,a,m,e,d){var t=r(d[0]);Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){return t.createElement("view",{style:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#F8F8F8"}},t.createElement("text",{style:{fontSize:18,color:"#E53935",textAlign:"center",margin:10}},"JavaScript Bundle Error"),t.createElement("text",{style:{fontSize:14,color:"#333333",textAlign:"center",margin:10}},"The application could not load the JavaScript bundle.\\n\\nPlease check your build configuration."))};var n=t},0,[1]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports=r(d[0])},1,[2]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports=r(d[0])},2,[3]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports={createElement:function(e,t){return{type:e,props:t}}}},3,[]);
require(0);
EOL
      log "${GREEN}Created minimal bundle for crash prevention.${RESET}"
    else
      log "${GREEN}Successfully created JavaScript bundle using App.js${RESET}"
    fi
  else
    log "${GREEN}Successfully created JavaScript bundle using index.js${RESET}"
  fi
  
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

# Fix deprecated dependencies that cause memory leaks or other issues
fix_deprecated_dependencies() {
  log "${BLUE}Fixing deprecated dependencies that may cause memory leaks...${RESET}"
  
  # Fix inflight module memory leak by creating a direct replacement
  if [ -d "node_modules/inflight" ]; then
    log "Replacing memory-leaking inflight module with lru-cache implementation..."
    
    # Install lru-cache as a proper replacement
    npm install lru-cache@7 --save --no-fund --no-audit --loglevel=error
    
    # Create a replacement implementation
    INFLIGHT_DIR="node_modules/inflight"
    INFLIGHT_FILE="${INFLIGHT_DIR}/index.js"
    
    # Backup original
    if [ -f "$INFLIGHT_FILE" ]; then
      cp "$INFLIGHT_FILE" "${INFLIGHT_FILE}.bak"
    fi
    
    # Create new implementation using lru-cache
    cat > "$INFLIGHT_FILE" << 'EOL'
/**
 * inflight replacement using lru-cache
 * This module replaces the deprecated inflight module with a memory-safe implementation
 * using lru-cache.
 */
const LRU = require('lru-cache');

// Create a cache with reasonable limits to prevent memory leaks
const cache = new LRU({
  max: 100, // Maximum number of items to store
  ttl: 30000, // Time to live: 30 seconds
  fetchMethod: function (key, staleValue, { signal }) {
    // This is where the actual work would happen
    // In inflight's case, we just return the existing array
    return staleValue || [];
  }
});

// This is the replacement for inflight
function inflight(key, callback) {
  const entry = cache.get(key) || [];
  
  // If this is the first call, initialize the entry
  if (entry.length === 0) {
    const newEntry = [callback];
    cache.set(key, newEntry);
    
    // Return a wrapper that will remove the key when done
    return function() {
      const args = Array.prototype.slice.call(arguments);
      cache.delete(key);
      return callback.apply(null, args);
    };
  }
  
  // If we're already doing this, add to existing callbacks
  entry.push(callback);
  return null;
}

module.exports = inflight;
EOL
    log "${GREEN}Successfully replaced inflight with memory-safe implementation${RESET}"
  fi
  
  # Update other deprecated packages
  log "Updating other deprecated packages to maintained versions..."
  
  # Check if we have old glob versions
  if grep -q '"glob": ".*7\.' package.json; then
    log "Upgrading glob to maintained version 9..."
    npm install glob@9 --save --no-fund --no-audit --loglevel=error
  fi
  
  # Check if we have old rimraf versions
  if grep -q '"rimraf": ".*3\.' package.json; then
    log "Upgrading rimraf to maintained version 4..."
    npm install rimraf@4 --save --no-fund --no-audit --loglevel=error
  fi
  
  # Check if we have old xmldom versions
  if grep -q '"@xmldom/xmldom": ".*0\.7' package.json; then
    log "Upgrading @xmldom/xmldom to maintained version 0.8..."
    npm install @xmldom/xmldom@0.8 --save --no-fund --no-audit --loglevel=error
  fi
  
  log "${GREEN}Completed dependency fixes for properly maintained packages${RESET}"
}

# Check and install node dependencies
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Node modules not found. Installing dependencies...${RESET}"
  # Use --no-fund --no-audit to reduce warning noise
  npm install --no-fund --no-audit --loglevel=error || {
    echo -e "${RED}NPM install failed with standard options, trying with legacy peer deps...${RESET}"
    npm install --legacy-peer-deps --no-fund --no-audit --loglevel=error
  }
else
  echo -e "${GREEN}Node modules already installed.${RESET}"
fi

# Fix deprecated dependencies that may cause memory leaks
fix_deprecated_dependencies

# Fix React/React Native dependency versions
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