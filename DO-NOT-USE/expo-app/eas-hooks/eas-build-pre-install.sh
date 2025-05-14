#!/bin/bash

# This script runs before EAS build installs dependencies
# It is set up in eas.json to address dependency resolution issues

# Exit on error
set -e

echo "🔧 EAS Build Pre-install Hook Running..."

# Create directories for hooks and scripts if they don't exist
mkdir -p eas-hooks

# Modify package.json to ensure dependencies are compatible
echo "📦 Checking package.json for compatibility issues..."

# Make sure React is version 18.2.0
if grep -q '"react": "19' package.json; then
  echo "⚠️ Found React 19 - downgrading to React 18.2.0 for compatibility"
  # Use sed to replace React version - this works on both macOS and Linux
  sed -i.bak 's/"react": "19.[0-9.]*"/"react": "18.2.0"/g' package.json
  sed -i.bak 's/"react-dom": "19.[0-9.]*"/"react-dom": "18.2.0"/g' package.json
  rm -f package.json.bak
fi

# Check for minimatch - add if missing
if ! grep -q '"minimatch":' package.json; then
  echo "➕ Adding minimatch dependency..."
  # Use node to add minimatch to package.json
  node -e "
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies.minimatch = '^9.0.3';
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  "
fi

# Print the modified package.json
echo "📄 Modified package.json:"
cat package.json

echo "✅ Pre-install hook completed successfully"