# AA Recovery Tracker

A React Native mobile application for tracking AA (Alcoholics Anonymous) recovery journey. The app allows users to check in to meetings, log prayer and meditation time, record time spent reading AA literature, and track interactions with sponsors and sponsees.

## Features

- **Activity Logging**: Log various recovery activities such as meetings, meditation, reading, service work, etc.
- **Spiritual Fitness Score**: Calculate a "Spiritual Fitness" score based on your recovery activities
- **Meeting Finder**: Find real AA meetings in your area using the Meeting Guide API
- **Nearby Members**: Discover other AA members nearby (based on user preference and location)
- **Privacy-Focused**: All user data is stored locally on the device using SQLite
- **Sobriety Tracker**: Track your sobriety time in days and years

## Technology Stack

- **React Native**: Mobile app framework
- **Expo**: Development platform for React Native
- **SQLite**: Local database storage via Expo SQLite
- **React Navigation**: Tab-based navigation
- **Expo Location**: Location services for nearby features
- **Meeting Guide API**: Real AA meeting data from various regions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- For iOS development:
  - macOS computer
  - Xcode 14 or higher
  - Apple Developer account (for testing on physical devices and distribution)
- For Android development:
  - Android Studio
  - Android SDK
  - Java Development Kit (JDK)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   expo start
   ```

4. Run on device/emulator:
   - Use the Expo Go app on your physical device
   - Press 'a' for Android emulator or 'i' for iOS simulator

### Building for iOS using Xcode

1. Generate native iOS files (already completed in this repository):
   ```
   npx expo prebuild -p ios
   ```

2. Install CocoaPods dependencies:
   ```
   cd ios
   pod install
   cd ..
   ```

3. Open the Xcode project:
   ```
   open ios/AARecoveryTracker.xcworkspace
   ```

4. In Xcode:
   - Select a development team in the "Signing & Capabilities" tab
   - Update bundle identifier if needed (current: com.example.aarecoverytracker)
   - Enable necessary capabilities (HealthKit, Push Notifications, etc.)
   - Select a target device (simulator or connected device)
   - Click the "Run" button to build and run the app

### Building for Distribution

#### Using EAS Build (Recommended)

1. Login to your Expo account:
   ```
   eas login
   ```

2. Configure build:
   ```
   eas build:configure
   ```

3. Start the build process:
   - For iOS: `eas build -p ios`
   - For Android: `eas build -p android`

4. Follow the on-screen instructions to complete the build process

#### Manual Archive for App Store

1. In Xcode, select "Any iOS Device" as the build target
2. Select Product > Archive
3. After archiving completes, use the Organizer window to validate and upload to App Store Connect

## Privacy

This app is designed with privacy in mind:
- All user data is stored locally on the device
- No data is transmitted to any server except when:
  - Fetching meeting data from the Meeting Guide API
  - Using optional location features (when enabled by the user)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.