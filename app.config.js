// Import app.json configuration
const appJson = require('./app.json');
const path = require('path');
const fs = require('fs');

// Read the current version from App.js if available
let version = '1.0.6';
try {
  const appJsPath = path.join(__dirname, 'App.js');
  if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const versionMatch = appJsContent.match(/APP_VERSION = "([^"]*?)"/);
    if (versionMatch && versionMatch[1]) {
      // Extract just the version number part if it contains a timestamp
      const extractedVersion = versionMatch[1].split(' - ')[0];
      if (extractedVersion) {
        version = extractedVersion;
      }
    }
  }
} catch (error) {
  console.warn('Could not read version from App.js:', error.message);
}

// Generate a timestamp for the build
const buildTimestamp = new Date().toISOString().replace(/[:\-]|\.\d+/g, '');
const buildNumber = `${version}-${buildTimestamp}`;

// Create enhanced config
module.exports = {
  // Keep existing app.json configuration
  ...appJson.expo,
  
  // Override or add new values
  name: appJson.expo?.name || "Spiritual Condition Tracker",
  slug: appJson.expo?.slug || "spiritual-condition-tracker",
  version,
  orientation: "portrait",
  
  // Ensure permissions are properly set
  ios: {
    ...(appJson.expo?.ios || {}),
    bundleIdentifier: appJson.expo?.ios?.bundleIdentifier || "com.spiritual.conditiontracker",
    buildNumber,
    infoPlist: {
      ...(appJson.expo?.ios?.infoPlist || {}),
      NSCameraUsageDescription: "This app uses the camera for QR code scanning to quickly connect with meeting information.",
      NSLocationWhenInUseUsageDescription: "This app uses your location to find nearby meetings and other AA members.",
      NSCalendarsUsageDescription: "This app needs access to your calendar to add and manage meeting reminders.",
      NSBluetoothAlwaysUsageDescription: "This app uses Bluetooth to discover nearby AA members for connection."
    }
  },
  
  android: {
    ...(appJson.expo?.android || {}),
    package: appJson.expo?.android?.package || "com.spiritual.conditiontracker",
    versionCode: parseInt(buildTimestamp.substring(0, 8)),
    permissions: [
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "WRITE_CALENDAR",
      "READ_CALENDAR",
      "BLUETOOTH",
      "BLUETOOTH_ADMIN"
    ]
  },
  
  // Asset bundling
  assetBundlePatterns: [
    "**/*"
  ],
  
  // Plugins
  plugins: [
    ["expo-location", {
      "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location to find nearby AA meetings."
    }],
    "expo-calendar",
    "expo-sqlite",
    "expo-notifications",
    ["expo-build-properties", {
      "ios": {
        "useFrameworks": "static"
      }
    }]
  ],
  
  // Dependency versions
  extra: {
    eas: {
      projectId: appJson.expo?.extra?.eas?.projectId || "auto-generated-id"
    },
    // Track specific dependencies and versions
    dependencies: {
      "react-native-paper-dates": "0.22.3",
      "@react-native-async-storage/async-storage": "2.1.0"
    }
  },
  
  // Debugging and updates
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/your-project-id"
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  
  // Additional hooks for building
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "your-organization",
          project: "spiritual-condition-tracker"
        }
      }
    ]
  }
};