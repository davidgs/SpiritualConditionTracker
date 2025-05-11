#!/bin/bash
set -e

echo "🔧 Starting EAS Build Pre-install Hook..."

# Make sure we're in the right directory
cd "$(dirname "$0")/.."
APP_ROOT=$(pwd)

echo "📂 Current directory: $APP_ROOT"

# Fix C++ compatibility issues
echo "🔧 Fixing C++ compatibility issues for EAS build..."
C_FIXED=0

for DIR in "node_modules/react-native/ReactCommon" "node_modules/react-native/React"; do
  if [ -d "$DIR" ]; then
    echo "🔍 Checking $DIR for C++ compatibility issues..."
    
    # Find and fix .contains() method calls in C++ files
    find "$DIR" -type f \( -name "*.cpp" -o -name "*.h" -o -name "*.hpp" \) -exec grep -l "\.contains(" {} \; | while read -r file; do
      echo "🔧 Fixing C++ compatibility in: $file"
      sed -i.bak 's/\([a-zA-Z0-9_]*\)\.contains(\([a-zA-Z0-9_]*\))/\1.find(\2) != \1.end()/g' "$file"
      rm -f "${file}.bak"
      C_FIXED=$((C_FIXED+1))
    done
  fi
done

echo "✅ Fixed $C_FIXED C++ compatibility issues"

# Update app.json to use JSC
if [ -f "$APP_ROOT/app.json" ]; then
  echo "🔧 Updating app.json to use JSC and disable new architecture..."
  # Simple sed replacements for key settings
  sed -i.bak 's/"jsEngine": "hermes"/"jsEngine": "jsc"/g' "$APP_ROOT/app.json"
  
  # Add newArchEnabled: false if it doesn't exist
  if ! grep -q '"newArchEnabled":' "$APP_ROOT/app.json"; then
    sed -i.bak 's/"version": "[^"]*"/"version": "&",\n    "newArchEnabled": false/g' "$APP_ROOT/app.json"
  fi
  
  rm -f "$APP_ROOT/app.json.bak"
  echo "✅ Updated app.json configuration"
fi

# Set environment variables to force old architecture
export RCT_NEW_ARCH_ENABLED=0
export USE_HERMES=0
export USE_BRIDGELESS=0
export USE_FRAMEWORKS=static
export FABRIC_ENABLED=0
export NEW_ARCH_ENABLED=0
export CODEGEN_DISABLE_ALL=1
export DISABLE_CODEGEN=1

echo "✅ Set environment variables to disable new architecture features"

# Create directories needed during build
mkdir -p "$APP_ROOT/build/generated/ios"
mkdir -p "$APP_ROOT/ios/dummy_pods/FBReactNativeSpec"
mkdir -p "$APP_ROOT/ios/dummy_pods/ReactAppDependencyProvider"

# Create a dummy header file for FBReactNativeSpec
echo "// Empty header file for FBReactNativeSpec" > "$APP_ROOT/ios/dummy_pods/FBReactNativeSpec/dummy.h"
echo "// Empty implementation file for FBReactNativeSpec" > "$APP_ROOT/ios/dummy_pods/FBReactNativeSpec/dummy.m"

# Create a dummy header file for ReactAppDependencyProvider
echo "// Empty header file for ReactAppDependencyProvider" > "$APP_ROOT/ios/dummy_pods/ReactAppDependencyProvider/dummy.h"
echo "// Empty implementation file for ReactAppDependencyProvider" > "$APP_ROOT/ios/dummy_pods/ReactAppDependencyProvider/dummy.m"

echo "✅ Created necessary directories and files"

# This approach modifies app.json directly to completely disable new architecture features
if [ -f "$APP_ROOT/app.json" ]; then
  # Use jq if available, otherwise fall back to sed
  if command -v jq >/dev/null 2>&1; then
    echo "🔧 Using jq to update app.json..."
    # Create a temporary file with the modified JSON
    jq '.expo.jsEngine = "jsc" | .expo.newArchEnabled = false' "$APP_ROOT/app.json" > "$APP_ROOT/app.json.tmp"
    mv "$APP_ROOT/app.json.tmp" "$APP_ROOT/app.json"
  else
    echo "🔧 Using sed to update app.json..."
    # Direct sed replacements
    sed -i.bak 's/"jsEngine": "hermes"/"jsEngine": "jsc"/g' "$APP_ROOT/app.json"
    
    # Add newArchEnabled: false if it doesn't exist
    if ! grep -q '"newArchEnabled":' "$APP_ROOT/app.json"; then
      sed -i.bak 's/"version": "[^"]*"/"version": "&",\n    "newArchEnabled": false/g' "$APP_ROOT/app.json"
    fi
    
    rm -f "$APP_ROOT/app.json.bak"
  fi
  echo "✅ Updated app.json configuration"
fi

echo "✅ Pre-install hook completed successfully"