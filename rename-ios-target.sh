#!/bin/bash

# Script to rename iOS target from App to SpiritualCondition
# Run this after making changes in XCode

echo "🔄 Renaming iOS target configuration..."

# Update Capacitor configuration
echo "Updating Capacitor config..."
sed -i 's/scheme: '\''App'\''/scheme: '\''SpiritualCondition'\''/g' capacitor.config.js

# Update Podfile
echo "Updating Podfile..."
sed -i 's/target '\''App'\''/target '\''SpiritualCondition'\''/g' ios/App/Podfile

# Rename project files if they exist
if [ -d "ios/App/App.xcodeproj" ]; then
    echo "Renaming App.xcodeproj to SpiritualCondition.xcodeproj..."
    mv ios/App/App.xcodeproj ios/App/SpiritualCondition.xcodeproj
fi

if [ -d "ios/App/App.xcworkspace" ]; then
    echo "Renaming App.xcworkspace to SpiritualCondition.xcworkspace..."
    mv ios/App/App.xcworkspace ios/App/SpiritualCondition.xcworkspace
fi

# Clean CocoaPods cache
echo "Cleaning CocoaPods cache..."
rm -rf ios/App/Pods ios/App/Podfile.lock

# Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync ios

echo "✅ iOS target renamed successfully!"
echo "📝 Next steps:"
echo "1. Open ios/App/SpiritualCondition.xcworkspace in XCode"
echo "2. Verify the target name is correct"
echo "3. Build and test the app"