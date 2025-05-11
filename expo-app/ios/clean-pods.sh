#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Cleaning iOS pods directory for a fresh start...${RESET}"

# Remove Pods directory
if [ -d "Pods" ]; then
  echo -e "Removing Pods directory..."
  rm -rf Pods
  echo -e "${GREEN}Pods directory removed${RESET}"
else
  echo -e "${YELLOW}Pods directory not found${RESET}"
fi

# Remove Podfile.lock
if [ -f "Podfile.lock" ]; then
  echo -e "Removing Podfile.lock..."
  rm -f Podfile.lock
  echo -e "${GREEN}Podfile.lock removed${RESET}"
else
  echo -e "${YELLOW}Podfile.lock not found${RESET}"
fi

# Remove .xcworkspace
if [ -d "SpiritualConditionTracker.xcworkspace" ]; then
  echo -e "Removing xcworkspace..."
  rm -rf SpiritualConditionTracker.xcworkspace
  echo -e "${GREEN}xcworkspace removed${RESET}"
else
  echo -e "${YELLOW}xcworkspace not found${RESET}"
fi

# Clean CocoaPods cache
echo -e "Cleaning CocoaPods cache..."
pod cache clean --all
echo -e "${GREEN}CocoaPods cache cleaned${RESET}"

# Run pod install with repo update
echo -e "${BLUE}Running pod install with repo update...${RESET}"
pod install --repo-update

echo -e "${GREEN}Done! Pods have been cleaned and reinstalled.${RESET}"
echo -e "${YELLOW}Don't forget to run Project > Clean Build Folder in Xcode too.${RESET}"