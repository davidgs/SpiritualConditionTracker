#!/bin/bash

# Fix React Native / React dependency conflict for iOS build
# This script updates package.json to ensure compatible dependency versions

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== Fixing React/React Native Dependency Conflict =====${RESET}"
echo "This script will update your package.json to use compatible React and React Native versions."
echo ""

# Check if we're in the root directory
if [ ! -d "expo-app" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${RESET}"
  exit 1
fi

# Navigate to expo app directory
cd expo-app

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json not found in expo-app directory${RESET}"
  exit 1
fi

echo "Creating backup of package.json..."
cp package.json package.json.bak
echo -e "${GREEN}Backup created at package.json.bak${RESET}"

# Update React Native and React versions to be compatible
echo "Updating React and React Native versions in package.json..."

# Fix for macOS/BSD vs Linux sed difference
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS/BSD sed
  sed -i '' 's/"react": "18.2.0"/"react": "^19.0.0"/' package.json
  sed -i '' 's/"react-dom": "18.2.0"/"react-dom": "^19.0.0"/' package.json
else
  # GNU/Linux sed
  sed -i 's/"react": "18.2.0"/"react": "^19.0.0"/' package.json
  sed -i 's/"react-dom": "18.2.0"/"react-dom": "^19.0.0"/' package.json
fi

echo -e "${GREEN}Updated React versions in package.json${RESET}"

# Reinstall dependencies with legacy peer deps
echo "Reinstalling dependencies with legacy peer deps..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Warning: npm install encountered issues. Trying with --force...${RESET}"
  npm install --force
fi

# Create .npmrc file to avoid future dependency conflicts
echo "Creating .npmrc to prevent future dependency conflicts..."
echo "legacy-peer-deps=true" > .npmrc

echo -e "${BOLD}${GREEN}===== Dependency Conflict Resolution Complete =====${RESET}"
echo ""
echo -e "Next steps:"
echo -e "1. ${BOLD}Run the prebuild command again:${RESET}"
echo -e "   ${BLUE}npx expo prebuild --platform ios --clean${RESET}"
echo ""
echo -e "2. ${BOLD}Continue with the iOS build process${RESET}"
echo ""
echo -e "${YELLOW}Note: If you encounter any issues with the updated dependencies, you can restore the backup:${RESET}"
echo -e "cp package.json.bak package.json && npm install"
echo ""