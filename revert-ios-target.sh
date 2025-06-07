#!/bin/bash

# Script to revert iOS target from SpiritualCondition back to App
# Run this to restore Capacitor compatibility

echo "🔄 Reverting iOS target to App configuration..."

# Update Capacitor configuration
echo "Updating Capacitor config..."
sed -i 's/scheme: '\''SpiritualCondition'\''/scheme: '\''App'\''/g' capacitor.config.js

# Update Podfile
echo "Updating Podfile..."
sed -i 's/target '\''SpiritualCondition'\''/target '\''App'\''/g' ios/App/Podfile

# Rename project files if they exist
if [ -d "ios/App/SpiritualCondition.xcodeproj" ]; then
    echo "Renaming SpiritualCondition.xcodeproj to App.xcodeproj..."
    mv ios/App/SpiritualCondition.xcodeproj ios/App/App.xcodeproj
fi

if [ -d "ios/App/SpiritualCondition.xcworkspace" ]; then
    echo "Renaming SpiritualCondition.xcworkspace to App.xcworkspace..."
    mv ios/App/SpiritualCondition.xcworkspace ios/App/App.xcworkspace
fi

# Clean CocoaPods cache
echo "Cleaning CocoaPods cache..."
rm -rf ios/App/Pods ios/App/Podfile.lock

# Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync ios

echo "✅ iOS target reverted to App successfully!"
echo "📝 Next steps:"
echo "1. Open ios/App/App.xcworkspace in XCode"
echo "2. Verify the target name is 'App'"
echo "3. Build and test the app"