# EAS Build Configuration Guide

This document outlines the configuration and setup for EAS (Expo Application Services) builds for the Spiritual Condition Tracker app.

## Configuration Files

### 1. `eas.json`
- Main configuration file for EAS builds
- Defines build profiles (development, preview, production)
- Configures build environment variables
- Specifies resource classes and caching settings

### 2. `app.config.js`
- Dynamic Expo configuration with version detection
- Configures app permissions, plugins and capabilities
- Manages build numbers and version strings
- Sets up iOS and Android specific settings

### 3. `metro.config.js`
- Configures Metro bundler for proper dependency resolution
- Sets up asset extensions and transformer paths
- Ensures correct module resolution across nested directories
- Handles proper React Native/Expo integration

## Environment Variables

The following environment variables are used:

- `EXPO_TOKEN`: Required for authentication with EAS services
- `NODE_OPTIONS="--max-old-space-size=8192"`: Prevents memory issues during builds
- `EXPO_DEBUG=1`: Enables verbose logging for troubleshooting
- `EAS_BUILD_CACHE=0`: Disables caching for clean builds when needed
- `EXPO_NO_DOCTOR=1`: Bypasses environment checks for faster builds

## Build Scripts

### `setup-eas-credentials.sh`
- Authenticates with EAS using EXPO_TOKEN
- Verifies login status
- Sets up build credentials for iOS

### `eas-build-pre-install.sh`
- Runs before the EAS build process
- Installs critical dependencies
- Creates symlinks for proper module resolution
- Verifies Podfile configuration

### `run-eas-build.sh`
- Main entry point for running builds
- Configures build profile and platform
- Sets up necessary environment variables
- Initiates the build process

## Dependency Management

Key dependencies required for builds:

- `@expo/metro-config`: For Metro bundler configuration
- `metro-react-native-babel-transformer`: For proper JavaScript transpilation
- `@react-native-async-storage/async-storage`: For local data persistence
- `expo-build-properties`: For iOS and Android build configuration
- `react-native-paper-dates`: For date picker functionality (replacement for DateTimePicker)

## iOS Build Configuration

- Uses static frameworks via `expo-build-properties`
- Sets minimum iOS deployment target to 13.0
- Configures necessary permissions in Info.plist
- Uses automatic provisioning profile management

## iOS Build Troubleshooting

Common build issues:

1. **C++ Compatibility Issues**: Fixed by modifying `.contains()` method calls to use `.find() != .end()` in native code
2. **Module Resolution Errors**: Fixed with proper configuration in metro.config.js
3. **Missing Dependencies**: Addressed in eas-build-pre-install.sh
4. **Pod Installation Failures**: Fixed with proper C++20 configuration in Podfile

## Notes on Incremental Fixes

- Removed all references to deprecated `DateTimePicker` and replaced with `react-native-paper-dates`
- Fixed C++ compatibility issues in React Native native code
- Improved EAS configuration for more reliable builds
- Added proper version tracking and build timestamps