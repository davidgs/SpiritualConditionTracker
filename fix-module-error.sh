#!/bin/bash

# Script to fix module errors for production deployment
# This fixes minimatch, agent-base, and ws modules

echo "Fixing module errors..."

# Install problematic packages
echo "Installing required packages..."
npm install minimatch@^5.1.0 agent-base@^6.0.2 ws@^8.0.0

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

# Fix for ws module limiter issue
echo "Fixing ws module limiter issue..."
mkdir -p node_modules/ws/lib

# Create limiter.js if needed
if [ ! -f "node_modules/ws/lib/limiter.js" ]; then
  echo "Creating ws limiter.js compatibility file..."
  cat > node_modules/ws/lib/limiter.js << 'EOF'
'use strict';

/**
 * Simple implementation for the missing limiter.js module
 */

class Limiter {
  constructor(options) {
    this.concurrency = options && options.concurrency || Infinity;
    this.pending = 0;
    this.jobs = [];
    this.timeout = null;
  }

  add(job) {
    this.jobs.push(job);
    this.process();
  }

  process() {
    if (this.pending === this.concurrency || !this.jobs.length) return;
    
    const job = this.jobs.shift();
    this.pending++;
    
    job(() => {
      this.pending--;
      this.process();
    });
  }
}

module.exports = Limiter;
EOF
fi

echo "Done fixing module errors."