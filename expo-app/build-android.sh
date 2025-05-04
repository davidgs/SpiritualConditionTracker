#!/bin/bash

# Build script for Android using EAS Build
# This script will handle the process of building the Android app

# Set error handling
set -e

echo "===== Spiritual Condition Tracker Android Build ====="
echo "Starting build process..."

# Check if eas-cli is installed
if ! command -v npx eas &> /dev/null; then
    echo "Error: EAS CLI is not installed. Installing..."
    npm install -g eas-cli
fi

# Check login status
echo "Checking EAS login status..."
if ! npx eas whoami &> /dev/null; then
    echo "You need to log in to EAS first."
    echo "Run 'npx eas login' and then try again."
    exit 1
fi

# Validate app.json and eas.json
echo "Validating configuration files..."
if [ ! -f "app.json" ]; then
    echo "Error: app.json file not found!"
    exit 1
fi

if [ ! -f "eas.json" ]; then
    echo "Error: eas.json file not found!"
    exit 1
fi

# Check for Android-specific configuration
if ! grep -q "\"android\":" app.json; then
    echo "Error: Android configuration not found in app.json!"
    exit 1
fi

# Check for Android package name
if ! grep -q "\"package\":" app.json; then
    echo "Error: Android package name not found in app.json!"
    exit 1
fi

# Check for credentials
if [ ! -f "../credentials.json" ]; then
    echo "Warning: credentials.json file not found in the project root."
    echo "EAS will prompt for credentials during the build process."
fi

# Check for keystore
if [ ! -f "../aa-recovery-keystore.jks" ]; then
    echo "Warning: Keystore file not found in the project root."
    echo "EAS will generate a new keystore during the build process."
fi

# Choose build profile
echo "Select a build profile:"
echo "1) development - For development and testing"
echo "2) native - Internal distribution with Android-specific settings (APK)"
echo "3) preview - Internal distribution"
echo "4) production - For Google Play submissions"
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        profile="development"
        ;;
    2)
        profile="native" 
        ;;
    3)
        profile="preview"
        ;;
    4)
        profile="production"
        ;;
    *)
        echo "Invalid choice. Using 'native' profile as default."
        profile="native"
        ;;
esac

echo "Starting EAS build for Android with profile: $profile"

# Run the build
npx eas build --platform android --profile $profile --non-interactive

echo "Build process initiated. You can monitor the build progress in the EAS dashboard."
echo "===== Build script complete ====="