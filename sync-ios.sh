#!/bin/bash

# Comprehensive iOS sync script for production builds
# Syncs all necessary files from Capacitor's default App directory to your production target

set -e  # Exit on any error

echo "=== iOS Production Sync Script ==="
echo "Updating from git..."
git pull

echo "Building project..."
npm run build

echo "Running Capacitor sync..."
npx cap sync

# Define source and target directories
SOURCE_DIR="ios/App/App"
TARGET_DIR="ios/App/My Spiritual Condition"

echo "Syncing assets from '$SOURCE_DIR' to '$TARGET_DIR'..."

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Production target directory '$TARGET_DIR' not found!"
    echo "Please ensure your iOS project is properly configured."
    exit 1
fi

# Function to copy file if it exists
copy_if_exists() {
    local src="$1"
    local dest="$2"
    local desc="$3"
    
    if [ -e "$src" ]; then
        echo "Copying $desc..."
        cp -r "$src" "$dest"
    else
        echo "Warning: $desc not found at $src"
    fi
}

# Remove old assets to ensure clean sync
echo "Cleaning existing assets..."
[ -d "$TARGET_DIR/public" ] && rm -rf "$TARGET_DIR/public"
[ -f "$TARGET_DIR/capacitor.config.json" ] && rm -f "$TARGET_DIR/capacitor.config.json"
[ -f "$TARGET_DIR/config.xml" ] && rm -f "$TARGET_DIR/config.xml"

# Copy web assets (most important)
copy_if_exists "$SOURCE_DIR/public" "$TARGET_DIR/public" "web assets (public directory)"

# Copy Capacitor configuration files
copy_if_exists "$SOURCE_DIR/capacitor.config.json" "$TARGET_DIR/capacitor.config.json" "Capacitor configuration"
copy_if_exists "$SOURCE_DIR/config.xml" "$TARGET_DIR/config.xml" "Cordova configuration"

# Verify critical files were copied
if [ ! -d "$TARGET_DIR/public" ]; then
    echo "Error: Failed to copy web assets to production target!"
    exit 1
fi

echo "✅ Production sync complete!"
echo "📱 Your 'My Spiritual Condition' target is now up to date."
echo "🔨 You can proceed with building in Xcode."

# Display sync summary
echo ""
echo "=== Sync Summary ==="
echo "✓ Web assets synced to: $TARGET_DIR/public"
if [ -f "$TARGET_DIR/capacitor.config.json" ]; then
    echo "✓ Capacitor config synced"
fi
if [ -f "$TARGET_DIR/config.xml" ]; then
    echo "✓ Cordova config synced"
fi
echo "=== Ready for App Store build ==="