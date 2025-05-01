# iOS Development Guide for AA Recovery Tracker

This guide provides information about iOS-specific features and considerations when developing and building the AA Recovery Tracker app.

## iOS Capabilities

The application uses several iOS capabilities that need to be enabled in Xcode:

1. **Location Services**: Used for nearby members feature
   - Added NSLocationWhenInUseUsageDescription in Info.plist
   - Requires user permission at runtime

2. **Calendar Access**: Used for meeting reminders
   - Added NSCalendarsUsageDescription in Info.plist
   - Added NSRemindersUsageDescription in Info.plist
   - Requires user permission at runtime

3. **HealthKit**: For potential future integration with health data
   - Added HealthKit entitlement
   - Will require additional setup if implemented

4. **Push Notifications**: For meeting reminders
   - Requires Apple Push Notification service (APNs) setup
   - Requires provisioning profile with push capability

5. **App Groups**: For sharing data between app and extensions
   - Added com.apple.security.application-groups entitlement
   - Group name: group.com.example.aarecoverytracker

## Native Module Dependencies

The app relies on several React Native modules that require native iOS code:

1. **expo-location**: For geolocation services
2. **expo-calendar**: For calendar integration
3. **expo-notifications**: For local notifications
4. **expo-sqlite**: For local database storage
5. **react-native-maps**: For displaying maps in the app

All native dependencies are automatically linked when using Expo's managed workflow or when running `pod install` in the iOS directory.

## Building for Different Environments

### Development

For development builds:
```
eas build -p ios --profile development
```

This creates a development build that can be installed on registered devices and includes development tools.

### TestFlight

For TestFlight distribution:
```
eas build -p ios --profile preview
```

This creates a build that can be uploaded to TestFlight for beta testing.

### Production

For App Store submission:
```
eas build -p ios --profile production
```

This creates a production-ready build for App Store submission.

## Common iOS Build Issues

1. **Signing Issues**: Ensure you have the correct provisioning profiles and certificates
   - Solution: Use automatic signing in Xcode or set up profiles manually through Apple Developer Portal

2. **Missing Capabilities**: If features don't work, check that capabilities are enabled
   - Solution: Add necessary capabilities in the "Signing & Capabilities" tab in Xcode

3. **Pod Install Errors**: Issues with CocoaPods dependencies
   - Solution: Try `pod deintegrate` and then `pod install` again, or update CocoaPods

4. **Minimum iOS Version**: The app requires iOS 15.1 or later
   - Solution: Make sure deployment target is set correctly in Xcode project settings

## App Store Submission Checklist

Before submitting to the App Store:

1. Update version and build numbers in app.json
2. Ensure all app icons and splash screens are properly configured
3. Prepare privacy policy URL (required for App Store submission)
4. Prepare App Store screenshots and promotional text
5. Test thoroughly on multiple device sizes
6. Ensure app complies with Apple's App Review Guidelines

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Expo iOS Development Guide](https://docs.expo.dev/workflow/ios-simulator/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup?platform=ios)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)