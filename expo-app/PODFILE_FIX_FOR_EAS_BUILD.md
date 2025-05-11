# Fixing Podfile for EAS Builds

This guide explains how we've addressed the common Podfile error in EAS builds:

```
[!] Invalid `Podfile` file: Couldn't find the React Native package.json file at ../../node_modules/react-native/package.json.
```

## The Problem

EAS creates a Podfile during the build process that incorrectly references React Native at `../../node_modules/react-native` instead of `../node_modules/react-native`.

## Our Solution

We've implemented an automatic fix through:

1. **Pre-install Hook**: Updated `eas-hooks/eas-build-pre-install.sh` to create a `fix-podfile.sh` script in the `eas-hooks/ios` directory.

2. **Manual Application**: During the EAS build, after the Podfile is generated, you'll need to run the fix-podfile.sh script manually. The script will:
   - Replace `:path => config[:reactNativePath]` with `:path => "../node_modules/react-native"`
   - Add C++20 language settings to ensure compatibility

3. **Easy Access**: The fix script has been placed in three locations for convenience:
   - `./eas-hooks/ios/fix-podfile.sh` (primary location)
   - `./ios/fix-podfile.sh` (for use within the ios directory)
   - `./fix-podfile.sh` (symlink in the root directory)

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

## Using the Fix During a Build

When running an EAS build, use the `--local` flag to get interactive access:

```bash
cd expo-app
eas build --platform ios --profile preview --local
```

Then, when the Podfile has been generated, run the fix script:

```bash
# If you're in the project root
./fix-podfile.sh

# Or if you're in the ios directory
./fix-podfile.sh
```

## Building with Remote EAS Build

For a remote build, you'll need to modify the Podfile manually through the EAS dashboard after the build has started. When you see the Podfile error in the logs:

1. Go to the EAS Dashboard
2. Find your build
3. Click "Cancel build" 
4. Start a new build with the `--local` flag
5. Apply the fix when prompted

```bash
cd expo-app
eas build --platform ios --profile preview --local
```

Once you have a successful build, you can submit the same configuration for remote builds.

## Additional Troubleshooting

If you encounter issues with the Podfile, you can:

1. Run `npm run clean-ios` (if available) to clean the iOS build 
2. Use `eas build:configure` to regenerate the EAS configuration
3. Try the `development` profile which may have different CocoaPods settings:
   ```bash
   eas build --platform ios --profile development --local
   ```