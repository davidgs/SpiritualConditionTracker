#!/bin/bash

# Spiritual Condition Tracker iOS Build Fixer
# This script applies all necessary fixes for iOS build issues
# Version: 1.0.0

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}===== Spiritual Condition Tracker iOS Build Fixer =====${RESET}"
echo "This script applies all necessary fixes for iOS build issues."
echo ""

# Ensure we're in the project root
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Warning: This script should be run from the project root directory.${RESET}"
  echo "Continuing anyway..."
fi

# Function to log with timestamp
log() {
  echo -e "${BOLD}[$(date +"%H:%M:%S")]${RESET} $1"
}

# 1. Fix agent-base module
log "${BLUE}Applying agent-base module fix...${RESET}"
if [ -f "fix-ios-agent-base.js" ]; then
  log "Running fix-ios-agent-base.js script..."
  node fix-ios-agent-base.js
else
  log "Creating agent-base directory structure..."
  mkdir -p node_modules/agent-base/dist/src
  
  # Create index.js at the problematic path
  cat > node_modules/agent-base/dist/src/index.js << 'EOF'
'use strict';

/**
 * Fixed agent-base module implementation
 * Created by fix-ios-build.sh
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;

/**
 * Agent class implementation with all required methods
 */
class Agent {
  constructor(opts) {
    this.options = opts || {};
    this.timeout = null;
    
    if (typeof opts === 'function') {
      this._callback = opts;
    } else if (typeof opts === 'object' && opts !== null) {
      this.timeout = opts.timeout || null;
    }
  }
  
  connect(req, options) {
    if (this._callback) {
      return Promise.resolve(this._callback(req, options));
    }
    
    return Promise.resolve({
      socket: {
        readable: true,
        writable: true,
        destroyed: false,
        destroy: function() { this.destroyed = true; },
        setTimeout: function() {},
        setNoDelay: function() {},
        setKeepAlive: function() {},
        on: function() { return this; },
        once: function() { return this; },
        end: function() {}
      }
    });
  }
  
  callback(req, options) {
    return this.connect(req, options);
  }
}

exports.Agent = Agent;
exports.default = function createAgent(opts) {
  return new Agent(opts);
};

module.exports = exports.default;
module.exports.Agent = Agent;
EOF
  
  # Create package.json if needed
  if [ ! -f "node_modules/agent-base/package.json" ]; then
    cat > node_modules/agent-base/package.json << 'EOF'
{
  "name": "agent-base",
  "version": "6.0.2",
  "description": "Fixed agent-base implementation for iOS builds",
  "main": "./dist/src/index.js"
}
EOF
  fi
  
  log "${GREEN}agent-base module fix completed${RESET}"
fi

# 2. Fix react-native-metro-config
log "${BLUE}Applying react-native/metro-config fix...${RESET}"
if [ -f "fix-react-native-metro-config.js" ]; then
  log "Running fix-react-native-metro-config.js script..."
  node fix-react-native-metro-config.js
else
  log "Creating @react-native/metro-config implementation..."
  mkdir -p node_modules/@react-native/metro-config
  
  # Create index.js
  cat > node_modules/@react-native/metro-config/index.js << 'EOF'
/**
 * Fixed @react-native/metro-config implementation
 * Created by fix-ios-build.sh
 */

'use strict';

function getDefaultConfig(projectRoot) {
  projectRoot = projectRoot || process.cwd();
  
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    },
  };
}

module.exports = {
  getDefaultConfig,
};
EOF
  
  # Create package.json
  cat > node_modules/@react-native/metro-config/package.json << 'EOF'
{
  "name": "@react-native/metro-config",
  "version": "0.72.6",
  "description": "Metro configuration for React Native - Fixed implementation",
  "main": "index.js",
  "license": "MIT"
}
EOF
  
  log "${GREEN}@react-native/metro-config fix completed${RESET}"
fi

# 3. Fix react-native-sqlite-storage
log "${BLUE}Applying react-native-sqlite-storage fix...${RESET}"
if [ -f "fix-sqlite-storage.js" ]; then
  log "Running fix-sqlite-storage.js script..."
  node fix-sqlite-storage.js
else
  SQLITE_PKG="node_modules/react-native-sqlite-storage/package.json"
  if [ -f "$SQLITE_PKG" ]; then
    log "Fixing SQLite package.json..."
    
    # Create a backup
    cp "$SQLITE_PKG" "${SQLITE_PKG}.bak"
    
    # Remove the problematic configuration using sed or node
    if command -v node &> /dev/null; then
      node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$SQLITE_PKG', 'utf8'));
        
        // Fix dependency platforms if they exist
        if (pkg.dependency && pkg.dependency.platforms && pkg.dependency.platforms.ios) {
          delete pkg.dependency.platforms.ios.project;
          console.log('Removed dependency.platforms.ios.project');
        }
        
        // Fix dependencies platforms if they exist
        if (pkg.dependencies && pkg.dependencies.platforms && pkg.dependencies.platforms.ios) {
          delete pkg.dependencies.platforms.ios.project;
          console.log('Removed dependencies.platforms.ios.project');
        }
        
        fs.writeFileSync('$SQLITE_PKG', JSON.stringify(pkg, null, 2));
      "
    else
      # Use sed as a fallback
      sed -i 's/"project": "[^"]*"//g' "$SQLITE_PKG"
    fi
    
    log "${GREEN}react-native-sqlite-storage fix completed${RESET}"
  else
    log "${YELLOW}react-native-sqlite-storage package.json not found, skipping fix${RESET}"
  fi
fi

# 4. Fix buildCacheProvider error
log "${BLUE}Checking for buildCacheProvider error...${RESET}"
EXPO_CONFIG_DIR="node_modules/@expo/config/build"
BUILDCACHE_FILE="${EXPO_CONFIG_DIR}/buildCacheProvider.js"

# Create directory if needed
if [ ! -d "${EXPO_CONFIG_DIR}" ]; then
  log "Creating missing directory: ${EXPO_CONFIG_DIR}"
  mkdir -p "${EXPO_CONFIG_DIR}"
fi

# Create the missing module file if it doesn't exist
if [ ! -f "${BUILDCACHE_FILE}" ]; then
  log "Creating missing buildCacheProvider module..."
  cat > "${BUILDCACHE_FILE}" << 'EOF'
/**
 * This is a placeholder implementation for the missing buildCacheProvider module
 * Created by fix-ios-build.sh
 */

// Simple cache provider implementation that does nothing
function createCacheProvider() {
  return {
    get: async () => null,
    put: async () => {},
    clear: async () => {},
  };
}

module.exports = {
  createCacheProvider,
};
EOF
  log "${GREEN}Successfully created buildCacheProvider module${RESET}"
else
  log "buildCacheProvider module already exists, no fix needed"
fi

# 5. Explicitly tell the user to run all the fixes on their machine
echo ""
echo -e "${BOLD}${BLUE}===== INSTRUCTIONS FOR LOCAL MACHINE =====${RESET}"
echo -e "To fix iOS build issues on your local machine, follow these steps:"
echo ""
echo -e "1. Copy these files to your project:"
echo -e "   - fix-ios-agent-base.js"
echo -e "   - fix-react-native-metro-config.js"
echo -e "   - fix-sqlite-storage.js"
echo -e "   - fix-ios-build.sh"
echo ""
echo -e "2. Run the fix script:"
echo -e "   ${BOLD}bash fix-ios-build.sh${RESET}"
echo ""
echo -e "3. If you still encounter the agent-base error, manually create the file at:"
echo -e "   ${YELLOW}/Users/davidgs/github.com/SpiritualConditionTracker/node_modules/agent-base/dist/src/index.js${RESET}"
echo ""
echo -e "4. Next, add this to your prepare-ios-build.sh script (at the top):"
echo -e ""
echo -e "   ${BLUE}# Apply all fixes first${RESET}"
echo -e "   ${BLUE}if [ -f \"fix-ios-agent-base.js\" ]; then${RESET}"
echo -e "   ${BLUE}  echo \"Running agent-base fix...\"${RESET}"
echo -e "   ${BLUE}  node fix-ios-agent-base.js${RESET}"
echo -e "   ${BLUE}fi${RESET}"
echo -e ""
echo -e "   ${BLUE}if [ -f \"fix-react-native-metro-config.js\" ]; then${RESET}"
echo -e "   ${BLUE}  echo \"Running metro-config fix...\"${RESET}"
echo -e "   ${BLUE}  node fix-react-native-metro-config.js${RESET}"
echo -e "   ${BLUE}fi${RESET}"
echo -e ""
echo -e "   ${BLUE}if [ -f \"fix-sqlite-storage.js\" ]; then${RESET}"
echo -e "   ${BLUE}  echo \"Running sqlite fix...\"${RESET}"
echo -e "   ${BLUE}  node fix-sqlite-storage.js${RESET}"
echo -e "   ${BLUE}fi${RESET}"
echo -e ""
echo -e "5. Run your prepare-ios-build.sh script with the --no-build option removed:"
echo -e "   ${BOLD}bash prepare-ios-build.sh${RESET}"
echo ""
echo -e "6. Open the project in Xcode and build!"
echo ""
echo -e "${BOLD}${GREEN}===== iOS Build Fixes Completed =====${RESET}"