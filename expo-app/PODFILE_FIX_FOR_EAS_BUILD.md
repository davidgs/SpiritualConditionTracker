# Fixing Podfile for EAS Builds

This guide explains how we've addressed the common Podfile error in EAS builds:

```
[!] Invalid `Podfile` file: Couldn't find the React Native package.json file at ../../node_modules/react-native/package.json.
```

## The Problem

EAS creates a Podfile during the build process that incorrectly references React Native at `../../node_modules/react-native` instead of `../node_modules/react-native`.

## Our Solution

We've implemented an automatic fix through:

1. **Pre-install Hook**: Updated `eas-hooks/eas-build-pre-install.sh` to create a `fix-podfile.sh` script that will run during the build

2. **Post-Install Command**: Added a `postInstallCommand` in `eas.json` that runs the fix-podfile.sh script after npm dependencies are installed

3. **Podfile Patching**: The script replaces `:path => config[:reactNativePath]` with `:path => "../node_modules/react-native"` and adds C++20 language settings

## Manual Fix (if needed)

If the automatic fix doesn't work, you can also:

1. Run the build with the `--local` flag:
   ```bash
   eas build --platform ios --profile preview --local
   ```

2. When the build process creates the Podfile, manually edit it and replace:
   ```ruby
   use_react_native!(
     :path => config[:reactNativePath],
   ```
   
   With:
   ```ruby
   use_react_native!(
     :path => "../node_modules/react-native",
   ```

3. Add a post_install hook for C++20 support at the end of the Podfile:
   ```ruby
   post_install do |installer|
     installer.pods_project.targets.each do |target|
       target.build_configurations.each do |config|
         # Set C++20 for all C++ files
         config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
         config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
       end
     end
   end
   ```

## Verifying the Fix

When running an EAS build, you should see output like:

```
[+] Running script 'Run postInstall script'
[!] Podfile has been modified, running pod install...
🔧 Fixing Podfile react-native path  
✅ Podfile fixed successfully
```

## Building with Fixed Configuration

To run a build with our fixed configuration:

```bash
cd expo-app
eas build --platform ios --profile preview --no-wait
```

The build should now proceed without the Podfile error.