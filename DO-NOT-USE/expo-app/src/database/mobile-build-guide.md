# Mobile Build Guide for AA Recovery Tracker

This guide provides comprehensive instructions for building both Android and iOS versions of the AA Recovery Tracker app.

## Prerequisites

Before you begin, ensure you have:

1. **Expo Account**: Register at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install with `npm install -g eas-cli`
3. **Development Environment**:
   - For iOS: macOS with Xcode 14+ installed
   - For Android: Android Studio with SDK Tools

## Project Setup

1. **Initialize EAS Project**

```bash
npx eas init
```

This links your local project with Expo's cloud services.

2. **Configure app.json**

Ensure your app.json has the correct configuration:

```json
{
  "expo": {
    "name": "AA Recovery Tracker",
    "slug": "aa-recovery-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/icon.png",
    "splash": {
      "image": "./src/assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.example.aarecoverytracker"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.example.aarecoverytracker"
    },
    "extra": {
      "eas": {
        "projectId": "a4fdb049-707c-4964-bb1f-20e9931596d2"
      }
    }
  }
}
```

3. **Configure eas.json**

Create or update your eas.json with build profiles:

```json
{
  "cli": {
    "version": ">= 0.60.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "credentialsSource": "local"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle",
        "credentialsSource": "local"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "APPLE_ID",
        "ascAppId": "APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "APPLE_TEAM_ID"
      },
      "android": {
        "track": "production"
      }
    }
  }
}
```

## Building for Android

### Step 1: Prepare Android Credentials

1. **Ensure keystore is set up**:
   - Keystore file in `android/app/keystores/aa-recovery-keystore.jks`
   - Configure `android/gradle.properties` with keystore details
   - Create a `credentials.json` file in project root:

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

### Step 2: Run the Android Build

```bash
# For debug/testing builds
npx eas build --platform android --profile preview

# For production builds
npx eas build --platform android --profile production
```

## Building for iOS

### Step 1: Prepare iOS Credentials

You have two options:

#### Option A: Let EAS manage credentials (Recommended)

When prompted during the build process, choose to log in with your Apple ID credentials. EAS will handle certificates and provisioning profiles automatically.

#### Option B: Manual credential management

If you already have iOS certificates and profiles:

1. Export your distribution certificate as a .p12 file
2. Download your provisioning profile (.mobileprovision)
3. Create a credentials.json file with your iOS details:

```json
{
  "ios": {
    "distributionCertificate": {
      "path": "path/to/dist-cert.p12",
      "password": "certificate-password"
    },
    "provisioningProfile": {
      "path": "path/to/profile.mobileprovision"
    }
  }
}
```

### Step 2: Run the iOS Build

```bash
# For internal testing
npx eas build --platform ios --profile preview

# For production
npx eas build --platform ios --profile production
```

## Managing Build Artifacts

### Downloading Build APKs/IPAs

When a build completes, you can download it in several ways:

1. **From Terminal**:
   ```bash
   npx eas build:list
   npx eas build:download --build-id <BUILD_ID>
   ```

2. **From Expo Website**:
   Visit [expo.dev](https://expo.dev) and navigate to your project's builds.

3. **QR Code for Internal Distribution**:
   Share the QR code provided in the build output for easy installation.

## Testing Builds

1. **Android APK**:
   - Transfer the APK to your device
   - Enable "Install from Unknown Sources" in settings
   - Open the APK to install

2. **iOS IPA**:
   - Use Apple TestFlight for distribution
   - Register test devices in Apple Developer Portal
   - Invite testers via email

## Submitting to App Stores

### Google Play Store

```bash
npx eas submit --platform android
```

### Apple App Store

```bash
npx eas submit --platform ios
```

## Troubleshooting

### Common Android Issues

1. **Keystore problems**:
   - Ensure the keystore path is correct
   - Verify keystore passwords match in all configuration files

2. **Build failures**:
   - Check EAS build logs for detailed errors
   - Ensure Android SDK and build tools are compatible

### Common iOS Issues

1. **Certificate errors**:
   - Check Apple Developer account subscription status
   - Remove expired certificates from Apple Developer Portal

2. **Provisioning Profile issues**:
   - Match bundle identifier exactly
   - Ensure proper entitlements for app features

## Continuous Integration

For automated builds, you can integrate EAS Build with your CI system:

```bash
# Example CI command
EXPO_TOKEN=your_token npx eas build --platform all --non-interactive
```

## Further Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Keystore Documentation](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing Guide](https://developer.apple.com/support/code-signing/)