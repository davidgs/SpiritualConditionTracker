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

- Node.js (v12 or higher)
- npm or yarn
- Expo CLI

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