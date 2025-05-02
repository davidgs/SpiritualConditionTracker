# iOS Xcode Build Checklist for AA Recovery Tracker

This checklist will help you ensure that all required settings are properly configured for a native Xcode build of the AA Recovery Tracker app, particularly with the Bluetooth/WiFi proximity features for nearby member discovery.

## Prerequisites

1. ✅ Make sure you have the latest version of Xcode installed (minimum 14.0+)
2. ✅ Ensure you have a valid Apple Developer account
3. ✅ Make sure you have CocoaPods installed (`sudo gem install cocoapods`)

## Before Opening Xcode

1. ✅ Make sure all necessary permissions have been added to Info.plist:
   - NSBluetoothAlwaysUsageDescription
   - NSBluetoothPeripheralUsageDescription
   - NSLocalNetworkUsageDescription
   - NSBonjourServices
   - UIBackgroundModes
   - NSCalendarsUsageDescription
   - NSRemindersUsageDescription
   - NSLocationWhenInUseUsageDescription

2. ✅ Make sure all necessary entitlements have been added to AARecoveryTracker.entitlements:
   - com.apple.developer.networking.multicast
   - com.apple.developer.networking.wifi-info
   - UIBackgroundModes (with bluetooth-central, bluetooth-peripheral, fetch, location)

3. ✅ Run the following commands to ensure all dependencies are properly installed:
   ```bash
   cd ios
   pod deintegrate  # Optional: only if you're having pod-related issues
   pod install --repo-update
   ```

## Opening Xcode Project

1. Open the project in Xcode by opening the `.xcworkspace` file (not the `.xcodeproj` file):
   ```bash
   open ios/AARecoveryTracker.xcworkspace
   ```

## Xcode Project Configuration

### 1. Signing & Capabilities Setup

1. Select the AARecoveryTracker target in the Project Navigator
2. Go to the "Signing & Capabilities" tab
3. Make sure "Automatically manage signing" is checked
4. Select your Apple Developer Team from the dropdown
5. The Bundle Identifier should be "com.example.aarecoverytracker" (or your custom identifier)
6. Verify that all the following capabilities are present (add them if missing by clicking "+ Capability"):
   - Background Modes
     - ✓ Uses Bluetooth LE accessories
     - ✓ Acts as a Bluetooth LE accessory
     - ✓ Background fetch
     - ✓ Location updates
   - Access WiFi Information
   - Network Extensions (for multicast)
   - Push Notifications (if using)
   - App Groups (if using)

### 2. Info Tab

1. Verify the deployment target is set to iOS 15.1 or higher
2. Check that the version and build numbers match app.json (1.0.0)
3. Make sure the device orientation settings match what's in app.json

### 3. Build Settings

1. Search for "deployment target" and ensure it's set to 15.1
2. Search for "valid architectures" and ensure "arm64" is included for devices
3. Search for "bitcode" and ensure it's set to "No" (Bitcode is deprecated as of Xcode 14)
4. Search for "swift version" and ensure it's set to Swift 5
5. Search for "framework search paths" and verify it includes:
   - $(inherited)
   - ${PODS_ROOT}/hermes-engine/destroot/Library/Frameworks/universal
   - ${PODS_XCFRAMEWORKS_BUILD_DIR}/hermes-engine/Pre-built

### 4. Build Phases

1. Check "Link Binary With Libraries" section to ensure all required frameworks are linked:
   - CoreBluetooth.framework
   - Network.framework
   - CoreLocation.framework
   - EventKit.framework (for calendar)
   - UserNotifications.framework
   - All required React Native and Expo frameworks should be added by CocoaPods

## Final Preparation and Building

1. Update the Team ID in project.pbxproj if needed:
   - Open ios/AARecoveryTracker.xcodeproj/project.pbxproj in a text editor
   - Find the "DEVELOPMENT_TEAM" entry and update with your Apple Team ID

2. Clean the build folder before building:
   - In Xcode, select "Product" > "Clean Build Folder"

3. Select a physical device from the device selector in the toolbar
   - Note: Some Bluetooth/WiFi features can only be fully tested on a physical device

4. Build and run the app:
   - Click the "Run" button (▶️) or press Cmd+R

## Debugging Common iOS Build Issues

### Code Signing Issues

1. "No valid signing certificate found":
   - Make sure your Apple Developer account is valid
   - Check that you've selected the correct team
   - Try creating a new certificate through Xcode by selecting "Fix Issue"

2. "Failed to create provisioning profile":
   - Go to the Apple Developer Portal and verify your App ID
   - Check that your bundle identifier matches what's registered
   - Try adding explicit provisioning profiles if automatic signing fails

### Framework/Library Issues

1. "Framework not found" errors:
   - Run `pod install --repo-update` again
   - Check that all frameworks are properly linked in Build Phases
   - Delete the derived data folder: `rm -rf ~/Library/Developer/Xcode/DerivedData`

2. Architecture issues:
   - Make sure the target architecture matches your device
   - For simulators, ensure x86_64 is supported
   - For physical devices, ensure arm64 is supported

### Permission Issues

1. Bluetooth/WiFi permissions not working:
   - Double-check Info.plist for all required permissions
   - Verify that the entitlements file is correctly configured
   - Check that capabilities are properly set in the Signing & Capabilities tab

## Testing Proximity Features

After building and installing the app:

1. Enable Bluetooth and WiFi on the test device
2. Grant all permissions when prompted
3. Navigate to the NearbyMembers screen
4. Enable discoverability
5. Use the DiscoverySettings component to enable Bluetooth/WiFi scanning
6. Test with another device to confirm proximity discovery works
7. Verify that different discovery methods (GPS, Bluetooth, WiFi) are correctly displayed in the user interface

## Additional Resources

- React Native iOS Setup Guide: https://reactnative.dev/docs/environment-setup
- Expo Development Builds: https://docs.expo.dev/development/build/
- Apple Developer Documentation: https://developer.apple.com/documentation/

Good luck with your Xcode build! If you encounter any specific issues not covered in this checklist, consult the React Native and Expo documentation or seek assistance from the developer community.