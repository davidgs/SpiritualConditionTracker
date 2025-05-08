#!/usr/bin/env node

/**
 * Fix for react-native-sqlite-storage iOS build warning
 * 
 * This script addresses the warning:
 * "Package react-native-sqlite-storage contains invalid configuration: 
 * dependency.platforms.ios.project is not allowed"
 * 
 * Usage:
 * node fix-sqlite-storage.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 iOS Build Fix: Starting react-native-sqlite-storage package fix...');

// Possible locations for the package
const possiblePaths = [
  'node_modules/react-native-sqlite-storage',
  '../node_modules/react-native-sqlite-storage',
  'expo-app/node_modules/react-native-sqlite-storage'
];

// Count of fixes applied
let fixCount = 0;

// Apply fixes to all possible paths
possiblePaths.forEach(packagePath => {
  try {
    // Check if the directory exists
    if (!fs.existsSync(packagePath)) {
      console.log(`⚠️ Path does not exist: ${packagePath}`);
      return;
    }

    console.log(`🔍 Checking package at: ${packagePath}`);
    
    // Path to package.json
    const packageJsonPath = path.join(packagePath, 'package.json');
    
    // Check if package.json exists
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`⚠️ package.json not found at: ${packageJsonPath}`);
      return;
    }
    
    // Read package.json content
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if the invalid configuration exists
    if (packageJson && 
        packageJson.dependencies && 
        packageJson.dependencies.platforms && 
        packageJson.dependencies.platforms.ios && 
        packageJson.dependencies.platforms.ios.project) {
      
      console.log('🔎 Found invalid configuration in package.json');
      
      // Create a backup
      fs.writeFileSync(`${packageJsonPath}.bak`, JSON.stringify(packageJson, null, 2));
      console.log(`💾 Created backup at: ${packageJsonPath}.bak`);
      
      // Fix the configuration
      delete packageJson.dependencies.platforms.ios.project;
      
      // If platforms.ios is now empty, remove it
      if (Object.keys(packageJson.dependencies.platforms.ios).length === 0) {
        delete packageJson.dependencies.platforms.ios;
      }
      
      // If platforms is now empty, remove it
      if (packageJson.dependencies.platforms && 
          Object.keys(packageJson.dependencies.platforms).length === 0) {
        delete packageJson.dependencies.platforms;
      }
      
      // Write the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Fixed invalid configuration in: ${packageJsonPath}`);
      fixCount++;
    } else {
      // Check the correct path according to the error message
      if (packageJson && packageJson.dependency && packageJson.dependency.platforms) {
        // Alternative structure
        if (packageJson.dependency.platforms.ios && 
            packageJson.dependency.platforms.ios.project) {
          
          console.log('🔎 Found invalid configuration in package.json (alternative structure)');
          
          // Create a backup
          fs.writeFileSync(`${packageJsonPath}.bak`, JSON.stringify(packageJson, null, 2));
          console.log(`💾 Created backup at: ${packageJsonPath}.bak`);
          
          // Fix the configuration
          delete packageJson.dependency.platforms.ios.project;
          
          // If platforms.ios is now empty, remove it
          if (Object.keys(packageJson.dependency.platforms.ios).length === 0) {
            delete packageJson.dependency.platforms.ios;
          }
          
          // If platforms is now empty, remove it
          if (packageJson.dependency.platforms && 
              Object.keys(packageJson.dependency.platforms).length === 0) {
            delete packageJson.dependency.platforms;
          }
          
          // Write the updated package.json
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log(`✅ Fixed invalid configuration in: ${packageJsonPath} (alternative structure)`);
          fixCount++;
        }
      } else {
        // Try a more exhaustive search for the problematic configuration
        let content = JSON.stringify(packageJson);
        if (content.includes('platforms') && content.includes('ios') && content.includes('project')) {
          console.log('🔎 Found potential invalid configuration through text search');
          
          // Create a backup
          fs.writeFileSync(`${packageJsonPath}.bak`, JSON.stringify(packageJson, null, 2));
          console.log(`💾 Created backup at: ${packageJsonPath}.bak`);
          
          // Replace the content with a fixed version using string operations
          content = content.replace(/"platforms"\s*:\s*{[^}]*"ios"\s*:\s*{[^}]*"project"\s*:[^,}]*[,}][^}]*}[^}]*}/g, 
                             '"platforms":{}');
          
          // Write the updated content
          fs.writeFileSync(packageJsonPath, JSON.parse(content, null, 2));
          console.log(`✅ Fixed potential invalid configuration in: ${packageJsonPath} (text search)`);
          fixCount++;
        } else {
          console.log(`ℹ️ No invalid configuration found in: ${packageJsonPath}`);
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ Error fixing path ${packagePath}:`, error.message);
  }
});

if (fixCount > 0) {
  console.log(`✅ Successfully applied ${fixCount} fixes to react-native-sqlite-storage package.`);
  console.log('🚀 iOS build should now proceed without the invalid configuration warning.');
} else {
  console.log(`
⚠️ No fixes were applied automatically. 

To fix this issue manually:
1. Locate your react-native-sqlite-storage package.json file
2. Find and remove any 'project' property within 'platforms.ios' section
3. Save the file
4. Rebuild your project
`);
}

console.log('🏁 sqlite-storage fix script completed.');