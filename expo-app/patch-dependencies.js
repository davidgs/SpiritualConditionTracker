/**
 * Dependency Patch Script for Spiritual Condition Tracker
 * 
 * This script fixes version compatibility issues between React Native and its dependencies
 * that were causing iOS build failures with missing symbols.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting dependency patch process...');

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Store the current versions to report changes
const currentVersions = {
  'react-native-screens': packageJson.dependencies['react-native-screens'],
  'react-native-safe-area-context': packageJson.dependencies['react-native-safe-area-context']
};

// Update to versions known to be compatible with React Native 0.79.x
packageJson.dependencies['react-native-screens'] = '~3.29.0';
packageJson.dependencies['react-native-safe-area-context'] = '4.8.1';

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Updated package.json with compatible dependency versions:');
console.log(`- react-native-screens: ${currentVersions['react-native-screens']} → ${packageJson.dependencies['react-native-screens']}`);
console.log(`- react-native-safe-area-context: ${currentVersions['react-native-safe-area-context']} → ${packageJson.dependencies['react-native-safe-area-context']}`);

// Install the updated dependencies
console.log('\nInstalling updated dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('\nDependencies updated successfully.');
  
  // Clean up iOS build artifacts to ensure a fresh build
  console.log('\nCleaning iOS build artifacts...');
  if (fs.existsSync(path.join(__dirname, 'ios', 'Pods'))) {
    console.log('Removing Pods directory...');
    try {
      execSync('rm -rf ios/Pods', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error removing Pods directory:', error.message);
    }
  }
  
  if (fs.existsSync(path.join(__dirname, 'ios', 'Podfile.lock'))) {
    console.log('Removing Podfile.lock...');
    try {
      execSync('rm -f ios/Podfile.lock', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error removing Podfile.lock:', error.message);
    }
  }
  
  console.log('\nPatch completed successfully. Next steps:');
  console.log('1. Run "cd ios && pod install" to reinstall iOS dependencies');
  console.log('2. Rebuild your iOS app');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  console.log('\nPlease run "npm install" manually to complete the update.');
}