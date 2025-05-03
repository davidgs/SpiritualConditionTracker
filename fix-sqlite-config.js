/**
 * This script fixes the react-native-sqlite-storage configuration warnings
 * by updating the dependency.platforms.ios.project format in the package.json
 */

const fs = require('fs');
const path = require('path');

// Path to the react-native-sqlite-storage package.json
const sqlitePackagePath = path.join(
  __dirname,
  'node_modules',
  'react-native-sqlite-storage',
  'package.json'
);

console.log(`Checking SQLite configuration at: ${sqlitePackagePath}`);

// Check if the file exists
if (!fs.existsSync(sqlitePackagePath)) {
  console.error('Error: react-native-sqlite-storage package.json not found!');
  process.exit(1);
}

// Read the package.json file
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(sqlitePackagePath, 'utf8'));
  console.log('Successfully read package.json');
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Check if the dependency configuration exists
if (
  packageJson.dependency &&
  packageJson.dependency.platforms &&
  packageJson.dependency.platforms.ios &&
  packageJson.dependency.platforms.ios.project
) {
  console.log('Found problematic configuration, fixing...');
  
  // Fix the configuration format
  // The warning is about the format of "dependency.platforms.ios.project"
  // Let's remove it and use the standard format
  delete packageJson.dependency.platforms.ios.project;
  
  // Add the correct podspec path
  packageJson.dependency.platforms.ios.podspecPath = 'platforms/ios/react-native-sqlite-storage.podspec';
  
  // Write the updated package.json back to the file
  try {
    fs.writeFileSync(sqlitePackagePath, JSON.stringify(packageJson, null, 2));
    console.log('Successfully updated package.json!');
  } catch (error) {
    console.error('Error writing package.json:', error);
    process.exit(1);
  }
} else {
  console.log('No problematic configuration found, nothing to fix.');
}

console.log('SQLite configuration check complete.');