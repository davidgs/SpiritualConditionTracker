#!/bin/bash

# This script prepares the app for deployment on Replit

# Ensure we're in the project root
cd "$(dirname "$0")"

# Kill any running processes
echo "Cleaning up any running processes..."
pkill -f "node deployment-server.js" || true
pkill -f "npx expo" || true

# Make sure the deployment server is ready
echo "Setting up deployment server..."
node deployment-server.js