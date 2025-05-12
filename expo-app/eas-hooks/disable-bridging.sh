#!/bin/bash
set -e

echo "🔧 Running disable-bridging.sh post-install hook..."

# Make sure we're in the right directory
cd "$(dirname "$0")/.."
APP_ROOT=$(pwd)

echo "📂 Current directory: $APP_ROOT"

# Create an empty placeholder for problematic header files
echo "🔧 Creating empty placeholder headers for React bridging..."
REACT_BRIDGING_DIR="$APP_ROOT/node_modules/react-native/ReactCommon/react/bridging"
mkdir -p "$REACT_BRIDGING_DIR"

# Create empty placeholder header files
echo "// Empty placeholder to prevent build errors" > "$REACT_BRIDGING_DIR/CallbackWrapper.h"
echo "// Empty placeholder to prevent build errors" > "$REACT_BRIDGING_DIR/LongLivedObject.h"
echo "// Empty placeholder to prevent build errors" > "$REACT_BRIDGING_DIR/AnyBinding.h"
echo "// Empty placeholder to prevent build errors" > "$REACT_BRIDGING_DIR/Function.h"

# Also create the debug directory and placeholder
REACT_DEBUG_DIR="$APP_ROOT/node_modules/react-native/ReactCommon/react/debug"
mkdir -p "$REACT_DEBUG_DIR"
echo "// Empty placeholder to prevent build errors" > "$REACT_DEBUG_DIR/react_native_assert.h"

echo "✅ Created empty placeholder header files"

# Also patch TurboModuleUtils.h to resolve bridging errors
TURBO_MODULE_HEADER_PATH="$APP_ROOT/node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleUtils.h"
if [ -f "$TURBO_MODULE_HEADER_PATH" ]; then
  echo "🔧 Patching TurboModuleUtils.h to remove bridging dependencies..."
  
  # Create a backup
  cp "$TURBO_MODULE_HEADER_PATH" "${TURBO_MODULE_HEADER_PATH}.bak"
  
  # Comment out the include for CallbackWrapper.h
  sed -i.bak 's/#include <react\/bridging\/CallbackWrapper.h>/\/\/ #include <react\/bridging\/CallbackWrapper.h>/g' "$TURBO_MODULE_HEADER_PATH"
  
  # Comment out the include for LongLivedObject.h
  sed -i.bak 's/#include <react\/bridging\/LongLivedObject.h>/\/\/ #include <react\/bridging\/LongLivedObject.h>/g' "$TURBO_MODULE_HEADER_PATH"
  
  # Remove backup files
  rm -f "${TURBO_MODULE_HEADER_PATH}.bak"
  
  echo "✅ Patched TurboModuleUtils.h"
fi

echo "✅ Post-install hook completed successfully"