// eas-build-config.js
module.exports = {
  // Common build options
  common: {
    env: {
      // Environment variables for all builds
      APP_ENV: 'production',
    },
  },
  
  // Android specific options
  android: {
    // Build variants (gradle)
    buildType: 'apk', // 'apk' or 'aab'
    gradleCommand: ':app:assembleRelease',
    
    // Credentials options
    credentialsSource: 'local',
    
    // Distribution options
    distribution: 'internal',
    
    // Misc
    cache: {
      disabled: false,
      key: 'v1',
    },
  },
  
  // iOS specific options
  ios: {
    // Build scheme
    buildConfiguration: 'Release',
    
    // Distribution options
    distribution: 'internal',
    simulator: false,
    
    // Credentials options
    credentialsSource: 'local',
    
    // Misc
    cache: {
      disabled: false,
      key: 'v1',
    },
  },
};