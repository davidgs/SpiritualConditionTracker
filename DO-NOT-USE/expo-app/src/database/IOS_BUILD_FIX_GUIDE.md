# iOS Build Fix Guide

This guide documents the steps taken to fix iOS build issues with React Native 0.79.x and Expo, particularly focused on resolving the missing header files and Codegen errors.

## Problem Summary

The iOS build was failing with multiple errors:

1. Missing header files:
   - `react/bridging/CallbackWrapper.h`
   - `react/bridging/LongLivedObject.h`
   - `react/debug/react_native_assert.h`

2. Architecture exclusion issues:
   - Targets like `React-Fabric`, `React-RCTFabric`, and `ReactAppDependencyProvider` were having architecture conflicts

3. Codegen errors:
   - "Codegen did not run properly in your project"

## Solution Overview

Our approach uses several key strategies:

1. **Disable New Architecture**: We completely disable all New Architecture features including Fabric, Codegen, and Hermes.

2. **File Patching**: We modify problematic source files to comment out references to missing headers.

3. **Empty Header Placeholders**: We create empty placeholder files for missing headers to satisfy the compiler.

4. **Architecture Exclusions**: We exclude critical architectures for problematic targets to prevent them from building.

5. **Environment Variables**: We set comprehensive environment variables to ensure consistent configuration.

## Implementation Details

### 1. Updated Podfile

The Podfile has been simplified to focus on the core issues:

- Setting environment variables to disable all New Architecture features
- Removing problematic files from build phases
- Adding important header search paths
- Completely disabling problematic targets 

### 2. Enhanced Pre-install Script

The `eas-hooks/eas-build-pre-install.sh` script now:

- Patches TurboModuleUtils.cpp, TurboModuleUtils.h, and TurboModuleBinding.cpp
- Comments out references to missing headers
- Creates empty placeholder files for missing bridging headers
- Updates app.json to disable the New Architecture

### 3. EAS Build Configuration

The eas.json file includes:

- Comprehensive environment variables to disable New Architecture features
- A prebuildCommand that runs our pre-install script
- Consistent configuration across preview and native iOS builds

## Testing and Verification

These changes should be tested with:

1. Local development: `npx expo run:ios`
2. EAS build: `npx eas-cli build --platform ios --profile preview`

## Troubleshooting Tips

If you encounter additional issues:

1. Check the build logs for specific file references causing errors
2. Consider adding those files to the exclusion list or patching them
3. Verify that all environment variables are properly set
4. Ensure the pre-install script is executing correctly
5. If needed, update the placeholder approach to handle additional missing files