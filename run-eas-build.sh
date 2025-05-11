#!/bin/bash

# Run EAS build with the correct configuration and environment
# This script will:
# 1. Set up EAS credentials using the EXPO_TOKEN
# 2. Run the EAS build with the specified profile
# 3. Show build status and logs

# Exit on error
set -e

# Configure build type
BUILD_PROFILE=${1:-"preview"}
PLATFORM=${2:-"ios"}

echo "========================================"
echo "Starting EAS build for Spiritual Condition Tracker"
echo "Profile: $BUILD_PROFILE"
echo "Platform: $PLATFORM"
echo "========================================"

# Check for EXPO_TOKEN
if [ -z "$EXPO_TOKEN" ]; then
  echo "Error: EXPO_TOKEN environment variable is required"
  echo "Please set your EXPO_TOKEN before running this script"
  exit 1
fi

# Setup credentials if needed
echo "Setting up EAS credentials for build..."

# Login to EAS with the token
echo "Logging in to EAS with provided token..."

# Create temporary session token file
TOKEN_FILE=$(mktemp)
echo "$EXPO_TOKEN" > "$TOKEN_FILE"

# Login using the standard EAS CLI approach
npx eas-cli login --non-interactive < "$TOKEN_FILE"
rm -f "$TOKEN_FILE"

# Verify login was successful
echo "Verifying EAS login status..."
if npx eas-cli whoami; then
  echo "EAS credentials setup successful"
else
  echo "Error setting up EAS credentials"
  exit 1
fi

# Create a timestamp for the build
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "Build timestamp: $TIMESTAMP"

# Setup environment variables for the build
export EAS_NO_VCS=1
export EAS_BUILD_AUTOCOMMIT=0
export NODE_OPTIONS="--max-old-space-size=8192"
export EXPO_DEBUG=1

# Disable React Native new architecture and Hermes
export RCT_NEW_ARCH_ENABLED=0
export USE_HERMES=0
export USE_FABRIC=0
export DISABLE_CODEGEN=1
export USE_FRAMEWORKS=static

# Run the pre-install script directly
echo "Running pre-install setup..."
if [ -f "./expo-app/eas-hooks/eas-build-pre-install.sh" ]; then
  chmod +x ./expo-app/eas-hooks/eas-build-pre-install.sh
  if ./expo-app/eas-hooks/eas-build-pre-install.sh; then
    echo "Pre-install setup completed successfully"
  else
    echo "Error in pre-install setup"
    exit 1
  fi
else
  echo "Warning: Pre-install script not found - continuing without it"
fi

# Change to the expo-app directory
cd ./expo-app

# Run the EAS build command
echo "Starting EAS build..."
npx eas-cli build \
  --platform $PLATFORM \
  --profile $BUILD_PROFILE

echo "========================================"
echo "Build started successfully!"
echo "Check your Expo dashboard for build status"
echo "========================================"