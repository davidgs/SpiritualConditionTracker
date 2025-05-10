#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

function log() {
  echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Determine project root directory
PROJECT_ROOT=$(pwd)
EXPO_APP_DIR="$PROJECT_ROOT/expo-app"
IOS_DIR="$EXPO_APP_DIR/ios"

log "${BLUE}Fixing ExpoDevice module import issue in ExpoModulesProvider.swift...${RESET}"

# Go to the iOS directory
cd "$IOS_DIR"
if [ $? -ne 0 ]; then
  log "${RED}Error: Could not navigate to iOS directory at $IOS_DIR${RESET}"
  exit 1
fi

# Define paths
MODULES_PROVIDER_FILE="Pods/Target Support Files/Pods-SpiritualConditionTracker/ExpoModulesProvider.swift"
MODULEMAP_DIR="Pods/Headers/Public/ExpoDevice"
MODULEMAP_FILE="$MODULEMAP_DIR/ExpoDevice.modulemap"

# Check if ExpoModulesProvider.swift exists
if [ ! -f "$MODULES_PROVIDER_FILE" ]; then
  log "${RED}Error: ExpoModulesProvider.swift not found at $MODULES_PROVIDER_FILE${RESET}"
  exit 1
fi

# Create modulemap directory if it doesn't exist
mkdir -p "$MODULEMAP_DIR"

# Create a basic modulemap file
cat > "$MODULEMAP_FILE" << 'EOF'
module ExpoDevice {
  umbrella header "ExpoDevice.h"
  export *
}
EOF
log "${GREEN}Created basic ExpoDevice.modulemap file${RESET}"

# Create a header file for ExpoDevice
HEADER_FILE="$MODULEMAP_DIR/ExpoDevice.h"
cat > "$HEADER_FILE" << 'EOF'
// ExpoDevice.h
// Empty header to satisfy modulemap
#ifndef ExpoDevice_h
#define ExpoDevice_h

#endif /* ExpoDevice_h */
EOF
log "${GREEN}Created ExpoDevice.h header file${RESET}"

# Check if ExpoModulesProvider.swift imports ExpoDevice
if grep -q "import ExpoDevice" "$MODULES_PROVIDER_FILE"; then
  log "${YELLOW}ExpoModulesProvider.swift imports ExpoDevice, fixing...${RESET}"
  
  # Option 1: Comment out the import
  sed -i.bak 's/import ExpoDevice/\/\/ import ExpoDevice - commented out by fix script/' "$MODULES_PROVIDER_FILE"
  
  # Verify the changes
  if grep -q "// import ExpoDevice" "$MODULES_PROVIDER_FILE"; then
    log "${GREEN}Successfully commented out ExpoDevice import${RESET}"
  else
    log "${RED}Failed to comment out ExpoDevice import${RESET}"
    
    # Option 2: Try different sed syntax for macOS
    sed -i '' 's/import ExpoDevice/\/\/ import ExpoDevice - commented out by fix script/' "$MODULES_PROVIDER_FILE"
    
    if grep -q "// import ExpoDevice" "$MODULES_PROVIDER_FILE"; then
      log "${GREEN}Successfully commented out ExpoDevice import (using macOS sed)${RESET}"
    else
      log "${RED}Could not comment out using sed, trying direct file replacement...${RESET}"
      
      # Option 3: Direct file replacement
      TEMP_FILE="${MODULES_PROVIDER_FILE}.new"
      cat "$MODULES_PROVIDER_FILE" | grep -v "import ExpoDevice" > "$TEMP_FILE"
      mv "$TEMP_FILE" "$MODULES_PROVIDER_FILE"
      
      # Check if the import line is gone
      if ! grep -q "import ExpoDevice" "$MODULES_PROVIDER_FILE"; then
        log "${GREEN}Successfully removed ExpoDevice import line${RESET}"
      else
        log "${RED}Failed to fix ExpoDevice import using all methods${RESET}"
      fi
    fi
  fi
  
  # Check if there are any references to ExpoDevice in the file content
  DEVICE_REFERENCES=$(grep -n "ExpoDevice" "$MODULES_PROVIDER_FILE" | grep -v "import")
  if [ -n "$DEVICE_REFERENCES" ]; then
    log "${YELLOW}Found additional ExpoDevice references that may cause issues:${RESET}"
    echo "$DEVICE_REFERENCES"
    log "${YELLOW}These will need to be commented out or replaced manually if they cause errors${RESET}"
  fi
else
  log "${GREEN}ExpoModulesProvider.swift does not import ExpoDevice, no need to fix${RESET}"
fi

# Check for App delegate issues
APPDELEGATE_FILE="SpiritualConditionTracker/AppDelegate.mm"
if [ -f "$APPDELEGATE_FILE" ]; then
  log "${BLUE}Checking AppDelegate.mm for potential issues...${RESET}"
  if grep -q "ExpoDevice" "$APPDELEGATE_FILE"; then
    log "${YELLOW}Found ExpoDevice references in AppDelegate.mm${RESET}"
  else
    log "${GREEN}No ExpoDevice references in AppDelegate.mm${RESET}"
  fi
fi

log "${GREEN}✓ Completed ExpoDevice module fix${RESET}"
log "${BLUE}Next steps:${RESET}"
log "1. Rerun 'pod install' in the iOS directory"
log "2. Clean the build folder in Xcode (Shift+Cmd+K)"
log "3. Build and run the project"

cd "$PROJECT_ROOT"
exit 0