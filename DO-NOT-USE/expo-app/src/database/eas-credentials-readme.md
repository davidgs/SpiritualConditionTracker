# EAS Build Credentials Guide

This document explains how to handle the EAS build process for both Android and iOS platforms. Since the EAS build process requires various credentials for signing, this guide will help you understand the requirements and how to configure them.

## Android Credentials

### Keystore Requirements

When building an Android app for distribution (APK or App Bundle), you need a keystore file for signing. There are two ways to handle this:

1. **Let EAS generate a keystore for you (recommended for testing)**
   - During the interactive build process, EAS will offer to generate a keystore
   - This is suitable for testing, but for production, you should create and manage your own keystore

2. **Use your own keystore file**
   - Create a keystore file using the Java keytool:
     ```bash
     keytool -genkey -v -keystore aa-recovery-keystore.jks -alias aa-recovery -keyalg RSA -keysize 2048 -validity 10000
     ```
   - Configure the keystore in your `gradle.properties` file:
     ```
     MYAPP_UPLOAD_STORE_FILE=aa-recovery-keystore.jks
     MYAPP_UPLOAD_STORE_PASSWORD=your-keystore-password
     MYAPP_UPLOAD_KEY_ALIAS=aa-recovery
     MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
     ```

### EAS Build Configuration

For Android builds using EAS, configure these profiles in your `eas.json`:

```json
"build": {
  "development": {
    "android": {
      "buildType": "apk"
    }
  },
  "preview": {
    "android": {
      "buildType": "apk"
    }
  },
  "production": {
    "android": {
      "buildType": "app-bundle"
    }
  }
}
```

## iOS Credentials

### Apple Developer Account

For iOS builds, you need:
- An Apple Developer account
- A provisioning profile
- A distribution certificate

When using EAS Build, you have two options:

1. **Let EAS handle credentials (recommended)**
   - Provide your Apple Developer account credentials during the build
   - EAS will create or fetch necessary certificates and profiles

2. **Manually manage credentials**
   - Create distribution certificates and profiles in Apple Developer Portal
   - Configure these in your EAS project

### EAS Build Configuration

For iOS builds using EAS, configure these profiles in your `eas.json`:

```json
"build": {
  "development": {
    "ios": {
      "simulator": true
    }
  },
  "preview": {
    "ios": {
      "resourceClass": "m-medium"
    }
  },
  "production": {
    "ios": {
      "resourceClass": "m-medium"
    }
  }
}
```

## Common EAS Commands

1. Initialize EAS for your project:
   ```bash
   npx eas init
   ```

2. Configure build profiles:
   ```bash
   npx eas build:configure
   ```

3. Build for Android:
   ```bash
   npx eas build --platform android --profile preview
   ```

4. Build for iOS:
   ```bash
   npx eas build --platform ios --profile preview
   ```

5. Submit to app stores:
   ```bash
   npx eas submit --platform ios
   npx eas submit --platform android
   ```

## Troubleshooting

- **"Generating a new Keystore is not supported in --non-interactive mode"**: 
  - Use interactive mode for first-time builds to allow EAS to generate a keystore
  - For CI/CD, save your keystore and configure it in environment variables

- **"Error: Apple account credentials invalid"**:
  - Ensure your Apple ID and password are correct
  - Enable app-specific passwords if using 2FA

- **Build failures due to missing signing configurations**:
  - Ensure `build.gradle` has proper signing configuration
  - Verify keystore details in `gradle.properties` match the actual keystore

Remember that for production builds, you should always use your own carefully managed keystores and certificates rather than auto-generated ones.