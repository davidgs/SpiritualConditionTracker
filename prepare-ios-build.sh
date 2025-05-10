#!/bin/bash

# Improved iOS Build Preparation Script for Spiritual Condition Tracker
# This script handles dependency installation and asset preparation for iOS builds
# Version: 2.0.0

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== Spiritual Condition Tracker iOS Build Preparation =====${RESET}"
echo "This script prepares your project for iOS native build using Xcode."
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

# Install missing dependencies directly
log "${BLUE}Installing required dependencies...${RESET}"

# Install key dependencies directly if missing
DEPENDENCIES=(
  "minimatch@5.1.6"
  "agent-base@6.0.2"
  "lru-cache@6.0.0"
  "glob@9.3.5"
)

for dep in "${DEPENDENCIES[@]}"; do
  pkg_name=$(echo $dep | cut -d@ -f1)
  if ! npm list $pkg_name --depth=0 2>/dev/null | grep -q $pkg_name; then
    log "Installing $dep..."
    npm install $dep --save-exact
  else
    log "${GREEN}$pkg_name already installed${RESET}"
  fi
done

log "${GREEN}All required dependencies have been installed${RESET}"

# Clear npm cache
log "Cleaning npm cache..."
npm cache clean --force

# Prepare iOS project directory
log "${BLUE}Preparing iOS project directory...${RESET}"

# Create or update the ios directory
if [ ! -d "expo-app/ios" ]; then
  log "Creating iOS project directory..."
  cd expo-app
  npx expo prebuild --platform ios --clean
  cd ..
else
  log "${GREEN}iOS project directory already exists${RESET}"
  
  # Update prebuild if needed - uncomment if you want to force update
  # log "Updating iOS project..."
  # cd expo-app
  # npx expo prebuild --platform ios --no-install
  # cd ..
fi

# Copy necessary assets
log "${BLUE}Copying assets to iOS project...${RESET}"

ASSETS_SRC="expo-app/assets"
PROJECT_NAME="SpiritualConditionTracker"

# Ensure assets directory exists
if [ -d "$ASSETS_SRC" ]; then
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
else
  log "${YELLOW}Warning: Assets directory not found at $ASSETS_SRC${RESET}"
fi

# Install CocoaPods dependencies
log "${BLUE}Installing CocoaPods dependencies...${RESET}"

cd expo-app/ios

# Note: We're NOT modifying the Podfile here since it's already properly configured
log "Running 'pod install'..."
pod install

cd ../..

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