/**
 * Fix for the './buildCacheProvider' module error in @expo/config
 * This script creates the missing module file that's causing the error
 */

const fs = require('fs');
const path = require('path');

function fixBuildCacheProviderError() {
  console.log('Checking for buildCacheProvider error...');
  
  // Path to the @expo/config directory where the missing file should be
  const configDir = path.join(__dirname, 'node_modules', '@expo', 'config', 'build');
  
  // Path to the missing file
  const missingFilePath = path.join(configDir, 'buildCacheProvider.js');
  
  // Check if the directory exists
  if (!fs.existsSync(configDir)) {
    console.log('Could not find @expo/config/build directory, skipping fix');
    return;
  }
  
  // Check if the file already exists
  if (fs.existsSync(missingFilePath)) {
    console.log('buildCacheProvider.js already exists, no fix needed');
    return;
  }
  
  // Create a simple implementation of the missing module
  const fileContent = `
/**
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
    console.log('Fix for buildCacheProvider error completed successfully');
  } catch (error) {
    console.error(`Error creating buildCacheProvider file: ${error.message}`);
  }
}

// Run the fix immediately when this script is executed directly
if (require.main === module) {
  fixBuildCacheProviderError();
}

// Export the function so it can be required by other modules
module.exports = fixBuildCacheProviderError;