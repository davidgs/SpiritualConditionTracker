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

echo "✅ Pre-install hook completed successfully"