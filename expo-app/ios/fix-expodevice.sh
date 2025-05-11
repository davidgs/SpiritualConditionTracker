#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Running ExpoDevice import fix for iOS build...${RESET}"

# Define paths
PROJECT_ROOT="/Users/davidgs/github.com/SpiritualConditionTracker"
EXPO_CONFIGURE_SCRIPT="Pods/Target Support Files/Pods-SpiritualConditionTracker/expo-configure-project.sh"
PROVIDER_FILE="Pods/Target Support Files/Pods-SpiritualConditionTracker/ExpoModulesProvider.swift"

# Check if we're in the ios directory
if [ ! -f "Podfile" ]; then
  echo -e "${RED}Please run this script from the ios directory${RESET}"
  exit 1
fi

# Step 1: Back up the original expo-configure-project.sh
if [ -f "$EXPO_CONFIGURE_SCRIPT" ]; then
  echo -e "${BLUE}Backing up original expo-configure-project.sh...${RESET}"
  cp "$EXPO_CONFIGURE_SCRIPT" "${EXPO_CONFIGURE_SCRIPT}.backup"
  echo -e "${GREEN}Backup created at ${EXPO_CONFIGURE_SCRIPT}.backup${RESET}"
  
  # Step 2: Create a modified version of expo-configure-project.sh that includes our patch
  echo -e "${BLUE}Creating modified expo-configure-script.sh...${RESET}"
  
  # First part of the original script
  cat "${EXPO_CONFIGURE_SCRIPT}.backup" > "${EXPO_CONFIGURE_SCRIPT}.new"
  
  # Add our patching code to the end of the script
  cat >> "${EXPO_CONFIGURE_SCRIPT}.new" << 'EOL'

# ================ ExpoDevice Fix =================
# This section appended by fix-expodevice.sh to fix ExpoDevice module issues

# Define the path to the ExpoModulesProvider.swift file
PROVIDER_FILE="${PODS_TARGET_SRCROOT}/../../Target Support Files/Pods-SpiritualConditionTracker/ExpoModulesProvider.swift"

# Check if the file exists
if [ -f "$PROVIDER_FILE" ]; then
  echo "Found ExpoModulesProvider.swift, checking for ExpoDevice import..."
  
  # Check if the file contains an import for ExpoDevice
  if grep -q "import ExpoDevice" "$PROVIDER_FILE"; then
    echo "Found ExpoDevice import, replacing with inline implementation..."
    
    # Create a temporary file with our changes
    cat > "$PROVIDER_FILE.new" << 'INNEREOF'
// Modified during expo-configure-project.sh to fix ExpoDevice import
import Foundation
import ExpoModulesCore

// Inline DeviceModule implementation
public class DeviceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDevice")
    Constants(["isDevice": true, "brand": "Apple"])
  }
}

// Original file content follows (with ExpoDevice import removed)
INNEREOF
    
    # Append the original file content with the import line removed
    grep -v "import ExpoDevice" "$PROVIDER_FILE" >> "$PROVIDER_FILE.new"
    
    # Replace the original file
    mv "$PROVIDER_FILE.new" "$PROVIDER_FILE"
    echo "Successfully patched ExpoModulesProvider.swift"
  else
    echo "No ExpoDevice import found in ExpoModulesProvider.swift"
  fi
else
  echo "ExpoModulesProvider.swift not found at: $PROVIDER_FILE"
fi
EOL
  
  # Replace the original script with our modified version
  mv "${EXPO_CONFIGURE_SCRIPT}.new" "$EXPO_CONFIGURE_SCRIPT"
  chmod +x "$EXPO_CONFIGURE_SCRIPT"
  echo -e "${GREEN}Modified expo-configure-project.sh with ExpoDevice fix${RESET}"
else
  echo -e "${YELLOW}expo-configure-project.sh not found at $EXPO_CONFIGURE_SCRIPT${RESET}"
fi

# Also patch any currently existing ExpoModulesProvider.swift
if [ -f "$PROVIDER_FILE" ]; then
  echo -e "${BLUE}Found existing ExpoModulesProvider.swift, patching it now...${RESET}"
  
  # Check if the file contains an import for ExpoDevice
  if grep -q "import ExpoDevice" "$PROVIDER_FILE"; then
    echo -e "${YELLOW}Found ExpoDevice import, replacing with inline implementation...${RESET}"
    
    # Create a temporary file with our changes
    cat > "$PROVIDER_FILE.new" << 'EOL'
// Modified by fix-expodevice.sh to fix ExpoDevice import
import Foundation
import ExpoModulesCore

// Inline DeviceModule implementation
public class DeviceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDevice")
    Constants(["isDevice": true, "brand": "Apple"])
  }
}

// Original file content follows (with ExpoDevice import removed)
EOL
    
    # Append the original file content with the import line removed
    grep -v "import ExpoDevice" "$PROVIDER_FILE" >> "$PROVIDER_FILE.new"
    
    # Replace the original file
    mv "$PROVIDER_FILE.new" "$PROVIDER_FILE"
    echo -e "${GREEN}Successfully patched existing ExpoModulesProvider.swift${RESET}"
  else
    echo -e "${GREEN}No ExpoDevice import found in existing ExpoModulesProvider.swift${RESET}"
  fi
else
  echo -e "${YELLOW}No existing ExpoModulesProvider.swift found - it will be patched when created${RESET}"
fi

echo -e "${GREEN}Fix complete. Now run your Xcode build.${RESET}"
echo -e "${YELLOW}Note: The fix will be applied both now and during the build process.${RESET}"