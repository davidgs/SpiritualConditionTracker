# Android Development Guide for AA Recovery Tracker

This guide provides information about Android-specific features and considerations when developing and building the AA Recovery Tracker app.

## Android Permissions

The application uses several Android permissions that are declared in the Android manifest:

1. **Location Permissions**:
   - `ACCESS_COARSE_LOCATION`: Approximate location (network-based)
   - `ACCESS_FINE_LOCATION`: Precise location (GPS and network-based)
   - Used for nearby members feature

2. **Calendar Permissions**:
   - `READ_CALENDAR`: Read calendar events
   - `WRITE_CALENDAR`: Create/modify calendar events
   - Used for meeting reminders

3. **System Permissions**:
   - `RECEIVE_BOOT_COMPLETED`: Start app at device boot
   - `VIBRATE`: Control device vibration for notifications
   - `SCHEDULE_EXACT_ALARM`: Schedule precise alarms for reminders

## Native Module Dependencies

The app relies on several React Native modules that require native Android code:

1. **expo-location**: For geolocation services
2. **expo-calendar**: For calendar integration
3. **expo-notifications**: For local notifications
4. **expo-sqlite**: For local database storage
5. **react-native-maps**: For displaying maps in the app

All native dependencies should be automatically linked when using Expo's managed workflow or when running the Gradle build.

## Building Android App

### Development Setup

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK during setup

2. **Configure Android SDK**:
   - Install Android SDK Platform (API Level 33 or higher recommended)
   - Install Android SDK Build-Tools
   - Install Android Emulator (optional, for testing)

3. **Setup Environment Variables**:
   - Set `ANDROID_HOME` to your Android SDK location
   - Add platform-tools to your PATH

### Building the App

#### Using Gradle (Android Studio)

1. Open the Android project in Android Studio:
   ```
   cd android
   ```
   Open the `android` directory in Android Studio

2. Configure signing:
   - Create keystore file (for release builds)
   - Configure `android/app/build.gradle` with signing information
   - Set up signing configs in Gradle properties

3. Build the APK:
   - Use Gradle tasks: 
     - `./gradlew assembleDebug` (debug build)
     - `./gradlew assembleRelease` (release build)

#### Using EAS Build (Recommended)

1. Login to your Expo account:
   ```
   eas login
   ```

2. Configure build:
   ```
   eas build:configure
   ```

3. Start the build process:
   ```
   eas build -p android
   ```

4. Follow the on-screen instructions to complete the build process

## App Signing

For release builds, Android apps must be signed with a keystore:

1. **Generate a keystore** (if you don't have one):
   ```
   keytool -genkey -v -keystore aa-recovery-keystore.jks -alias aa-recovery -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle** to use the keystore:
   Add to `android/gradle.properties`:
   ```
   MYAPP_UPLOAD_STORE_FILE=aa-recovery-keystore.jks
   MYAPP_UPLOAD_KEY_ALIAS=aa-recovery
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```

3. **Update build.gradle**:
   Add to `android/app/build.gradle`:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file(MYAPP_UPLOAD_STORE_FILE)
               storePassword MYAPP_UPLOAD_STORE_PASSWORD
               keyAlias MYAPP_UPLOAD_KEY_ALIAS
               keyPassword MYAPP_UPLOAD_KEY_PASSWORD
           }
       }
       buildTypes {
           release {
               ...
               signingConfig signingConfigs.release
           }
       }
   }
   ```

## Distribution Channels

### Google Play Store

1. Create a Google Play Developer account
2. Create a new application in the Google Play Console
3. Prepare store listing (screenshots, descriptions, etc.)
4. Upload signed APK or AAB (Android App Bundle, preferred)
5. Complete content rating questionnaire
6. Set up pricing and distribution
7. Submit for review

### Internal Testing

1. Build a signed APK/AAB:
   ```
   eas build -p android --profile preview
   ```
2. Distribute via:
   - Google Play internal testing track
   - Firebase App Distribution
   - Direct APK sharing

## Common Android Build Issues

1. **Gradle sync failures**:
   - Check Gradle version compatibility
   - Ensure all dependencies are available
   - Update Gradle wrapper if needed

2. **Missing permissions**:
   - Ensure all required permissions are in AndroidManifest.xml
   - Request runtime permissions properly for Android 6.0+

3. **Signing issues**:
   - Verify keystore file exists and is accessible
   - Check keystore passwords in gradle.properties

4. **64K method limit**:
   - Enable multidex in app/build.gradle
   - ```
     android {
         defaultConfig {
             multiDexEnabled true
         }
     }
     ```

5. **Performance issues**:
   - Use Android Profiler to identify bottlenecks
   - Optimize layout hierarchy and rendering

## Resources

- [Android Developer Documentation](https://developer.android.com/docs)
- [React Native Android Setup](https://reactnative.dev/docs/environment-setup?platform=android)
- [EAS Build for Android](https://docs.expo.dev/build-reference/android/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)