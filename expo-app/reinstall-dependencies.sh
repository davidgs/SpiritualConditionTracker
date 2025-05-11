#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Starting cleanup and dependency reinstallation...${RESET}"

# Save the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Clean npm cache
echo -e "Cleaning npm cache..."
npm cache clean --force
echo -e "${GREEN}npm cache cleaned${RESET}"

# 2. Remove node_modules completely
if [ -d "node_modules" ]; then
  echo -e "Removing node_modules directory..."
  rm -rf node_modules
  echo -e "${GREEN}node_modules directory removed${RESET}"
else
  echo -e "${YELLOW}node_modules directory not found${RESET}"
fi

# 3. Remove package-lock.json if it exists
if [ -f "package-lock.json" ]; then
  echo -e "Removing package-lock.json..."
  rm -f package-lock.json
  echo -e "${GREEN}package-lock.json removed${RESET}"
else
  echo -e "${YELLOW}package-lock.json not found${RESET}"
fi

# 4. Clean iOS project
if [ -d "ios" ]; then
  echo -e "Cleaning iOS project..."
  cd ios
  if [ -f "clean-pods.sh" ]; then
    echo -e "Running clean-pods.sh..."
    chmod +x clean-pods.sh
    ./clean-pods.sh
  else
    echo -e "${YELLOW}clean-pods.sh not found, skipping${RESET}"
  fi
  cd ..
else
  echo -e "${YELLOW}ios directory not found, skipping iOS cleanup${RESET}"
fi

# 5. Reinstall dependencies
echo -e "${BLUE}Reinstalling dependencies...${RESET}"
npm install

# 6. Verify expo-device is not installed
if [ -d "node_modules/expo-device" ]; then
  echo -e "${RED}ERROR: expo-device is still present in node_modules!${RESET}"
  echo -e "Removing it manually..."
  rm -rf node_modules/expo-device
  echo -e "${GREEN}expo-device manually removed${RESET}"
else
  echo -e "${GREEN}Verified: expo-device is not in node_modules${RESET}"
fi

echo -e "${GREEN}Dependencies reinstalled successfully!${RESET}"
echo -e "${YELLOW}Next steps: Run 'npm start' to verify the app starts correctly${RESET}"