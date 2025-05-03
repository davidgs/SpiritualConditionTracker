# Pure React Native iOS Build Guide

This guide explains how to build the AA Recovery Tracker iOS app using pure React Native (no Expo dependencies).

## Setup Environment

1. **Node.js**: Make sure you have Node.js installed (version 16 or higher recommended)
2. **Ruby/CocoaPods**: Required for iOS builds (Ruby 2.6+ and CocoaPods 1.10+)
3. **Xcode**: Version 14.0 or higher recommended

## Build Process

### 1. Install JavaScript Dependencies

```bash
npm install
```

### 2. Run the iOS Build Setup Script

```bash
cd ios
./setup-build-env.sh
```

This script will:
- Set up the build environment
- Install CocoaPods dependencies
- Fix any issues with the transition from Expo to pure native
- Create the Xcode workspace

### 3. Open the Project in Xcode

```bash
open ios/AARecoveryTracker.xcworkspace
```

**Important**: Always open the `.xcworkspace` file, not the `.xcodeproj` file.

### 4. Build and Run in Xcode

- Select your target device/simulator
- Click the "Play" button to build and run

## Troubleshooting

### Native Module Issues

If you encounter `Error: Cannot find module 'X'` or similar, make sure the corresponding native module is properly installed and linked:

```bash
# Example for a missing module
npm install --save the-missing-module
cd ios && pod install
```

### Pod Installation Failures

If pod installation fails, try:

```bash
cd ios
./setup-build-env.sh --clean-pods
```

This will completely clean the Pods directory and reinstall.

### Workspace Issues

If Xcode is unable to open the workspace or you see "No such file or directory" errors:

```bash
cd ios
./force-workspace-creation.sh
```

### Strange Build Errors

If you encounter unexpected build errors related to Expo or configuration issues:

```bash
cd ios
./fix-expo-configure.sh
```

## SQLite Database Integration

The app uses `react-native-sqlite-storage` for local data storage. The native modules have been correctly configured in the Podfile.

## Reminder: No Expo Dependencies

This build configuration uses pure React Native without any Expo dependencies. All former Expo modules have been replaced with their React Native equivalents:

- `expo-location` → `react-native-geolocation`
- `expo-calendar` → `react-native-calendar-events`
- `expo-notifications` → `react-native-notifications`
- `expo-device` → `react-native-device-info`