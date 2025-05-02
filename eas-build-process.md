# EAS Build Process Guide

This document explains the step-by-step process of building the AA Recovery Tracker app using EAS Build, the Expo Application Services build system.

## Initial Setup

1. **Initialize EAS Project**
   ```bash
   npx eas init
   ```
   This creates and links your project on the Expo servers.

2. **Configure Build Profiles**
   The `eas.json` file should contain profiles for different build environments:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {
         "autoIncrement": true
       }
     }
   }
   ```

## Android Build Credentials Setup

When building for Android, you need a keystore file for signing the app.

1. **Generate a Keystore File**
   ```bash
   keytool -genkey -v -keystore aa-recovery-keystore.jks -alias aa-recovery -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Store the Keystore Safely**
   - Create a directory for storing keystores: `android/app/keystores/`
   - Move the keystore file to this directory
   - Add this directory to `.gitignore` to prevent accidental commits

3. **Configure Credentials**
   Create a `credentials.json` file in your project root:
   ```json
   {
     "android": {
       "keystore": {
         "keystorePath": "android/app/keystores/aa-recovery-keystore.jks",
         "keystorePassword": "your-password",
         "keyAlias": "aa-recovery",
         "keyPassword": "your-password"
       }
     }
   }
   ```

4. **Configure eas.json for Local Credentials**
   ```json
   "preview": {
     "android": {
       "buildType": "apk",
       "credentialsSource": "local"
     }
   }
   ```

5. **Configure gradle.properties**
   ```
   MYAPP_UPLOAD_STORE_FILE=keystores/aa-recovery-keystore.jks
   MYAPP_UPLOAD_KEY_ALIAS=aa-recovery
   MYAPP_UPLOAD_STORE_PASSWORD=your-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-password
   ```

## iOS Build Credentials Setup

For iOS builds, you need Apple Developer credentials and provisioning profiles:

1. **Provide Apple Developer Credentials**
   When prompted during the build process, you'll need to provide:
   - Apple ID
   - App-specific password (if using 2FA)
   - Team ID

2. **Configure eas.json for iOS**
   ```json
   "preview": {
     "ios": {
       "resourceClass": "m-medium"
     }
   }
   ```

## Running the Build

1. **Start the Build Process**
   ```bash
   # For Android
   npx eas build --platform android --profile preview
   
   # For iOS
   npx eas build --platform ios --profile preview
   ```

2. **Build Phases**
   The EAS build process includes these phases:
   - Compressing project files
   - Uploading to EAS Build servers
   - Waiting in queue
   - Running the build
   - Creating the binary (APK/IPA)
   - Making the build available for download

3. **Monitor Build Progress**
   ```bash
   npx eas build:list
   ```

4. **Download the Build**
   Once complete, the build will be available for download:
   - Directly from the EAS Dashboard
   - Using the download URL provided in the build output
   - Through the Expo Go app with a QR code (for internal distribution)

## Troubleshooting

Common issues and solutions:

1. **Build Queue Times**
   - EAS builds may queue depending on service load
   - Premium accounts get priority

2. **Credential Issues**
   - Ensure your keystore information is correct
   - Check Apple Developer account access

3. **Build Failures**
   - Review logs for specific errors
   - Common issues include:
     * Missing dependencies
     * Native code conflicts
     * Incorrect credentials
     * File size limits

4. **QR Code Scanning Issues**
   - Ensure your device is on the same network
   - Use the Expo Go app for development builds

## Next Steps After Building

1. **Testing the Build**
   - Install on test devices
   - Verify all functionality works correctly
   - Test on multiple device sizes

2. **Submitting to App Stores**
   ```bash
   # For Android
   npx eas submit --platform android
   
   # For iOS
   npx eas submit --platform ios
   ```

3. **Over-the-Air Updates**
   ```bash
   npx eas update --branch production
   ```