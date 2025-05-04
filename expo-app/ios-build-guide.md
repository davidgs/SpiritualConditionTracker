# iOS Build Guide for Spiritual Condition Tracker

This guide explains how to build the iOS version of the Spiritual Condition Tracker app using Expo EAS Build.

## Prerequisites

Before building the iOS app, ensure you have the following:

1. An Apple Developer account ($99/year)
2. Proper iOS credentials configured:
   - Distribution Certificate
   - Provisioning Profile
3. Expo account with EAS access
4. Node.js and npm installed
5. Expo CLI and EAS CLI installed

## Required Configuration Files

The project includes the following configuration files for building:

- **app.json**: Contains the app configuration including bundle identifier, version, and permissions
- **eas.json**: Contains the EAS build profiles and settings
- **credentials.json**: Contains paths to your iOS certificates and provisioning profiles

## Build Methods

You have three ways to build the iOS app:

### Method 1: Using npm script

```bash
cd expo-app
npm run build:ios
```

This will build using the predefined "native" profile in eas.json.

### Method 2: Using the build script

```bash
cd expo-app
./build-ios.sh
```

This interactive script will ask you which build profile to use and handle the build process.

### Method 3: Using EAS CLI directly

```bash
cd expo-app
npx eas build --platform ios --profile <profile-name>
```

Replace `<profile-name>` with one of the following:
- `development`: For development and testing
- `native`: Internal distribution with iOS-specific settings
- `preview`: Internal distribution
- `production`: For App Store submissions

## Build Profiles Explained

The app has different build profiles configured in eas.json:

1. **development**: Builds a development client that can be used for testing on physical devices.
2. **native**: Builds an iOS-specific distribution for internal testing with customized iOS settings.
3. **preview**: Creates an internal distribution build suitable for TestFlight.
4. **production**: Prepares a build for App Store submission.

## iOS Credentials

The app uses the following iOS credentials:

- **Bundle Identifier**: `com.aarecovery.tracker`
- **Build Number**: Incremented automatically by EAS
- **Required Permissions**:
  - Calendar access for meeting management
  - Location access for nearby features
  - Bluetooth for member discovery

## Testing the Build

Once your build is complete:

1. Download the .ipa file from the EAS dashboard
2. Install via TestFlight by uploading to App Store Connect
3. Or install directly using Apple Configurator 2

## Troubleshooting

If you encounter build issues:

1. Check the EAS build logs for detailed error messages
2. Ensure your Apple Developer account is active
3. Verify your certificates and provisioning profiles are valid
4. Make sure you've accepted all Apple agreements in App Store Connect

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [TestFlight Guide](https://developer.apple.com/testflight/)