# Android Build Credentials Guide

This document explains how to set up and manage Android build credentials for the AA Recovery Tracker app.

## Keystore Setup for App Signing

Android apps must be signed with a digital certificate (keystore) before they can be installed or updated on devices. For the AA Recovery Tracker app, we've set up a keystore with the following details:

### Current Keystore Configuration

- **Keystore filename**: `aa-recovery-keystore.jks`
- **Keystore location**: `android/app/keystores/aa-recovery-keystore.jks`
- **Key alias**: `aa-recovery`
- **Keystore password**: `password123` (should be replaced with a more secure password in production)
- **Key password**: `password123` (should be replaced with a more secure password in production)

### How to Generate a New Keystore (if needed)

```bash
keytool -genkey -v -keystore aa-recovery-keystore.jks -alias aa-recovery -keyalg RSA -keysize 2048 -validity 10000
```

During this process, you'll be prompted to create passwords for the keystore and the key, as well as provide information about your organization.

## Gradle Configuration

The Android build system uses Gradle to manage build configurations. We've set up the following files to properly reference the keystore:

### 1. `android/gradle.properties`

This file contains the keystore configuration variables:

```properties
MYAPP_UPLOAD_STORE_FILE=keystores/aa-recovery-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=aa-recovery
MYAPP_UPLOAD_STORE_PASSWORD=password123
MYAPP_UPLOAD_KEY_PASSWORD=password123
```

### 2. `android/app/build.gradle`

This file references the keystore configuration from gradle.properties in the signingConfigs section:

```groovy
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // Other build settings...
    }
}
```

## EAS Build Configuration

For building with EAS Build, we've configured the project to use local credentials:

### 1. `credentials.json`

This file in the project root defines the keystore for EAS builds:

```json
{
  "android": {
    "keystore": {
      "keystorePath": "android/app/keystores/aa-recovery-keystore.jks",
      "keystorePassword": "password123",
      "keyAlias": "aa-recovery",
      "keyPassword": "password123"
    }
  }
}
```

### 2. `eas.json`

This file configures EAS Build to use local credentials for Android builds:

```json
"preview": {
  "android": {
    "buildType": "apk",
    "credentialsSource": "local"
  }
}
```

## Package Name (Bundle Identifier)

The Android package name for the app is defined in `android/app/build.gradle`:

```groovy
defaultConfig {
    applicationId 'com.example.aarecoverytracker'
    // Other config...
}
```

This package name should be updated to match your desired production package name before publishing.

## Version Management

Version information is defined in the build.gradle file:

```groovy
defaultConfig {
    // Other config...
    versionCode 1
    versionName "1.0.0"
}
```

- **versionCode**: Must be incremented for each new release to the Play Store
- **versionName**: Human-readable version (follows semantic versioning)

## Automating Version Updates

EAS Build can automatically increment the version code for each build:

```json
"production": {
  "autoIncrement": true,
  "android": {
    "buildType": "app-bundle",
    "credentialsSource": "local"
  }
}
```

## Google Play Store Setup

To publish to the Google Play Store, you'll need:

1. **Google Play Developer Account**: Register at play.google.com/apps/publish ($25 one-time fee)
2. **Service Account Key**: For automated deployments
3. **App Listing Information**: App description, screenshots, etc.

## Best Practices for Credential Management

1. **Keep keystore secure**: Loss of your keystore means you won't be able to update your app
2. **Backup keystore file**: Store a copy of the keystore in a secure location
3. **Use strong passwords**: Change the default passwords in production
4. **Don't commit secrets**: Exclude keystore files and passwords from git

## Troubleshooting Common Issues

1. **Keystore Issues**
   - Error: "Could not read keystore"
   - Solution: Check that the path to keystore is correct

2. **Signing Issues**
   - Error: "Failed to read key from keystore"
   - Solution: Verify key alias and passwords are correct

3. **Version Code Issues**
   - Error: "Version code has been used already"
   - Solution: Increment the versionCode in build.gradle

4. **Build Failures**
   - Issue: Build fails with cryptic errors
   - Solution: Check the EAS build logs at the URL provided in the build output