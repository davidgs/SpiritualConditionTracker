#!/bin/bash

# Script to fix the minimatch module error

echo "Fixing minimatch module error..."

# Install minimatch directly
npm install minimatch@^5.1.0

# Create the directory structure if it doesn't exist
mkdir -p node_modules/minimatch/dist/commonjs

# Check if the dist/commonjs directory exists in minimatch
if [ ! -d "node_modules/minimatch/dist/commonjs" ]; then
  echo "Creating the minimatch/dist/commonjs directory..."
  mkdir -p node_modules/minimatch/dist/commonjs
  
  # Create a simple index.js file if none exists
  if [ ! -f "node_modules/minimatch/dist/commonjs/index.js" ]; then
    echo "Creating a simple index.js file..."
    cat > node_modules/minimatch/dist/commonjs/index.js << 'EOF'
// Simple minimatch shim
module.exports = require('../../minimatch.js');
EOF
  fi
fi

echo "Done fixing module error."