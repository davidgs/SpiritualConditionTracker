#!/bin/bash

# iOS sync script for My Spiritual Condition project

echo "=== iOS Sync for My Spiritual Condition ==="
echo "Updating from git..."
git pull

echo "Building project..."
npm run build

echo "Running Capacitor sync..."
npx cap sync ios

echo "✅ Sync complete!"
echo "🔨 Ready to build in Xcode"