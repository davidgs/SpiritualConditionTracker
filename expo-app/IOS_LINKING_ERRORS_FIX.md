# iOS Linking Errors Fix Guide

## The Problem

When building for iOS, you encountered this error:

```
Undefined symbols for architecture arm64:
  "_OBJC_CLASS_$_RNSNavigationController", referenced from: ...
  "_OBJC_CLASS_$_RNSScreenStackHeaderConfig", referenced from: ...
  "_OBJC_METACLASS_$_RNSNavigationController", referenced from: ...
  "facebook::react::RNCSafeAreaViewShadowNode::adjustLayoutWithState()", referenced from: ...
  "facebook::react::RNCSafeAreaViewComponentName", referenced from: ...
```

## Root Cause

This is a **version compatibility issue** between React Native 0.79.x and the specific versions of:
- react-native-screens
- react-native-safe-area-context

The problem occurs because these dependencies have C++ implementation files that expect specific symbols from the React Native core. When the versions aren't aligned, the linker can't find these symbols.

## The Solution

The correct fix is to ensure version compatibility by using versions of these packages that are known to work with React Native 0.79.x:

1. Use `react-native-screens` version ~3.29.0
2. Use `react-native-safe-area-context` version 4.8.1

These versions are specifically designed to work with React Native 0.79.x and its New Architecture.

## How to Apply the Fix

1. Run the `patch-dependencies.js` script:
   ```
   node patch-dependencies.js
   ```

2. This script will:
   - Update your package.json with the correct dependency versions
   - Install the updated dependencies
   - Clean iOS build artifacts for a fresh build

3. Then, reinstall iOS pods:
   ```
   cd ios
   pod install
   ```

4. Finally, rebuild your iOS app.

## Why This Works

By using the correctly matched versions, we ensure that the C++ implementation files in these libraries are compatible with the React Native core code. This prevents the linker from looking for symbols that don't exist or have changed names between versions.

## Avoiding Hacks

Instead of excluding source files (which only masks the symptoms), this approach addresses the root cause by ensuring proper version compatibility. This is a more maintainable solution that won't break with future updates.

Document Version: 1.0.0 (May 11, 2025)