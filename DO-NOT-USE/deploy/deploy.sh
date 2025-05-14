#!/bin/bash

# Deployment script for Spiritual Condition Tracker
# This script will deploy the application using PM2

# Ensure we're in the project root
cd "$(dirname "$0")/.."

echo "Starting deployment of Spiritual Condition Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Stop any existing instances
echo "Stopping any existing instances..."
pm2 stop spiritual-condition-tracker 2>/dev/null || true
pm2 delete spiritual-condition-tracker 2>/dev/null || true

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start deploy/pm2.config.js

# Save the PM2 configuration to start on system reboot
echo "Saving PM2 configuration..."
pm2 save

echo "Deployment complete!"
echo "Your application is now running at: http://localhost:3000"
echo "To check status, run: pm2 status"
echo "To view logs, run: pm2 logs spiritual-condition-tracker"