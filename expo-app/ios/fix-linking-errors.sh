#!/bin/bash

# Fix Linking Errors Script for iOS builds
# This script creates a patch for the Podfile to fix the linking errors with 
# react-native-screens and react-native-safe-area-context

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Fixing linking errors in iOS build...${RESET}"

PODFILE="Podfile"

if [ ! -f "$PODFILE" ]; then
  echo -e "${RED}Podfile not found! Please run this script from the ios directory.${RESET}"
  exit 1
fi

# Create a backup
cp "$PODFILE" "${PODFILE}.backup"
echo -e "${GREEN}Created backup at ${PODFILE}.backup${RESET}"

# Check if we need to add fixes
if grep -q "RNSScreenNavigationContainer.mm" "$PODFILE"; then
  echo -e "${YELLOW}Fix already applied. No changes made.${RESET}"
  exit 0
fi

# Fix the Podfile
echo -e "Patching Podfile to fix linking errors..."

# Get line number where post_install starts
POST_INSTALL_LINE=$(grep -n "post_install" "$PODFILE" | cut -d':' -f1)
if [ -z "$POST_INSTALL_LINE" ]; then
  echo -e "${RED}Could not find post_install in Podfile!${RESET}"
  exit 1
fi

TARGET_SECTION_LINE=$(grep -n "target.name == 'react-native-screens'" "$PODFILE" | cut -d':' -f1)
if [ -z "$TARGET_SECTION_LINE" ]; then
  echo -e "${YELLOW}Could not find react-native-screens section, may need to add it completely${RESET}"
  
  # Find the end of the post_install block to insert our fix
  TARGET_LINE=$(grep -n "RCT-Folly" "$PODFILE" | cut -d':' -f1)
  if [ -z "$TARGET_LINE" ]; then
    # If we can't find RCT-Folly, try to find the end of post_install
    TARGET_LINE=$(grep -n "end" "$PODFILE" | awk -v start="$POST_INSTALL_LINE" '$1 > start' | head -1 | cut -d':' -f1)
    TARGET_LINE=$((TARGET_LINE - 1))
  else
    # Get to the end of the RCT-Folly block
    TARGET_LINE=$(tail -n +$TARGET_LINE "$PODFILE" | grep -n "end" | head -1 | cut -d':' -f1)
    TARGET_LINE=$((TARGET_LINE + TARGET_LINE - 1))
  fi
  
  if [ -z "$TARGET_LINE" ]; then
    echo -e "${RED}Could not determine insertion point in Podfile!${RESET}"
    exit 1
  fi
  
  echo -e "Adding fix at line $TARGET_LINE..."
  
  # Add the fix to the Podfile
  sed -i.tmp "${TARGET_LINE}i\\
      # Fix for react-native-screens missing symbols\\
      elsif target.name == 'react-native-screens'\\
        target.build_configurations.each do |config|\\
          config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = [\\
            \"RNSScreenStackHeaderConfig.mm\",\\
            \"RNSScreenStack.mm\",\\
            \"RNSScreen.mm\",\\
            \"RNSScreenNavigationContainer.mm\",\\
            \"RNSScreenStackAnimator.mm\"\\
          ]\\
        end\\
      # Fix for react-native-safe-area-context missing symbols\\
      elsif target.name == 'react-native-safe-area-context'\\
        target.build_configurations.each do |config|\\
          config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = [\\
            \"RNCSafeAreaViewShadowNode.cpp\",\\
            \"RNCSafeAreaViewState.cpp\",\\
            \"RNCSafeAreaViewComponentView.mm\",\\
            \"RNCSafeAreaViewComponentView.cpp\",\\
            \"RNCSafeAreaView.cpp\"\\
          ]\\
        end" "$PODFILE"
    
  # Also add universal linker flags
  TARGET_LINE=$(grep -n "end" "$PODFILE" | awk -v start="$TARGET_LINE" '$1 > start' | head -1 | cut -d':' -f1)
  TARGET_LINE=$((TARGET_LINE - 1))
  
  sed -i.tmp "${TARGET_LINE}i\\
      # Universal fix for all targets\\
      target.build_configurations.each do |config|\\
        # Fix the C++ standard\\
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'\\
        # Make sure Objective-C symbols are properly linked\\
        if !config.build_settings['OTHER_LDFLAGS']&.include?('-ObjC')\\
          config.build_settings['OTHER_LDFLAGS'] = ['-ObjC']\\
        end\\
      end" "$PODFILE"
else
  echo -e "${YELLOW}Found existing react-native-screens section, updating...${RESET}"
  
  # Extract the section and modify it
  START_LINE="$TARGET_SECTION_LINE"
  END_LINE=$(tail -n +$START_LINE "$PODFILE" | grep -n "end" | head -1 | cut -d':' -f1)
  END_LINE=$((END_LINE + START_LINE - 1))
  
  # Update the excluded files
  sed -i.tmp "${START_LINE},${END_LINE}c\\
      elsif target.name == 'react-native-screens'\\
        target.build_configurations.each do |config|\\
          config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] = [\\
            \"RNSScreenStackHeaderConfig.mm\",\\
            \"RNSScreenStack.mm\",\\
            \"RNSScreen.mm\",\\
            \"RNSScreenNavigationContainer.mm\",\\
            \"RNSScreenStackAnimator.mm\"\\
          ]\\
        end" "$PODFILE"
fi

# Clean up
rm -f "$PODFILE.tmp"

echo -e "${GREEN}Podfile updated to fix linking errors.${RESET}"
echo -e "${YELLOW}Now run 'pod install' to apply the changes.${RESET}"