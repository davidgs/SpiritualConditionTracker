#!/bin/bash

# This script removes all references to @react-native-community/datetimepicker
# and replaces them with react-native-paper-dates

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

echo -e "${BLUE}Cleaning DateTimePicker references from the project...${RESET}"

# Check for any files that reference DateTimePicker
echo -e "Searching for files that reference DateTimePicker..."
FILES=$(find ./src -type f -name "*.js" -o -name "*.jsx" | xargs grep -l "@react-native-community/datetimepicker" 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo -e "${GREEN}No direct imports of @react-native-community/datetimepicker found.${RESET}"
else
  echo -e "${YELLOW}Found the following files with DateTimePicker references:${RESET}"
  echo "$FILES"
  
  # Process each file
  for FILE in $FILES; do
    echo -e "Processing ${BLUE}$FILE${RESET}..."
    
    # Create backup
    cp "$FILE" "${FILE}.bak"
    
    # Replace import statements
    sed -i '' 's/import DateTimePicker from.*@react-native-community\/datetimepicker.*/import { DatePickerModal } from '\''react-native-paper-dates'\'';/g' "$FILE"
    
    # Replace dynamic imports/requires
    sed -i '' 's/.*require.*@react-native-community\/datetimepicker.*/\/\/ Replaced with react-native-paper-dates/g' "$FILE"
    
    echo -e "${GREEN}Updated $FILE${RESET}"
  done
fi

# Check for dynamic imports
echo -e "Searching for files with dynamic requires of DateTimePicker..."
DYNAMIC_FILES=$(find ./src -type f -name "*.js" -o -name "*.jsx" | xargs grep -l "require.*datetimepicker" 2>/dev/null || true)

if [ -z "$DYNAMIC_FILES" ]; then
  echo -e "${GREEN}No dynamic requires of DateTimePicker found.${RESET}"
else
  echo -e "${YELLOW}Found the following files with dynamic DateTimePicker requires:${RESET}"
  echo "$DYNAMIC_FILES"
  
  # Process each file
  for FILE in $DYNAMIC_FILES; do
    echo -e "Processing ${BLUE}$FILE${RESET}..."
    
    # Create backup
    cp "$FILE" "${FILE}.bak"
    
    # Replace the dynamic require block with react-native-paper-dates
    sed -i '' '/let DateTimePicker/,/}/ s/.*/import { DatePickerModal } from '\''react-native-paper-dates'\'';/' "$FILE"
    
    echo -e "${GREEN}Updated $FILE${RESET}"
  done
fi

# Fix SettingsScreen.js specifically (common issue)
SETTINGS_SCREEN="./src/screens/SettingsScreen.js"
if [ -f "$SETTINGS_SCREEN" ]; then
  echo -e "Checking SettingsScreen.js for DateTimePicker references..."
  
  if grep -q "DateTimePicker" "$SETTINGS_SCREEN"; then
    echo -e "${YELLOW}Found DateTimePicker references in SettingsScreen.js, fixing...${RESET}"
    
    # Create backup
    cp "$SETTINGS_SCREEN" "${SETTINGS_SCREEN}.bak"
    
    # Make sure we have the correct import
    if ! grep -q "DatePickerModal.*react-native-paper-dates" "$SETTINGS_SCREEN"; then
      sed -i '' '1s/^/import { DatePickerModal } from '\''react-native-paper-dates'\'';\n/' "$SETTINGS_SCREEN"
    fi
    
    # Remove any DateTimePicker imports
    sed -i '' '/import.*DateTimePicker/d' "$SETTINGS_SCREEN"
    sed -i '' '/require.*datetimepicker/d' "$SETTINGS_SCREEN"
    
    echo -e "${GREEN}Fixed SettingsScreen.js${RESET}"
  else
    echo -e "${GREEN}No DateTimePicker references found in SettingsScreen.js${RESET}"
  fi
fi

# Update package.json to make sure we have the correct dependencies
echo -e "Updating package.json to ensure correct dependencies..."

# Check if we have react-native-paper-dates in package.json
if ! grep -q "react-native-paper-dates" "package.json"; then
  echo -e "${YELLOW}Adding react-native-paper-dates to package.json${RESET}"
  sed -i '' 's/"react-native-paper": "\^[0-9\.]*",/"react-native-paper": "\^5.12.1",\n    "react-native-paper-dates": "\^0.22.3",/g' "package.json"
fi

# Remove DateTimePicker from package.json if it exists
if grep -q "@react-native-community/datetimepicker" "package.json"; then
  echo -e "${YELLOW}Removing @react-native-community/datetimepicker from package.json${RESET}"
  # Save a backup
  cp "package.json" "package.json.bak"
  # Remove the line with datetimepicker
  sed -i '' '/"@react-native-community\/datetimepicker"/d' "package.json"
fi

echo -e "${GREEN}Done cleaning DateTimePicker references!${RESET}"
echo -e "${YELLOW}Next steps: Run 'npm install --legacy-peer-deps' to update your dependencies.${RESET}"