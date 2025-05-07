#!/bin/bash

# Direct module fix script for lru-cache module issues
# This script directly fixes the lru-cache module error by:
# 1. Installing lru-cache explicitly
# 2. Creating the missing index.js file with a basic implementation
# 3. Fixing the package.json file to point to the correct main file

echo "Starting module error fix..."

# Helper functions
log() {
  echo "$(date -u '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create directories if needed
ensure_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    log "Created directory: $1"
  fi
}

# Install lru-cache explicitly
log "Installing lru-cache..."
npm install lru-cache@6.0.0 --save

# Check if the lru-cache module was installed
LRU_CACHE_DIR="node_modules/lru-cache"
if [ ! -d "$LRU_CACHE_DIR" ]; then
  log "ERROR: lru-cache directory not found after installation"
  exit 1
fi

# Create index.js file if it doesn't exist
INDEX_PATH="$LRU_CACHE_DIR/index.js"
if [ ! -f "$INDEX_PATH" ]; then
  log "Creating index.js file for lru-cache..."
  
  cat > "$INDEX_PATH" << 'EOF'
// Simple LRU Cache implementation
class LRUCache {
  constructor(options = {}) {
    this.max = options.max || 500;
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      // Refresh key
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key, value) {
    // Delete if key exists
    if (this.cache.has(key)) this.cache.delete(key);
    
    // Delete oldest if max size reached
    if (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // Add new value
    this.cache.set(key, value);
    return this;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = function lruCache(options) {
  return new LRUCache(options);
};

module.exports.LRUCache = LRUCache;
EOF

  log "Created lru-cache index.js file"
fi

# Fix package.json file
PACKAGE_JSON_PATH="$LRU_CACHE_DIR/package.json"
if [ -f "$PACKAGE_JSON_PATH" ]; then
  log "Fixing package.json main entry..."
  # Use a temporary file for sed replacement
  sed 's/"main":[^,]*/"main": "index.js"/' "$PACKAGE_JSON_PATH" > "$PACKAGE_JSON_PATH.tmp"
  mv "$PACKAGE_JSON_PATH.tmp" "$PACKAGE_JSON_PATH"
else
  log "Creating package.json for lru-cache..."
  cat > "$PACKAGE_JSON_PATH" << 'EOF'
{
  "name": "lru-cache",
  "version": "6.0.0",
  "description": "A cache object that deletes the least-recently-used items",
  "main": "index.js",
  "license": "ISC"
}
EOF
fi

# Do the same for any lru-cache in the expo-app directory
EXPO_APP_LRU_CACHE_DIR="expo-app/node_modules/lru-cache"
if [ -d "expo-app" ]; then
  log "Checking for lru-cache in expo-app directory..."
  
  # Create directory if it doesn't exist
  ensure_dir "$EXPO_APP_LRU_CACHE_DIR"
  
  # Copy our fixed files to the expo-app node_modules
  cp "$INDEX_PATH" "$EXPO_APP_LRU_CACHE_DIR/index.js"
  cp "$PACKAGE_JSON_PATH" "$EXPO_APP_LRU_CACHE_DIR/package.json"
  
  log "Fixed lru-cache in expo-app directory"
fi

# Update App.js with current version
APP_JS="expo-app/App.js"
if [ -f "$APP_JS" ]; then
  TIMESTAMP=$(date +%s%3N)
  VERSION_STRING="1.0.2 - $(date '+%b %-d, %Y, %I:%M %p') - BUILD-$TIMESTAMP"
  
  log "Updating App.js version to: $VERSION_STRING"
  
  # Check if APP_VERSION constant exists
  if grep -q "APP_VERSION" "$APP_JS"; then
    # Update existing APP_VERSION
    sed -i "s/APP_VERSION = '[^']*'/APP_VERSION = '$VERSION_STRING'/" "$APP_JS"
    sed -i "s/APP_VERSION = \"[^\"]*\"/APP_VERSION = \"$VERSION_STRING\"/" "$APP_JS"
  else
    # Add APP_VERSION if it doesn't exist
    sed -i "1s/^/const APP_VERSION = '$VERSION_STRING';\n/" "$APP_JS"
  fi
  
  log "Updated App.js version string"
fi

log "Module error fix completed successfully"
echo "To run the app, execute: node run-expo-only.js"