# Building the iOS App Natively (Without Expo)

This guide explains how to build the AA Recovery Tracker iOS app using native build tools and without Expo dependencies. This approach resolves the expo-configure-project.sh issues and other Expo-related build problems.

## Prerequisites

- macOS with Xcode 14+ installed
- CocoaPods installed (`sudo gem install cocoapods`)
- Node.js and npm installed

## Building the App

### Step 1: Set up Build Environment

1. Run the setup script to prepare your environment:
   ```bash
   cd ios
   chmod +x setup-build-env.sh
   ./setup-build-env.sh
   ```

2. If you encounter any issues, run with the clean option:
   ```bash
   ./setup-build-env.sh --clean-pods
   ```

### Step 2: Open in Xcode

1. Open the Xcode workspace file (not the project file):
   ```bash
   open ios/AARecoveryTracker.xcworkspace
   ```

2. Select your development team under Signing & Capabilities
   - Select the AARecoveryTracker target
   - Go to Signing & Capabilities tab
   - Choose your development team from the dropdown

### Step 3: Build and Run

1. Select a simulator or connected device from the target dropdown
2. Click the Play button to build and run the app

## Troubleshooting

### If the build fails with "expo-configure-project.sh" errors:

1. Run the Expo fix script:
   ```bash
   cd ios
   ./fix-expo-configure.sh
   ```

2. Clean the build:
   ```bash
   cd ios
   xcodebuild clean -workspace AARecoveryTracker.xcworkspace -scheme AARecoveryTracker
   ```

3. Try rebuilding

### If there are permission issues or paths not found:

1. Make sure all scripts are executable:
   ```bash
   chmod +x ios/*.sh
   ```

2. Check the Node.js path by running:
   ```bash
   which node
   ```

3. Update the .xcode.env file with your Node path:
   ```bash
   echo "export NODE_BINARY=$(which node)" > ios/.xcode.env
   ```

### For other build issues:

Refer to the detailed troubleshooting guide:
```
ios-build-troubleshooting.md
```

## Important Note on Expo Dependencies

This app has been converted to use fully native iOS and Android builds instead of relying on Expo. The app.json configuration has been updated, and the Podfile now uses standard React Native dependencies without requiring Expo modules.

If you need to add new native components, you should use standard React Native linking methods:

```bash
npm install <package-name>
cd ios && pod install
```