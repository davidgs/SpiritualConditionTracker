# iOS Xcode Build Checklist for AA Recovery Tracker

This checklist will help you ensure that all required settings are properly configured for a native Xcode build of the AA Recovery Tracker app, particularly with the Bluetooth/WiFi proximity features.

## Before Opening Xcode

1. ✅ Make sure all necessary permissions have been added to Info.plist
   - NSBluetoothAlwaysUsageDescription
   - NSBluetoothPeripheralUsageDescription
   - NSLocalNetworkUsageDescription
   - NSBonjourServices
   - UIBackgroundModes

2. ✅ Make sure all necessary entitlements have been added to AARecoveryTracker.entitlements
   - com.apple.developer.networking.multicast
   - com.apple.developer.networking.wifi-info
   - UIBackgroundModes

3. ✅ Run `cd ios && pod install` to install all necessary pods and dependencies

## Xcode Project Setup

1. Open the project in Xcode by opening the `.xcworkspace` file (not the `.xcodeproj` file)
   ```
   open ios/AARecoveryTracker.xcworkspace
   ```

2. Configure Signing & Capabilities:
   - Select the AARecoveryTracker target
   - Go to the "Signing & Capabilities" tab
   - Make sure "Automatically manage signing" is checked
   - Select your development team
   - If necessary, add the following capabilities:
     - Background Modes (with Bluetooth Central/Peripheral, Location, and Background fetch enabled)
     - Access WiFi Information
     - Network Extensions (for multi-cast)

3. Check Build Settings:
   - "iOS Deployment Target" should be set to iOS 15.1 or later
   - Architecture settings should include "arm64" for devices
   - In build settings, search for "valid architectures" and make sure it includes arm64

4. Check Swift version compatibility:
   - Ensure Swift language version is set to "Swift 5" in build settings

5. Check Framework Search Paths:
   - Make sure the framework search paths include $(inherited) and the proper Pods paths

## Building the App

1. Before building, clean the build folder:
   - Select "Product" > "Clean Build Folder" from the menu

2. Select your device from the device selector in the toolbar

3. Build and run the app
   - If you encounter any errors, check the Issues navigator for details

## Common Issues & Solutions

1. If you get code signing errors:
   - Check that your development team is selected
   - Verify that your provisioning profile is valid
   - Try "Product" > "Clean Build Folder" and build again

2. If you get "framework not found" errors:
   - Run `pod install` again
   - Make sure all required frameworks are linked in the Build Phases

3. If you get Bluetooth-related errors:
   - Confirm all the necessary permissions are in Info.plist
   - Check that Bluetooth capabilities are enabled in Signing & Capabilities
   - Ensure the device you're testing on has Bluetooth enabled

4. If you get WiFi or network-related errors:
   - Verify NSLocalNetworkUsageDescription is properly set
   - Check that Bonjour services are listed in NSBonjourServices
   - Confirm the networking entitlements are properly configured

## Post-Build Testing

After successfully building the app, test the proximity features:
1. Enable Bluetooth and WiFi on the test device
2. Navigate to the NearbyMembers screen
3. Enable discovery
4. Test with another device to confirm that proximity discovery works correctly

Good luck with your build! If you encounter any issues not covered in this checklist, consult the React Native and Expo documentation for additional guidance.