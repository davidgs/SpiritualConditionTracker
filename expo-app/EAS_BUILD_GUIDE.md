# EAS Build Guide for Spiritual Condition Tracker

This guide explains how to build the Spiritual Condition Tracker app using EAS (Expo Application Services).

## Prerequisites

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Set up your EXPO_TOKEN (for CI/CD):
```bash
export EXPO_TOKEN=your_expo_token
```

## Configuration Files

The app's build configuration is defined in several key files:

- **eas.json**: Main configuration for EAS builds
- **app.json**: Expo app configuration with native settings
- **metro.config.js**: Metro bundler configuration
- **eas-hooks/eas-build-pre-install.sh**: Pre-install script for build fixes

## Running an iOS Build

From the `expo-app` directory:

```bash
# For internal testing build
eas build --platform ios --profile preview --no-wait

# For production build
eas build --platform ios --profile production --no-wait
```

## Build Profiles

The `eas.json` file defines several build profiles:

- **development**: For development client builds
- **preview**: For internal testing builds
- **native**: Custom native build with iOS/Android specific settings
- **production**: For App Store/Play Store builds

## Important Fixes

The app includes several fixes for common EAS build issues:

1. **C++ Compatibility**: The pre-install script automatically fixes C++ `.contains()` method calls.
2. **Dependency Resolution**: Key dependencies are ensured via the pre-install script.
3. **Metro Configuration**: Proper module resolution is configured in metro.config.js.
4. **Font Assets**: React Native Vector Icons are properly set up.

## Troubleshooting

If your build fails, check the following:

1. **EAS Build Logs**: Use the EAS dashboard to view detailed build logs.
2. **Pre-install Script**: Ensure the pre-install script executed properly.
3. **Dependency Issues**: Check for missing or incompatible dependencies.

For specific issues, run a build with verbose logging:

```bash
eas build --platform ios --profile preview --no-wait --verbose
```

## Notes

- The app uses version 1.0.6 with build number 6 for iOS
- The project uses a custom metro.config.js for proper module resolution
- C++ compatibility fixes ensure proper native module compilation
- AsyncStorage and react-native-paper-dates are properly configured