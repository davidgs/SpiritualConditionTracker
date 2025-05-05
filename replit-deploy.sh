#!/bin/bash

# This script is used to deploy the Expo app

# Make sure the script is executable
chmod +x deploy-expo.sh

# Start the ExpoApp workflow
echo "Starting ExpoApp workflow..."
cd expo-app
npx expo start --offline --web --port 5000