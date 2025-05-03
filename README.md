# AA Recovery Tracker

A React Native application for tracking recovery in Alcoholics Anonymous.

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

### iOS

1. Open the project in Xcode:

```bash
open ios/AARecoveryTracker.xcworkspace
```

2. Select the desired scheme and device
3. Build and archive the application

### Android

1. Generate a signed APK:

```bash
cd android
./gradlew assembleRelease
```

2. The APK will be available at `android/app/build/outputs/apk/release/app-release.apk`

## Privacy

This application stores all data locally on the user's device. No data is shared with any external services or servers. Proximity discovery features only share the minimum amount of information necessary for connection.