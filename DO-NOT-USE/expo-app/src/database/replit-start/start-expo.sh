#!/bin/bash
# Minimal script to start Expo directly on port 3243

# Kill any existing expo processes
pkill -f expo || true

# Go to the expo-app directory from the current directory
cd "$(dirname "$0")/../expo-app" || exit 1

# Set environment variables
export EXPO_WEB_PORT=3243
export PORT=3243
export CI=1
export BROWSER=none
export DANGEROUSLY_DISABLE_HOST_CHECK=true

# Start Expo on the specified port
exec npx expo start --web --port 3243 --host lan