/**
 * Capacitor configuration for iOS and Android
 */
module.exports = {
  appId: 'com.spiritualconditiontracker.app',
  appName: 'Spiritual Condition Tracker',
  webDir: './dist',
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
    },
    Geolocation: {
      // iOS specific permissions
      requestPermissions: true,
      // Accuracy settings
      enableHighAccuracy: true,
      timeout: 10000
    }
  },
  // Commented out for native builds - only use external server for development
  // server: {
  //   url: 'http://localhost:5000',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    // These settings help with WebView rendering on iOS
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    // Location permissions for meeting locate functionality
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'This app needs location access to help you find nearby AA meetings and add location details to your meetings.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs location access to help you find nearby AA meetings and add location details to your meetings.'
    }
  },
  android: {
    // Common Android configuration
    useLegacyBridge: true
  }
};