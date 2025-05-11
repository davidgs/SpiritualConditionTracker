#!/bin/bash
set -e

echo "🔧 Starting EAS Build Pre-install Hook..."

# Make sure we're in the right directory
cd "$(dirname "$0")/.."
APP_ROOT=$(pwd)

echo "📂 Current directory: $APP_ROOT"

# Check if ios/Podfile exists
if [ -f "./ios/Podfile" ]; then
  echo "📄 Found Podfile in ios directory"
  
  # Ensure the directory exists in the EAS build environment
  if [ ! -d "$HOME/workingdir/build/ios" ]; then
    echo "📂 Creating ios directory in EAS build environment"
    mkdir -p "$HOME/workingdir/build/ios"
  fi
  
  # Copy our working Podfile to the EAS build environment
  echo "📋 Copying our working Podfile to EAS build environment"
  cp "./ios/Podfile" "$HOME/workingdir/build/ios/Podfile"
  
  echo "✅ Podfile copied successfully"
else
  echo "❌ Podfile not found in ios directory"
  echo "Please make sure the Podfile exists at ./ios/Podfile"
  exit 1
fi

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

echo "✅ C++ compatibility fixes applied"
echo "✅ Pre-install hook completed successfully"