# iOS Build Troubleshooting Guide

This guide addresses common iOS build issues for the AA Recovery Tracker app, specifically focusing on the "Command PhaseScriptExecution failed with a nonzero exit code" error.

## "Command PhaseScriptExecution failed with a nonzero exit code" Error

This error typically occurs during the "Bundle React Native code and images" phase of the Xcode build process. Here's how to fix it:

### Special Solution for Expo-Configure-Project.sh Issues

If the error mentions "expo-configure-project.sh" specifically, this is likely an issue with the Expo configuration script's permissions or Node path:

1. Run our specialized fix script:
   ```bash
   cd ios
   ./fix-expo-configure.sh
   ```

2. This script will:
   - Find all instances of expo-configure-project.sh
   - Fix execution permissions
   - Update the script to handle Node.js path issues
   - Create backups of the original scripts

### Solution 1: Run the Setup Script

We've created a setup script to help fix common build issues:

1. Open Terminal and navigate to your project directory
2. Run the setup script:
   ```bash
   cd ios
   ./setup-build-env.sh
   ```
3. If that doesn't work, try with clean pods:
   ```bash
   ./setup-build-env.sh --clean-pods
   ```
4. Open the Xcode workspace and try building again

### Solution 2: Clean Build Folders

1. In Xcode, select **Product → Clean Build Folder** (Shift+Command+K)
2. Close Xcode completely
3. Delete the DerivedData folder:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/AARecoveryTracker-*
   ```
4. Reopen Xcode and try building again

### Solution 3: Fix Node Path Issues

If the error message mentions missing Node binary or has issues with the React Native scripts:

1. Create or edit the `.xcode.env` file in your iOS directory:
   ```bash
   echo "export NODE_BINARY=$(command -v node)" > ios/.xcode.env
   ```
2. Make sure your Node.js is in your PATH and accessible from Xcode:
   ```bash
   which node
   ```
3. Check that the node path matches what's in your `.xcode.env` file

### Solution 4: Reinstall Dependencies

If the build error persists, try reinstalling all dependencies:

1. Delete node_modules:
   ```bash
   rm -rf node_modules
   ```
2. Delete the Pods directory:
   ```bash
   rm -rf ios/Pods
   ```
3. Delete Podfile.lock:
   ```bash
   rm -f ios/Podfile.lock
   ```
4. Reinstall dependencies:
   ```bash
   npm install
   cd ios && pod install --repo-update
   ```

### Solution 5: Check Script Phases in Xcode

1. Open your project in Xcode
2. Select your project target
3. Go to "Build Phases" tab
4. Look for "Bundle React Native code and images" phase
5. Verify the script contains proper error handling 
6. If needed, manually update the script to include error checking:

```bash
set -e

# Find node binary
export NODE_BINARY=$(command -v node || command -v nodejs)
if [ -z "$NODE_BINARY" ]; then
  echo "error: Could not find the Node.js binary. Please ensure Node.js is installed."
  exit 1
fi

# Rest of the original script...
```

## Other Common Issues

### Symbol Not Found (CoreBluetooth)

If you see errors related to CoreBluetooth symbols:

1. Ensure CoreBluetooth.framework is properly linked:
   - Select your target in Xcode
   - Go to "Build Phases" → "Link Binary With Libraries"
   - Add CoreBluetooth.framework if it's not there

2. Verify the proper imports are in your bridging header:
   - Check that `#import <CoreBluetooth/CoreBluetooth.h>` is in your bridging header

### Architecture Issues

If you see architecture-related errors (especially on Apple Silicon Macs):

1. Verify your Podfile has the proper architecture settings:
   ```ruby
   post_install do |installer|
     # ...
     installer.pods_project.build_configurations.each do |config|
       config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
     end
   end
   ```

2. Make sure your Deployment Target is set consistently:
   - Check that all targets and pods are set to iOS 15.1 or later

### Firebase/Expo Packages Issues

If you're using Firebase or specific Expo packages causing problems:

1. Verify compatibility with your React Native and Expo versions
2. Check that native configurations are properly set in Build Phases

## Still Having Issues?

If you're still experiencing build issues:

1. Check the exact error message in the Xcode build log
2. Look for specific file or module references in the error
3. Try building in verbose mode: 
   ```bash
   xcodebuild -workspace ios/AARecoveryTracker.xcworkspace -scheme AARecoveryTracker -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 14' | xcpretty
   ```
4. Consult the React Native and Expo documentation for version-specific issues