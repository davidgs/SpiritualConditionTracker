# iOS Build Guide for Spiritual Condition Tracker

This guide walks you through the process of building and running the Spiritual Condition Tracker app on iOS using Xcode.

## Prerequisites

- macOS computer
- Xcode 13 or later
- Apple Developer account (for running on physical devices)
- Node.js and npm installed
- CocoaPods installed (`sudo gem install cocoapods`)

## Prepare for iOS Build

1. Make the prepare script executable:
   ```bash
   chmod +x prepare-ios-build.sh
   ```

2. Run the preparation script:
   ```bash
   ./prepare-ios-build.sh
   ```

This script will:
- Check for existing iOS build and offer to clean it
- Install node dependencies if needed
- Fix SQLite configuration issues
- Create a fresh iOS build with `expo prebuild`
- Install CocoaPods dependencies

## Open Project in Xcode

After the script completes, open the Xcode workspace:

```bash
open expo-app/ios/SpiritualConditionTracker.xcworkspace
```

**Important:** Always open the `.xcworkspace` file, not the `.xcodeproj` file.

## Configure Signing & Capabilities

1. In Xcode, select the main project in the Project Navigator
2. Select the "SpiritualConditionTracker" target
3. Go to the "Signing & Capabilities" tab
4. Select your team from the dropdown
5. Ensure "Automatically manage signing" is checked
6. Wait for Xcode to generate a provisioning profile

The app requires several capabilities for iOS:
- Background Modes (for Bluetooth and location)
- Calendar access
- Location access
- Bluetooth access

These should be automatically configured in the Info.plist file.

## Test Database Implementation

SQLite implementation on iOS requires native code. The app uses `react-native-sqlite-storage` which has been properly configured, but you should verify the database works by:

1. Running the app in the iOS Simulator
2. Creating a test user and activities
3. Verifying data persists between app restarts

## Common Issues & Solutions

### SQLite "ExecuteSQL failed" Error

If you see SQLite execution errors, check:

1. The SQLite database path in `database.js`
2. Ensure proper permissions for file access
3. Rebuild with `pod install` in the iOS directory

### "Bundle not found" or Missing JS Bundle

If the app can't find the JavaScript bundle:

1. Make sure Metro bundler is running
2. Delete the build folder and clean the project
3. Rebuild the project

### Missing Icon Fonts

If icon fonts are missing:

1. Ensure all font files are in `expo-app/assets/fonts/`
2. Make sure `react-native.config.js` points to the correct fonts directory
3. Run `npx react-native-asset` to link the fonts
4. Rebuild the app

## Deploying to App Store

When you're ready to deploy to the App Store:

1. Update the version and build number in `app.json`
2. Create an Archive in Xcode (Product > Archive)
3. Follow the Xcode steps for App Store Connect submission
4. Complete the App Store Connect details
5. Submit for review

For TestFlight:
1. Follow the same Archive steps above
2. Choose "Distribute App" > "TestFlight & App Store"
3. Invite testers through App Store Connect

## Development Tips

- Use physical devices when testing Bluetooth and proximity features
- Debug network issues using Xcode's Network tools
- SQLite databases can be inspected using the Xcode File inspector
- For specific iOS UI adjustments, create a platform-specific file with `.ios.js` suffix