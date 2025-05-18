/**
 * Capacitor configuration for iOS and Android
 */
module.exports = {
  appId: 'com.spiritualconditiontracker.app',
  appName: 'Spiritual Condition Tracker',
  webDir: '.',
  bundledWebRuntime: true,
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'spiritual-condition-tracker',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for database'
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for database',
        biometricSubTitle: 'Log in using your biometric'
      }
    }
  },
  server: {
    // This tells Capacitor to use our external server for loading the app
    // This is needed for proper functioning in iOS
    url: 'http://localhost:5000',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    // These settings help with WebView rendering on iOS
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true
  },
  android: {
    // Common Android configuration
    useLegacyBridge: true
  }
};