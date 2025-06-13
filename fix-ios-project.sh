#!/bin/bash

# Emergency fix script for iOS project corruption
# This script will restore the proper project structure

set -e

echo "=== iOS Project Recovery Script ==="
echo "Fixing Xcode project structure..."

# Define directories
TARGET_DIR="ios/App/My Spiritual Condition"
SOURCE_DIR="ios/App/App"
BACKUP_DIR="ios/App/App_backup_$(date +%Y%m%d_%H%M%S)"

# Create backup of current App directory
if [ -d "$SOURCE_DIR" ]; then
    echo "Creating backup of App directory..."
    cp -r "$SOURCE_DIR" "$BACKUP_DIR"
fi

# Restore Assets.xcassets if it was moved/deleted
if [ ! -d "$TARGET_DIR/Assets.xcassets" ] && [ -d "$SOURCE_DIR/Assets.xcassets" ]; then
    echo "Restoring Assets.xcassets..."
    cp -r "$SOURCE_DIR/Assets.xcassets" "$TARGET_DIR/Assets.xcassets"
fi

# Only copy essential web files, not the entire directory structure
if [ -d "$SOURCE_DIR/public" ]; then
    echo "Syncing only web assets (public directory)..."
    rm -rf "$TARGET_DIR/public"
    cp -r "$SOURCE_DIR/public" "$TARGET_DIR/public"
fi

# Copy only configuration files, not everything
if [ -f "$SOURCE_DIR/capacitor.config.json" ]; then
    echo "Syncing capacitor.config.json..."
    cp "$SOURCE_DIR/capacitor.config.json" "$TARGET_DIR/capacitor.config.json"
fi

if [ -f "$SOURCE_DIR/config.xml" ]; then
    echo "Syncing config.xml..."
    cp "$SOURCE_DIR/config.xml" "$TARGET_DIR/config.xml"
fi

echo "✅ Project structure restored!"
echo "⚠️  Please check your Xcode project targets"
echo "💾 Backup created at: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Open your project in Xcode"
echo "2. Remove any duplicate 'App' targets if they exist"
echo "3. Verify 'My Spiritual Condition' target has proper assets"
echo "4. Clean build folder (Product → Clean Build Folder)"