# Android Build Guide for Spiritual Condition Tracker

This guide explains how to build the Android version of the Spiritual Condition Tracker app using Expo EAS Build.

## Prerequisites

Before building the Android app, ensure you have the following:

1. A Google Play Developer account ($25 one-time fee) if publishing to Google Play
2. Proper Android credentials configured:
   - Keystore file (.jks)
   - Keystore password, key alias, and key password
3. Expo account with EAS access
4. Node.js and npm installed
5. Expo CLI and EAS CLI installed

## Required Configuration Files

The project includes the following configuration files for building:

- **app.json**: Contains the app configuration including package name, version, and permissions
- **eas.json**: Contains the EAS build profiles and settings
- **credentials.json**: Contains paths to your Android keystore and related passwords

## Build Methods

You have three ways to build the Android app:

### Method 1: Using npm script

```bash
cd expo-app
npm run build:android
```

This will build using the predefined "native" profile in eas.json, which produces an APK file.

### Method 2: Using the build script

```bash
cd expo-app
./build-android.sh
```

This interactive script will ask you which build profile to use and handle the build process.

### Method 3: Using EAS CLI directly

```bash
cd expo-app
npx eas build --platform android --profile <profile-name>
```

Replace `<profile-name>` with one of the following:
- `development`: For development and testing
- `native`: Internal distribution with APK format
- `preview`: Internal distribution
- `production`: For Google Play submissions (AAB format)

## Build Profiles Explained

The app has different build profiles configured in eas.json:

1. **development**: Builds a development client that can be used for testing on physical devices.
2. **native**: Builds an Android APK for direct installation.
3. **preview**: Creates an internal distribution build suitable for testing.
4. **production**: Prepares an Android App Bundle (AAB) for Google Play submission.

## Android Credentials

The app uses the following Android credentials:

- **Package Name**: `com.aarecovery.tracker`
- **Version Code**: Incremented automatically by EAS
- **Required Permissions**:
  - Calendar access for meeting management
  - Location access for nearby features
  - Bluetooth for member discovery

## Testing the Build

Once your build is complete:

1. Download the .apk file from the EAS dashboard
2. Install directly on Android devices (enable "Unknown sources" in settings)
3. Or use Internal Testing tracks in Google Play Console

## Signing the App

Android apps must be signed before distribution. The app is configured to use a keystore file for signing. This keystore should be securely stored and backed up, as losing it means you cannot update the app on Google Play.

If you don't provide a keystore, EAS will generate one for you, but you must download and save it for future updates.

## Troubleshooting

If you encounter build issues:

1. Check the EAS build logs for detailed error messages
2. Verify your keystore file and credentials are correct
3. Ensure you have the necessary permissions configured in app.json
4. For crashes, check the Android logcat output

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Developer Documentation](https://developer.android.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)