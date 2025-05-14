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

1. **For local development:**
   Use the provided EAS hooks:

   ```bash
   # Run pre-install hook to fix package.json
   chmod +x ./eas-hooks/eas-build-pre-install.sh
   ./eas-hooks/eas-build-pre-install.sh
   
   # Install dependencies with legacy peer deps
   npm install --legacy-peer-deps
   
   # Run post-install hook to fix module structure
   chmod +x ./eas-hooks/eas-build-post-install.sh
   ./eas-hooks/eas-build-post-install.sh
   ```

2. **For EAS builds:**
   Use the pre-configured hooks in eas.json:

   ```json
   "prebuildCommand": "chmod +x ./eas-hooks/eas-build-pre-install.sh && ./eas-hooks/eas-build-pre-install.sh",
   "postInstallCommand": "chmod +x ./eas-hooks/eas-build-post-install.sh && ./eas-hooks/eas-build-post-install.sh"
   ```

3. **Quick Fix:**
   Manually modify package.json to use React 18:

   ```json
   "dependencies": {
     "react": "18.2.0",
     "react-dom": "18.2.0"
   }
   ```

## Module Resolution Issues

### `Cannot find module 'minimatch/dist/commonjs/index.js'`

This error occurs when the minimatch module structure doesn't match what EAS Build expects.

**Solution:**

1. **Use the eas-hooks system (recommended):**

   The project includes pre and post-install hooks that automatically fix this issue:

   ```bash
   # Run post-install hook to fix minimatch structure
   chmod +x ./eas-hooks/eas-build-post-install.sh
   ./eas-hooks/eas-build-post-install.sh
   ```

2. **Manual fix:**

   If the hook doesn't work, manually fix the module structure:

   ```bash
   # Create directory structure
   mkdir -p node_modules/minimatch/dist/commonjs
   
   # Create re-export file if minimatch.js exists
   if [ -f node_modules/minimatch/minimatch.js ]; then
     cp node_modules/minimatch/minimatch.js node_modules/minimatch/dist/commonjs/index.js
   else
     echo "module.exports = require('../../minimatch.js');" > node_modules/minimatch/dist/commonjs/index.js
   fi
   ```

3. **Use the `--preserve-symlinks` Node option:**

   This is already configured in the eas.json file, but can be set manually:

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

For the most reliable builds, follow these steps:

### Method 1: Using Local Build Scripts (Recommended)

The project provides complete build scripts that handle all dependency fixes:

1. For iOS:
   ```bash
   chmod +x ./local-ios-build.sh
   ./local-ios-build.sh
   ```

2. For Android:
   ```bash
   chmod +x ./local-android-build.sh
   ./local-android-build.sh
   ```

### Method 2: Manual EAS Build

If you need to manually trigger builds:

1. Run the dependency fix hooks first:
   ```bash
   chmod +x ./eas-hooks/eas-build-pre-install.sh
   ./eas-hooks/eas-build-pre-install.sh
   
   npm install --legacy-peer-deps
   
   chmod +x ./eas-hooks/eas-build-post-install.sh
   ./eas-hooks/eas-build-post-install.sh
   ```

2. Start the build with the `--no-wait` flag:
   ```bash
   export NODE_OPTIONS="--preserve-symlinks"
   eas build --platform [ios|android] --profile native --no-wait
   ```

3. Monitor build progress in the Expo dashboard

### Method 3: CI/CD Setup

For continuous integration:

1. Use GitHub Actions or similar CI/CD platform
2. Include the hooks in your CI/CD workflow
3. Trigger EAS builds with the proper environment variables set:
   ```
   NODE_OPTIONS="--preserve-symlinks" 
   EXPO_IMAGE_UTILS_NO_SHARP="1"
   ```