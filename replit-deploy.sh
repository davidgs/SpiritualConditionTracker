#!/bin/bash

# This script is executed when the application is deployed on Replit
# It ensures the latest version of the app is served

echo "Starting deployment process..."

# Stop any running processes
pkill -f "node main.js" || true
pkill -f "npx expo" || true

# Change to the project directory
cd "$(dirname "$0")"

# Check if the expo-app directory exists
if [ ! -d "expo-app" ]; then
  echo "Error: expo-app directory not found!"
  exit 1
fi

# Start the main deployment server
echo "Starting main deployment server..."
node main.js