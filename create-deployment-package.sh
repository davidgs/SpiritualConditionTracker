#!/bin/bash
# Script to create a deployment package of Spiritual Condition Tracker
# Run this on your server to create a clean deployment package

# Define target directory
TARGET_DIR="deployment_package"
VERSION=$(grep -o 'APP_VERSION = "[^"]*"' expo-app/App.js | cut -d'"' -f2 || echo "unknown")
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
ZIP_NAME="spiritual-condition-tracker-${TIMESTAMP}.zip"

echo "Creating deployment package for version: $VERSION"
echo "Output file will be: $ZIP_NAME"

# Create a clean directory
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Copy files
echo "Copying essential files..."
cp -r expo-app "$TARGET_DIR/"
cp run-expo-only.js "$TARGET_DIR/"
cp server-update-force-rebuild.sh "$TARGET_DIR/"
cp DEPLOYMENT_CHECKLIST.md "$TARGET_DIR/"

# Make scripts executable
chmod +x "$TARGET_DIR/server-update-force-rebuild.sh"
chmod +x "$TARGET_DIR/run-expo-only.js"

# Remove unnecessary files
echo "Cleaning up unnecessary files..."
rm -rf "$TARGET_DIR/expo-app/node_modules"
rm -rf "$TARGET_DIR/expo-app/.expo"
rm -rf "$TARGET_DIR/expo-app/web-build"
rm -rf "$TARGET_DIR/expo-app/.git"

# Create ZIP if available
if command -v zip &> /dev/null; then
    echo "Creating ZIP file..."
    cd "$TARGET_DIR" && zip -r "../$ZIP_NAME" .
    echo "ZIP file created: $ZIP_NAME"
else
    echo "ZIP command not found. Package created at: $TARGET_DIR"
    echo "You can manually compress this directory."
fi

echo "Deployment package creation complete!"
echo "To deploy:"
echo "1. Extract the package to your server"
echo "2. Run 'npm install' in the expo-app directory"
echo "3. Run './server-update-force-rebuild.sh' to start the server"