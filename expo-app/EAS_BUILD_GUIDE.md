# EAS Build Guide for Spiritual Condition Tracker

This guide explains how we've solved the Podfile path error in EAS builds.

## The Problem

EAS builds for iOS were failing with the following error:

```
[!] Invalid `Podfile` file: Couldn't find the React Native package.json file at ../../node_modules/react-native/package.json.
 #  from /Users/expo/workingdir/build/expo-app/Podfile:40
 #  -------------------------------------------
 #  
 >    use_react_native!(
 #      :path => config[:reactNativePath],
 #  -------------------------------------------
```

The issue is that the Podfile is looking for React Native in the wrong location.

## Our Solution

We've created a pre-configured `Podfile` in the `ios` directory that:

1. Directly references React Native at the correct path (`../node_modules/react-native`)
2. Sets the proper C++20 language standard for compatibility
3. Configures iOS deployment target to 13.0 
4. Fixes simulator architecture issues

Our `eas-hooks/eas-build-pre-install.sh` script copies this Podfile to the correct location in the EAS build environment.

## Building for iOS

To build for iOS:

```bash
cd expo-app
eas build --platform ios --profile preview
```

## How It Works

1. The `prebuildCommand` in `eas.json` runs our `eas-hooks/eas-build-pre-install.sh` script
2. The script copies our pre-configured Podfile to the EAS build directory
3. The script also fixes any C++ compatibility issues in React Native source code
4. EAS build proceeds with our fixed Podfile instead of generating a problematic one

## Troubleshooting

If you still encounter build issues:

1. Check the EAS build logs for specific errors
2. Make sure you're using the latest version of eas-cli:
   ```
   npm install -g eas-cli
   ```
3. Try a local build to debug issues more easily:
   ```
   eas build --platform ios --profile preview --local
   ```

## Version Compatibility

This fix has been tested with:
- React Native 0.79.x
- Expo SDK 51
- iOS 13.0+ target