#!/bin/bash

# This script runs before EAS build installs dependencies
# It is set up in eas.json to address dependency resolution issues

# Exit on error
set -e

echo "🔧 EAS Build Pre-install Hook Running..."

# Create directories for hooks and scripts if they don't exist
mkdir -p eas-hooks

# Modify package.json to ensure dependencies are compatible
echo "📦 Checking package.json for compatibility issues..."

# Add key dependencies if missing 
DEPENDENCIES_TO_CHECK=(
  "minimatch" "^9.0.3"
  "metro-react-native-babel-transformer" "^0.76.8"
  "react-native-paper-dates" "^0.22.42"
  "expo-build-properties" "~0.11.1"
)

for ((i=0; i<${#DEPENDENCIES_TO_CHECK[@]}; i+=2)); do
  DEP_NAME="${DEPENDENCIES_TO_CHECK[i]}"
  DEP_VERSION="${DEPENDENCIES_TO_CHECK[i+1]}"
  
  if ! grep -q "\"${DEP_NAME}\":" package.json; then
    echo "➕ Adding ${DEP_NAME} dependency..."
    # Use node to add dependency to package.json
    node -e "
      const fs = require('fs');
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies['${DEP_NAME}'] = '${DEP_VERSION}';
      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    "
  fi
done

# Ensure AsyncStorage is properly installed
if ! grep -q '"@react-native-async-storage/async-storage":' package.json; then
  echo "➕ Adding @react-native-async-storage/async-storage dependency..."
  node -e "
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies['@react-native-async-storage/async-storage'] = '^2.1.2';
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  "
fi

# Fix C++ compatibility issues in native code if needed
echo "🔍 Checking for C++ compatibility issues in native code..."

# Path to React Native source files
RN_DIR="./node_modules/react-native"

# Find files with .contains() calls that need to be fixed
FILES_TO_CHECK=(
  "${RN_DIR}/ReactCommon/react/performance/timeline/PerformanceObserver.cpp"
  "${RN_DIR}/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp"
)

for FILE in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$FILE" ]; then
    echo "📋 Checking $FILE for .contains() method calls..."
    
    # Create backup
    cp "$FILE" "${FILE}.bak"
    
    # Replace .contains() with .find() != .end() for C++ compatibility
    sed -i.tmp 's/\([a-zA-Z0-9_]*\)\.contains(\([^)]*\))/\1.find(\2) != \1.end()/g' "$FILE"
    
    # Count replacements
    DIFF_COUNT=$(diff -u "${FILE}.bak" "$FILE" | grep -c '+.*find')
    
    if [ $DIFF_COUNT -gt 0 ]; then
      echo "✅ Fixed $DIFF_COUNT C++ compatibility issues in $FILE"
    else
      echo "ℹ️ No C++ compatibility issues found in $FILE"
      # Restore original if no changes were made
      mv "${FILE}.bak" "$FILE"
    fi
    
    # Clean up temporary files
    rm -f "${FILE}.tmp" "${FILE}.bak"
  fi
done

# Print the modified package.json
echo "📄 Modified package.json:"
cat package.json

# Fix Podfile if it exists (created during build process)
echo "🔍 Checking for Podfile issues..."
if [ -d "./ios" ]; then
  PODFILE_PATH="./ios/Podfile"
  
  # Create Podfile if it doesn't exist yet (will be generated later)
  if [ ! -f "$PODFILE_PATH" ]; then
    echo "ℹ️ Podfile doesn't exist yet, will be fixed after generation"
    
    # Create a script to fix the Podfile after it's generated
    mkdir -p ./ios
    cat << 'EOF' > ./ios/fix-podfile.sh
#!/bin/bash
# Fix Podfile react-native path
if [ -f "./Podfile" ]; then
  echo "🔧 Fixing Podfile react-native path"
  sed -i.bak 's|:path => config\[:reactNativePath\]|:path => "../node_modules/react-native"|g' Podfile
  
  # Add C++20 configuration if missing
  if ! grep -q "post_install" Podfile; then
    echo "Adding post_install hook to Podfile"
    cat << 'POSTINSTALL' >> Podfile

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Set C++20 for all C++ files
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
POSTINSTALL
  fi
  
  # Clean up backup
  rm -f Podfile.bak
  echo "✅ Podfile fixed successfully"
else
  echo "⚠️ No Podfile found to fix"
fi
EOF
    chmod +x ./ios/fix-podfile.sh
    echo "✅ Created fix-podfile.sh script that will run during build"
  else
    echo "🔧 Fixing existing Podfile"
    # Fix the existing Podfile
    sed -i.bak 's|:path => config\[:reactNativePath\]|:path => "../node_modules/react-native"|g' "$PODFILE_PATH"
    
    # Clean up backup
    rm -f "${PODFILE_PATH}.bak"
    echo "✅ Podfile fixed successfully"
  fi
fi

echo "✅ Pre-install hook completed successfully"