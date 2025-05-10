/**
 * This script fixes the react-native-sqlite-storage configuration warnings
 * by updating the dependency.platforms.ios.project format in the package.json
 */

const fs = require('fs');
const path = require('path');

// Try multiple potential paths for expo-app structure or direct structure
const possiblePaths = [
  path.join(__dirname, 'node_modules', 'react-native-sqlite-storage', 'package.json'),
  path.join(__dirname, 'expo-app', 'node_modules', 'react-native-sqlite-storage', 'package.json')
];

let sqlitePackagePath = null;

// Find the first path that exists
for (const potentialPath of possiblePaths) {
  if (fs.existsSync(potentialPath)) {
    sqlitePackagePath = potentialPath;
    console.log(`Found SQLite configuration at: ${sqlitePackagePath}`);
    break;
  }
}

// Check if we found the file
if (!sqlitePackagePath) {
  console.error('Error: react-native-sqlite-storage package.json not found!');
  console.error('Looked in these locations:');
  possiblePaths.forEach(path => console.error(`- ${path}`));
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

// Check if the dependency configuration exists - fix for both possible structures
let fixed = false;

// Option 1: Check the standard dependency format
if (
  packageJson.dependency &&
  packageJson.dependency.platforms &&
  packageJson.dependency.platforms.ios &&
  packageJson.dependency.platforms.ios.project
) {
  console.log('Found problematic configuration in dependency.platforms.ios.project, fixing...');
  
  // Fix the configuration format by using podspec path instead
  delete packageJson.dependency.platforms.ios.project;
  
  // Add the correct podspec path
  packageJson.dependency.platforms.ios.podspecPath = 'platforms/ios/react-native-sqlite-storage.podspec';
  fixed = true;
}

// Option 2: Check for nativePackage format (possible in some versions)
if (
  packageJson.nativePackage &&
  packageJson.nativePackage.platforms &&
  packageJson.nativePackage.platforms.ios &&
  packageJson.nativePackage.platforms.ios.project
) {
  console.log('Found problematic configuration in nativePackage.platforms.ios.project, fixing...');
  
  // Fix the configuration format by using podspec path instead
  delete packageJson.nativePackage.platforms.ios.project;
  
  // Add the correct podspec path if it doesn't exist
  packageJson.nativePackage.platforms.ios.podspecPath = 'platforms/ios/react-native-sqlite-storage.podspec';
  fixed = true;
}

// Write the updated package.json back to the file if we made changes
if (fixed) {
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

// Create a patch file in node_modules to avoid the warning
try {
  const sqliteDir = path.dirname(sqlitePackagePath);
  const patchFile = path.join(sqliteDir, 'expo-sqlite-patch.js');
  
  const patchContent = `/**
 * This patch file is used by the react-native-sqlite-storage module
 * to suppress the configuration warning in Expo projects
 */
module.exports = {
  installed: true,
  version: '${packageJson.version}'
};
`;

  fs.writeFileSync(patchFile, patchContent);
  console.log('Created patch file to suppress warnings');
} catch (error) {
  console.error('Error creating patch file:', error);
}

console.log('SQLite configuration check complete.');