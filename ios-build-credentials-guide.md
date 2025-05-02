# iOS Build Credentials Guide

This document explains how to set up and manage iOS build credentials for the AA Recovery Tracker app.

## Apple Developer Account Requirements

To build iOS apps with EAS Build, you need the following:

1. **Apple Developer Account**: An active membership in the Apple Developer Program ($99/year)
2. **Apple ID**: Your Apple developer account email address
3. **App-specific Password**: If your Apple ID uses two-factor authentication (2FA)
4. **Team ID**: Your Apple Developer Team ID (found in Apple Developer portal)

## Credential Types Needed

iOS builds require several credential types:

1. **Distribution Certificate**: A certificate that verifies you as a trusted developer
2. **Provisioning Profile**: Links your app to devices, certificates, and entitlements
3. **Push Notification Certificate**: Required if your app uses push notifications
4. **App Store Connect API Key**: For automated submissions to the App Store

## Methods for Managing iOS Credentials

You have two options for iOS credentials management:

### Option 1: Let EAS Handle Your Credentials (Recommended)

During the build process, EAS will prompt for your Apple credentials:

```
? Do you want to log in to your Apple account? › (Y/n)
```

When you select "Yes" and provide your Apple ID and password, EAS will:
- Generate or reuse an existing distribution certificate
- Create a provisioning profile for your app
- Store these credentials securely on Expo's servers

This is the easiest approach and requires no manual credential management.

### Option 2: Manual Credential Management

If you prefer to manage credentials yourself or can't provide Apple account access:

1. **Generate Distribution Certificate**
   - Use Xcode to create a distribution certificate
   - Export the certificate and private key as a .p12 file

2. **Create Provisioning Profile**
   - Register your app's bundle identifier in Apple Developer Portal
   - Create a distribution provisioning profile
   - Download the .mobileprovision file

3. **Configure Local Credentials**
   Create a `credentials.json` file:
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

4. **Update eas.json**
   ```json
   "preview": {
     "ios": {
       "credentialsSource": "local",
       "resourceClass": "m-medium"
     }
   }
   ```

## Working with App-Specific Passwords

If your Apple ID uses two-factor authentication (2FA), you'll need an app-specific password:

1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. In the Security section, click "Generate Password" under App-Specific Passwords
4. Follow the steps to create a password
5. Use this password when prompted during the EAS build process

## Troubleshooting iOS Credentials

Common issues and solutions:

1. **Certificate Limit Reached**
   - Apple limits you to 3 distribution certificates at a time
   - Revoke unused certificates in the Apple Developer Portal

2. **Provisioning Profile Issues**
   - Ensure the bundle identifier in your app matches the one in the profile
   - Check that your profile includes the correct entitlements

3. **Two-Factor Authentication Problems**
   - Use an app-specific password instead of your regular password
   - Ensure your account has the correct permissions

4. **Expired Developer Program Membership**
   - Renew your Apple Developer Program membership
   - Generate new credentials after renewal

## Managing iOS App Updates

When releasing updates to your app:

1. **Version and Build Numbers**
   - Increment the `buildNumber` in app.json for iOS
   - EAS can auto-increment with `"autoIncrement": true` in eas.json

2. **Privacy Declarations**
   - Update Info.plist with any new privacy declarations required

3. **Test Flight Distribution**
   - Use EAS Submit to deploy to TestFlight:
   ```bash
   npx eas submit --platform ios
   ```