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

# Set environment variables to force old architecture with more aggressive settings
export RCT_NEW_ARCH_ENABLED=0
export USE_HERMES=0
export USE_FABRICCXX=0
export USE_BRIDGELESS=0 
export USE_FRAMEWORKS=static
export FABRIC_ENABLED=0
export NEW_ARCH_ENABLED=0
export EXPO_DISABLE_MERCURY=1
export EXPO_USE_FLIPPER=0

# Disable bridging and codegen
export BRIDGING_CPP_ENABLED=0
export CODEGEN_DISABLE_ALL=1
export JS_RUNTIME_HERMES_ENABLED=0
export USE_REACT_FABRIC=0
export DISABLE_CODEGEN=1
export REACT_FABRIC_ENABLED=0

echo "✅ Set environment variables to disable new architecture features"

# Create needed build directory
mkdir -p "$APP_ROOT/build/generated/ios"

echo "✅ Created build directory"

# Update app.json to disable New Architecture features
if [ -f "$APP_ROOT/app.json" ]; then
  echo "🔧 Updating app.json for old architecture only..."

  # Use jq if available, otherwise use sed
  if command -v jq >/dev/null 2>&1; then
    jq '.expo.jsEngine = "jsc" | .expo.newArchEnabled = false' "$APP_ROOT/app.json" > "$APP_ROOT/app.json.tmp"
    mv "$APP_ROOT/app.json.tmp" "$APP_ROOT/app.json"
  else
    # Replace Hermes with JSC
    sed -i.bak 's/"jsEngine": "hermes"/"jsEngine": "jsc"/g' "$APP_ROOT/app.json"
    
    # Set newArchEnabled to false
    if grep -q '"newArchEnabled":' "$APP_ROOT/app.json"; then
      sed -i.bak 's/"newArchEnabled": true/"newArchEnabled": false/g' "$APP_ROOT/app.json"
    else
      sed -i.bak 's/"version": "[^"]*"/"version": "&",\n    "newArchEnabled": false/g' "$APP_ROOT/app.json"
    fi
    
    rm -f "$APP_ROOT/app.json.bak"
  fi
  echo "✅ Updated app.json configuration"
fi

# Create patch for TurboModuleUtils.cpp to resolve bridging errors
TURBO_MODULE_PATH="$APP_ROOT/node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleUtils.cpp"
if [ -f "$TURBO_MODULE_PATH" ]; then
  echo "🔧 Patching TurboModuleUtils.cpp to remove bridging dependencies..."
  
  # Create a backup
  cp "$TURBO_MODULE_PATH" "${TURBO_MODULE_PATH}.bak"
  
  # Comment out the include for CallbackWrapper.h
  sed -i.bak 's/#include <react\/bridging\/CallbackWrapper.h>/\/\/ #include <react\/bridging\/CallbackWrapper.h>/g' "$TURBO_MODULE_PATH"
  
  # Comment out the include for LongLivedObject.h
  sed -i.bak 's/#include <react\/bridging\/LongLivedObject.h>/\/\/ #include <react\/bridging\/LongLivedObject.h>/g' "$TURBO_MODULE_PATH"
  
  # Remove backup files
  rm -f "${TURBO_MODULE_PATH}.bak"
  
  echo "✅ Patched TurboModuleUtils.cpp"
fi

# Also patch TurboModuleBinding.cpp
TURBO_BINDING_PATH="$APP_ROOT/node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp"
if [ -f "$TURBO_BINDING_PATH" ]; then
  echo "🔧 Patching TurboModuleBinding.cpp to remove bridging dependencies..."
  
  # Create a backup
  cp "$TURBO_BINDING_PATH" "${TURBO_BINDING_PATH}.bak"
  
  # Comment out the include for LongLivedObject.h
  sed -i.bak 's/#include <react\/bridging\/LongLivedObject.h>/\/\/ #include <react\/bridging\/LongLivedObject.h>/g' "$TURBO_BINDING_PATH"
  
  # Remove backup files
  rm -f "${TURBO_BINDING_PATH}.bak"
  
  echo "✅ Patched TurboModuleBinding.cpp"
fi

echo "✅ Pre-install hook completed successfully"