#!/bin/bash

# Simplified iOS Build Preparation Script for Spiritual Condition Tracker
# This script directly resolves dependency issues for iOS native build with Xcode

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

# Check if we're in the right directory
if [ ! -d "expo-app" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${RESET}"
  exit 1
fi

# Function to log messages with timestamps
log() {
  echo -e "${BOLD}[$(date +"%H:%M:%S")]${RESET} $1"
}

# Install missing dependencies directly instead of working around them
install_missing_dependencies() {
  log "${BLUE}Installing required dependencies directly...${RESET}"
  
  # Check if the dependencies exist, install if missing
  if ! npm list minimatch --depth=0 2>/dev/null | grep -q minimatch; then
    log "Installing minimatch package..."
    npm install minimatch --save
  fi
  
  if ! npm list glob --depth=0 2>/dev/null | grep -q glob; then
    log "Installing glob package..."
    npm install glob --save
  fi
  
  if ! npm list agent-base --depth=0 2>/dev/null | grep -q agent-base; then
    log "Installing agent-base package..."
    npm install agent-base@6.0.2 --save-exact
  fi
  
  if ! npm list lru-cache --depth=0 2>/dev/null | grep -q lru-cache; then
    log "Installing lru-cache package..."
    npm install lru-cache@6.0.0 --save-exact
  fi
  
  # Fix react-native-sqlite-storage warning by directly installing proper version
  if npm list react-native-sqlite-storage --depth=0 2>/dev/null | grep -q react-native-sqlite-storage; then
    log "Updating react-native-sqlite-storage package..."
    npm install react-native-sqlite-storage@latest --save
  fi
  
  log "${GREEN}All required dependencies have been installed${RESET}"
}

# Prepare iOS project directory
prepare_ios_project() {
  log "${BLUE}Preparing iOS project directory...${RESET}"
  
  # Create ios directory if it doesn't exist
  if [ ! -d "expo-app/ios" ]; then
    log "Creating iOS project directory..."
    cd expo-app
    npx expo prebuild --platform ios --clean
    cd ..
  else
    log "${GREEN}iOS project directory already exists${RESET}"
  fi
}

# Install CocoaPods dependencies
install_pods() {
  log "${BLUE}Installing CocoaPods dependencies...${RESET}"
  
  cd expo-app/ios
  
  # Check and potentially modify the Podfile to fix common issues
  if [ -f "Podfile" ]; then
    log "Checking Podfile for possible issues..."
    
    # Backup Podfile before modifications
    cp Podfile Podfile.backup
    
    # Add excluded source files for problematic libraries
    if ! grep -q "EXCLUDED_SOURCE_FILE_NAMES" Podfile; then
      log "Adding excluded source file configurations to Podfile..."
      
      # Insert the exclusion just before the last 'end' in the file
      sed -i '' -e '$i\ 
  # Fix for C++ file errors in certain libraries\
  post_install do |installer|\
    installer.pods_project.targets.each do |target|\
      if target.name == "react-native-safe-area-context"\
        target.build_configurations.each do |config|\
          config.build_settings["EXCLUDED_SOURCE_FILE_NAMES"] = [\
            "RNCSafeAreaViewShadowNode.cpp",\
            "RNCSafeAreaViewState.cpp"\
          ]\
        end\
      elsif target.name == "react-native-screens"\
        target.build_configurations.each do |config|\
          config.build_settings["EXCLUDED_SOURCE_FILE_NAMES"] = [\
            "RNSScreenStackHeaderConfig.mm"\
          ]\
        end\
      elsif target.name == "RCT-Folly"\
        target.build_configurations.each do |config|\
          config.build_settings["GCC_PREPROCESSOR_DEFINITIONS"] ||= ["$(inherited)"]\
          config.build_settings["GCC_PREPROCESSOR_DEFINITIONS"] << "FOLLY_HAVE_COROUTINES=0"\
        end\
      end\
    end\
  end\
      ' Podfile
    fi
    
    log "${GREEN}Podfile has been updated with required fixes${RESET}"
  else
    log "${RED}Error: Podfile not found. Run 'npx expo prebuild --platform ios' first${RESET}"
  fi
  
  # Run pod install
  log "Running 'pod install'..."
  pod install
  
  cd ../..
  log "${GREEN}CocoaPods dependencies installed successfully${RESET}"
}

# Copy necessary assets to iOS project
copy_assets() {
  log "${BLUE}Copying assets to iOS project...${RESET}"
  
  ASSETS_SRC="expo-app/assets"
  PROJECT_NAME="SpiritualConditionTracker"
  
  # Ensure assets directory exists
  if [ ! -d "$ASSETS_SRC" ]; then
    mkdir -p "$ASSETS_SRC"
    log "Created assets directory"
  fi
  
  # Copy app icon
  if [ -f "$ASSETS_SRC/icon.png" ]; then
    log "Copying app icon..."
    mkdir -p "expo-app/ios/$PROJECT_NAME/Images.xcassets/AppIcon.appiconset/"
    cp "$ASSETS_SRC/icon.png" "expo-app/ios/$PROJECT_NAME/Images.xcassets/AppIcon.appiconset/"
  fi
  
  # Copy fonts if needed
  if [ -d "$ASSETS_SRC/fonts" ]; then
    log "Copying fonts..."
    mkdir -p "expo-app/ios/$PROJECT_NAME/fonts"
    cp -R "$ASSETS_SRC/fonts"/* "expo-app/ios/$PROJECT_NAME/fonts/"
  fi
  
  log "${GREEN}Assets copied successfully${RESET}"
}

# Main function to run all steps
main() {
  # Install missing dependencies directly
  install_missing_dependencies
  
  # Prepare iOS project directory
  prepare_ios_project
  
  # Install CocoaPods dependencies
  install_pods
  
  # Copy necessary assets
  copy_assets
  
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
}

# Run the main function
main