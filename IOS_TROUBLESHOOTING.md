# iOS Build Troubleshooting Guide

## Common Issues and Solutions

### "No script URL provided" Error

This error occurs when the iOS app cannot find the JavaScript bundle to run. The error typically appears as:

```
No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle.
unsanitizedScriptURLString = (null)
```

**Solutions:**

1. **Use the fix-no-script-url-error.sh script:**
   ```bash
   ./fix-no-script-url-error.sh
   ```
   This script will:
   - Generate a JavaScript bundle
   - Update AppDelegate.m to use the embedded bundle
   - Provide instructions for adding the bundle to your Xcode project

2. **Manual fix:**
   - Generate a JavaScript bundle:
     ```bash
     cd expo-app  # or your project root
     mkdir -p ios/assets
     npx react-native bundle --entry-file=index.js --platform=ios --dev=false --bundle-output=ios/assets/main.jsbundle --assets-dest=ios/assets
     ```
   - Update AppDelegate.m to use the embedded bundle:
     - Find the line: `jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];`
     - Replace with: `jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];`
   - In Xcode:
     - Add the bundle file to your project (right-click on project → "Add Files to [Your Project]" → select the main.jsbundle file)
     - Make sure "Copy items if needed" is checked
     - Build and run

3. **Ensure the Metro server is running** (for development only):
   ```bash
   cd expo-app  # or your project root
   npx react-native start
   ```
   Then run the app from Xcode.

### Code Signing Issues

If you see errors related to code signing:

1. **In Xcode:**
   - Select your project in the Navigator
   - Select your app target
   - Go to "Signing & Capabilities"
   - Ensure "Automatically manage signing" is checked
   - Select your development team

2. **If you don't have a development team:**
   - You need an Apple Developer account
   - Or change the Bundle Identifier to a unique value and select "Personal Team"

### SQLite-Related Errors

If you encounter SQLite-related errors:

1. **Check SQLite integration:**
   - Ensure `react-native-sqlite-storage` is properly installed:
     ```bash
     cd expo-app  # or your project root
     npm install react-native-sqlite-storage
     ```

2. **Update the Podfile:**
   - Add the SQLite pod dependency:
     ```ruby
     pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
     ```
   - Run `pod install` in the ios directory

3. **Check platform-specific implementation:**
   - Ensure `expo-app/src/database/platforms/database.ios.js` exists and has the correct SQLite implementation

### Linking Errors

If you see linking errors in Xcode:

1. **Clean the build:**
   - In Xcode: Product → Clean Build Folder
   - Then build again

2. **Update CocoaPods:**
   ```bash
   cd expo-app/ios  # or your iOS directory
   pod install --repo-update
   ```

3. **Use the prepare script:**
   ```bash
   ./prepare-for-xcode.sh
   ```

### Architecture Issues (arm64 simulator errors)

If you get arm64 architecture errors when building for simulator:

1. **In Xcode:**
   - Select the project in the Navigator
   - Select "Build Settings"
   - Find "Excluded Architectures"
   - Add "arm64" for "Any iOS Simulator SDK"

### When All Else Fails

1. **Start fresh:**
   ```bash
   cd expo-app  # or your project root
   rm -rf ios
   npx expo prebuild --platform ios --clean
   cd ios && pod install && cd ..
   ```

2. **Then run the prepare script again:**
   ```bash
   ./prepare-for-xcode.sh
   ```

3. **Open the project and follow the iOS build validation report instructions:**
   ```bash
   cat ios-build-validation.txt
   ```