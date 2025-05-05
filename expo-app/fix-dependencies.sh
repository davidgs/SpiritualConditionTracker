#!/bin/bash

# Make script exit on error
set -e

echo "⚙️ Fixing dependencies before build..."

# Navigate to the project directory
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Add explicit minimatch dependency if not already present
if ! grep -q '"minimatch":' package.json; then
  echo "➕ Adding minimatch dependency..."
  npm install minimatch@^9.0.3 --save
fi

# Fix specific module resolution issues
echo "🔧 Fixing module resolution issues..."

# Create node_modules directory if it doesn't exist
mkdir -p node_modules/minimatch/dist/commonjs

# Check if minimatch needs fixing
if [ ! -f node_modules/minimatch/dist/commonjs/index.js ]; then
  echo "🔍 Fixing minimatch module structure..."
  # Fix minimatch structure
  if [ -f node_modules/minimatch/minimatch.js ]; then
    # Option 1: Create directories and copy file
    mkdir -p node_modules/minimatch/dist/commonjs
    cp node_modules/minimatch/minimatch.js node_modules/minimatch/dist/commonjs/index.js
  else
    # Option 2: Reinstall minimatch specifically
    npm uninstall minimatch
    npm install minimatch@^9.0.3 --save
    # Then create the structure if it still doesn't exist
    if [ ! -f node_modules/minimatch/dist/commonjs/index.js ]; then
      mkdir -p node_modules/minimatch/dist/commonjs
      # Create a simple JS file that re-exports the correct module
      echo "module.exports = require('../../minimatch.js');" > node_modules/minimatch/dist/commonjs/index.js
    fi
  fi
fi

# Clear metro cache
echo "🧹 Clearing Metro bundler cache..."
rm -rf node_modules/.cache

echo "✅ Dependencies fixed successfully!"