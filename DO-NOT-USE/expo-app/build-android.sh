#!/bin/bash

# Interactive build script for Android
# This script walks through the Android build process step by step

# Set error handling
set -e

echo "===== Android Build Script for Spiritual Condition Tracker ====="
echo "This script will help you build the Android app with EAS."

# Check if logged in
if ! npx eas whoami &> /dev/null; then
    echo "Not logged in to EAS. Please log in first."
    ./eas-login.sh
    if ! npx eas whoami &> /dev/null; then
        echo "Login failed. Please try again later."
        exit 1
    fi
fi

# Verify app.json
if ! grep -q '"projectId": ".*-.*-.*-.*-.*"' app.json; then
    echo "⚠️ Warning: The projectId in app.json doesn't appear to be a valid UUID."
    echo "This might cause build issues."
    read -p "Do you want to continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        echo "Build cancelled. Please fix the projectId in app.json."
        exit 1
    fi
fi

# Check package name
if ! grep -q '"package": ".*"' app.json; then
    echo "⚠️ Error: No package name found in app.json!"
    echo "Please add a package field like 'com.yourcompany.appname' to the android section of app.json."
    exit 1
fi

# Choose build profile
echo "Available build profiles:"
echo "1) development - Creates a development build for testing"
echo "2) preview - Creates an internal distribution build for testing"
echo "3) native - Creates a native build optimized for testing"
echo "4) production - Creates a production-ready build for Google Play Store submission"

read -p "Select a build profile (1-4): " profile_choice

case $profile_choice in
    1) profile="development" ;;
    2) profile="preview" ;;
    3) profile="native" ;;
    4) profile="production" ;;
    *) echo "Invalid choice. Using 'preview' as default."; profile="preview" ;;
esac

# Choose build type
echo "Build type options:"
echo "1) APK - Android application package (easier to install directly)"
echo "2) AAB - Android App Bundle (required for Play Store, smaller download size)"

read -p "Select build type (1-2): " build_type_choice

case $build_type_choice in
    1) build_type="apk" ;;
    2) build_type="aab" ;;
    *) echo "Invalid choice. Using 'apk' as default."; build_type="apk" ;;
esac

# Final confirmation
echo ""
echo "=============== BUILD CONFIGURATION ==============="
echo "Profile: $profile"
echo "Build type: $build_type"
echo ""

read -p "Start build with these settings? (y/n): " start_build

if [ "$start_build" != "y" ] && [ "$start_build" != "Y" ]; then
    echo "Build cancelled. No changes were made."
    exit 0
fi

# Run the build
echo "Starting Android build with EAS..."

# Add build type parameter if apk selected
if [ "$build_type" = "apk" ]; then
    npx eas build --platform android --profile $profile --non-interactive --build-type=apk
else
    npx eas build --platform android --profile $profile --non-interactive
fi

echo "===== Build process initiated ====="
echo "You can check the status of your build at https://expo.dev/builds"