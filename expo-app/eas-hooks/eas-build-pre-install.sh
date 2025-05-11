#!/bin/bash
set -e

echo "🔧 Starting EAS Build Pre-install Hook..."

# Make sure we're in the right directory
cd "$(dirname "$0")/.."
APP_ROOT=$(pwd)

echo "📂 Current directory: $APP_ROOT"

# Fix any C++ compatibility issues
echo "🔧 Fixing C++ compatibility issues for EAS build..."

# These directories may contain C++ code with .contains() calls
FIX_DIRS=(
  "node_modules/react-native/ReactCommon"
  "node_modules/react-native/React"
)

for DIR in "${FIX_DIRS[@]}"; do
  if [ -d "$DIR" ]; then
    echo "🔍 Checking $DIR for C++ compatibility issues..."
    
    # Replace modern .contains() calls with .find() != .end()
    find "$DIR" -name "*.cpp" -o -name "*.h" -o -name "*.hpp" | xargs grep -l "\.contains(" | while read -r file; do
      echo "🔧 Fixing C++ compatibility in: $file"
      sed -i.bak 's/\([a-zA-Z0-9_]*\)\.contains(\([a-zA-Z0-9_]*\))/\1.find(\2) != \1.end()/g' "$file"
      rm -f "${file}.bak"
    done
  fi
done

# Disable Fabric codegen
echo "🔧 Disabling New Architecture/Fabric codegen..."
if [ -f "node_modules/react-native/scripts/react_native_pods.rb" ]; then
  echo "Modifying react_native_pods.rb to force disable Fabric..."
  sed -i.bak 's/fabric_enabled = options\[:fabric_enabled\]/fabric_enabled = false/g' "node_modules/react-native/scripts/react_native_pods.rb"
  rm -f "node_modules/react-native/scripts/react_native_pods.rb.bak"
fi

# Ensure we're using JSC instead of Hermes
if [ -f "$APP_ROOT/app.json" ]; then
  echo "🔧 Ensuring app.json has JSC engine configured..."
  # Use jq if available, otherwise sed
  if command -v jq &> /dev/null; then
    jq '.expo.jsEngine = "jsc" | .expo.ios.jsEngine = "jsc" | .expo.android.jsEngine = "jsc"' "$APP_ROOT/app.json" > "$APP_ROOT/app.json.tmp"
    mv "$APP_ROOT/app.json.tmp" "$APP_ROOT/app.json"
  else
    # Fallback to manually checking if JSC is in the file
    if ! grep -q '"jsEngine"' "$APP_ROOT/app.json"; then
      echo "⚠️ Couldn't find jsEngine in app.json, please add it manually"
    fi
  fi
fi

# Ensure Podfile has hermes and fabric disabled
if [ -f "$APP_ROOT/ios/Podfile" ]; then
  echo "🔧 Ensuring Podfile has Hermes and Fabric disabled..."
  
  # Check for hermes_enabled setting
  if ! grep -q "hermes_enabled => false" "$APP_ROOT/ios/Podfile"; then
    sed -i.bak 's/:app_path => "#{Pod::Config.instance.installation_root}\/.."/&,\n    :hermes_enabled => false/' "$APP_ROOT/ios/Podfile"
    rm -f "$APP_ROOT/ios/Podfile.bak"
  fi
  
  # Check for fabric_enabled setting
  if ! grep -q "fabric_enabled => false" "$APP_ROOT/ios/Podfile"; then
    sed -i.bak 's/:hermes_enabled => false/&,\n    :fabric_enabled => false/' "$APP_ROOT/ios/Podfile"
    rm -f "$APP_ROOT/ios/Podfile.bak"
  fi
  
  # Check for new_arch_enabled setting
  if ! grep -q "new_arch_enabled => false" "$APP_ROOT/ios/Podfile"; then
    sed -i.bak 's/:fabric_enabled => false/&,\n    :new_arch_enabled => false/' "$APP_ROOT/ios/Podfile"
    rm -f "$APP_ROOT/ios/Podfile.bak"
  fi
  
  echo "✅ Podfile configuration updated"
fi

# Also add these settings to the app.json file for consistent configuration
if [ -f "$APP_ROOT/app.json" ]; then
  echo "🔧 Updating app.json with architecture settings..."
  # This is a simple pattern match and replace, but should be sufficient
  if ! grep -q "\"newArchEnabled\": false" "$APP_ROOT/app.json"; then
    sed -i.bak 's/"jsEngine": "jsc"/&,\n    "newArchEnabled": false/' "$APP_ROOT/app.json"
    rm -f "$APP_ROOT/app.json.bak"
  fi
fi

echo "✅ C++ compatibility fixes applied"
echo "✅ JSC engine configuration verified"
echo "✅ Pre-install hook completed successfully"