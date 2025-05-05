#!/bin/bash

# Script to fix module errors for production deployment
# This fixes both minimatch and agent-base modules

echo "Fixing module errors..."

# Install problematic packages
echo "Installing required packages..."
npm install minimatch@^5.1.0 agent-base@^6.0.2

# Fix for minimatch module
echo "Fixing minimatch module..."
mkdir -p node_modules/minimatch/dist/commonjs

# Create minimatch index.js if needed
if [ ! -f "node_modules/minimatch/dist/commonjs/index.js" ]; then
  echo "Creating minimatch compatibility file..."
  cat > node_modules/minimatch/dist/commonjs/index.js << 'EOF'
// Simple minimatch shim
module.exports = require('../../minimatch.js');
EOF
fi

# Fix for agent-base module
echo "Fixing agent-base module..."
mkdir -p node_modules/agent-base/dist

# Create agent-base index.js if needed
if [ ! -f "node_modules/agent-base/dist/index.js" ]; then
  echo "Creating agent-base compatibility file..."
  cat > node_modules/agent-base/dist/index.js << 'EOF'
"use strict";
// Simple agent-base shim
module.exports = require('../src/index');
EOF
fi

echo "Done fixing module errors."