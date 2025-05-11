#!/bin/bash
set -e

echo "🔧 Starting local iOS build fix script..."
echo "This script will patch React Native source files and run the build locally"

# Get the app root directory
APP_ROOT=$(pwd)
echo "📂 Working in: $APP_ROOT"

# Set environment variables to force old architecture
export RCT_NEW_ARCH_ENABLED=0
export USE_HERMES=0
export USE_BRIDGELESS=0
export USE_FRAMEWORKS=static
export FABRIC_ENABLED=0
export NEW_ARCH_ENABLED=0
export CODEGEN_DISABLE_ALL=1
export DISABLE_CODEGEN=1
export BRIDGING_CPP_ENABLED=0
export REACT_FABRIC_ENABLED=0

echo "✅ Set environment variables to disable new architecture features"

# Create patch for TurboModuleUtils.cpp to resolve bridging errors
TURBO_MODULE_PATH="$APP_ROOT/node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleUtils.cpp"
if [ -f "$TURBO_MODULE_PATH" ]; then
  echo "🔧 Patching TurboModuleUtils.cpp to remove bridging dependencies..."
  
  # Create a backup
  cp "$TURBO_MODULE_PATH" "${TURBO_MODULE_PATH}.bak"
  
  # Comment out the include for CallbackWrapper.h
  sed -i'.bak' 's/#include <react\/bridging\/CallbackWrapper.h>/\/\/ #include <react\/bridging\/CallbackWrapper.h>/g' "$TURBO_MODULE_PATH"
  
  # Comment out the include for LongLivedObject.h
  sed -i'.bak' 's/#include <react\/bridging\/LongLivedObject.h>/\/\/ #include <react\/bridging\/LongLivedObject.h>/g' "$TURBO_MODULE_PATH"
  
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
  sed -i'.bak' 's/#include <react\/bridging\/LongLivedObject.h>/\/\/ #include <react\/bridging\/LongLivedObject.h>/g' "$TURBO_BINDING_PATH"
  
  # Remove backup files
  rm -f "${TURBO_BINDING_PATH}.bak"
  
  echo "✅ Patched TurboModuleBinding.cpp"
fi

# Patch app.json
if [ -f "$APP_ROOT/app.json" ]; then
  echo "🔧 Updating app.json for old architecture only..."
  
  # Replace Hermes with JSC
  sed -i'.bak' 's/"jsEngine": "hermes"/"jsEngine": "jsc"/g' "$APP_ROOT/app.json"
  
  # Set newArchEnabled to false
  if grep -q '"newArchEnabled":' "$APP_ROOT/app.json"; then
    sed -i'.bak' 's/"newArchEnabled": true/"newArchEnabled": false/g' "$APP_ROOT/app.json"
  else
    sed -i'.bak' 's/"version": "[^"]*"/"version": "&",\n    "newArchEnabled": false/g' "$APP_ROOT/app.json"
  fi
  
  rm -f "$APP_ROOT/app.json.bak"
  echo "✅ Updated app.json configuration"
fi

# Clean and reinstall the pods
echo "🧹 Cleaning iOS project..."
if [ -d "$APP_ROOT/ios/Pods" ]; then
  rm -rf "$APP_ROOT/ios/Pods"
  rm -f "$APP_ROOT/ios/Podfile.lock"
fi

echo "🔄 Installing pods..."
cd "$APP_ROOT/ios"
pod install

echo "✅ Fix script completed successfully. Now you can run 'npx expo run:ios' to test the build."
echo "💡 If the build fails, check the errors and see if any additional patching is needed."
echo "   You may need to manually modify some source files if you encounter specific errors."