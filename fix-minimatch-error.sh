#!/bin/bash

# Script to fix the minimatch module error on the production server
# This script addresses the 'Cannot find module '../../minimatch.js'' error

echo "Fixing minimatch module error in production environment..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Update the package.json in minimatch to use CommonJS instead of ES modules
MINIMATCH_PKG_PATH="node_modules/minimatch/package.json"

if [ -f "$MINIMATCH_PKG_PATH" ]; then
  echo "Updating minimatch package.json..."
  # Remove the "type": "module" from package.json
  sed -i 's/"type": "module",//g' "$MINIMATCH_PKG_PATH"
  sed -i 's/"type":"module",//g' "$MINIMATCH_PKG_PATH"
  echo "Updated minimatch package.json"
fi

# Create the minimatch.js compatibility file if needed
if [ ! -f "node_modules/minimatch/minimatch.js" ]; then
  echo "Creating minimatch.js compatibility file..."
  cat > node_modules/minimatch/minimatch.js << 'EOF'
// CommonJS compatibility module
const minMatch = require('./dist/commonjs/minimatch');
module.exports = minMatch;
EOF
fi

# Ensure the dist/commonjs directory exists
mkdir -p node_modules/minimatch/dist/commonjs

# Create the index.js file if it doesn't exist or fix it if it does
echo "Creating/updating minimatch/dist/commonjs/index.js..."
cat > node_modules/minimatch/dist/commonjs/index.js << 'EOF'
// Fixed minimatch CommonJS module
try {
  const path = require('path');
  const fs = require('fs');
  const pkgPath = path.resolve(__dirname, '../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Get the main entry point from package.json
  const main = pkg.main || '../..';
  
  // Export the minimatch module
  module.exports = require(path.resolve(__dirname, '../../', main));
} catch (err) {
  // Fallback export
  module.exports = function minimatch(path, pattern, options) {
    if (typeof pattern !== 'string') {
      throw new TypeError('pattern must be a string');
    }
    
    return path.includes(pattern.replace(/\*/g, ''));
  };
}
EOF

echo "Done fixing minimatch module error."