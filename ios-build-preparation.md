# iOS Build Preparation Checklist

This guide will help you prepare your Spiritual Condition Tracker app for iOS building with the correct dependencies and configurations.

## 1. Fix React Dependency Issues

The first step is to fix the React dependency version mismatch. Your application uses React Native 0.79.2, which requires React 19.0.0.

```bash
# Make the script executable
chmod +x fix-react-dependency.sh

# Run the script to fix dependencies
./fix-react-dependency.sh
```

This script will:
- Update React to version 19.0.0 to match React Native 0.79.2 requirements
- Install required dependencies like react-native-paper and react-native-paper-dates
- Clear caches to ensure clean builds
- Generate the JavaScript bundle for iOS

## 2. Fix AppDelegate Configuration

Next, fix the AppDelegate to properly load the JavaScript bundle in release mode:

```bash
# Make the script executable
chmod +x fix-no-script-url-error.sh

# Run the script to modify AppDelegate
./fix-no-script-url-error.sh
```

This script will:
- Find the AppDelegate.m or AppDelegate.mm file
- Add code to use the embedded JavaScript bundle in release mode
- Provide instructions for adding the bundle to your Xcode project

## 3. Prepare for Xcode Build

1. Open your Xcode project:
   ```bash
   cd ios
   open YourProject.xcworkspace  # or .xcodeproj if you don't have a workspace
   ```

2. Add the JavaScript bundle to your Xcode project:
   - Right-click on your project in the Project Navigator
   - Select "Add Files to 'YourProject'..."
   - Navigate to the ios/assets directory
   - Select main.jsbundle
   - Make sure "Copy items if needed" is checked
   - Click Add

3. Configure the build:
   - Select your project in the navigator
   - Go to "Edit Scheme" (Product > Scheme > Edit Scheme)
   - Select the "Run" action
   - Change the Build Configuration from "Debug" to "Release"
   - Click "Close"

4. Clean the build folder:
   - Select Product > Clean Build Folder

5. Build and run the app:
   - Select Product > Build
   - After successful build, select Product > Run

## Troubleshooting

If you encounter any issues:

### Missing Dependencies
If you see errors about missing modules, install them:
```bash
cd expo-app
npm install [missing-package-name] --save
```

### Bundle Loading Issues
If the app still can't find the bundle:
1. Verify that main.jsbundle is properly added to your Xcode project
2. Check that the AppDelegate is correctly modified to load the bundle
3. Ensure you're running in Release mode, not Debug mode

### Debug Logging
To get more detailed logs, add the following to your AppDelegate before loading the bundle:
```objective-c
NSLog(@"Bundle path: %@", [[NSBundle mainBundle] pathForResource:@"main" ofType:@"jsbundle"]);
```

### Clean Reinstall
If all else fails, try a complete clean reinstall:
```bash
cd expo-app
rm -rf node_modules
rm -rf ios/build
npm install
cd ios
pod install
cd ..
./fix-react-dependency.sh
./fix-no-script-url-error.sh
```

Then rebuild in Xcode.