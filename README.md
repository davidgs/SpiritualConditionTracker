# Spiritual Condition Tracker

A React Native application for tracking recovery in Alcoholics Anonymous.

![Spiritual Condition Tracker Logo](expo-app/assets/logo.png)

## Features

- **Activity Tracking**: Log meetings, prayer, meditation, and more
- **Spiritual Fitness Score**: Calculate recovery progress with a proprietary algorithm
- **Sobriety Counter**: Track days and years of sobriety
- **Meeting Management**: Save and organize your regular AA meetings
- **Nearby Members**: Connect with other AA members in your vicinity
- **Privacy-First Design**: All data is stored locally on your device

## Technology Stack

- React Native (pure native build)
- SQLite for local database storage
- No backend dependencies - runs completely on the device

## Development

### Prerequisites

- Node.js
- React Native CLI
- Xcode (for iOS builds)
- Android Studio (for Android builds)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx react-native start
```

4. Run on iOS:

```bash
npx react-native run-ios
```

5. Run on Android:

```bash
npx react-native run-android
```

## Building for Production

### Using EAS Build (Recommended)

The project is configured to use EAS Build, which handles iOS and Android builds in the cloud.

#### Prerequisites

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account:

```bash
eas login
```

#### Building

The project includes build scripts that handle dependency fixes and build configuration:

1. For iOS:

```bash
# Make script executable
chmod +x ./expo-app/local-ios-build.sh

# Run the build script
./expo-app/local-ios-build.sh
```

2. For Android:

```bash
# Make script executable
chmod +x ./expo-app/local-android-build.sh

# Run the build script
./expo-app/local-android-build.sh
```

### Troubleshooting Build Issues

If you encounter dependency conflicts or module resolution errors:

1. Run the fix-dependencies script:

```bash
chmod +x ./expo-app/fix-dependencies.sh
./expo-app/fix-dependencies.sh
```

2. For React version conflicts specifically:

```bash
chmod +x ./expo-app/downgrade-react.sh
./expo-app/downgrade-react.sh
```

3. Check the troubleshooting guide for more information:

```
expo-app/eas-build-troubleshooting.md
```

### Manual Building (Alternative)

#### iOS

1. Open the project in Xcode:

```bash
npx expo prebuild --platform ios
open ios/SpiritualConditionTracker.xcworkspace
```

2. Select the desired scheme and device
3. Build and archive the application

#### Android

1. Generate a signed APK:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

2. The APK will be available at `android/app/build/outputs/apk/release/app-release.apk`

## Privacy

This application stores all data locally on the user's device. No data is shared with any external services or servers. Proximity discovery features only share the minimum amount of information necessary for connection.