# Build Instructions for Spiritual Condition Tracker

This document provides detailed instructions for building the iOS and Android versions of the Spiritual Condition Tracker app using EAS (Expo Application Services).

## Prerequisites

- Node.js installed on your local machine
- Expo CLI installed: `npm install -g expo-cli`
- EAS CLI installed: `npm install -g eas-cli`
- An Expo account (create one at https://expo.dev/signup if needed)

## Authentication

Make sure you're logged in to your Expo account:

```bash
eas login
```

## iOS Build

To build the iOS version of the app:

1. Navigate to the project directory:
   ```bash
   cd expo-app
   ```

2. Start the iOS build:
   ```bash
   eas build --platform ios --profile native
   ```

3. Follow the prompts to set up iOS credentials:
   - If you have an Apple Developer account, you'll be asked to log in
   - EAS can handle certificate and provisioning profile generation for you
   - For distribution type, choose "Development" for testing or "Ad-hoc" for distribution to specific devices

4. The build will be processed on EAS servers and you'll be notified when it's complete
   - You can monitor the build status at: https://expo.dev/accounts/davidgs/projects/spiritual-condition-tracker/builds

5. Once complete, you can download the .ipa file from the EAS website

## Android Build

To build the Android version of the app:

1. Navigate to the project directory:
   ```bash
   cd expo-app
   ```

2. Start the Android build:
   ```bash
   eas build --platform android --profile native
   ```

3. Follow the prompts to set up Android credentials:
   - EAS can generate a new keystore for you if you don't have one
   - Or you can upload your existing keystore

4. The build will be processed on EAS servers and you'll be notified when it's complete
   - You can monitor the build status at: https://expo.dev/accounts/davidgs/projects/spiritual-condition-tracker/builds

5. Once complete, you can download the .apk file from the EAS website

## Build Configuration

The build configuration is defined in the `eas.json` file. The "native" profile is configured for both iOS and Android with the following settings:

- iOS: Internal distribution with default resource class
- Android: APK build type with internal distribution

You can modify these settings in the `eas.json` file if needed.

## App Configuration

The app configuration is defined in the `app.json` file, including:

- Bundle identifiers: `com.davidgs.spiritualconditiontracker`
- Permissions required by the app
- Icons and splash screens

## Troubleshooting

If you encounter any issues during the build process:

1. Check the build logs on the EAS website
2. Make sure your EXPO_TOKEN environment variable is correctly set
3. Verify that your app.json is properly configured
4. Ensure you have the necessary Apple Developer or Google Play Developer accounts with valid memberships

## Additional Resources

- [EAS Build documentation](https://docs.expo.dev/build/introduction/)
- [iOS-specific build configuration](https://docs.expo.dev/build-reference/ios-builds/)
- [Android-specific build configuration](https://docs.expo.dev/build-reference/android-builds/)