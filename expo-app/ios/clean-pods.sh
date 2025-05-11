#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Performing thorough cleanup of ExpoDevice references...${RESET}"

# First, check that we're in the ios directory
if [ ! -f "Podfile" ]; then
  echo -e "${RED}Please run this script from the ios directory${RESET}"
  exit 1
fi

# Check if our fix script is still in the directory, and if so, remove it
if [ -f "fix-expodevice.sh" ]; then
  echo -e "Removing fix-expodevice.sh..."
  rm -f fix-expodevice.sh
  echo -e "${GREEN}fix-expodevice.sh removed${RESET}"
fi

# 1. Check for references in project.pbxproj
if [ -f "SpiritualConditionTracker.xcodeproj/project.pbxproj" ]; then
  echo -e "Checking for ExpoDevice references in project.pbxproj..."
  if grep -q "ExpoDevice" "SpiritualConditionTracker.xcodeproj/project.pbxproj"; then
    echo -e "${YELLOW}Found ExpoDevice references in project.pbxproj${RESET}"
    echo -e "Creating backup of project.pbxproj..."
    cp "SpiritualConditionTracker.xcodeproj/project.pbxproj" "SpiritualConditionTracker.xcodeproj/project.pbxproj.backup"
    echo -e "${GREEN}Backup created at SpiritualConditionTracker.xcodeproj/project.pbxproj.backup${RESET}"
    
    # Remove the ExpoDevice references
    echo -e "Removing ExpoDevice references from project.pbxproj..."
    sed -i.bak '/ExpoDevice/d' "SpiritualConditionTracker.xcodeproj/project.pbxproj"
    rm -f "SpiritualConditionTracker.xcodeproj/project.pbxproj.bak"
    echo -e "${GREEN}ExpoDevice references removed from project.pbxproj${RESET}"
  else
    echo -e "${GREEN}No ExpoDevice references found in project.pbxproj${RESET}"
  fi
else
  echo -e "${YELLOW}project.pbxproj not found${RESET}"
fi

# 2. Remove Pods directory
if [ -d "Pods" ]; then
  echo -e "Removing Pods directory..."
  rm -rf Pods
  echo -e "${GREEN}Pods directory removed${RESET}"
else
  echo -e "${YELLOW}Pods directory not found${RESET}"
fi

# 3. Remove Podfile.lock
if [ -f "Podfile.lock" ]; then
  echo -e "Removing Podfile.lock..."
  rm -f Podfile.lock
  echo -e "${GREEN}Podfile.lock removed${RESET}"
else
  echo -e "${YELLOW}Podfile.lock not found${RESET}"
fi

# 4. Remove .xcworkspace
if [ -d "SpiritualConditionTracker.xcworkspace" ]; then
  echo -e "Removing xcworkspace..."
  rm -rf SpiritualConditionTracker.xcworkspace
  echo -e "${GREEN}xcworkspace removed${RESET}"
else
  echo -e "${YELLOW}xcworkspace not found${RESET}"
fi

# 5. Remove any ExpoDevice module files from node_modules if they still exist
if [ -d "../node_modules/expo-device" ]; then
  echo -e "Removing expo-device module from node_modules..."
  rm -rf "../node_modules/expo-device"
  echo -e "${GREEN}expo-device module removed from node_modules${RESET}"
fi

# 6. Check for and clean any references in Podfile
echo -e "Checking Podfile for any remaining ExpoDevice references..."
if grep -q "ExpoDevice" "Podfile"; then
  echo -e "${YELLOW}Found ExpoDevice references in Podfile, removing...${RESET}"
  cp Podfile Podfile.backup
  sed -i.bak '/ExpoDevice/d' Podfile
  rm -f Podfile.bak
  echo -e "${GREEN}ExpoDevice references removed from Podfile${RESET}"
else
  echo -e "${GREEN}No ExpoDevice references found in Podfile${RESET}"
fi

# 7. Clean derived data
echo -e "Cleaning Xcode derived data (if on macOS)..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  rm -rf ~/Library/Developer/Xcode/DerivedData/SpiritualConditionTracker-*
  echo -e "${GREEN}Xcode derived data cleaned${RESET}"
else
  echo -e "${YELLOW}Not on macOS, skipping derived data cleaning${RESET}"
fi

# 8. Clean CocoaPods cache
echo -e "Cleaning CocoaPods cache..."
pod cache clean --all
echo -e "${GREEN}CocoaPods cache cleaned${RESET}"

# 9. Run pod install with repo update
echo -e "${BLUE}Running pod install with repo update...${RESET}"
pod install --repo-update --verbose

echo -e "${GREEN}Done! All ExpoDevice references have been removed and pods reinstalled.${RESET}"
echo -e "${YELLOW}Don't forget to run Project > Clean Build Folder in Xcode before building.${RESET}"