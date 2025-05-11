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

echo "✅ C++ compatibility fixes applied"
echo "✅ Pre-install hook completed successfully"