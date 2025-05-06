#!/bin/bash

# Make script exit on error
set -e

echo "⚙️ Downgrading React to version 18.2.0 to resolve compatibility issues..."

# Navigate to the project directory
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

# Check if React version is 19
react_version=$(node -e "try { console.log(require('./package.json').dependencies.react); } catch(e) { console.log(''); }")

if [[ $react_version == *"19."* ]]; then
  echo "📦 Current React version: $react_version"
  echo "🔄 Downgrading to React 18.2.0..."
  
  # Uninstall current React
  npm uninstall react
  
  # Install React 18.2.0
  npm install react@18.2.0 --save
  
  # Reinstall react-dom to match
  if grep -q '"react-dom":' package.json; then
    npm uninstall react-dom
    npm install react-dom@18.2.0 --save
  fi
  
  # Clear metro cache
  echo "🧹 Clearing Metro bundler cache..."
  rm -rf node_modules/.cache
  
  echo "✅ React successfully downgraded to 18.2.0"
else
  echo "ℹ️ React is already at a compatible version: $react_version"
  echo "✅ No downgrade necessary"
fi

echo "ℹ️ You may need to restart your application to apply the changes."