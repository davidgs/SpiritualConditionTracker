/**
 * Capacitor configuration for iOS and Android
 */
module.exports = {
  appId: 'com.spiritualconditiontracker.app',
  appName: 'SpiritualCondition',
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
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 1000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_splash",
      useDialog: true
    }
  },
  // Commented out for native builds - only use external server for development
  // server: {
  //   url: 'http://localhost:5000',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    // These settings help with WebView rendering on iOS
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    // iOS project structure configuration
    scheme: 'SpiritualCondition',
    path: 'ios',
    // Safe area and status bar configuration
    backgroundColor: '#1a1a1a',
    overrideUserAgent: null,
    appendUserAgent: null,
    // Location permissions for meeting locate functionality
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'This app needs location access to help you find nearby AA meetings and add location details to your meetings.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs location access to help you find nearby AA meetings and add location details to your meetings.',
      // Launch screen configuration
      UILaunchStoryboardName: 'LaunchScreen',
      UILaunchImages: 'LaunchImage',
      // Status bar configuration
      UIStatusBarStyle: 'UIStatusBarStyleLightContent',
      UIViewControllerBasedStatusBarAppearance: true
    }
  },
  android: {
    // Common Android configuration
    useLegacyBridge: true
  }
};