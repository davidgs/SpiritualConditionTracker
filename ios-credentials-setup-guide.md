# iOS Credentials Setup Guide for AA Recovery Tracker

This document explains how to obtain and configure iOS credentials for building the AA Recovery Tracker app.

## Prerequisites

Before you begin, ensure you have:

1. **Apple Developer Account**: An active membership in the Apple Developer Program ($99/year)
2. **Xcode**: The latest version installed on a Mac (cannot be done on Windows/Linux)
3. **Admin access**: To your Apple Developer account

## Step 1: Obtain Distribution Certificate

A distribution certificate identifies you as a trusted developer to Apple.

### Generate a Certificate Signing Request (CSR)

1. Open **Keychain Access** on your Mac
2. Go to **Keychain Access** > **Certificate Assistant** > **Request a Certificate From a Certificate Authority**
3. Enter your email address and name
4. Select **Saved to disk** and **Let me specify key pair information**
5. Click **Continue**
6. Set **Key Size** to 2048 bits and **Algorithm** to RSA
7. Click **Continue** and save the CSR file

### Create a Distribution Certificate

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
2. Click the + button
3. Select **Apple Distribution** (or **iOS Distribution** for older accounts)
4. Click **Continue**
5. Upload the CSR file you created
6. Click **Continue** and then **Download**
7. Double-click the downloaded certificate file to install it in Keychain Access

### Export the Certificate and Private Key

1. Open **Keychain Access**
2. Find your distribution certificate (it should have your name and "iPhone Distribution")
3. Right-click and select **Export**
4. Choose the **.p12** file format
5. Create a password when prompted (remember this password!)
6. Save the file (e.g., `distribution_certificate.p12`)

## Step 2: Create an App ID

An App ID uniquely identifies your application.

1. Go to [Identifiers section](https://developer.apple.com/account/resources/identifiers/list)
2. Click the + button
3. Select **App IDs** and click **Continue**
4. Select **App** and click **Continue**
5. Enter a description (e.g., "AA Recovery Tracker")
6. Enter your Bundle ID (e.g., `com.example.aarecoverytracker`)
7. Under **Capabilities**, enable the ones needed by the app:
   - Push Notifications
   - Associated Domains
   - App Groups (if needed)
8. Click **Continue** and then **Register**

## Step 3: Create a Provisioning Profile

A provisioning profile connects your app, certificate, and device IDs.

1. Go to [Profiles section](https://developer.apple.com/account/resources/profiles/list)
2. Click the + button
3. Select **App Store** under Distribution and click **Continue**
4. Select your App ID from the dropdown and click **Continue**
5. Select your Distribution Certificate and click **Continue**
6. Enter a profile name (e.g., "AA Recovery Tracker App Store")
7. Click **Generate** and then **Download**
8. Save the `.mobileprovision` file (e.g., `app_store_profile.mobileprovision`)

## Step 4: Configure Credentials in EAS

Now that you have your certificates and provisioning profiles, you can configure them in your project:

### Option 1: Add to credentials.json

Add the following to your `credentials.json` file:

```json
{
  "ios": {
    "provisioningProfilePath": "path/to/app_store_profile.mobileprovision",
    "distributionCertificate": {
      "path": "path/to/distribution_certificate.p12",
      "password": "YOUR_P12_PASSWORD"
    }
  }
}
```

### Option 2: Use EAS Credentials Manager

For a more managed approach:

```bash
npx eas credentials
```

Follow the interactive prompts to upload your credentials to Expo's server.

## Step 5: Update eas.json for iOS Builds

Ensure your `eas.json` file has the correct iOS configuration:

```json
{
  "build": {
    "preview": {
      "ios": {
        "credentialsSource": "local",
        "resourceClass": "m-medium"
      }
    }
  }
}
```

## Step 6: Run an iOS Build

With credentials in place, run:

```bash
npx eas build --platform ios --profile preview
```

## Common Issues and Troubleshooting

### Certificate Expired or Revoked

If your certificate has expired or been revoked, you need to create a new one and update your provisioning profiles.

### Missing Capabilities

If your app uses features like Push Notifications but they weren't enabled in your App ID, you'll need to:

1. Update the App ID with the required capabilities
2. Generate a new provisioning profile
3. Update your credentials

### Code Signing Errors

If you encounter code signing errors, check:

1. Your certificate is valid and not expired
2. The provisioning profile uses the correct certificate and App ID
3. The Bundle ID in your app matches the one in the provisioning profile

### Two-Factor Authentication Issues

If you have two-factor authentication enabled on your Apple ID:

1. Create an app-specific password at [appleid.apple.com](https://appleid.apple.com)
2. Use this password when prompted during the EAS build process

## Next Steps After Successful Build

Once you have a successful build:

1. **TestFlight**: Submit the build to TestFlight for internal testing
2. **App Store**: When ready, submit to the App Store for review
3. **OTA Updates**: Set up over-the-air updates with EAS Update

For more information, refer to:
- [Expo App Signing docs](https://docs.expo.dev/app-signing/app-credentials/)
- [Apple Developer Program Help](https://developer.apple.com/support/)