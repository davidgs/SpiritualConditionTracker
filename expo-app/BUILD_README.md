# Building the Spiritual Condition Tracker App

This document provides an overview of the build process for the Spiritual Condition Tracker app for both iOS and Android platforms.

## Getting Started

The Spiritual Condition Tracker app is built using Expo and React Native. The build process is handled by EAS (Expo Application Services), which provides cloud builds for both iOS and Android.

### Authentication Setup

Before building, you need to authenticate with EAS:

1. **Generate an EAS token**: Follow the instructions in `generate-eas-token.md`
2. **Set up the token**: Run `npm run setup-token` and follow the prompts
3. **Store the token**: Add it to Replit Secrets as `EXPO_TOKEN`

## Build Tools

The following build tools and scripts are included in this project:

1. **build-ios.sh**: Interactive script for building the iOS app
2. **build-android.sh**: Interactive script for building the Android app
3. **eas-login.sh**: Helper script for logging into EAS
4. **setup-eas-token.sh**: Helper script for setting up authentication tokens
5. **check-build-environment.sh**: Tool to verify your build environment is properly configured

## Build Process Overview

The build process involves the following steps:

1. **Login to EAS**: Authenticate with EAS using your Expo account
2. **Select a Build Profile**: Choose between development, native, preview, or production
3. **Configure Credentials**: Provide iOS certificates or Android keystore details
4. **Trigger Build**: EAS builds the app in the cloud
5. **Download Build**: Download the resulting IPA (iOS) or APK/AAB (Android) file

## Available NPM Scripts

For convenience, several npm scripts are included in package.json:

```json
"scripts": {
  "build:android": "eas build --platform android --profile native --non-interactive",
  "build:ios": "eas build --platform ios --profile native --non-interactive",
  "build:preview": "eas build --profile preview --non-interactive"
}
```

## Configuration Files

The build process relies on the following configuration files:

- **app.json**: App metadata, permissions, and platform-specific settings
- **eas.json**: EAS build configuration with different profiles
- **credentials.json**: Paths to certificates and keystores

## Credentials Requirements

### iOS Credentials
- Apple Developer Account
- Distribution Certificate
- Provisioning Profile

### Android Credentials
- Keystore File (.jks)
- Keystore Password
- Key Alias
- Key Password

## Detailed Build Guides

For detailed platform-specific instructions, refer to:

- [iOS Build Guide](ios-build-guide.md)
- [Android Build Guide](android-build-guide.md)

## Troubleshooting

If you encounter build issues, check the following:

1. Ensure you're logged into EAS (`./eas-login.sh`)
2. Verify your credentials are correct
3. Check for any issues in your Apple Developer Account or Google Play Console
4. Review the build logs in the EAS Dashboard

## Updating the App

When updating the app:

1. Increment the version number in app.json
2. Use the same build profile and credentials for consistency
3. Submit the new build to the respective app stores

## Need Help?

If you need additional help with the build process, you can:

1. Check the [Expo documentation](https://docs.expo.dev/build/introduction/)
2. Visit the [Expo forums](https://forums.expo.dev/)
3. Contact the app developer for project-specific assistance