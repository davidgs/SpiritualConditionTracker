# Build Troubleshooting Guide

This guide provides solutions for common issues encountered when building the AA Recovery Tracker app with EAS Build.

## JavaScript Bundle Build Failures

If the build fails during the "Bundle JavaScript" phase, check the following:

### 1. Module Resolution Issues

**Symptoms:**
- "Unable to resolve module" errors
- "Cannot find module" errors

**Solutions:**
- Make sure all dependencies are properly installed
- Check for circular dependencies
- Verify import paths (case sensitivity matters)

```bash
# Clean and reinstall node modules
rm -rf node_modules
npm install
```

### 2. Babel/Metro Configuration

**Symptoms:**
- Syntax errors in build logs
- Transformation errors

**Solutions:**
- Check babel.config.js for correct configuration
- Try clearing the Metro bundler cache:

```bash
npx react-native start --reset-cache
```

### 3. Large File/Asset Issues

**Symptoms:**
- "File size exceeds maximum" errors
- OOM (Out of Memory) errors during build

**Solutions:**
- Optimize large image assets
- Reduce bundle size by code splitting
- Check for large dependencies that could be removed

### 4. Environment Variable Issues

**Symptoms:**
- "Cannot read property of undefined" errors
- Missing API keys or configuration

**Solutions:**
- Ensure all required environment variables are defined
- Check that `app.json` and `.env` files have correct values

## Android-Specific Build Issues

### 1. Gradle Build Failures

**Symptoms:**
- "Failed to execute aapt" errors
- "Execution failed for task" errors

**Solutions:**
- Update Gradle version in `android/gradle/wrapper/gradle-wrapper.properties`
- Check Android SDK versions in `android/build.gradle`

### 2. Keystore Problems

**Symptoms:**
- "Keystore file not found" errors
- "Failed to read key" errors

**Solutions:**
- Verify keystore path in `credentials.json`
- Ensure keystore passwords match in all configuration files
- Regenerate keystore if necessary

### 3. Native Module Compatibility

**Symptoms:**
- Native modules failing to compile
- Missing implementations

**Solutions:**
- Check native module versions match React Native version
- Look for conflicting libraries or duplicate modules

## iOS-Specific Build Issues

### 1. Certificate/Provisioning Profile Issues

**Symptoms:**
- "No certificates found" errors
- "Invalid provisioning profile" errors

**Solutions:**
- Renew expired certificates in Apple Developer Portal
- Regenerate provisioning profiles
- Check bundle identifier matches

### 2. Xcode/Swift Version Mismatches

**Symptoms:**
- Swift compiler errors
- Incompatible Xcode version

**Solutions:**
- Update the `ios/Podfile` to specify supported Swift version
- Set minimum deployment target correctly

## Running a Clean Build

If you're still experiencing issues, try these steps for a completely clean build:

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

2. Clean the native builds:
```bash
# For Android
cd android && ./gradlew clean
# For iOS
cd ios && pod install --repo-update
```

3. Run prebuild again:
```bash
npx expo prebuild --clean
```

4. Start a new EAS build with maximum logging:
```bash
npx eas build --platform android --profile preview --verbose
```

## Getting Help

If you've tried all the troubleshooting steps and are still experiencing issues:

1. Check the Expo forums: [forums.expo.dev](https://forums.expo.dev)
2. Review React Native issues on GitHub: [github.com/facebook/react-native/issues](https://github.com/facebook/react-native/issues)
3. Search for similar issues in the EAS documentation: [docs.expo.dev/build/troubleshooting](https://docs.expo.dev/build/troubleshooting)