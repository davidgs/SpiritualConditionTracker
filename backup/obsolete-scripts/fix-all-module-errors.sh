#!/bin/bash

# Script to fix multiple module errors in one go

echo "Fixing module errors for production deployment..."

# Install or reinstall problematic packages
echo "Reinstalling problematic packages..."
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
// Simple agent-base shim that points to the main file
module.exports = require('../src/index');
EOF
fi

# Additional check for agent-base src directory
if [ ! -d "node_modules/agent-base/src" ]; then
  echo "Creating agent-base src directory..."
  mkdir -p node_modules/agent-base/src
  
  # Create a basic implementation if src/index.js is missing
  if [ ! -f "node_modules/agent-base/src/index.js" ]; then
    echo "Creating basic agent-base implementation..."
    cat > node_modules/agent-base/src/index.js << 'EOF'
"use strict";
function Agent(options) {
  if (!(this instanceof Agent)) {
    return new Agent(options);
  }
  this.defaultPort = 443;
  this.protocol = 'https:';
  this.options = options || {};
}

Agent.prototype.callback = function() {
  console.warn('agent-base shim is being used - limited functionality');
  throw new Error('This is a compatibility shim for agent-base');
};

module.exports = Agent;
EOF
  fi
fi

echo "Done fixing module errors."