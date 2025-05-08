# iOS Xcode Build Checklist

Use this checklist to ensure a successful build of the Spiritual Condition Tracker in Xcode.

## Before Opening Xcode

- [ ] Run the prepare-ios-build.sh script
- [ ] Verify iOS directory was created in expo-app folder
- [ ] Verify CocoaPods dependencies were installed

## Xcode Project Setup

- [ ] Open the `.xcworkspace` file (not the .xcodeproj)
- [ ] Select the main target in the project navigator
- [ ] Go to Signing & Capabilities tab
- [ ] Select your development team
- [ ] Ensure "Automatically manage signing" is checked
- [ ] Wait for provisioning profile generation to complete

## Build Configuration

- [ ] Set the build scheme to "Debug" for testing or "Release" for production
- [ ] Select a simulator or connected device as the build target
- [ ] Clean the build folder (Product > Clean Build Folder)

## Required Capabilities Verification

Ensure these capabilities are properly configured:

- [ ] Background Modes (Required for Bluetooth and background operations)
  - [ ] Bluetooth (Central & Peripheral)
  - [ ] Location updates
  - [ ] Background fetch

- [ ] Privacy permissions in Info.plist:
  - [ ] NSCalendarsUsageDescription (Calendar access)
  - [ ] NSLocationWhenInUseUsageDescription (Location access)
  - [ ] NSBluetoothAlwaysUsageDescription (Bluetooth access)
  - [ ] NSBluetoothPeripheralUsageDescription (Bluetooth peripheral access)

## SQLite Configuration

- [ ] Verify SQLite libraries are properly linked:
  - [ ] libsqlite3.tbd is in the "Link Binary with Libraries" build phase
  - [ ] Pods for react-native-sqlite-storage are installed

## Common Build Errors

If you encounter any of these issues, here are potential solutions:

### Build Failed: "Module not found"
- Clean build folder and rebuild
- Run `pod install` again in the iOS directory

### SQLite Errors
- Check database path configuration in database.ios.js
- Verify SQLite libraries are properly linked

### Missing Icon Fonts
- Check that all fonts are in assets/fonts directory
- Run `npx react-native-asset` to link the fonts
- Clean and rebuild the project

### Signing Issues
- Verify Apple Developer account is valid
- Try refreshing provisioning profiles in Xcode
- Check bundle identifier matches your provisioning profile

## Distribution Preparation

When ready to create an archive for distribution:

- [ ] Update version and build number in app.json
- [ ] Set build scheme to "Release"
- [ ] Select "Any iOS Device (arm64)" as the build target
- [ ] Product > Archive
- [ ] Follow Xcode distribution workflow for TestFlight or App Store