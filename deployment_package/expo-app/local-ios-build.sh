#!/bin/bash

# Script to build iOS app locally
# This should be run on your local machine, not in Replit

# Exit on error
set -e

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "EAS CLI is not installed. Installing now..."
    npm install -g eas-cli
fi

# Check if logged in
echo "Checking EAS authentication status..."
if ! eas whoami &> /dev/null; then
    echo "You are not logged in to EAS. Please log in:"
    eas login
fi

# Show current user
eas whoami

# Apply dependency fixes
echo "Applying dependency fixes before build..."

# Make sure eas-hooks directory exists
mkdir -p eas-hooks

# Run pre-install hook
chmod +x ./eas-hooks/eas-build-pre-install.sh
./eas-hooks/eas-build-pre-install.sh

# Install dependencies
npm install --legacy-peer-deps

# Run post-install hook
chmod +x ./eas-hooks/eas-build-post-install.sh
./eas-hooks/eas-build-post-install.sh

# Start the build
echo "Starting iOS build process..."
echo "This will build the app with the native profile and open the build status in your browser."
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Run the build command with minimatch workaround
export NODE_OPTIONS="--preserve-symlinks"
eas build --platform ios --profile native --no-wait

echo "Build process has been initiated!"
echo "You can monitor the build at: https://expo.dev/accounts/davidgs/projects/spiritual-condition-tracker/builds"