/**
 * Fix for the './buildCacheProvider' module error in @expo/config
 * This script creates the missing module file that's causing the error
 */

const fs = require('fs');
const path = require('path');

function fixBuildCacheProviderError() {
  console.log('Checking for buildCacheProvider error...');
  
  // Try multiple potential paths for the @expo/config module
  const potentialPaths = [
    path.join(__dirname, 'node_modules', '@expo', 'config', 'build'),
    path.join(__dirname, 'expo-app', 'node_modules', '@expo', 'config', 'build'),
    path.join(process.cwd(), 'node_modules', '@expo', 'config', 'build'),
    path.join(process.cwd(), '..', 'node_modules', '@expo', 'config', 'build')
  ];
  
  let fixApplied = false;
  
  // Try to find and fix all potential instances
  for (const configDir of potentialPaths) {
    // Path to the missing file
    const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
    
    // Check if the directory exists
    if (!fs.existsSync(configDir)) {
      console.log(`Skipping path (not found): ${configDir}`);
      continue;
    }
    
    // Check if the file already exists
    if (fs.existsSync(missingFilePath)) {
      console.log(`buildCacheProvider already exists at: ${missingFilePath}`);
      continue;
    }
    
    // Create the missing file
    applyFixToPath(configDir, missingFilePath);
    fixApplied = true;
  }
  
  if (!fixApplied) {
    console.log('Could not find any @expo/config/build directories that need fixing');
    console.log('Trying to find any @expo/config installations in node_modules...');
    
    // Fallback: try to find any expo config installation
    try {
      // Use find to locate any expo config modules in node_modules
      const findCmd = process.platform === 'win32' 
        ? `where /r . @expo\\config\\build` 
        : `find ${process.cwd()} -path "*node_modules/@expo/config/build" -type d`;
        
      const { execSync } = require('child_process');
      const foundPaths = execSync(findCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
        .trim()
        .split('\n')
        .filter(line => line.length > 0);
      
      if (foundPaths.length > 0) {
        console.log(`Found ${foundPaths.length} potential @expo/config paths with find command`);
        
        foundPaths.forEach(configDir => {
          const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
          
          if (!fs.existsSync(missingFilePath)) {
            applyFixToPath(configDir, missingFilePath);
            fixApplied = true;
          }
        });
      }
    } catch (error) {
      console.log('Error searching for @expo/config directories:', error.message);
    }
  }
  
  if (!fixApplied) {
    console.log('No fix was applied - could not find or fix @expo/config module');
    console.log('You may need to manually create the missing file');
  }
}

function applyFixToPath(configDir, missingFilePath) {
  // Create a simple implementation of the missing module
  const fileContent = `/**
 * This is a placeholder implementation for the missing buildCacheProvider module
 * Created by fix-buildcache-provider.js to resolve module import errors
 */

// Simple cache provider implementation that does nothing
function createCacheProvider() {
  return {
    get: async () => null,
    put: async () => {},
    clear: async () => {},
  };
}

module.exports = {
  createCacheProvider,
};
`;
  
  try {
    // Write the file
    fs.writeFileSync(missingFilePath, fileContent);
    console.log(`Created missing module file: ${missingFilePath}`);
  } catch (error) {
    console.error(`Error creating buildCacheProvider file at ${missingFilePath}: ${error.message}`);
  }
}

// Run the fix immediately when this script is executed directly
if (require.main === module) {
  fixBuildCacheProviderError();
}

// Export the function so it can be required by other modules
module.exports = fixBuildCacheProviderError;