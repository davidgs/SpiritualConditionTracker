#!/bin/bash

# Build and sync script for iOS with dual target support
# This handles syncing assets to both the default Capacitor location and your renamed iOS target

echo "Updating from git ..."
git pull

echo "Building project..."
npm run build

echo "Running Capacitor sync..."
npx cap sync

echo "Copying assets to 'My Spiritual Condition' target..."
if [ -d "ios/App/My Spiritual Condition" ]; then
    cp -r "ios/App/App/public/" "ios/App/My Spiritual Condition/public/" 2>/dev/null
    echo "Assets copied successfully to 'My Spiritual Condition' target"
else
    echo "Warning: 'My Spiritual Condition' target directory not found"
fi

echo "Sync complete. You can now build in Xcode."