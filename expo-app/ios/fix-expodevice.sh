#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Running ExpoDevice import fix for iOS build...${RESET}"

# Define the path to the ExpoModulesProvider.swift file
PROVIDER_FILE="Pods/Target Support Files/Pods-SpiritualConditionTracker/ExpoModulesProvider.swift"

# Check if the file exists
if [ -f "$PROVIDER_FILE" ]; then
  echo -e "${BLUE}Found ExpoModulesProvider.swift, checking for ExpoDevice import...${RESET}"
  
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
    echo -e "${GREEN}Successfully patched ExpoModulesProvider.swift${RESET}"
    
    echo -e "${BLUE}Setting read-only permissions to prevent changes...${RESET}"
    chmod a-w "$PROVIDER_FILE"
    echo -e "${GREEN}File set to read-only${RESET}"
  else
    echo -e "${GREEN}No ExpoDevice import found in ExpoModulesProvider.swift${RESET}"
  fi
else
  echo -e "${RED}ExpoModulesProvider.swift not found at: $PROVIDER_FILE${RESET}"
fi

echo -e "${BLUE}Checking for any remaining ExpoDevice references...${RESET}"
grep -r "import ExpoDevice" Pods/Target\ Support\ Files/ || echo -e "${GREEN}No ExpoDevice imports found${RESET}"

echo -e "${GREEN}Fix complete. You can now run your Xcode build.${RESET}"