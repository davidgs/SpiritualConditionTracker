#!/bin/bash
set -e

# This script helps test iOS build fixes locally before submitting to EAS Build
# It cleans the environment, applies our fixes, and attempts a local iOS build

echo "🧹 Cleaning previous build artifacts..."
rm -rf ./ios/build
rm -rf ./ios/Pods
rm -rf ./ios/Podfile.lock

echo "🔧 Running pre-install fixes..."
chmod +x ./eas-hooks/eas-build-pre-install.sh
./eas-hooks/eas-build-pre-install.sh

echo "📦 Installing pods..."
cd ios
pod install --verbose

echo "🔨 Building iOS app locally..."
cd ..
npx expo run:ios

echo "✅ Process completed!"