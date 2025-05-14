#!/bin/bash

# This script runs after EAS build installs dependencies
# It addresses module resolution issues with minimatch

# Exit on error
set -e

echo "🔧 EAS Build Post-install Hook Running..."

# Fix minimatch module structure
echo "🔍 Checking minimatch module structure..."

# Create directory structure if it doesn't exist
mkdir -p node_modules/minimatch/dist/commonjs

# Check if minimatch index.js is missing from the expected location
if [ ! -f node_modules/minimatch/dist/commonjs/index.js ]; then
  echo "🔍 Fixing minimatch module structure..."
  
  # Option 1: Check if minimatch.js exists at the root level
  if [ -f node_modules/minimatch/minimatch.js ]; then
    echo "📂 Copying minimatch.js to dist/commonjs/index.js"
    cp node_modules/minimatch/minimatch.js node_modules/minimatch/dist/commonjs/index.js
  else
    # Option 2: Create a re-export file
    echo "📝 Creating re-export minimatch module"
    echo "module.exports = require('../../minimatch.js');" > node_modules/minimatch/dist/commonjs/index.js
  fi
fi

# Verify the fix
if [ -f node_modules/minimatch/dist/commonjs/index.js ]; then
  echo "✅ minimatch module structure fixed successfully"
else
  echo "❌ Failed to fix minimatch module structure"
  exit 1
fi

# Clean Metro cache
if [ -d node_modules/.cache ]; then
  echo "🧹 Cleaning Metro cache..."
  rm -rf node_modules/.cache
fi

echo "✅ Post-install hook completed successfully"