# EAS Build Troubleshooting Guide

This document provides solutions for common issues encountered when building the Spiritual Condition Tracker app with EAS.

## "Invalid UUID appId" Error

### Problem

When running an EAS build, you encounter this error:

```
Invalid UUID appId
```

### Cause

This error occurs when:

1. The `projectId` in the app.json file is not a valid UUID format.
2. There's a mismatch between your Expo account and the project configuration.
3. You've recently renamed or duplicated the project.

### Solution

1. **Check projectId Format**: Ensure the projectId is a valid UUID in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

   ```json
   "extra": {
     "eas": {
       "projectId": "a82e4d89-0b9f-45e8-a23d-c9b8e7662695"
     }
   }
   ```

2. **Generate a New Project ID**: You can generate a new valid UUID and update app.json:

   ```bash
   npx uuid
   ```

   Then, replace the projectId in app.json with the generated UUID.

3. **Update the Updates URL**: Make sure the updates URL in app.json matches the projectId:

   ```json
   "updates": {
     "url": "https://u.expo.dev/a82e4d89-0b9f-45e8-a23d-c9b8e7662695"
   }
   ```

4. **Re-Login to EAS**: Sometimes logging out and back in can help:

   ```bash
   npx eas logout
   npx eas login
   ```

5. **Create a New EAS Project**: If all else fails, create a new EAS project:

   ```bash
   npx eas project:init
   ```

   This will create a new projectId and configure your app.json properly.

## Authentication Issues

### Problem

Unable to authenticate with EAS or seeing permission errors.

### Solution

1. Ensure you're logged in with the correct Expo account:
   ```bash
   npx eas whoami
   ```

2. Check if your EXPO_TOKEN is set correctly in your environment variables.

3. Re-login using:
   ```bash
   npx eas logout
   npx eas login
   ```

## iOS Build Issues

### Problem

iOS build fails with certificate or provisioning profile errors.

### Solution

1. Let EAS manage your credentials automatically (easiest):
   ```bash
   npx eas build --platform ios --profile preview --non-interactive --auto-credentials
   ```

2. Use a generic provisioning profile (only for testing):
   ```bash
   npx eas build --platform ios --profile preview --non-interactive --clear-provisions
   ```

3. Configure credentials manually:
   ```bash
   npx eas credentials
   ```

## Android Build Issues

### Problem

Android build fails with keystore or signing errors.

### Solution

1. Let EAS manage your keystore (recommended for first-time builds):
   ```bash
   npx eas build --platform android --profile preview --non-interactive
   ```

2. If you have your own keystore, configure it:
   ```bash
   npx eas credentials
   ```

## Other Common Issues

1. **Out of date Expo SDK or Expo CLI**: Update your dependencies:
   ```bash
   npm install -g eas-cli
   npm install expo@latest
   ```

2. **Incompatible dependencies**: Check for warnings in your package.json dependencies.

3. **Missing runtime version**: Ensure your app.json has the runtimeVersion field:
   ```json
   "runtimeVersion": {
     "policy": "sdkVersion"
   }
   ```

4. **Invalid or missing app configuration**: Use the check-build-environment.sh script to verify your configuration.

## Getting Further Help

If you continue to face issues after trying these solutions:

1. Visit the [Expo forums](https://forums.expo.dev/)
2. Check the [EAS Build documentation](https://docs.expo.dev/build/introduction/)
3. Look for similar issues on [GitHub](https://github.com/expo/expo/issues)