# Android Native Build Checklist for AA Recovery Tracker

This checklist will help you ensure that all required settings are properly configured for a native Android build of the AA Recovery Tracker app, particularly with the Bluetooth/WiFi proximity features for nearby member discovery.

## Prerequisites

1. ✅ Make sure you have Android Studio installed (latest version recommended)
2. ✅ Ensure you have JDK 11 or newer installed
3. ✅ Make sure you have the Android SDK installed with:
   - Android SDK Platform API 33 (or higher)
   - Android SDK Build-Tools 33.0.0 (or higher)
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
   - Android Emulator (for testing without a physical device)

## Before Opening Android Studio

1. ✅ Make sure all necessary permissions have been added to AndroidManifest.xml:
   - ACCESS_COARSE_LOCATION
   - ACCESS_FINE_LOCATION
   - BLUETOOTH
   - BLUETOOTH_ADMIN
   - BLUETOOTH_CONNECT (for Android 12+)
   - BLUETOOTH_SCAN (for Android 12+)
   - BLUETOOTH_ADVERTISE (for Android 12+)
   - ACCESS_WIFI_STATE
   - CHANGE_WIFI_STATE
   - NEARBY_WIFI_DEVICES (for Android 13+)
   - READ_CALENDAR
   - WRITE_CALENDAR
   - RECEIVE_BOOT_COMPLETED
   - VIBRATE
   - SCHEDULE_EXACT_ALARM

2. ✅ Make sure ProGuard rules are properly set up for the project (if using minification)

3. ✅ Verify the gradle files are set up with the correct:
   - Target SDK version (33 or higher recommended)
   - Minimum SDK version (21 or higher recommended)
   - Build tools version
   - Dependencies for Bluetooth and WiFi functionality

## Opening Android Studio Project

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to the 'android' folder in your project and select it

## Android Project Configuration

### 1. Check build.gradle Files

1. **Project-level build.gradle**
   - Verify that Google's Maven repository is included
   - Check that the Gradle plugin version is appropriate for your target SDK

2. **App-level build.gradle**
   - Confirm `compileSdkVersion` is 33 or higher
   - Verify `minSdkVersion` is set appropriately (21+ recommended)
   - Check `targetSdkVersion` is set to 33 or higher
   - Ensure all required dependencies are included, especially:
     - Bluetooth libraries
     - WiFi P2P libraries
     - Location services
     - Calendar providers

### 2. Check AndroidManifest.xml

1. Verify that the package name matches your intended package: `com.example.aarecoverytracker`
2. Confirm all required permissions are declared
3. Check that appropriate intent filters are set up
4. For Android 12+ compatibility, verify that Bluetooth permissions are properly configured
5. For Android 13+ compatibility, verify that WiFi permissions are properly configured

### 3. Setup Keystore for Signing

1. Locate your keystore file (`aa-recovery-keystore.jks`)
2. In Android Studio, go to:
   - File > Project Structure > Modules > app
   - Navigate to the "Signing" tab
   - Configure the signing with your keystore file and credentials

### 4. Configure Gradle Properties

1. Open `gradle.properties`
2. Add or update the following properties if needed:
   ```
   android.useAndroidX=true
   android.enableJetifier=true
   org.gradle.jvmargs=-Xmx2048m
   ```

## Building and Running

1. Build the app:
   - Click "Build" > "Make Project" or use keyboard shortcut (Ctrl+F9 or Cmd+F9)
   - Alternatively, click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"

2. Run the app:
   - Connect a physical Android device or start an emulator
   - Click "Run" > "Run app" or click the Run button (green triangle) in the toolbar

3. For a release build:
   - Click "Build" > "Generate Signed Bundle / APK"
   - Follow the wizard to create a signed APK or App Bundle
   - Select "APK" for direct installation or "Android App Bundle" for Play Store submission

## Debugging Common Android Build Issues

### Gradle Sync Issues

1. "Failed to resolve: xyz" errors:
   - Check your internet connection
   - Update the Gradle version or plugin versions
   - Make sure repositories are correctly configured
   - Run "File" > "Invalidate Caches / Restart"

2. Gradle version conflicts:
   - In the project's gradle file, specify a version that works with all dependencies
   - Use the resolution strategy to force specific versions if needed

### Permission Issues

1. Runtime permissions not working:
   - Verify that you're requesting permissions at runtime for Android 6.0+ (API 23+)
   - Check that you're handling permission denial cases
   - Test on different Android versions (especially Android 10, 11, 12, and 13) as permission models changed

2. Bluetooth/WiFi issues:
   - For Android 12+, ensure BLUETOOTH_CONNECT, BLUETOOTH_SCAN, and BLUETOOTH_ADVERTISE permissions are properly requested
   - For Android 13+, ensure NEARBY_WIFI_DEVICES permission is properly requested

### Keystore Issues

1. "Key not found in keystore" error:
   - Verify the keystore password, key alias, and key password
   - Ensure the keystore file is in the correct location

2. Signing configuration errors:
   - Check that the signing configuration in build.gradle is correct
   - Make sure the keystore file exists and is accessible

## Testing Proximity Features

After building and installing the app:

1. Enable Bluetooth and WiFi on the test device
2. Grant all permissions when prompted
3. Navigate to the NearbyMembers screen
4. Enable discoverability
5. Use the DiscoverySettings component to enable Bluetooth/WiFi scanning
6. Test with another device to confirm proximity discovery works
7. Verify that different discovery methods (GPS, Bluetooth, WiFi) are correctly displayed in the user interface

## Additional Resources

- React Native Android Setup Guide: https://reactnative.dev/docs/environment-setup
- Android Developers Guide: https://developer.android.com/guide
- Bluetooth Low Energy Guide: https://developer.android.com/guide/topics/connectivity/bluetooth-le
- WiFi P2P Guide: https://developer.android.com/guide/topics/connectivity/wifip2p

Good luck with your Android build! If you encounter any specific issues not covered in this checklist, consult the React Native and Android documentation or seek assistance from the developer community.