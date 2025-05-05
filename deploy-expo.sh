#!/bin/bash

# This script is used to deploy the Expo app to Replit

# Change to the expo-app directory
cd expo-app

# Make sure dependencies are installed
echo "Checking dependencies..."
npm install --no-audit

# Start the Expo web server for deployment
echo "Starting Expo web server..."
npx expo start --offline --web --port 5001 --non-interactive