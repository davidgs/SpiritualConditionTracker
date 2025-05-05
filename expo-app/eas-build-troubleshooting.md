# EAS Build Troubleshooting Guide

This guide addresses common issues encountered when building with EAS Build.

## Dependency Conflicts

### React Version Conflicts

Error similar to:
```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: react@19.1.0
npm error Could not resolve dependency:
npm error peer react@"^18.0.0" from react-native-web@0.19.13
```

This error occurs when React 19 is installed but dependencies like react-native-web require React 18.

**Solution:**

1. Use `--legacy-peer-deps` flag when installing:

```bash
npm install --legacy-peer-deps
```

2. Update the fix-dependencies.sh script to include this flag:

```bash
./fix-dependencies.sh
```

3. If the above doesn't work, use the provided downgrade script:

```bash
# This will downgrade React to version 18.2.0 which is compatible with react-native-web
chmod +x ./downgrade-react.sh
./downgrade-react.sh
```

4. For manual resolution, downgrade React version to 18.2.0 in package.json:

```json
"dependencies": {
  "react": "^18.2.0"
}
```

## Module Resolution Issues

### `Cannot find module 'minimatch/dist/commonjs/index.js'`

This error occurs when the minimatch module structure doesn't match what EAS Build expects.

**Solution:**

1. Make sure minimatch is explicitly added to your dependencies:

```json
"dependencies": {
  "minimatch": "^9.0.3"
}
```

2. Run the `fix-dependencies.sh` script before building:

```bash
chmod +x ./fix-dependencies.sh
./fix-dependencies.sh
```

3. Use the `--preserve-symlinks` Node option:

```bash
export NODE_OPTIONS="--preserve-symlinks"
eas build [options]
```

## Yoga/React Native Component Errors

### Errors like `'Edges' is a private member of 'facebook::yoga::Style'`

These errors indicate compatibility issues between React Native components.

**Solution:**

1. Make sure all React Native packages are on compatible versions
2. Specifically for safe-area-context, use version 4.8.1:

```json
"react-native-safe-area-context": "4.8.1"
```

3. Use a specific build configuration in eas.json:

```json
"ios": {
  "buildConfiguration": "Release",
  "env": {
    "EXPO_IMAGE_UTILS_NO_SHARP": "1"
  }
}
```

## Build Failures or Timeouts

### Build fails with timeout or unexplained error

**Solution:**

1. Use the `--no-wait` flag with EAS Build to initiate the build without waiting:

```bash
eas build --platform ios --profile native --no-wait
```

2. Monitor build progress in the Expo website dashboard
3. Consider using a local build if EAS Build continues to fail

## iOS Specific Issues

### CoreBluetooth Errors

If you encounter CoreBluetooth symbol errors:

1. Ensure proper permissions are in app.json:

```json
"ios": {
  "infoPlist": {
    "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth to connect with nearby AA members.",
    "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth to connect with nearby AA members.",
    "UIBackgroundModes": ["bluetooth-central", "bluetooth-peripheral"]
  }
}
```

2. Include proper native module implementations:

```js
// Use react-native-ble-plx instead of expo-bluetooth
import { BleManager } from 'react-native-ble-plx';
```

## Android Specific Issues

### Android SDK or JDK Issues

If you encounter Android SDK or JDK errors:

1. Make sure your local environment has correct versions:
   - JDK 11 or 17
   - Android SDK 33+

2. Use the 'latest' image in eas.json:

```json
"android": {
  "image": "latest"
}
```

## Getting Help from EAS Support

If issues persist:

1. Run `eas diagnostics` to get system details
2. Contact Expo support with your build ID
3. Include detailed error messages and project configuration

## Recommended Build Process

For the most reliable builds:

1. Always run `fix-dependencies.sh` before building
2. Use the `--no-wait` flag for EAS builds
3. Monitor in the Expo developer dashboard
4. Consider setting up CI/CD for automated builds once the configuration is stable