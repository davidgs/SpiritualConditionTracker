# AA Recovery Tracker Mobile Build Guide

This guide provides comprehensive instructions for building the AA Recovery Tracker app for both iOS and Android platforms.

## Prerequisites

### Common Requirements
- Node.js v16 or higher
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Git

### iOS-Specific Requirements
- Mac computer running macOS 12 (Monterey) or later
- Xcode 14 or later
- Apple Developer account (for distribution)
- CocoaPods: `sudo gem install cocoapods`

### Android-Specific Requirements
- Android Studio
- Android SDK (API level 33 or higher recommended)
- Java Development Kit (JDK) 11 or higher
- Android device or emulator for testing

## Project Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd aa-recovery-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Verify installation:
   ```bash
   npx expo doctor
   ```

## Building for iOS

### Option 1: Local Development with Xcode

1. Generate iOS native files (if not already done):
   ```bash
   npx expo prebuild -p ios
   ```

2. Install CocoaPods dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. Open the Xcode workspace:
   ```bash
   open ios/AARecoveryTracker.xcworkspace
   ```

4. In Xcode:
   - Select your development team in the "Signing & Capabilities" tab
   - Update bundle identifier if needed
   - Ensure all capabilities are properly configured
   - Select your target device
   - Click the "Run" button (▶️) to build and run

### Option 2: EAS Build for iOS

1. Login to your Expo account:
   ```bash
   eas login
   ```

2. Configure the build profiles (already set up in eas.json)

3. Start the build:
   - Development build: `eas build -p ios --profile development`
   - Preview build: `eas build -p ios --profile preview`
   - Production build: `eas build -p ios --profile production`

4. Follow the on-screen instructions to complete the build process

5. For internal distribution:
   ```bash
   eas build:submit -p ios --profile preview
   ```

## Building for Android

### Option 1: Local Development with Android Studio

1. Generate Android native files (if not already done):
   ```bash
   npx expo prebuild -p android
   ```

2. Open the Android project in Android Studio:
   - Open Android Studio
   - Select "Open an existing project"
   - Navigate to the `android` directory in your project

3. Setup your device:
   - Connect a physical Android device via USB with Developer options and USB debugging enabled
   - OR setup an Android Virtual Device (emulator) through AVD Manager

4. Build and run:
   - Click the "Run" button (▶️) in Android Studio
   - Select your target device
   - Android Studio will build and install the app

### Option 2: Command-line Build

1. Configure signing for release builds:
   - Create a keystore file: 
     ```bash
     keytool -genkey -v -keystore aa-recovery-keystore.jks -alias aa-recovery -keyalg RSA -keysize 2048 -validity 10000
     ```
   - Move the keystore to `android/app/`
   - Configure keystore details in `android/gradle.properties` (see example in android-keystore-example.properties)

2. Build the APK:
   - Debug build: 
     ```bash
     cd android && ./gradlew assembleDebug
     ```
   - Release build: 
     ```bash
     cd android && ./gradlew assembleRelease
     ```

3. Find the output APK:
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release.apk`

### Option 3: EAS Build for Android

1. Login to your Expo account:
   ```bash
   eas login
   ```

2. Start the build:
   - Development build: `eas build -p android --profile development`
   - Preview build: `eas build -p android --profile preview`
   - Production build: `eas build -p android --profile production`

3. For internal distribution:
   ```bash
   eas build:submit -p android --profile preview --track internal
   ```

## App Store Submissions

### App Store (iOS)

1. Prepare assets:
   - App icon (all required sizes)
   - Screenshots (iPhone and iPad if supporting both)
   - App description and metadata

2. Submit via App Store Connect:
   - Login to [App Store Connect](https://appstoreconnect.apple.com/)
   - Create a new app
   - Fill in all required information
   - Upload build (either directly from Xcode or using EAS Submit)
   - Submit for review

### Google Play Store (Android)

1. Prepare assets:
   - App icon
   - Feature graphic (1024x500 px)
   - Screenshots (various device sizes)
   - App description and metadata

2. Submit via Google Play Console:
   - Login to [Google Play Console](https://play.google.com/console/)
   - Create a new application
   - Fill in all required information
   - Upload build (AAB file from EAS Build or Gradle)
   - Submit for review

## CI/CD Automation

For automated builds, consider setting up:

1. GitHub Actions workflow for build automation
2. Fastlane for streamlined deployment
3. EAS Update for over-the-air updates

Example EAS Update command:
```bash
eas update --branch production --message "Update with bug fixes"
```

## Troubleshooting

### Common iOS Issues

- **Signing issues**: Check your Apple Developer account and provisioning profiles
- **CocoaPods errors**: Try `pod deintegrate` then `pod install` again
- **Build errors**: Check Xcode version compatibility and update SDKs if needed

### Common Android Issues

- **Gradle sync failed**: Update Gradle and check dependency compatibility
- **Signing config errors**: Verify keystore file path and credentials
- **SDK issues**: Make sure Android SDK components are up to date

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [iOS-specific guide](./ios-development-guide.md)
- [Android-specific guide](./android-development-guide.md)