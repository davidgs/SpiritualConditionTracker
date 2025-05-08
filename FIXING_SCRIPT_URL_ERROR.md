# Fixing "No script URL provided" Error in Xcode

If you're seeing this error when running your app in Xcode:

```
No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle.

unsanitizedScriptURLString = (null)
```

Follow these steps to resolve it:

## Solution 1: Ensure Metro Bundler is Running

During development, Xcode needs to connect to the Metro bundler to load the JavaScript code.

1. Open a terminal
2. Navigate to your project directory
3. Start the Metro bundler:
   ```bash
   cd expo-app
   npx react-native start
   ```
4. Make sure your Xcode build scheme is set to "Debug"
5. Try running the app again from Xcode

## Solution 2: Create and Include a Pre-Bundled JavaScript File

For release builds or if you want to run without the Metro bundler, you need to include a pre-bundled JavaScript file.

1. Run the bundle creation script:
   ```bash
   chmod +x create-ios-bundle.sh
   ./create-ios-bundle.sh
   ```

2. Add the bundle to your Xcode project:
   - Open your Xcode project
   - Right-click on your project in the Project Navigator
   - Select "Add Files to 'SpiritualConditionTracker'"
   - Navigate to and select the `expo-app/ios/bundle` folder
   - Make sure "Copy items if needed" is checked
   - Click "Add"

3. Update AppDelegate.mm to use the bundle:
   - Open `AppDelegate.mm` in Xcode
   - Find the part where the RCTBridge is being created
   - Update it to use the bundled JavaScript in release mode:

   ```objc
   NSURL *jsCodeLocation;
   #ifdef DEBUG
     // During development, use the Metro bundler URL
     jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
   #else
     // In production, use the pre-bundled file
     jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"bundle/main" withExtension:@"jsbundle"];
   #endif
   
   RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
   ```

4. Make sure your build scheme is set to "Release" to use the bundled JavaScript
5. Clean and rebuild the project

## Solution 3: Fix the Metro Bundler Connection

Sometimes there are network issues preventing Xcode from connecting to Metro.

1. Check your `AppDelegate.mm` file:
   ```objc
   // In the AppDelegate.mm file
   - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
   #if DEBUG
     return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
   #else
     return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
   #endif
   }
   ```

2. Modify the Debug URL to use explicit localhost:
   ```objc
   #if DEBUG
     NSURL *jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios"];
     return jsCodeLocation;
   #else
     return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
   #endif
   ```

3. Make sure your Mac's firewall isn't blocking connections on port 8081

## Solution 4: Enable Direct Debugging

For development builds, you can enable direct debugging:

1. Open the scheme editor in Xcode (Product > Scheme > Edit Scheme)
2. Select the "Run" action
3. Go to the "Arguments" tab
4. Add the following environment variable:
   - Name: `RCT_METRO_PORT`
   - Value: `8081`

5. Also add this variable:
   - Name: `RCT_ENABLE_DIRECT_DEBUGGING`
   - Value: `1`

6. Close the scheme editor and try running the app again

## Additional Tips for Troubleshooting

- **Clean the build folder**: In Xcode, go to Product > Clean Build Folder, then rebuild
- **Reset the simulators**: In the iOS Simulator menu, go to Device > Erase All Content and Settings
- **Check network settings**: Make sure your Mac and iOS simulator can connect to localhost
- **Update React Native**: Make sure you're using compatible versions of React Native and Expo
- **Check for port conflicts**: Make sure no other application is using port 8081

If you continue to have issues, try running in Release mode with the bundled JavaScript file, which provides the most reliable experience for testing.