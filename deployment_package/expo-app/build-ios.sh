#!/bin/bash

# Interactive build script for iOS
# This script walks through the iOS build process step by step

# Set error handling
set -e

echo "===== iOS Build Script for Spiritual Condition Tracker ====="
echo "This script will help you build the iOS app with EAS."

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
    echo "This might cause the 'Invalid UUID appId' error."
    read -p "Do you want to continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        echo "Build cancelled. Please fix the projectId in app.json."
        exit 1
    fi
fi

# Check bundle identifier
if ! grep -q '"bundleIdentifier": ".*"' app.json; then
    echo "⚠️ Error: No bundleIdentifier found in app.json!"
    echo "Please add a bundleIdentifier like 'com.yourcompany.appname' to the ios section of app.json."
    exit 1
fi

# Choose build profile
echo "Available build profiles:"
echo "1) development - Creates a development build for testing (requires Apple Developer account)"
echo "2) preview - Creates an internal distribution build for testing"
echo "3) native - Creates a native build optimized for testing (faster than simulator)"
echo "4) production - Creates a production-ready build for App Store submission"

read -p "Select a build profile (1-4): " profile_choice

case $profile_choice in
    1) profile="development" ;;
    2) profile="preview" ;;
    3) profile="native" ;;
    4) profile="production" ;;
    *) echo "Invalid choice. Using 'preview' as default."; profile="preview" ;;
esac

# Ask for distribution type
if [ "$profile" = "development" ] || [ "$profile" = "preview" ] || [ "$profile" = "native" ]; then
    echo "Distribution options:"
    echo "1) simulator - Build for iOS simulator"
    echo "2) internal - Build for internal distribution (Ad Hoc)"
    
    read -p "Select distribution type (1-2): " dist_choice
    
    case $dist_choice in
        1) distribution="simulator" ;;
        2) distribution="internal" ;;
        *) echo "Invalid choice. Using 'internal' as default."; distribution="internal" ;;
    esac
else
    distribution="store"
fi

# Final confirmation
echo ""
echo "=============== BUILD CONFIGURATION ==============="
echo "Profile: $profile"
echo "Distribution: $distribution"
echo ""

read -p "Start build with these settings? (y/n): " start_build

if [ "$start_build" != "y" ] && [ "$start_build" != "Y" ]; then
    echo "Build cancelled. No changes were made."
    exit 0
fi

# Run the build
echo "Starting iOS build with EAS..."

if [ "$distribution" = "simulator" ]; then
    npx eas build --platform ios --profile $profile --local
else
    npx eas build --platform ios --profile $profile --non-interactive
fi

echo "===== Build process initiated ====="
echo "You can check the status of your build at https://expo.dev/builds"