#!/bin/bash

# This script handles Expo-related scripts for pure native builds
# It either disables or removes the scripts to prevent them from causing errors

echo "Converting project to pure native build (no Expo)..."

# Check if Pods directory exists
if [ ! -d "./Pods" ]; then
  echo "No Pods directory found. Run pod install first."
  exit 0
fi

# Find all instances of expo-configure-project.sh and related Expo scripts
EXPO_SCRIPTS=$(find ./Pods -name "*expo*.sh" 2>/dev/null)

if [ -z "$EXPO_SCRIPTS" ]; then
  echo "No Expo scripts found. Project is clean."
else
  echo "Found the following Expo-related scripts:"
  echo "$EXPO_SCRIPTS"
  echo ""
  
  # Create a disabled version of all Expo scripts to prevent them from running
  for SCRIPT in $EXPO_SCRIPTS; do
    echo "Processing $SCRIPT..."
    
    # Create a backup if it doesn't exist
    if [ ! -f "${SCRIPT}.backup" ]; then
      echo "Creating backup at ${SCRIPT}.backup"
      cp "$SCRIPT" "${SCRIPT}.backup"
    fi
    
    # Replace the script with a no-op version
    cat > "$SCRIPT" << 'EOL'
#!/bin/sh

# This script has been disabled as part of the conversion to pure native build

echo "Expo script disabled - using pure native build"
exit 0
EOL
    
    # Ensure the script is executable
    chmod +x "$SCRIPT"
    echo "Disabled $SCRIPT successfully"
  done
fi

# Check for Expo-specific Build Phases in the Xcode project
PROJECT_FILE="./AARecoveryTracker.xcodeproj/project.pbxproj"
if [ -f "$PROJECT_FILE" ]; then
  echo "Checking for Expo Build Phases in Xcode project..."
  
  # If found, make a backup of the project file
  if grep -q "Supporting/Expo" "$PROJECT_FILE" || grep -q "expo-configure-project.sh" "$PROJECT_FILE"; then
    echo "Found Expo references in project file. Making backup..."
    cp "$PROJECT_FILE" "${PROJECT_FILE}.backup-expo"
    
    # Remove or comment out Expo-specific build phases
    perl -i -pe 's/(shellScript = .*expo-configure-project.sh.*)/#$1/g' "$PROJECT_FILE"
    echo "Modified project file to disable Expo build phases"
  else
    echo "No Expo build phases found in Xcode project."
  fi
fi

echo "Project has been converted to pure native build."
echo "You can now build the project without Expo dependencies."