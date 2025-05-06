#!/bin/bash
# Script to completely clean and restart the Expo app server
# This addresses extreme caching issues by removing all cached data

# Print commands as they execute
set -x

# Show current directory
pwd

# Kill ANY existing Node or Expo processes
echo "Killing all existing Node and Expo processes..."
pkill -f "node" || true
pkill -f "expo" || true
pkill -f "metro" || true

# Give processes time to terminate
sleep 2

# Remove ALL cache directories
echo "Removing ALL cache directories..."

# Remove node_modules cache
rm -rf ./expo-app/node_modules/.cache
rm -rf ./node_modules/.cache

# Remove Expo caches
rm -rf ./expo-app/.expo
rm -rf ./.expo
rm -rf ~/.expo

# Remove Metro bundler cache
rm -rf ./expo-app/metro-cache
rm -rf ~/.metro

# Remove web build directories
rm -rf ./expo-app/web-build
rm -rf ./web-build

# Remove any possible temp directories
rm -rf ./expo-app/.tmp
rm -rf ./tmp

# Clear npm cache
npm cache clean --force

# Just in case there are yarn caches
yarn cache clean || true

# Clear babel cache
find . -name ".babel.json" -delete

# Clear require cache by forcing Node to restart
echo "Cache cleaning complete. Starting server with fresh environment..."

# Fix LRU cache module issue
echo "Fixing lru-cache module issue..."
node fix-lru-cache.js

# Fix minimatch and other modules
echo "Running additional module fixes..."
if [ -f ./fix-module-error.sh ]; then
  bash ./fix-module-error.sh
fi

# Install any missing dependencies
echo "Installing critical dependencies..."
npm install --no-save lru-cache@6.0.0 semver@7.5.4 minimatch@5.1.6

# Print App.js version for verification
echo "App.js version:"
grep -n "APP_VERSION" ./expo-app/App.js

# Start the server with maximum cache cleaning and increased memory
NODE_OPTIONS="--no-warnings --max-old-space-size=4096" \
EXPO_CACHE_BUSTER="$(date +%s)" \
METRO_CACHE_BUSTER="$(date +%s)" \
TIMESTAMP="$(date +%s)" \
BUILD_ID="force-clean-$(date +%s)" \
EXPO_PUBLIC_BUILD_ID="force-clean-$(date +%s)" \
REACT_APP_BUILD_ID="force-clean-$(date +%s)" \
NODE_ENV="production" \
CI="1" \
node run-expo-only.js