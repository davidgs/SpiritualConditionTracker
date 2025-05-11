# ExpoDevice Removal Guide

## Overview

This document describes why we removed `expo-device` from the Spiritual Condition Tracker app and how we resolved the related issues.

## Problem

The `expo-device` package was causing several critical build problems:

1. Duplicate dependency declarations in the iOS Podfile
2. Conflicts with React Native's auto-linking process
3. Missing imports in Swift files causing compilation errors
4. Reference conflicts in the Xcode project file

## Solution

We implemented the following fixes:

### 1. Package Removal

- Removed `expo-device` from `package.json`
- Created cleanup scripts to ensure all references were removed
- Modified the NearbyMembersScreen.js to work without device detection

### 2. iOS Build Fixes

- Cleaned up Podfile to remove explicit ExpoDevice references
- Added cleanup scripts to remove references from project.pbxproj
- Removed fix-expodevice.sh which was attempting to patch the files

### 3. Project Dependency Management

- Created `clean-pods.sh` to clean iOS build environment
- Created `reinstall-dependencies.sh` to reinstall dependencies cleanly
- Added `clean-build-mobile.sh` for preparing clean mobile builds

## Testing the Fix

To verify the fix is working:

1. Run the web version using `npm run web`
2. For iOS builds, run `./clean-build-mobile.sh` followed by `npm run build:ios`
3. For Android builds, run `./clean-build-mobile.sh` followed by `npm run build:android`

## Future Reference

If you encounter similar issues with other dependencies:

1. Check for duplicate declarations in the Podfile
2. Verify the dependency is correctly listed in package.json
3. Remove any manual linking that conflicts with React Native's auto-linking
4. Clean up project files thoroughly using the provided scripts

## Technical Notes

- The `expo-device` functionality was not critical to the app's operation
- Location features now rely solely on `expo-location` which is sufficient
- The NearbyMembersScreen.js has been modified to work without device-specific detection

Document Version: 1.0.0 (May 11, 2025)