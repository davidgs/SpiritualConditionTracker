#!/bin/bash

# Create directories for the needed headers
mkdir -p ios/DoubleConversion/double-conversion

# Download the DoubleConversion source directly from GitHub
echo "Downloading DoubleConversion source..."
curl -s -L https://github.com/google/double-conversion/archive/v3.1.5.tar.gz | tar -xz -C /tmp
cp -r /tmp/double-conversion-3.1.5/double-conversion/* ios/DoubleConversion/double-conversion/

# Clean previous build artifacts
echo "Cleaning previous build artifacts..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf build
rm -rf *.xcworkspace

echo "Done! Now, on your local machine, run the following commands:"
echo "cd ios"
echo "pod install"
echo "Then open the workspace in Xcode:"
echo "open AARecoveryTracker.xcworkspace"