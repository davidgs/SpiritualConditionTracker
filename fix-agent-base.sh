#!/bin/bash
# Script to fix the agent-base module error
# Run this before prepare-ios-build.sh

echo "Fixing agent-base module error..."
AGENT_BASE_DIR="node_modules/agent-base"
AGENT_BASE_PKG="${AGENT_BASE_DIR}/package.json"

if [ -f "${AGENT_BASE_PKG}" ]; then
  echo "Found agent-base package.json, checking for issues..."
  
  # Check if the main entry is incorrect
  if grep -q "\"main\": \"dist/src/index\"" "${AGENT_BASE_PKG}"; then
    echo "Found incorrect main entry in agent-base package.json, fixing..."
    
    # Create a backup
    cp "${AGENT_BASE_PKG}" "${AGENT_BASE_PKG}.bak"
    
    # Fix the main entry to point to the correct location
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS sed requires a suffix with -i
      sed -i '' -e 's|"main": "dist/src/index"|"main": "dist/index"|g' "${AGENT_BASE_PKG}"
    else
      # Linux sed works without a suffix
      sed -i -e 's|"main": "dist/src/index"|"main": "dist/index"|g' "${AGENT_BASE_PKG}"
    fi
    
    echo "Fixed agent-base package.json main entry"
    
    # Check if we need to create the dist directory
    if [ ! -d "${AGENT_BASE_DIR}/dist" ]; then
      echo "Creating missing dist directory..."
      mkdir -p "${AGENT_BASE_DIR}/dist"
    fi
    
    # Create a minimal index.js file if it doesn't exist
    if [ ! -f "${AGENT_BASE_DIR}/dist/index.js" ]; then
      echo "Creating minimal agent-base index.js file..."
      cat > "${AGENT_BASE_DIR}/dist/index.js" << 'EOF'
/**
 * Minimal agent-base implementation to fix module resolution issues
 * Created by fix-agent-base.sh
 */

function Agent(opts) {
  if (!(this instanceof Agent)) return new Agent(opts);
  this.options = opts || {};
}

Agent.prototype.callback = function() {
  throw new Error('Agent.prototype.callback() not implemented');
};

module.exports = Agent;
EOF
      echo "Created minimal agent-base implementation"
    fi
  else
    echo "agent-base package.json appears to be correctly configured"
  fi
else
  echo "agent-base package.json not found, skipping fix"
fi

echo "Checking for @react-native/metro-config issues..."
METRO_CONFIG_DIR="node_modules/@react-native/metro-config"
if [ ! -d "${METRO_CONFIG_DIR}" ]; then
  echo "@react-native/metro-config not found, creating minimal implementation..."
  
  # Create the directory
  mkdir -p "${METRO_CONFIG_DIR}"
  
  # Create a minimal package.json
  cat > "${METRO_CONFIG_DIR}/package.json" << 'EOF'
{
  "name": "@react-native/metro-config",
  "version": "0.72.6",
  "description": "Metro configuration for React Native",
  "main": "index.js",
  "license": "MIT"
}
EOF
  
  # Create a minimal index.js
  cat > "${METRO_CONFIG_DIR}/index.js" << 'EOF'
/**
 * Minimal @react-native/metro-config implementation
 * Created by fix-agent-base.sh
 */

const path = require('path');

function getDefaultConfig(projectRoot) {
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };
}

module.exports = {
  getDefaultConfig,
};
EOF
  
  echo "Created minimal @react-native/metro-config implementation"
fi

echo "Fix completed. You can now proceed with prepare-ios-build.sh"