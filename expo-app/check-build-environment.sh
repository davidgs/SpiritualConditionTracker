#!/bin/bash

# Script to check if the build environment is properly configured
# This checks for all required dependencies for building the Spiritual Condition Tracker app

# Set error handling
set -e

echo "===== Build Environment Check for Spiritual Condition Tracker ====="
echo "Checking for required tools and configurations..."

# Check Node.js and npm
echo -n "Node.js: "
if command -v node &> /dev/null; then
    node_version=$(node -v)
    echo "✅ Installed ($node_version)"
    
    if [[ $node_version != v16* ]] && [[ $node_version != v18* ]] && [[ $node_version != v20* ]]; then
        echo "⚠️  Warning: Recommended Node.js version is 16.x, 18.x, or 20.x"
    fi
else
    echo "❌ Not installed (Required)"
    echo "Please install Node.js from https://nodejs.org/"
fi

echo -n "npm: "
if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    echo "✅ Installed ($npm_version)"
else
    echo "❌ Not installed (Required)"
    echo "npm should be installed with Node.js"
fi

# Check for Expo CLI
echo -n "Expo CLI: "
if npx expo --version &> /dev/null; then
    expo_version=$(npx expo --version)
    echo "✅ Installed ($expo_version)"
else
    echo "❌ Not installed (Required)"
    echo "Please install Expo CLI with: npm install -g expo-cli"
fi

# Check for EAS CLI
echo -n "EAS CLI: "
if npx eas --version &> /dev/null; then
    eas_version=$(npx eas --version)
    echo "✅ Installed ($eas_version)"
else
    echo "⚠️  Not installed (Required for building)"
    echo "You should install EAS CLI with: npm install -g eas-cli"
fi

# Check for configuration files
echo -n "app.json: "
if [ -f "app.json" ]; then
    echo "✅ Present"
else
    echo "❌ Missing (Required)"
    echo "The app.json file is required for the build process"
fi

echo -n "eas.json: "
if [ -f "eas.json" ]; then
    echo "✅ Present"
else
    echo "❌ Missing (Required)"
    echo "The eas.json file is required for EAS builds"
fi

echo -n "credentials.json: "
if [ -f "../credentials.json" ]; then
    echo "✅ Present"
else
    echo "⚠️  Missing (Optional)"
    echo "A credentials.json file is useful but EAS can manage credentials for you"
fi

# Check for EAS login status
echo -n "EAS account: "
if npx eas whoami &> /dev/null; then
    eas_user=$(npx eas whoami)
    echo "✅ Logged in as $eas_user"
else
    echo "❌ Not logged in"
    echo "Please run ./eas-login.sh to log in to EAS"
fi

# iOS-specific checks
echo -n "iOS Bundle Identifier: "
if grep -q "\"bundleIdentifier\":" app.json; then
    bundle_id=$(grep -o '"bundleIdentifier": "[^"]*' app.json | cut -d'"' -f4)
    echo "✅ Configured as $bundle_id"
else
    echo "❌ Not configured"
    echo "The iOS bundle identifier must be set in app.json"
fi

# Android-specific checks
echo -n "Android Package Name: "
if grep -q "\"package\":" app.json; then
    package_name=$(grep -o '"package": "[^"]*' app.json | cut -d'"' -f4)
    echo "✅ Configured as $package_name"
else
    echo "❌ Not configured"
    echo "The Android package name must be set in app.json"
fi

# Check for build scripts
echo -n "Build scripts: "
if [ -x "build-ios.sh" ] && [ -x "build-android.sh" ]; then
    echo "✅ Present and executable"
else
    echo "⚠️  Issue with build scripts"
    echo "Make sure build-ios.sh and build-android.sh are present and executable"
    echo "Run: chmod +x build-ios.sh build-android.sh"
fi

echo "===== Environment check complete ====="
echo "If any required items are missing, please fix them before attempting to build."