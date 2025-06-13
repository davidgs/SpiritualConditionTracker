#!/bin/bash

# Safe iOS sync script - only syncs web assets
# Does NOT touch Xcode project files or native iOS assets

echo "=== Safe iOS Web Assets Sync ==="
echo "Updating from git..."
git pull

echo "Building project..."
npm run build

echo "Running Capacitor sync..."
npx cap sync

# Define directories
SOURCE_PUBLIC="ios/App/App/public"
TARGET_PUBLIC="ios/App/My Spiritual Condition/public"

echo "Syncing ONLY web assets (public directory)..."

# Check if source exists
if [ ! -d "$SOURCE_PUBLIC" ]; then
    echo "Error: Source web assets not found at $SOURCE_PUBLIC"
    echo "Run 'npx cap sync' first to generate web assets."
    exit 1
fi

# Check if target directory exists
if [ ! -d "ios/App/My Spiritual Condition" ]; then
    echo "Error: Production target 'My Spiritual Condition' not found!"
    exit 1
fi

# Only sync web assets - nothing else
echo "Removing old web assets..."
[ -d "$TARGET_PUBLIC" ] && rm -rf "$TARGET_PUBLIC"

echo "Copying new web assets..."
cp -r "$SOURCE_PUBLIC" "$TARGET_PUBLIC"

# Verify sync
if [ -d "$TARGET_PUBLIC" ]; then
    echo "✅ Web assets synced successfully!"
    echo "📱 'My Spiritual Condition' target updated with latest web content"
    echo "🔨 Safe to build in Xcode"
else
    echo "❌ Failed to sync web assets"
    exit 1
fi