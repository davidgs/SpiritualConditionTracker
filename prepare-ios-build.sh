#!/bin/bash

# Spiritual Condition Tracker - iOS Build Preparation Script
# This script prepares the Expo project for iOS native build with Xcode

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

# Fix SQLite configuration
echo "Applying SQLite configuration fix..."
node ../fix-sqlite-config.js
echo -e "${GREEN}SQLite configuration fixed.${RESET}"

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