#!/bin/bash

echo "Fixing iOS build issues - Final Approach"

# Step 1: Clean everything
echo "Cleaning previous build artifacts..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf *.xcworkspace

# Step 2: Replace the Podfile with our minimal version
echo "Installing minimal Podfile..."
cp Podfile.minimal Podfile

# Step 3: Ensure DoubleConversion source files exist
echo "Setting up DoubleConversion source files..."
mkdir -p DoubleConversion/double-conversion
if [ ! -f "DoubleConversion/double-conversion/double-conversion.h" ]; then
  echo "Downloading DoubleConversion source..."
  curl -s -L https://github.com/google/double-conversion/archive/v3.1.5.tar.gz | tar -xz -C /tmp
  cp -r /tmp/double-conversion-3.1.5/double-conversion/* DoubleConversion/double-conversion/
  echo "DoubleConversion source installed."
else
  echo "DoubleConversion source already exists."
fi

echo ""
echo "Setup complete! Now run:"
echo "pod install"
echo ""
echo "Then open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"