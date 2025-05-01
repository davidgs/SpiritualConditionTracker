# Android Build Checklist

Use this checklist to ensure the Android build is properly configured before building and distributing your app.

## Project Settings

- [ ] **Package Name**: `com.example.aarecoverytracker` (change as needed)
- [ ] **Version Code**: 1 (increment with each new release)
- [ ] **Version Name**: 1.0.0
- [ ] **Min SDK**: 21 (Android 5.0)
- [ ] **Target SDK**: 33 (Android 13) or higher
- [ ] **Compile SDK**: 33 or higher

## Manifest Configuration

- [ ] **Permissions**:
  - [ ] ACCESS_COARSE_LOCATION
  - [ ] ACCESS_FINE_LOCATION
  - [ ] INTERNET
  - [ ] READ_CALENDAR
  - [ ] WRITE_CALENDAR
  - [ ] RECEIVE_BOOT_COMPLETED
  - [ ] SCHEDULE_EXACT_ALARM
  - [ ] VIBRATE
- [ ] **App Icon**: ic_launcher and ic_launcher_round properly configured
- [ ] **Activity Configuration**: 
  - [ ] Proper orientation settings
  - [ ] Proper window soft input mode
  - [ ] Export attribute set to true
- [ ] **Intent Filters**: Main activity has proper intent filter

## Gradle Configuration

- [ ] **Dependencies**: All required dependencies are up to date
- [ ] **Build Types**: Debug and Release properly configured
- [ ] **Signing Configuration**: Release signing config set up with keystore
- [ ] **Product Flavors**: Set up if needed (e.g., free/paid versions)
- [ ] **Build Features**: 
  - [ ] ViewBinding enabled if needed
  - [ ] BuildConfig generation enabled

## Assets and Resources

- [ ] **App Icons**: All required resolutions present (mipmap-mdpi through mipmap-xxxhdpi)
- [ ] **Splash Screen**: Configured correctly
- [ ] **Colors and Themes**: Properly set up in values resources
- [ ] **Strings**: All text externalized in strings.xml (for localization)
- [ ] **Layouts**: Responsive layouts that work on various screen sizes

## App Signing

For release builds:

- [ ] **Keystore Created**: Generated with keytool or in Android Studio
- [ ] **Keystore Backed Up**: Stored securely (losing this means losing ability to update app)
- [ ] **Gradle Properties**: Keystore details configured in gradle.properties
- [ ] **Build Gradle**: Signing config properly referenced in app/build.gradle

## Performance Optimizations

- [ ] **Enable R8/ProGuard**: Code shrinking and obfuscation for release builds
- [ ] **ProGuard Rules**: Properly configured to avoid issues with libraries
- [ ] **Image Optimization**: Images compressed and properly sized
- [ ] **Database Operations**: Running on background threads
- [ ] **Multidex Enabled**: If app exceeds 64K method limit

## Release Preparation

- [ ] **Remove Debug Code**: Logs, test functionality, etc.
- [ ] **Enable Crash Reporting**: Analytics or crash reporting set up
- [ ] **Test on Multiple Devices**: Different screen sizes and Android versions
- [ ] **Check Battery Usage**: App doesn't drain battery unnecessarily
- [ ] **Background Services**: Properly managed and optimized

## Google Play Store Submission

- [ ] **Privacy Policy**: Created and URL available
- [ ] **App Category**: Selected appropriate category
- [ ] **Content Rating**: Completed questionnaire
- [ ] **Store Listing**: 
  - [ ] App description
  - [ ] Feature graphic
  - [ ] Screenshots for different devices
  - [ ] Promo video (optional)
- [ ] **App Signing**: Enrolled in Google Play App Signing (recommended)
- [ ] **App Bundle**: Created Android App Bundle (AAB) for upload

## Building Process

### Development Build
```
eas build -p android --profile development
```
or
```
./gradlew assembleDebug
```

### Release Build
```
eas build -p android --profile production
```
or
```
./gradlew assembleRelease
```

## Common Build Errors

- **Gradle sync failed**: Update Gradle and dependencies
- **Duplicate classes**: Check for library conflicts
- **Missing signing configs**: Verify keystore setup
- **R symbol not found**: Clean and rebuild project
- **Native library issues**: Check for compatibility with target ABIs