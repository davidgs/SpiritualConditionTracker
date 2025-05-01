# Xcode Project Configuration Checklist

Use this checklist to ensure the iOS build is properly configured before building with Xcode.

## Project Settings

- [ ] **Bundle Identifier**: `com.example.aarecoverytracker` (change as needed)
- [ ] **Version**: 1.0.0
- [ ] **Build**: 1
- [ ] **Deployment Target**: iOS 15.1 or higher
- [ ] **Devices**: iPhone, iPad (Universal)
- [ ] **Orientation**: Portrait only (as configured in app.json)

## Signing & Capabilities

- [ ] **Signing Team**: Selected Apple Developer account team
- [ ] **Automatically manage signing**: Enabled (recommended for simplicity)

### Required Capabilities
- [ ] **HealthKit**
- [ ] **Push Notifications**
- [ ] **App Groups**
  - group.com.example.aarecoverytracker
- [ ] **Associated Domains** (if using universal links)
- [ ] **Background Modes**
  - Location updates
  - Remote notifications

## Info.plist Keys

Ensure these keys are present in the Info.plist file:

- [ ] **NSLocationWhenInUseUsageDescription**: "This app uses your location to find nearby AA members when you enable discoverability."
- [ ] **NSCalendarsUsageDescription**: "This app needs access to your calendar to add AA meeting reminders."
- [ ] **NSRemindersUsageDescription**: "This app needs access to your reminders to set meeting alerts."
- [ ] **NSUserActivityTypes**: Contains "AddToCalendarIntent"
- [ ] **UIRequiresFullScreen**: Set to appropriate value
- [ ] **UIStatusBarStyle**: Set to appropriate style
- [ ] **LSApplicationQueriesSchemes**: If the app needs to open other apps

## Building Process

### Development Build
- [ ] Connect iOS device (if building for device)
- [ ] Select appropriate scheme (Debug)
- [ ] Select appropriate destination (device or simulator)
- [ ] Run the app (⌘R)

### Archive for Distribution
- [ ] Update version and build numbers if needed
- [ ] Select "Any iOS Device" as build destination
- [ ] Select Product > Archive from the menu
- [ ] Use Organizer to validate and distribute the app

## Common Build Errors

### Code Signing Errors
- Check that the provisioning profile is valid and matches the bundle identifier
- Ensure your Apple Developer account has the necessary entitlements

### Missing Dependencies
- Run `pod install` in the ios directory to update CocoaPods dependencies

### Architecture Issues
- Make sure you're building for the correct architecture (arm64 for newer devices)

### Build Optimization
- Clean the build folder (⇧⌘K) before rebuilding if encountering strange errors
- Delete derived data if necessary (Xcode > Preferences > Locations > Derived Data > delete)

## Final Testing Checklist

Before submitting to the App Store:

- [ ] App launches correctly
- [ ] All permissions are requested with clear explanations
- [ ] All features work as expected
- [ ] Performance is good on target devices
- [ ] App follows Apple's Human Interface Guidelines
- [ ] App complies with App Store Review Guidelines