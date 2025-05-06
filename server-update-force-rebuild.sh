#!/bin/bash
# Script to force a complete rebuild of the Expo app
# This script should be run on your server after downloading the latest files

# Print commands as they are executed
set -x

# Define variables
EXPO_APP_DIR="$(pwd)/expo-app"
PORT=3243

echo "===== Starting complete rebuild of Spiritual Condition Tracker ====="
echo "App directory: $EXPO_APP_DIR"

# Kill any running Expo processes
echo "Stopping any running Expo processes..."
pkill -f "expo start" || true
pkill -f "node.*expo" || true

# Clear all caches
echo "Clearing all caches..."
rm -rf "$EXPO_APP_DIR/node_modules/.cache" || true
rm -rf "$EXPO_APP_DIR/.expo" || true
rm -rf "$EXPO_APP_DIR/web-build" || true

# Fix common module issues
echo "Fixing common module issues..."
mkdir -p "$EXPO_APP_DIR/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/"
touch "$EXPO_APP_DIR/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"
touch "$EXPO_APP_DIR/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf"
touch "$EXPO_APP_DIR/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf"
touch "$EXPO_APP_DIR/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"
touch "$EXPO_APP_DIR/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"

# Check App.js version
APP_VERSION=$(grep -o 'APP_VERSION = "[^"]*"' "$EXPO_APP_DIR/App.js" | cut -d'"' -f2)
echo "Current App.js version: $APP_VERSION"

# Start Expo with all cache clearing flags
echo "Starting Expo with complete rebuild..."
cd "$EXPO_APP_DIR" && \
    npx expo start --web --port $PORT --host lan --clear --no-dev --reset-cache &

echo "===== Setup complete ====="
echo "App should be running at http://localhost:$PORT"
echo "You may need to wait a minute for the bundler to complete"
echo "If you encounter issues, check the logs for errors"

# Print reminder about getting the latest code
echo ""
echo "IMPORTANT: Make sure you have the latest code from the repository"
echo "If you're still seeing old code, make sure all files are up to date"
echo "Specifically check that App.js and all files in src/ are the latest versions"