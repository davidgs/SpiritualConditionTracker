#!/bin/bash

# Clean Build Script for Spiritual Condition Tracker
# This script prepares a clean environment for building both iOS and Android
# Version: 1.0.0 - May 11, 2025

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}=======================================================${RESET}"
echo -e "${BLUE}  Spiritual Condition Tracker - Clean Build Process    ${RESET}"
echo -e "${BLUE}=======================================================${RESET}"
echo -e "${YELLOW}Starting clean build process for mobile deployment...${RESET}"

# Save the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Clean npm environment
echo -e "${BLUE}Step 1: Cleaning npm environment...${RESET}"
npm cache clean --force
echo -e "${GREEN}npm cache cleaned${RESET}"

# 2. Clean project build directories
echo -e "${BLUE}Step 2: Cleaning project build directories...${RESET}"

# 2.1 Clean Android build
if [ -d "android/app/build" ]; then
  echo -e "Cleaning Android build directory..."
  rm -rf android/app/build
  echo -e "${GREEN}Android build directory cleaned${RESET}"
else
  echo -e "${YELLOW}Android build directory not found or already clean${RESET}"
fi

# 2.2 Clean iOS build
if [ -d "ios/build" ]; then
  echo -e "Cleaning iOS build directory..."
  rm -rf ios/build
  echo -e "${GREEN}iOS build directory cleaned${RESET}"
else
  echo -e "${YELLOW}iOS build directory not found or already clean${RESET}"
fi

# 3. Check for and remove critical problematic dependencies
echo -e "${BLUE}Step 3: Verifying dependencies...${RESET}"

# 3.1 Check package.json for problematic dependencies
if grep -q "expo-device" package.json; then
  echo -e "${RED}WARNING: Found expo-device in package.json. This package is causing build issues.${RESET}"
  echo -e "Please remove it manually using a text editor or by running:"
  echo -e "npm uninstall expo-device"
  echo -e "${YELLOW}Build may fail if this dependency is not removed.${RESET}"
else
  echo -e "${GREEN}expo-device is not listed in package.json (good)${RESET}"
fi

# 4. Clean and reinstall pods for iOS
echo -e "${BLUE}Step 4: Cleaning and reinstalling iOS pods...${RESET}"
if [ -d "ios" ]; then
  # 4.1 Clean Pods
  cd ios
  
  if [ -d "Pods" ]; then
    echo -e "Removing iOS Pods directory..."
    rm -rf Pods
    echo -e "${GREEN}Pods directory removed${RESET}"
  else
    echo -e "${YELLOW}Pods directory not found or already clean${RESET}"
  fi
  
  if [ -f "Podfile.lock" ]; then
    echo -e "Removing Podfile.lock..."
    rm -f Podfile.lock
    echo -e "${GREEN}Podfile.lock removed${RESET}"
  else
    echo -e "${YELLOW}Podfile.lock not found or already removed${RESET}"
  fi
  
  if [ -d "SpiritualConditionTracker.xcworkspace" ]; then
    echo -e "Removing xcworkspace..."
    rm -rf SpiritualConditionTracker.xcworkspace
    echo -e "${GREEN}xcworkspace removed${RESET}"
  else
    echo -e "${YELLOW}xcworkspace not found or already removed${RESET}"
  fi
  
  # 4.2 Modify Podfile to fix common iOS build issues
  if [ -f "Podfile" ]; then
    echo -e "Checking Podfile for any references to problematic modules..."
    if grep -q "expo-device" Podfile; then
      echo -e "${YELLOW}Found problematic module references in Podfile, cleaning...${RESET}"
      # Create backup
      cp Podfile Podfile.backup
      # Remove problematic lines
      sed -i.bak '/expo-device/d' Podfile
      rm -f Podfile.bak
      echo -e "${GREEN}Problematic module references removed from Podfile${RESET}"
    else
      echo -e "${GREEN}Podfile is clean, no problematic modules found${RESET}"
    fi
  else
    echo -e "${RED}Podfile not found! This is required for iOS builds.${RESET}"
  fi
  
  cd ..
  echo -e "${GREEN}iOS pod environment cleaned${RESET}"
else
  echo -e "${YELLOW}iOS directory not found, skipping iOS-specific cleanup${RESET}"
fi

# 5. Install dependencies
echo -e "${BLUE}Step 5: Reinstalling dependencies...${RESET}"
npm install

# 6. Verify dependencies are properly installed
echo -e "${BLUE}Step 6: Verifying installation...${RESET}"
if [ -d "node_modules/expo-device" ]; then
  echo -e "${RED}WARNING: expo-device is still in node_modules!${RESET}"
  echo -e "Removing it manually..."
  rm -rf node_modules/expo-device
  echo -e "${GREEN}expo-device manually removed${RESET}"
else
  echo -e "${GREEN}Verified: expo-device is not in node_modules (good)${RESET}"
fi

echo -e "${BLUE}=======================================================${RESET}"
echo -e "${GREEN}Clean build process completed successfully!${RESET}"
echo -e "${BLUE}=======================================================${RESET}"
echo -e "${YELLOW}Now you can build the app for iOS and Android:${RESET}"
echo -e "  npm run build:ios      # Build for iOS"
echo -e "  npm run build:android  # Build for Android"
echo -e "${BLUE}=======================================================${RESET}"