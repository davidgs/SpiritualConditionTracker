#!/bin/bash
# Script to copy assets to native iOS and Android directories

echo "=========================================="
echo "Copying assets to native platform directories"
echo "=========================================="

PROJECT_ROOT=$(pwd)
ASSETS_DIR="$PROJECT_ROOT/expo-app/assets"

echo "Assets source directory: $ASSETS_DIR"

# Copy to iOS resources
IOS_DIR="$PROJECT_ROOT/expo-app/ios"
if [ -d "$IOS_DIR" ]; then
  echo "Copying assets to iOS directory..."
  
  # Find the iOS app directory
  APP_NAME=$(grep -o '"name": *"[^"]*"' "$PROJECT_ROOT/expo-app/app.json" | head -1 | cut -d'"' -f4)
  if [ -z "$APP_NAME" ]; then
    APP_NAME="SpiritualConditionTracker" # Fallback name
  fi
  
  # Create Images.xcassets if it doesn't exist
  XCASSETS_DIR="$IOS_DIR/$APP_NAME/Images.xcassets"
  if [ ! -d "$XCASSETS_DIR" ]; then
    echo "Creating Images.xcassets directory..."
    mkdir -p "$XCASSETS_DIR"
  fi
  
  # Copy the logo as an iOS resource
  echo "Copying logo.jpg to iOS resources..."
  cp "$ASSETS_DIR/original-logo.jpg" "$IOS_DIR/$APP_NAME/logo.jpg"
  
  # Create AppIcon.appiconset directory if needed
  APPICON_DIR="$XCASSETS_DIR/AppIcon.appiconset"
  if [ ! -d "$APPICON_DIR" ]; then
    echo "Creating AppIcon.appiconset directory..."
    mkdir -p "$APPICON_DIR"
  fi
  
  # Copy the icon to AppIcon.appiconset
  echo "Copying icon.png to AppIcon.appiconset..."
  cp "$ASSETS_DIR/icon.png" "$APPICON_DIR/icon.png"
  
  echo "✅ Assets copied to iOS directory"
else
  echo "iOS directory not found, skipping iOS assets"
fi

# Copy to Android resources
ANDROID_DIR="$PROJECT_ROOT/expo-app/android"
if [ -d "$ANDROID_DIR" ]; then
  echo "Copying assets to Android directory..."
  
  # Create drawable directory if it doesn't exist
  DRAWABLE_DIR="$ANDROID_DIR/app/src/main/res/drawable"
  if [ ! -d "$DRAWABLE_DIR" ]; then
    echo "Creating drawable directory..."
    mkdir -p "$DRAWABLE_DIR"
  fi
  
  # Copy the logo to drawable
  echo "Copying logo to drawable..."
  cp "$ASSETS_DIR/original-logo.jpg" "$DRAWABLE_DIR/logo.jpg"
  
  # Create mipmap directories if they don't exist
  for DPI in hdpi mdpi xhdpi xxhdpi xxxhdpi; do
    MIPMAP_DIR="$ANDROID_DIR/app/src/main/res/mipmap-$DPI"
    if [ ! -d "$MIPMAP_DIR" ]; then
      echo "Creating mipmap-$DPI directory..."
      mkdir -p "$MIPMAP_DIR"
    fi
  done
  
  # Copy icon to mipmap directories
  echo "Copying icon to mipmap directories..."
  cp "$ASSETS_DIR/icon.png" "$ANDROID_DIR/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
  cp "$ASSETS_DIR/adaptive-icon.png" "$ANDROID_DIR/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"
  
  echo "✅ Assets copied to Android directory"
else
  echo "Android directory not found, skipping Android assets"
fi

# Make sure web assets are available
WEB_BUILD_DIR="$PROJECT_ROOT/web-build"
if [ -d "$WEB_BUILD_DIR" ]; then
  echo "Copying assets to web-build directory..."
  
  # Copy the logo to web-build
  cp "$ASSETS_DIR/icon.png" "$WEB_BUILD_DIR/logo.png"
  cp "$ASSETS_DIR/favicon.png" "$WEB_BUILD_DIR/favicon.png"
  
  echo "✅ Assets copied to web-build directory"
fi

echo "=========================================="
echo "Asset copy complete!"
echo "=========================================="