#!/bin/bash

# Exit on error
set -e

echo "Starting iOS build for Spiritual Condition Tracker..."

# Check if logged in
echo "Checking EAS authentication status..."
eas whoami

# Create credentials if needed
echo "Preparing iOS build with credentials..."
eas build:configure --platform ios

# Start the build
echo "Starting iOS build process..."
eas build --platform ios --profile native --non-interactive --wait

echo "Build process has been initiated!"
echo "You can check build status at: https://expo.dev/accounts/davidgs/projects/spiritual-condition-tracker/builds"