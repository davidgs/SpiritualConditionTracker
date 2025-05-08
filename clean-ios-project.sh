#!/bin/bash

# Spiritual Condition Tracker - iOS Project Cleanup Script
# This script performs a thorough cleanup of iOS build files

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== iOS Project Cleanup =====${RESET}"
echo "This script will clean the iOS project to help resolve build issues."
echo ""

# Check if we're in the root directory
if [ ! -d "expo-app" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${RESET}"
  exit 1
fi

# Ask for confirmation
echo -e "${YELLOW}WARNING: This will remove all iOS build files.${RESET}"
read -p "Are you sure you want to proceed? (y/n): " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
  echo "Cleanup canceled."
  exit 0
fi

# Navigate to expo app directory
cd expo-app

# Clean iOS directory
if [ -d "ios" ]; then
  echo "Removing iOS directory..."
  rm -rf ios
  echo -e "${GREEN}iOS directory removed.${RESET}"
else
  echo "iOS directory not found. Skipping."
fi

# Clean pod cache if CocoaPods is installed
if command -v pod &> /dev/null; then
  echo "Cleaning CocoaPods cache..."
  pod cache clean --all
  echo -e "${GREEN}CocoaPods cache cleaned.${RESET}"
fi

# Clean metro bundler cache
if [ -d "node_modules/.cache" ]; then
  echo "Cleaning Metro bundler cache..."
  rm -rf node_modules/.cache
  echo -e "${GREEN}Metro bundler cache cleaned.${RESET}"
fi

# Remove derived data (Xcode cache)
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
  echo "Cleaning Xcode derived data..."
  rm -rf ~/Library/Developer/Xcode/DerivedData/*SpiritualConditionTracker*
  echo -e "${GREEN}Xcode derived data cleaned.${RESET}"
fi

# Go back to root directory
cd ..

echo -e "${BOLD}${GREEN}===== Cleanup Complete =====${RESET}"
echo ""
echo -e "Next steps:"
echo -e "1. ${BOLD}Run the prepare-ios-build.sh script to create a fresh iOS build${RESET}"
echo -e "   ${BLUE}./prepare-ios-build.sh${RESET}"
echo ""
echo -e "${YELLOW}Note: If you encounter persistent issues, you may need to reinstall node dependencies:${RESET}"
echo -e "1. cd expo-app"
echo -e "2. rm -rf node_modules"
echo -e "3. npm install"
echo ""