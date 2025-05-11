#!/bin/bash

# Exit on error
set -e

echo "Setting up EAS credentials for build..."

# Check for EXPO_TOKEN environment variable
if [ -z "$EXPO_TOKEN" ]; then
  echo "Error: EXPO_TOKEN environment variable is not set."
  echo "Please set your EXPO_TOKEN before running this script."
  exit 1
fi

# Login to EAS with the token
echo "Logging in to EAS with provided token..."
# Create temporary file with the token
TOKEN_FILE=$(mktemp)
echo "$EXPO_TOKEN" > "$TOKEN_FILE"

# Login using the token file
npx eas-cli login --non-interactive < "$TOKEN_FILE"

# Remove the temporary file
rm "$TOKEN_FILE"

# Verify login was successful
echo "Verifying EAS login status..."
npx eas-cli whoami

echo "Configuring credentials for iOS..."
# Set up iOS build credentials automatically
npx eas-cli credentials

echo "EAS credentials setup complete!"
echo "You can now run builds with: npx eas-cli build --platform ios --profile preview"