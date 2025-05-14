#!/bin/bash

# Exit on error
set -e

# Check if EXPO_TOKEN environment variable is set
if [ -z "$EXPO_TOKEN" ]; then
  echo "Error: EXPO_TOKEN environment variable is not set"
  exit 1
fi

# Login to EAS using the token
echo "Logging into EAS with token..."
npx eas-cli login --non-interactive --token $EXPO_TOKEN

echo "EAS login successful!"